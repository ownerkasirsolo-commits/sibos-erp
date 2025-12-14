
import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import CompactNumber from '../../../components/common/CompactNumber';
import GlassPanel from '../../../components/common/GlassPanel';
import { ChartOfAccount } from '../types';

interface FinancialOverviewProps {
    chartData: { month: string; income: number; expense: number }[];
    accounts: ChartOfAccount[];
}

const FinancialOverview: React.FC<FinancialOverviewProps> = ({ chartData, accounts }) => {
  const liquidAssets = accounts.filter(a => a.category === 'ASSET' && (a.name.includes('Kas') || a.name.includes('Bank')));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART SECTION */}
        <GlassPanel className="lg:col-span-2 p-6 rounded-3xl bg-black/20 border border-white/5 relative overflow-hidden flex flex-col h-[400px]">
            <h3 className="text-lg font-bold text-white mb-6">Analisis Arus Kas (6 Bulan)</h3>
            
            <div className="flex-1 flex items-end justify-between gap-4 relative z-10 px-2 pb-6">
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10 z-0">
                    {[1,2,3,4].map(i => <div key={i} className="border-t border-white border-dashed w-full h-1/4"></div>)}
                </div>

                {chartData.map((d, i) => {
                    // Simple normalization for visualization
                    const maxVal = Math.max(...chartData.map(c => Math.max(c.income, c.expense)));
                    const incH = maxVal > 0 ? (d.income / maxVal) * 100 : 0;
                    const expH = maxVal > 0 ? (d.expense / maxVal) * 100 : 0;

                    return (
                        <div key={i} className="flex-1 h-full flex flex-col justify-end gap-1 group relative">
                            {/* Income Bar */}
                            <div 
                                className="w-full bg-green-500/50 rounded-t-sm transition-all duration-500 hover:bg-green-400 relative" 
                                style={{height: `${Math.max(incH, 1)}%`}}
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-green-400 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-20">
                                    +<CompactNumber value={d.income} forceFull />
                                </div>
                            </div>
                            {/* Expense Bar */}
                            <div 
                                className="w-full bg-red-500/50 rounded-t-sm transition-all duration-500 hover:bg-red-400 relative" 
                                style={{height: `${Math.max(expH, 1)}%`}}
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-red-400 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-20">
                                    -<CompactNumber value={d.expense} forceFull />
                                </div>
                            </div>
                            <span className="text-[10px] text-gray-500 text-center mt-2 font-bold uppercase">{d.month}</span>
                        </div>
                    );
                })}
            </div>
            
            <div className="flex gap-4 justify-center mt-2">
                <div className="flex items-center gap-2 text-xs text-gray-400"><div className="w-3 h-3 bg-green-500/50 rounded-sm"></div> Pemasukan</div>
                <div className="flex items-center gap-2 text-xs text-gray-400"><div className="w-3 h-3 bg-red-500/50 rounded-sm"></div> Pengeluaran</div>
            </div>
        </GlassPanel>

        {/* ASSET SUMMARY */}
        <div className="flex flex-col gap-4">
             <GlassPanel className="p-6 rounded-3xl bg-blue-900/10 border border-blue-500/20">
                 <h4 className="text-sm font-bold text-blue-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                     <Wallet size={16} /> Aset Lancar
                 </h4>
                 <div className="space-y-4">
                     {liquidAssets.map(acc => (
                         <div key={acc.id}>
                             <div className="flex justify-between items-center mb-1">
                                 <span className="text-sm text-gray-300">{acc.name}</span>
                                 <span className="text-sm font-bold text-white"><CompactNumber value={acc.balance} forceFull /></span>
                             </div>
                             <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden">
                                 <div className="h-full bg-blue-500/50 rounded-full" style={{width: '60%'}}></div>
                             </div>
                         </div>
                     ))}
                 </div>
                 <button className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors">
                     Lihat Semua Akun
                 </button>
             </GlassPanel>

             <GlassPanel className="p-6 rounded-3xl bg-white/5 border border-white/5 flex-1 flex flex-col justify-center items-center text-center">
                 <h4 className="text-xs font-bold text-gray-400 uppercase">Rasio Profit</h4>
                 <div className="mt-2 text-3xl font-black text-green-400">+24.5%</div>
                 <p className="text-[10px] text-gray-500 mt-1">Dibanding bulan lalu</p>
             </GlassPanel>
        </div>
    </div>
  );
};

export default FinancialOverview;
