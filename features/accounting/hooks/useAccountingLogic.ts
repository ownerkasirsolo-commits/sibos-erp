
import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../services/db';
import { useGlobalContext } from '../../../context/GlobalContext';
import { ActivityLog } from '../../../components/common/LiveLogPanel';
import { ChartOfAccount, CashTransaction, BudgetPlan, BalanceSheetData, FinancialReportData } from '../types';

export const useAccountingLogic = () => {
  const { activeOutlet, currentUser } = useGlobalContext();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'journal' | 'report' | 'budget'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter for General Ledger
  const [ledgerAccount, setLedgerAccount] = useState('All');
  
  // Fetch Data from DB
  const cashFlow = useLiveQuery(() => 
      activeOutlet 
      ? db.cashFlow.where('outletId').equals(activeOutlet.id).reverse().toArray() 
      : Promise.resolve([]), 
  [activeOutlet]) || [];

  const accounts = useLiveQuery(() => db.accounts.toArray()) || [];
  const budgets = useLiveQuery(() => db.budgets.toArray()) || [];

  // --- STATS CALCULATION ---
  const totalIncome = cashFlow
    .filter(t => t.type === 'in')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = cashFlow
    .filter(t => t.type === 'out')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netProfit = totalIncome - totalExpense;

  const currentCash = (accounts.find(a => a.id === 'acc_cash')?.balance || 0) + 
                      (accounts.find(a => a.id === 'acc_bank_bca')?.balance || 0);

  // --- FINANCIAL REPORT DATA (P&L) ---
  const getProfitLossReport = (): FinancialReportData => {
      const revenue = cashFlow.filter(t => t.category === 'sales').reduce((acc, t) => acc + t.amount, 0);
      const cogs = cashFlow.filter(t => t.category === 'procurement').reduce((acc, t) => acc + t.amount, 0);
      
      const expenses: Record<string, number> = {};
      cashFlow.filter(t => t.type === 'out' && t.category !== 'procurement').forEach(t => {
          // Use implied double entry logic from old structure if necessary
          const catName = t.accountName || t.category;
          expenses[catName] = (expenses[catName] || 0) + t.amount;
      });

      const totalOpExpense = Object.values(expenses).reduce((a, b) => a + b, 0);
      const grossProfit = revenue - cogs;
      const netIncome = grossProfit - totalOpExpense;

      return { revenue, cogs, grossProfit, expenses, totalOpExpense, netIncome };
  };

  // --- BALANCE SHEET DATA (NERACA) ---
  const getBalanceSheet = (): BalanceSheetData => {
      // Logic: Group accounts by category and subcategory
      const assetsCurrent = accounts.filter(a => a.category === 'ASSET' && a.subcategory === 'Lancar');
      const assetsFixed = accounts.filter(a => a.category === 'ASSET' && a.subcategory === 'Tetap');
      
      const liabilitiesCurrent = accounts.filter(a => a.category === 'LIABILITY' && a.subcategory === 'Jangka Pendek');
      const liabilitiesLong = accounts.filter(a => a.category === 'LIABILITY' && a.subcategory !== 'Jangka Pendek');
      
      const equityItems = accounts.filter(a => a.category === 'EQUITY');
      
      // Calculate Current Earnings (Laba Berjalan) from P&L
      const plData = getProfitLossReport();
      const currentEarnings = plData.netIncome;

      // Summation
      const sum = (accs: ChartOfAccount[]) => accs.reduce((acc, curr) => acc + curr.balance, 0);

      const totalAssets = sum(assetsCurrent) + sum(assetsFixed);
      const totalLiabilities = sum(liabilitiesCurrent) + sum(liabilitiesLong);
      
      // Equity = Stored Equity + Retained Earnings (if tracked separately) + Current Earnings
      const retainedEarnings = accounts.find(a => a.id === 'acc_re')?.balance || 0;
      const totalEquity = sum(equityItems) + currentEarnings; // Assuming acc_re is already in equityItems, careful double counting

      // Correction: If acc_re is inside equityItems, we shouldn't add it again, but usually RE is updated at year end.
      // For dynamic display, Total Equity = (Equity Accounts Balance) + (Current Period Net Income).
      // Ensure 'acc_re' in equityItems only reflects PAST periods.
      
      return {
          assets: {
              current: assetsCurrent,
              fixed: assetsFixed,
              total: totalAssets
          },
          liabilities: {
              current: liabilitiesCurrent,
              longTerm: liabilitiesLong,
              total: totalLiabilities
          },
          equity: {
              items: equityItems,
              retainedEarnings: retainedEarnings,
              currentEarnings: currentEarnings,
              total: totalEquity
          }
      };
  };

  // --- GENERAL LEDGER LOGIC (BUKU BESAR) ---
  const generalLedgerData = useMemo(() => {
      if (ledgerAccount === 'All') return [];
      
      // Filter transactions affecting this account
      // In full double entry, we'd check journal lines.
      // Here we map implied logic:
      // If Cash selected: Show all (as most hit cash).
      // If Expense selected: Show tx where accountId matches.
      
      return cashFlow.filter(t => {
          if (t.accountId === ledgerAccount) return true; // Direct hit
          if (t.debitAccountId === ledgerAccount || t.creditAccountId === ledgerAccount) return true; // Explicit hit
          
          // Legacy/Simple support:
          // If searching for Cash/Bank, and tx type is 'in'/'out' with no specific debit/credit, assume cash hit.
          const isCashAccount = accounts.find(a => a.id === ledgerAccount)?.category === 'ASSET' && accounts.find(a => a.id === ledgerAccount)?.subcategory === 'Lancar';
          if (isCashAccount && !t.debitAccountId && !t.creditAccountId) return true;
          
          return false;
      });
  }, [cashFlow, ledgerAccount, accounts]);


  // --- CHART DATA GENERATOR ---
  const getChartData = () => {
      // Group by Month (Last 6 Months)
      const data = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthName = d.toLocaleString('default', { month: 'short' });
          
          const income = cashFlow
            .filter(t => t.type === 'in' && new Date(t.timestamp).getMonth() === d.getMonth() && new Date(t.timestamp).getFullYear() === d.getFullYear())
            .reduce((acc, t) => acc + t.amount, 0);
            
          const expense = cashFlow
            .filter(t => t.type === 'out' && new Date(t.timestamp).getMonth() === d.getMonth() && new Date(t.timestamp).getFullYear() === d.getFullYear())
            .reduce((acc, t) => acc + t.amount, 0);

          data.push({ month: monthName, income, expense });
      }
      return data;
  };

  // --- BUDGET CALCULATION ---
  const budgetStatus = useMemo(() => {
     return budgets.map(b => {
         // Calculate spent for this budget's account
         const spent = cashFlow
            .filter(t => t.accountId === b.accountId && t.type === 'out')
            .reduce((acc, t) => acc + t.amount, 0);
         
         return {
             ...b,
             spent,
             percent: Math.min((spent / b.limit) * 100, 100),
             remaining: b.limit - spent
         };
     });
  }, [budgets, cashFlow]);

  // --- ACTIONS ---
  // Updated to handle Double Entry Implications & Attachment
  const addTransaction = async (data: any) => {
      if (!activeOutlet || !currentUser) return;
      
      // Determine Debit/Credit based on simple UI selection
      // If Expense (Out): Debit = Expense Account, Credit = Cash/Bank
      // If Income (In): Debit = Cash/Bank, Credit = Revenue Account
      
      let debitId = '';
      let creditId = '';
      
      if (data.type === 'out') {
          debitId = data.accountId; // The expense account selected
          creditId = data.sourceAccountId || 'acc_cash'; // Default to petty cash if not specified
      } else {
          debitId = data.sourceAccountId || 'acc_cash'; // Money goes into here
          creditId = data.accountId; // Revenue source
      }

      const newTx: CashTransaction = {
          id: `TRX-${Date.now()}`,
          outletId: activeOutlet.id,
          staffName: currentUser.name,
          timestamp: new Date().toISOString(),
          amount: data.amount,
          type: data.type,
          category: data.category,
          note: data.note,
          accountId: data.accountId, // Legacy support
          accountName: data.accountName,
          debitAccountId: debitId,
          creditAccountId: creditId,
          attachment: data.attachment // New Field
      };
      
      await db.cashFlow.add(newTx);
      
      // Update Account Balances (Double Entry)
      const debitAcc = await db.accounts.get(debitId);
      const creditAcc = await db.accounts.get(creditId);
      
      if (debitAcc) {
          // Assets/Expenses increase on Debit
          const isNormalDebit = debitAcc.category === 'ASSET' || debitAcc.category === 'EXPENSE';
          const newBalance = isNormalDebit ? debitAcc.balance + data.amount : debitAcc.balance - data.amount;
          await db.accounts.update(debitId, { balance: newBalance });
      }
      
      if (creditAcc) {
          // Liab/Equity/Revenue increase on Credit
          const isNormalCredit = creditAcc.category === 'LIABILITY' || creditAcc.category === 'EQUITY' || creditAcc.category === 'REVENUE';
          const newBalance = isNormalCredit ? creditAcc.balance + data.amount : creditAcc.balance - data.amount;
          await db.accounts.update(creditId, { balance: newBalance });
      }
  };

  // Get recent transactions (sorted by date desc)
  const recentTransactions = useMemo(() => {
      if (!searchTerm) return cashFlow.slice(0, 50);
      return cashFlow.filter(t => 
          t.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.category.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 50);
  }, [cashFlow, searchTerm]);

  return {
    activeTab, setActiveTab,
    searchTerm, setSearchTerm,
    totalIncome,
    totalExpense,
    netProfit,
    currentCash,
    recentTransactions,
    accounts,
    budgetStatus,
    profitLoss: getProfitLossReport(),
    balanceSheet: getBalanceSheet(),
    chartData: getChartData(),
    addTransaction,
    
    // Ledger Props
    ledgerAccount, setLedgerAccount,
    generalLedgerData
  };
};
