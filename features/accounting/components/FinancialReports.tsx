
import React, { useState } from 'react';
import { Download, Printer, PieChart, Activity, FileText } from 'lucide-react';
import GlassPanel from '../../../components/common/GlassPanel';
import CompactNumber from '../../../components/common/CompactNumber';
import { FinancialReportData, BalanceSheetData } from '../types';

interface FinancialReportsProps {
    data: FinancialReportData; // P&L Data
    balanceSheet?: BalanceSheetData; // New Prop
}

const FinancialReports: React.FC<FinancialReportsProps> = ({ data, balanceSheet }) => {
  const [reportType, setReportType] = useState<'pl' | 'bs'>('pl'); // PL = Profit Loss, BS = Balance Sheet

  const renderProfitLoss = () => (
     <div className="space-y-6 text-sm animate-in fade-in">
         {/* REVENUE */}
         <div>
             <div className="flex justify-between font-bold text-lg mb-2">
                 <span>Pendapatan Usaha</span>
                 <span><CompactNumber value={data.revenue} currency textClassName="text-black" forceFull/></span>
             </div>
             <div className="flex justify-between text-gray-600 pl-4 border-l-2 border-gray-200">
                 <span>Harga Pokok Penjualan (HPP)</span>
                 <span>(<CompactNumber value={data.cogs} currency textClassName="text-gray-600" forceFull/>)</span>
             </div>
             <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-gray-300">
                 <span>Laba Kotor (Gross Profit)</span>
                 <span className="text-blue-700"><CompactNumber value={data.grossProfit} currency textClassName="text-blue-700" forceFull/></span>
             </div>
         </div>

         {/* EXPENSES */}
         <div>
             <h4 className="font-bold uppercase text-gray-500 text-xs mb-2">Beban Operasional</h4>
             <div className="space-y-1 pl-4 border-l-2 border-gray-200 mb-2">
                 {Object.entries(data.expenses).map(([name, amount]) => (
                     <div key={name} className="flex justify-between text-gray-600">
                         <span>{name}</span>
                         <span><CompactNumber value={amount} currency textClassName="text-gray-600" forceFull/></span>
                     </div>
                 ))}
             </div>
             <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-300">
                 <span>Total Beban</span>
                 <span>(<CompactNumber value={data.totalOpExpense} currency textClassName="text-black" forceFull/>)</span>
             </div>
         </div>

         {/* NET INCOME */}
         <div className="mt-8 pt-4 border-t-2 border-black flex justify-between items-center bg-gray-100 p-4 rounded-xl">
             <span className="font-black text-xl uppercase">Laba Bersih</span>
             <span className={`font-black text-2xl ${data.netIncome >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                 <CompactNumber value={data.netIncome} currency textClassName={data.netIncome >= 0 ? 'text-green-700' : 'text-red-600'} forceFull/>
             </span>
         </div>
     </div>
  );

  const renderBalanceSheet = () => {
      if (!balanceSheet) return <div className="text-gray-500 text-center py-10">Data Neraca tidak tersedia.</div>;
      
      const { assets, liabilities, equity } = balanceSheet;
      
      return (
        <div className="space-y-8 text-sm animate-in fade-in">
            {/* ASSETS */}
            <div>
                <h3 className="font-bold text-lg text-blue-800 mb-3 border-b border-blue-200 pb-2">AKTIVA (ASSETS)</h3>
                
                <h4 className="font-bold text-gray-600 text-xs uppercase mb-2">Aset Lancar</h4>
                <div className="pl-4 space-y-1 mb-4">
                    {assets.current.map(acc => (
                        <div key={acc.id} className="flex justify-between text-gray-700">
                            <span>{acc.name}</span>
                            <span><CompactNumber value={acc.balance} currency textClassName="text-gray-800" forceFull/></span>
                        </div>
                    ))}
                </div>

                <h4 className="font-bold text-gray-600 text-xs uppercase mb-2">Aset Tetap</h4>
                <div className="pl-4 space-y-1 mb-4">
                    {assets.fixed.map(acc => (
                        <div key={acc.id} className="flex justify-between text-gray-700">
                            <span>{acc.name}</span>
                            <span><CompactNumber value={acc.balance} currency textClassName="text-gray-800" forceFull/></span>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between font-black text-base pt-2 border-t-2 border-blue-800">
                     <span>TOTAL AKTIVA</span>
                     <span className="text-blue-800"><CompactNumber value={assets.total} currency textClassName="text-blue-800" forceFull/></span>
                </div>
            </div>

            {/* PASIVA */}
            <div>
                <h3 className="font-bold text-lg text-red-800 mb-3 border-b border-red-200 pb-2">PASIVA (LIABILITIES + EQUITY)</h3>
                
                <h4 className="font-bold text-gray-600 text-xs uppercase mb-2">Kewajiban (Liabilities)</h4>
                <div className="pl-4 space-y-1 mb-4">
                    {liabilities.current.map(acc => (
                        <div key={acc.id} className="flex justify-between text-gray-700">
                            <span>{acc.name}</span>
                            <span><CompactNumber value={acc.balance} currency textClassName="text-gray-800" forceFull/></span>
                        </div>
                    ))}
                </div>

                <h4 className="font-bold text-gray-600 text-xs uppercase mb-2">Modal (Equity)</h4>
                <div className="pl-4 space-y-1 mb-4">
                    {equity.items.map(acc => (
                        <div key={acc.id} className="flex justify-between text-gray-700">
                            <span>{acc.name}</span>
                            <span><CompactNumber value={acc.balance} currency textClassName="text-gray-800" forceFull/></span>
                        </div>
                    ))}
                    <div className="flex justify-between text-gray-700 font-bold bg-yellow-50 p-1 rounded">
                        <span>Laba Periode Berjalan</span>
                        <span><CompactNumber value={equity.currentEarnings} currency textClassName="text-gray-800" forceFull/></span>
                    </div>
                </div>

                <div className="flex justify-between font-black text-base pt-2 border-t-2 border-red-800">
                     <span>TOTAL PASIVA</span>
                     <span className="text-red-800"><CompactNumber value={liabilities.total + equity.total} currency textClassName="text-red-800" forceFull/></span>
                </div>
            </div>
        </div>
      );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* REPORT CARD */}
        <GlassPanel className="lg:col-span-2 p-0 rounded-3xl bg-white text-black relative overflow-hidden flex flex-col">
             
             {/* Report Tabs */}
             <div className="flex border-b border-gray-200 bg-gray-50">
                 <button 
                    onClick={() => setReportType('pl')}
                    className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${reportType === 'pl' ? 'bg-white text-blue-600 border-t-4 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                     <Activity size={16} /> Laba Rugi
                 </button>
                 <button 
                    onClick={() => setReportType('bs')}
                    className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${reportType === 'bs' ? 'bg-white text-orange-600 border-t-4 border-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                     <FileText size={16} /> Neraca
                 </button>
             </div>

             <div className="p-8 relative z-10">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-50 pointer-events-none mix-blend-multiply"></div>
                 
                 <div className="relative">
                     <div className="text-center mb-8 border-b-2 border-black/10 pb-4">
                         <h2 className="text-2xl font-black uppercase tracking-wide">
                             {reportType === 'pl' ? 'Laporan Laba Rugi' : 'Laporan Neraca'}
                         </h2>
                         <p className="text-sm text-gray-500 font-mono">Periode: Bulan Ini</p>
                     </div>

                     {reportType === 'pl' ? renderProfitLoss() : renderBalanceSheet()}
                 </div>
             </div>
        </GlassPanel>

        {/* ACTIONS */}
        <div className="flex flex-col gap-4">
            <GlassPanel className="p-6 rounded-3xl text-center">
                <h4 className="font-bold text-white mb-4">Export Laporan</h4>
                <div className="space-y-3">
                    <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold flex items-center justify-center gap-2 border border-white/10 transition-colors">
                        <Printer size={18} /> Cetak PDF
                    </button>
                    <button className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-colors">
                        <Download size={18} /> Download Excel
                    </button>
                </div>
            </GlassPanel>

            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200">
                <p className="font-bold mb-1">Tips Akunting:</p>
                {reportType === 'pl' 
                    ? "Laba Rugi menunjukkan performa operasional. Pastikan Total Beban tidak melebihi Gross Profit."
                    : "Neraca harus seimbang (Balance). Total Aktiva wajib sama dengan Total Pasiva."
                }
            </div>
        </div>
    </div>
  );
};

export default FinancialReports;
