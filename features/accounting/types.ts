
// --- ACCOUNTING TYPES ---

export type AccountCategory = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export interface ChartOfAccount {
  id: string;
  code: string; // e.g., 1-1001
  name: string; // e.g., Kas Kecil, Bank BCA
  category: AccountCategory;
  subcategory?: string; // e.g., 'Lancar', 'Tetap', 'Jangka Pendek'
  isSystem: boolean; // Cannot be deleted
  balance: number; // Current balance
}

export interface BudgetPlan {
  id: string;
  accountId: string; // Link to Expense Account
  accountName: string;
  limit: number;
  period: string; // 'Monthly'
  spent: number; // Calculated field
}

export interface CashTransaction {
  id: string;
  outletId: string;
  type: 'in' | 'out'; // Helper for simple UI
  amount: number;
  
  // Double Entry Logic
  debitAccountId: string; // Akun yang bertambah (Debit)
  creditAccountId: string; // Akun yang berkurang (Kredit)
  
  // Legacy/UI Helpers
  category: 'sales' | 'procurement' | 'salary' | 'operational' | 'other';
  note: string;
  timestamp: string | Date; 
  staffName: string;
  refId?: string; // Reference to Order ID or PO ID

  // Optional legacy fields for UI compatibility
  accountId?: string;
  accountName?: string;
  
  // New: Proof of Transaction
  attachment?: string; // Base64 string of the image
}

export interface FinancialReportData {
    revenue: number;
    cogs: number;
    grossProfit: number;
    expenses: Record<string, number>;
    totalOpExpense: number;
    netIncome: number;
}

export interface BalanceSheetData {
    assets: {
        current: ChartOfAccount[];
        fixed: ChartOfAccount[];
        total: number;
    };
    liabilities: {
        current: ChartOfAccount[];
        longTerm: ChartOfAccount[];
        total: number;
    };
    equity: {
        items: ChartOfAccount[];
        retainedEarnings: number;
        currentEarnings: number;
        total: number;
    };
}
