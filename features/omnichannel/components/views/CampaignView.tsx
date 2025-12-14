
import React from 'react';
import { Megaphone, Plus, Eye, TrendingUp } from 'lucide-react';
import GlassPanel from '../../../../components/common/GlassPanel';
import StatWidget from '../../../../components/common/StatWidget';

interface CampaignViewProps {
    stats: { active: number; reach: number; conversion: number };
}

const CampaignView: React.FC<CampaignViewProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in zoom-in-95">
        <div className="lg:col-span-9">
            <div className="glass-panel p-6 rounded-3xl border border-white/5 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 bg-pink-500/20 rounded-full flex items-center justify-center mb-6 text-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.3)]">
                    <Megaphone size={40} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Campaign & Promo</h3>
                <p className="text-gray-400 max-w-md leading-relaxed">
                    Buat promo diskon coret, bundling, atau flash sale di semua platform sekaligus untuk meningkatkan penjualan.
                </p>
                <button className="mt-8 px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-pink-600/20 hover:scale-105 transition-transform flex items-center gap-2">
                    <Plus size={20} /> Buat Campaign Baru
                </button>
            </div>
        </div>
        
        <div className="lg:col-span-3">
            <GlassPanel className="p-5 rounded-2xl border border-white/5">
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Performa Promo</h4>
            <StatWidget 
                label="Campaign Aktif" 
                value={stats.active} 
                icon={Megaphone} 
                colorClass="text-pink-400" 
                bgClass="bg-pink-500/10 border-pink-500/20 mb-3"
            />
            <StatWidget 
                label="Jangkauan" 
                value={stats.reach} 
                icon={Eye} 
                colorClass="text-blue-400" 
                bgClass="bg-blue-500/10 border-blue-500/20 mb-3"
            />
                <StatWidget 
                label="Konversi" 
                value={`${stats.conversion}%`} 
                icon={TrendingUp} 
                colorClass="text-green-400" 
                bgClass="bg-green-500/10 border-green-500/20"
            />
        </GlassPanel>
        </div>
    </div>
  );
};

export default CampaignView;
