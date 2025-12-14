
import React, { useMemo } from 'react';
import Modal from '../../../../components/common/Modal';
import { PieChart, Users, Building2, Star, Download, Printer, Network } from 'lucide-react';
import { Supplier } from '../../types';

interface SupplierReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    suppliers: Supplier[];
}

const SupplierReportModal: React.FC<SupplierReportModalProps> = ({ isOpen, onClose, suppliers }) => {
    
    // --- ANALYTICS LOGIC ---
    const stats = useMemo(() => {
        const totalSuppliers = suppliers.length;
        const networkSuppliers = suppliers.filter(s => s.isSibosNetwork).length;
        
        // Category Distribution
        const categoryMap: Record<string, number> = {};
        suppliers.forEach(s => {
            categoryMap[s.category] = (categoryMap[s.category] || 0) + 1;
        });
        
        const categories = Object.entries(categoryMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        // Top Performers
        const topPerformers = [...suppliers]
            .sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0))
            .slice(0, 5);

        // Average Score
        const avgScore = totalSuppliers > 0 
            ? suppliers.reduce((acc, curr) => acc + (curr.performanceScore || 0), 0) / totalSuppliers 
            : 0;

        return { totalSuppliers, networkSuppliers, categories, topPerformers, avgScore };
    }, [suppliers]);

    // Pie Chart CSS Generator
    const getConicGradient = () => {
        let currentDeg = 0;
        const total = stats.totalSuppliers || 1;
        const colors = ['#f97316', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899'];
        
        const segments = stats.categories.map((cat, i) => {
            const deg = (cat.value / total) * 360;
            const color = colors[i % colors.length];
            const segment = `${color} ${currentDeg}deg ${currentDeg + deg}deg`;
            currentDeg += deg;
            return segment;
        });

        return `conic-gradient(${segments.join(', ')})`;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Laporan Database Supplier" size="lg">
            <div className="space-y-6">
                
                {/* 1. KEY METRICS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600/20 to-blue-900/10 border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Building2 className="text-blue-400" size={18} />
                            <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">Total Mitra</span>
                        </div>
                        <p className="text-2xl font-black text-white">{stats.totalSuppliers}</p>
                    </div>
                    
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                            <Network className="text-cyan-400" size={18} />
                            <span className="text-xs font-bold text-cyan-200 uppercase tracking-wider">B2B Network</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.networkSuppliers}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                            <Star className="text-yellow-400" size={18} />
                            <span className="text-xs font-bold text-yellow-200 uppercase tracking-wider">Rata2 Skor</span>
                        </div>
                        <p className="text-2xl font-bold text-yellow-400">{stats.avgScore.toFixed(1)}</p>
                    </div>
                </div>

                {/* 2. VISUALIZATION & BREAKDOWN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* CHART */}
                    <div className="glass-panel p-5 rounded-2xl bg-black/20">
                        <h4 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                            <PieChart size={16} className="text-orange-500"/> Distribusi Kategori
                        </h4>
                        <div className="flex items-center gap-6">
                            {/* CSS Pie Chart */}
                            <div className="w-32 h-32 rounded-full relative shrink-0" style={{ background: getConicGradient() }}>
                                <div className="absolute inset-4 bg-[#131b2d] rounded-full flex items-center justify-center">
                                    <span className="text-[10px] text-gray-500 font-bold">BY TYPE</span>
                                </div>
                            </div>
                            
                            {/* Legend */}
                            <div className="flex-1 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                {stats.categories.map((cat, i) => {
                                    const colors = ['bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
                                    const percent = ((cat.value / stats.totalSuppliers) * 100).toFixed(1);
                                    return (
                                        <div key={cat.name} className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${colors[i % colors.length]}`}></div>
                                                <span className="text-gray-300">{cat.name}</span>
                                            </div>
                                            <span className="font-bold text-white">{percent}%</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* TOP PERFORMERS */}
                    <div className="glass-panel p-5 rounded-2xl bg-black/20">
                        <h4 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                            <Star size={16} className="text-yellow-500"/> Top 5 Performa Terbaik
                        </h4>
                        <div className="space-y-3">
                            {stats.topPerformers.map((sup, i) => (
                                <div key={sup.id} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-gray-600">#{i+1}</span>
                                        <div>
                                            <p className="text-sm font-bold text-gray-200">{sup.name}</p>
                                            <p className="text-[10px] text-gray-500">{sup.category}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                                        {sup.performanceScore}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                    <button className="px-4 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 flex items-center gap-2 text-xs font-bold transition-colors">
                        <Printer size={16} /> Cetak
                    </button>
                    <button className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 text-xs font-bold shadow-lg shadow-blue-600/20 transition-all">
                        <Download size={16} /> Download PDF
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default SupplierReportModal;
