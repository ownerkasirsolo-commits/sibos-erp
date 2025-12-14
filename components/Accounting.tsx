
import React from 'react';
import { Calculator } from 'lucide-react';
import { useAccountingLogic } from '../hooks/useAccountingLogic';
import FinancialOverview from './accounting/FinancialOverview';
import TransactionTable from './accounting/TransactionTable';

const Accounting: React.FC = () => {
  const { totalIncome, totalExpense, netProfit, recentTransactions } = useAccountingLogic();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-xl font-bold text-white flex items-center gap-2">
               <Calculator className="text-orange-500" /> Akuntansi
           </h2>
           <p className="text-sm text-gray-400">Laporan keuangan realtime.</p>
        </div>
        <div className="flex gap-2">
            <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-sm font-bold border border-white/10">
                Export
            </button>
            <button className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-orange-600/20">
                Catat +
            </button>
        </div>
      </div>

      <FinancialOverview income={totalIncome} expense={totalExpense} profit={netProfit} />
      
      <TransactionTable transactions={recentTransactions} />
    </div>
  );
};

export default Accounting;
