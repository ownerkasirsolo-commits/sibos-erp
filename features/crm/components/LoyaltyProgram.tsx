
import React, { useMemo } from 'react';
import { Crown, MoreHorizontal, Users, TrendingUp } from 'lucide-react';
import GlassPanel from '../../../components/common/GlassPanel';
import { useGlobalContext } from '../../../context/GlobalContext';
import StatWidget from '../../../components/common/StatWidget';

const LoyaltyProgram: React.FC = () => {
  const { customers } = useGlobalContext();

  // Calculate Member Distribution per Tier
  const tierStats = useMemo(() => {
      const distribution = {
          Bronze: 0,
          Silver: 0,
          Gold: 0,
          Platinum: 0
      };
      customers.forEach(c => {
          if (distribution[c.tier] !== undefined) {
              distribution[c.tier]++;
          }
      });
      return distribution;
  }, [customers]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-right-4 relative">
        
        {/* LEFT COLUMN: MAIN CONFIG (9/12) */}
        <div className="lg:col-span-9 flex flex-col gap-6">
            
            {/* Header Banner */}
            <GlassPanel className="p-8 rounded-3xl bg-gradient-to-br from-orange-900/20 to-black border-orange-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-b from-orange-400 to-orange-600 flex items-center justify-center shadow-[0_0_40px_-10px_rgba(234,88,12,0.6)] shrink-0">
                        <Crown size={40} className="text-white" />
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h3 className="text-2xl font-bold text-white">Loyalty Tiers</h3>
                        <p className="text-gray-400 mt-1 max-w-lg text-sm">
                            Atur syarat kenaikan level member berdasarkan total belanja untuk meningkatkan retensi pelanggan jangka panjang.
                        </p>
                    </div>
                    <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-xl transition-colors border border-white/5 whitespace-nowrap">
                        Edit Konfigurasi
                    </button>
                </div>
            </GlassPanel>

            {/* Tier List */}
            <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-orange-500" /> Jenjang & Benefit
                </h3>
                <div className="space-y-3">
                    {[
                    { name: 'Bronze', spend: '0', benefit: 'Basic Point (1%)', color: 'from-orange-700 to-orange-900', iconColor: 'text-orange-200' },
                    { name: 'Silver', spend: '1.000.000', benefit: '1.5x Point, Voucher Ultah', color: 'from-gray-400 to-gray-600', iconColor: 'text-white' },
                    { name: 'Gold', spend: '5.000.000', benefit: '2x Point, Priority Service, Free Drink', color: 'from-yellow-400 to-yellow-600', iconColor: 'text-yellow-100' },
                    { name: 'Platinum', spend: '15.000.000', benefit: '3x Point, Personal Manager, All Access', color: 'from-slate-300 to-slate-500', iconColor: 'text-white' },
                    ].map((tier, i) => (
                    <GlassPanel key={i} className="p-4 rounded-2xl flex items-center gap-6 group hover:border-white/20 transition-all">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center shadow-lg shrink-0`}>
                            <Crown size={20} className={`${tier.iconColor} drop-shadow-md`} />
                        </div>
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                            <div>
                                <h4 className="font-bold text-white text-lg">{tier.name}</h4>
                                <p className="text-xs text-gray-500">Tier Level {i+1}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Min. Belanja</p>
                                <p className="font-bold text-gray-200">Rp {tier.spend}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Benefit Utama</p>
                                <p className="text-xs font-medium text-orange-400">{tier.benefit}</p>
                            </div>
                        </div>
                        <button className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white"><MoreHorizontal size={18}/></button>
                    </GlassPanel>
                    ))}
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: WIDGETS (3/12) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
            <GlassPanel className="p-5 rounded-2xl border border-white/5">
                <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                    <Users size={16} className="text-blue-400"/> Distribusi Member
                </h4>
                <div className="space-y-3">
                    {Object.entries(tierStats).map(([tier, count]) => (
                        <div key={tier} className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${
                                    tier === 'Platinum' ? 'bg-slate-300' : 
                                    tier === 'Gold' ? 'bg-yellow-400' : 
                                    tier === 'Silver' ? 'bg-gray-400' : 'bg-orange-600'
                                }`}></div>
                                <span className="text-sm font-medium text-gray-300">{tier}</span>
                            </div>
                            <span className="font-bold text-white">{count}</span>
                        </div>
                    ))}
                    <div className="w-full h-px bg-white/10 my-2"></div>
                    <div className="flex justify-between items-center px-2">
                        <span className="text-xs text-gray-500">Total</span>
                        <span className="font-bold text-orange-400">{customers.length}</span>
                    </div>
                </div>
            </GlassPanel>

            <GlassPanel className="p-5 rounded-2xl border border-white/5 bg-gradient-to-br from-yellow-600/10 to-transparent">
                <h4 className="font-bold text-yellow-500 mb-2 text-sm uppercase tracking-wider">Pro Tip</h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                    Member <b>Gold</b> dan <b>Platinum</b> berkontribusi 80% dari omset. Pastikan benefit mereka selalu menarik.
                </p>
            </GlassPanel>
        </div>
    </div>
  );
};

export default LoyaltyProgram;
