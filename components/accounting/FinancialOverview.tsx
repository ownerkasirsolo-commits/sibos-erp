
import React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import CompactNumber from '../common/CompactNumber';
import GlassPanel from '../common/GlassPanel';

interface FinancialOverviewProps {
    income: number;
    expense: number;
    profit: number;
}

const FinancialOverview: React.FC<FinancialOverviewProps> = ({ income, expense, profit }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassPanel className="p-6 rounded-3xl bg-gradient-to-br from-green-600/10 to-green-400/5 border-green-500/20">
            <p className="text-sm text-gray-400 mb-1">Total Pemasukan</p>
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="text-green-500" size={24} /> <CompactNumber value={income} />
            </h3>
        </GlassPanel>
        
        <GlassPanel className="p-6 rounded-3xl bg-gradient-to-br from-red-600/10 to-red-400/5 border-red-500/20">
            <p className="text-sm text-gray-400 mb-1">Total Pengeluaran</p>
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <TrendingDown className="text-red-500" size={24} /> <CompactNumber value={expense} />
            </h3>
        </GlassPanel>
        
        <GlassPanel className="p-6 rounded-3xl bg-gradient-to-br from-blue-600/10 to-blue-400/5 border-blue-500/20">
            <p className="text-sm text-gray-400 mb-1">Laba Bersih</p>
            <h3 className={`text-2xl font-bold flex items-center gap-2 ${profit >= 0 ? 'text-white' : 'text-red-400'}`}>
                <DollarSign className="text-blue-500" size={24} /> <CompactNumber value={profit} />
            </h3>
        </GlassPanel>
    </div>
  );
};

export default FinancialOverview;
