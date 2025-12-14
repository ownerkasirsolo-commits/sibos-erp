
import React, { useState } from 'react';
import { 
    Calculator, TrendingUp, TrendingDown, DollarSign, 
    PieChart, Activity, FileText, Wallet, Search, Plus
} from 'lucide-react';
import { useAccountingLogic } from './hooks/useAccountingLogic';
import TransactionTable from './components/TransactionTable';
import StatWidget from '../../components/common/StatWidget';
import GlassPanel from '../../components/common/GlassPanel';
import GlassInput from '../../components/common/GlassInput';
import SectionHeader from '../../components/common/SectionHeader';
import CompactNumber from '../../components/common/CompactNumber';
import FinancialOverview from './components/FinancialOverview';
import BudgetingView from './components/BudgetingView';
import FinancialReports from './components/FinancialReports';
import JournalEntryModal from './components/JournalEntryModal';

const Accounting: React.FC = () => {
  const { 
      activeTab, setActiveTab, 
      totalIncome, totalExpense, netProfit, currentCash,
      recentTransactions, 
      accounts, budgetStatus, profitLoss, balanceSheet, chartData,
      searchTerm, setSearchTerm, addTransaction
  } = useAccountingLogic();

  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* 1. HEADER STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
         <StatWidget 
            label="Saldo Kas & Bank" 
            value={currentCash} 
            icon={Wallet} 
            colorClass="text-blue-400" 
            bgClass="bg-blue-500/10 border-blue-500/20"
         />
         <StatWidget 
            label="Pemasukan (Bulan Ini)" 
            value={totalIncome} 
            icon={TrendingUp} 
            colorClass="text-green-400" 
            bgClass="bg-green-500/10 border-green-500/20"
         />
         <StatWidget 
            label="Pengeluaran (Bulan Ini)" 
            value={totalExpense} 
            icon={TrendingDown} 
            colorClass="text-red-400" 
            bgClass="bg-red-500/10 border-red-500/20"
         />
         <StatWidget 
            label="Laba Bersih" 
            value={netProfit} 
            icon={DollarSign} 
            colorClass={netProfit >= 0 ? "text-orange-400" : "text-red-400"} 
            bgClass="bg-orange-500/10 border-orange-500/20"
         />
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="flex bg-black/20 p-1 rounded-xl w-full md:w-fit md:mx-auto overflow-x-auto no-scrollbar sticky top-0 z-30 backdrop-blur-md">
            {[
                { id: 'dashboard', label: 'Dashboard', icon: PieChart },
                { id: 'journal', label: 'Jurnal Transaksi', icon: FileText },
                { id: 'report', label: 'Laporan Keuangan', icon: Activity },
                { id: 'budget', label: 'Anggaran (Budget)', icon: Calculator },
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={(e) => {
                        setActiveTab(tab.id as any);
                        e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    }}
                    className={`flex-1 md:flex-none py-2.5 px-6 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                        activeTab === tab.id 
                        ? 'bg-orange-600 text-white shadow-lg' 
                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                    }`}
                >
                    <tab.icon size={14} />
                    <span>{tab.label}</span>
                </button>
            ))}
      </div>

      {/* 3. MAIN CONTENT */}
      <div className="animate-in fade-in zoom-in-95 duration-300">
          
          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
              <FinancialOverview chartData={chartData} accounts={accounts} />
          )}

          {/* TAB: JOURNAL */}
          {activeTab === 'journal' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-9 space-y-4">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center">
                          <SectionHeader title="Jurnal Transaksi" subtitle="Rekapitulasi arus kas masuk dan keluar." />
                          <div className="flex gap-2 w-full sm:w-auto">
                              <GlassInput 
                                icon={Search}
                                placeholder="Cari transaksi..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="py-2.5 text-sm"
                                wrapperClassName="flex-1 sm:w-64"
                              />
                              <button 
                                onClick={() => setIsEntryModalOpen(true)}
                                className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm shadow-lg whitespace-nowrap"
                              >
                                  <Plus size={18} /> Catat
                              </button>
                          </div>
                      </div>
                      <TransactionTable transactions={recentTransactions} />
                  </div>
                  <div className="lg:col-span-3 space-y-4">
                      <GlassPanel className="p-5 rounded-2xl border border-white/5">
                          <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Saldo Akun</h4>
                          <div className="space-y-3">
                              {accounts.filter(a => a.category === 'ASSET' && (a.name.includes('Kas') || a.name.includes('Bank'))).map(acc => (
                                  <div key={acc.id} className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                                      <span className="text-xs text-gray-400">{acc.name}</span>
                                      <span className="text-sm font-bold text-white"><CompactNumber value={acc.balance} /></span>
                                  </div>
                              ))}
                          </div>
                      </GlassPanel>
                  </div>
              </div>
          )}

          {/* TAB: REPORT */}
          {activeTab === 'report' && (
             <FinancialReports data={profitLoss} balanceSheet={balanceSheet} />
          )}

           {/* TAB: BUDGET */}
           {activeTab === 'budget' && (
              <BudgetingView budgets={budgetStatus} />
          )}
      </div>

      {/* MODAL: MANUAL ENTRY */}
      <JournalEntryModal 
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        onSave={addTransaction}
        accounts={accounts}
      />
    </div>
  );
};

export default Accounting;
