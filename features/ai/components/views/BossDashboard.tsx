
import React, { useEffect } from 'react';
import { useBossLogic } from '../../hooks/useBossLogic';
import { BrainCircuit, Sparkles, Target, Zap, ArrowRight, Activity, TrendingUp } from 'lucide-react';
import GlassPanel from '../../../../components/common/GlassPanel';
import StatWidget from '../../../../components/common/StatWidget';
import ZombieMatrix from '../widgets/ZombieMatrix';
import ForecastChart from '../widgets/ForecastChart';

const BossDashboard: React.FC = () => {
    const { 
        stats, 
        isAnalyzing, 
        briefing, 
        strategy, 
        zombieProducts,
        generateMorningBriefing,
        generateMarketingStrategy
    } = useBossLogic();

    // Auto-generate briefing on mount if empty
    useEffect(() => {
        if (!briefing && !isAnalyzing) {
            generateMorningBriefing();
        }
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            
            {/* EXECUTIVE HEADER */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0f172a] to-[#1e1b4b] border border-indigo-500/20 p-8 shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>
                
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-500 rounded-xl text-white shadow-lg shadow-indigo-500/40">
                                <BrainCircuit size={24} />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tight">The Boss Dashboard</h1>
                        </div>
                        
                        {/* AI Briefing Area */}
                        <div className="bg-black/30 border border-white/10 rounded-2xl p-6 relative">
                            <h2 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Sparkles size={14} /> Morning Briefing
                            </h2>
                            {isAnalyzing && !briefing ? (
                                <div className="flex items-center gap-3 text-gray-400 animate-pulse">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                    <p className="text-sm">Gemini sedang menganalisis data bisnis Anda...</p>
                                </div>
                            ) : (
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <p className="text-gray-200 leading-relaxed text-base">
                                        {briefing ? briefing.split('\n').map((line, i) => (
                                            <span key={i} className="block mb-2">{line}</span>
                                        )) : "Klik tombol refresh untuk analisa terbaru."}
                                    </p>
                                </div>
                            )}
                             <button 
                                onClick={generateMorningBriefing}
                                disabled={isAnalyzing}
                                className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                title="Refresh Analisa"
                            >
                                <Zap size={16} className={isAnalyzing ? 'animate-spin' : ''} />
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats Summary */}
                    <div className="space-y-4">
                         <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                             <div>
                                 <p className="text-xs text-gray-400 uppercase font-bold">Revenue (30d)</p>
                                 <p className="text-2xl font-bold text-white">Rp {(stats.totalRevenue / 1000000).toFixed(1)}jt</p>
                             </div>
                             <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                 <TrendingUp size={20} />
                             </div>
                         </div>
                         <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                             <div>
                                 <p className="text-xs text-gray-400 uppercase font-bold">Total Transaksi</p>
                                 <p className="text-2xl font-bold text-white">{stats.totalTx}</p>
                             </div>
                             <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                 <Activity size={20} />
                             </div>
                         </div>
                    </div>
                </div>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. SALES FORECAST */}
                <ForecastChart />

                {/* 2. ZOMBIE MENU */}
                <ZombieMatrix products={zombieProducts} />

            </div>

            {/* STRATEGY WAR ROOM */}
            <GlassPanel className="p-8 rounded-3xl bg-gradient-to-br from-indigo-900/20 to-black border-indigo-500/30">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Target className="text-indigo-400" /> War Room Strategy
                        </h3>
                        <p className="text-sm text-gray-400">Rencana aksi taktis untuk minggu ini.</p>
                    </div>
                    <button 
                        onClick={generateMarketingStrategy}
                        disabled={isAnalyzing}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        <Sparkles size={18} /> {isAnalyzing ? 'Meracik Strategi...' : 'Generate Strategi Baru'}
                    </button>
                </div>

                <div className="bg-black/40 border border-white/10 rounded-2xl p-6 min-h-[150px]">
                    {strategy ? (
                        <div className="text-gray-200 leading-relaxed whitespace-pre-wrap font-medium">
                            {strategy}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
                            <Target size={48} className="mb-4" />
                            <p>Belum ada strategi aktif. Minta AI untuk membuat rencana.</p>
                        </div>
                    )}
                </div>
                
                {strategy && (
                    <div className="mt-6 flex justify-end">
                        <button className="flex items-center gap-2 text-indigo-400 font-bold hover:text-white transition-colors text-sm">
                            Eksekusi Campaign di Omnichannel <ArrowRight size={16} />
                        </button>
                    </div>
                )}
            </GlassPanel>

        </div>
    );
};

export default BossDashboard;
