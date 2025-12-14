
import React from 'react';
import { Calculator, AlertCircle, Plus } from 'lucide-react';
import GlassPanel from '../../../components/common/GlassPanel';
import CompactNumber from '../../../components/common/CompactNumber';
import { BudgetPlan } from '../types';

interface BudgetingViewProps {
    budgets: (BudgetPlan & { percent: number, remaining: number })[];
}

const BudgetingView: React.FC<BudgetingViewProps> = ({ budgets }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {budgets.map(budget => (
            <GlassPanel key={budget.id} className="p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl ${budget.percent > 90 ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            <Calculator size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg">{budget.accountName}</h4>
                            <p className="text-xs text-gray-400">Limit: <CompactNumber value={budget.limit} forceFull/></p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-gray-500 uppercase">Terpakai</p>
                        <p className={`text-xl font-bold ${budget.percent > 90 ? 'text-red-400' : 'text-white'}`}>
                            <CompactNumber value={budget.spent} forceFull />
                        </p>
                    </div>
                </div>

                <div className="relative h-4 bg-black/40 rounded-full overflow-hidden mb-2 z-10">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                            budget.percent > 100 ? 'bg-red-600' : 
                            budget.percent > 80 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}
                        style={{width: `${Math.min(budget.percent, 100)}%`}}
                    ></div>
                </div>
                
                <div className="flex justify-between items-center text-xs relative z-10">
                    <span className={`${budget.percent > 90 ? 'text-red-400 font-bold' : 'text-gray-400'}`}>
                        {budget.percent.toFixed(1)}% Digunakan
                    </span>
                    <span className="text-gray-300">
                        Sisa: <span className="font-bold text-green-400"><CompactNumber value={budget.remaining} forceFull/></span>
                    </span>
                </div>

                {budget.percent > 90 && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-xs text-red-200 animate-pulse relative z-10">
                        <AlertCircle size={14} /> 
                        <span>Peringatan: Budget hampir habis atau over limit!</span>
                    </div>
                )}
                
                {/* Background Decor */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${budget.percent > 90 ? 'from-red-500/10' : 'from-blue-500/10'} to-transparent rounded-bl-full pointer-events-none`}></div>
            </GlassPanel>
        ))}

        <button className="p-6 rounded-3xl border-2 border-dashed border-white/10 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all flex flex-col items-center justify-center text-gray-400 hover:text-orange-400 group h-[200px]">
            <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-orange-500/20 flex items-center justify-center mb-3 transition-colors">
                <Plus size={32} />
            </div>
            <span className="font-bold text-sm">Buat Anggaran Baru</span>
        </button>
    </div>
  );
};

export default BudgetingView;
