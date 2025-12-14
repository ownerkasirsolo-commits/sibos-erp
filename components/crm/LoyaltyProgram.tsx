
import React from 'react';
import { Crown, MoreHorizontal } from 'lucide-react';
import GlassPanel from '../common/GlassPanel';

const LoyaltyProgram: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
        <GlassPanel className="p-8 rounded-3xl bg-gradient-to-br from-orange-900/20 to-black border-orange-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-b from-orange-400 to-orange-600 flex items-center justify-center shadow-[0_0_40px_-10px_rgba(249,115,22,0.6)]">
                <Crown size={48} className="text-white" />
            </div>
            <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-white">Loyalty Tier</h3>
                <p className="text-gray-400 mt-2 max-w-lg">
                    Atur syarat kenaikan level member berdasarkan total belanja.
                </p>
                <button className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-xl transition-colors">
                    Config
                </button>
            </div>
            </div>
        </GlassPanel>

        <h3 className="text-lg font-bold text-white mt-8 mb-4">Level Membership</h3>
        <div className="space-y-3">
            {[
            { name: 'Bronze', spend: '0', benefit: 'Basic Point (1%)', color: 'from-orange-700 to-orange-900' },
            { name: 'Silver', spend: '1.000.000', benefit: '1.5x Point, Voucher Ultah', color: 'from-gray-300 to-gray-500' },
            { name: 'Gold', spend: '5.000.000', benefit: '2x Point, Priority Service, Free Drink', color: 'from-yellow-300 to-yellow-600' },
            { name: 'Platinum', spend: '15.000.000', benefit: '3x Point, Personal Manager, All Access', color: 'from-slate-200 to-slate-400' },
            ].map((tier, i) => (
            <GlassPanel key={i} className="p-4 rounded-2xl flex items-center gap-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center shadow-lg`}>
                <Crown size={20} className="text-black/50" />
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div>
                    <h4 className="font-bold text-white text-lg">{tier.name}</h4>
                    <p className="text-xs text-gray-500">Tier Level {i+1}</p>
                    </div>
                    <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Min. Belanja</p>
                    <p className="font-bold text-gray-200">Rp {tier.spend}</p>
                    </div>
                    <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Benefit Utama</p>
                    <p className="text-xs font-medium text-orange-400">{tier.benefit}</p>
                    </div>
                </div>
                <button className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white"><MoreHorizontal size={18}/></button>
            </GlassPanel>
            ))}
        </div>
    </div>
  );
};

export default LoyaltyProgram;
