
import React, { useMemo } from 'react';
import { Ingredient } from '../../types';
import Modal from '../../../../components/common/Modal';
import { PieChart, TrendingUp, DollarSign, Package, AlertTriangle, Download, Printer } from 'lucide-react';
import CompactNumber from '../../../../components/common/CompactNumber';

interface StockReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    ingredients: Ingredient[];
}

const StockReportModal: React.FC<StockReportModalProps> = ({ isOpen, onClose, ingredients }) => {
    
    // --- ANALYTICS LOGIC ---
    const stats = useMemo(() => {
        const totalItems = ingredients.length;
        const totalAssetValue = ingredients.reduce((acc, curr) => acc + (curr.stock * curr.avgCost), 0);
        
        // Category Distribution
        const categoryMap: Record<string, number> = {};
        ingredients.forEach(i => {
            categoryMap[i.category] = (categoryMap[i.category] || 0) + (i.stock * i.avgCost);
        });
        
        const categories = Object.entries(categoryMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value); // Sort descending by value

        // Top 5 High Value Items (Pareto Principle)
        const topValueItems = [...ingredients]
            .sort((a, b) => (b.stock * b.avgCost) - (a.stock * a.avgCost))
            .slice(0, 5);

        // Stock Health
        const stockHealth = {
            good: ingredients.filter(i => i.stock > i.minStock * 2).length,
            warning: ingredients.filter(i => i.stock > i.minStock && i.stock <= i.minStock * 2).length,
            critical: ingredients.filter(i => i.stock <= i.minStock).length
        };

        return { totalItems, totalAssetValue, categories, topValueItems, stockHealth };
    }, [ingredients]);

    // Pie Chart CSS Generator
    const getConicGradient = () => {
        let currentDeg = 0;
        const total = stats.totalAssetValue || 1;
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
        <Modal isOpen={isOpen} onClose={onClose} title="Laporan & Analisa Stok" size="lg">
            <div className="space-y-6">
                
                {/* 1. KEY METRICS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-green-600/20 to-green-900/10 border border-green-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="text-green-400" size={18} />
                            <span className="text-xs font-bold text-green-200 uppercase tracking-wider">Total Aset</span>
                        </div>
                        <p className="text-2xl font-black text-white"><CompactNumber value={stats.totalAssetValue} forceFull /></p>
                    </div>
                    
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                            <Package className="text-blue-400" size={18} />
                            <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">Total SKU</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.totalItems}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="text-red-400" size={18} />
                            <span className="text-xs font-bold text-red-200 uppercase tracking-wider">Perlu Restock</span>
                        </div>
                        <p className="text-2xl font-bold text-red-400">{stats.stockHealth.critical}</p>
                    </div>
                </div>

                {/* 2. VISUALIZATION & BREAKDOWN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* CHART */}
                    <div className="glass-panel p-5 rounded-2xl bg-black/20">
                        <h4 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                            <PieChart size={16} className="text-orange-500"/> Distribusi Nilai Aset
                        </h4>
                        <div className="flex items-center gap-6">
                            {/* CSS Pie Chart */}
                            <div className="w-32 h-32 rounded-full relative shrink-0" style={{ background: getConicGradient() }}>
                                <div className="absolute inset-4 bg-[#131b2d] rounded-full flex items-center justify-center">
                                    <span className="text-[10px] text-gray-500 font-bold">BY VALUE</span>
                                </div>
                            </div>
                            
                            {/* Legend */}
                            <div className="flex-1 space-y-2">
                                {stats.categories.slice(0, 4).map((cat, i) => {
                                    const colors = ['bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
                                    const percent = ((cat.value / stats.totalAssetValue) * 100).toFixed(1);
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

                    {/* TOP ITEMS */}
                    <div className="glass-panel p-5 rounded-2xl bg-black/20">
                        <h4 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                            <TrendingUp size={16} className="text-blue-500"/> Top 5 Aset Terbesar
                        </h4>
                        <div className="space-y-3">
                            {stats.topValueItems.map((item, i) => (
                                <div key={item.id} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-gray-600">#{i+1}</span>
                                        <div>
                                            <p className="text-sm font-bold text-gray-200">{item.name}</p>
                                            <p className="text-[10px] text-gray-500">{item.stock} {item.unit} x <CompactNumber value={item.avgCost} currency={false}/></p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-mono font-bold text-orange-400">
                                        <CompactNumber value={item.stock * item.avgCost} forceFull />
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

export default StockReportModal;
