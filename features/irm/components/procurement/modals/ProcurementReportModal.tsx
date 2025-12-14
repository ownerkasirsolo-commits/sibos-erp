
import React, { useMemo } from 'react';
import Modal from '../../../../../../components/common/Modal';
import { PieChart, TrendingUp, DollarSign, Package, Download, Printer, ShoppingCart } from 'lucide-react';
import CompactNumber from '../../../../../../components/common/CompactNumber';
import { PurchaseOrder } from '../../../types';

interface ProcurementReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    purchaseOrders: PurchaseOrder[];
}

const ProcurementReportModal: React.FC<ProcurementReportModalProps> = ({ isOpen, onClose, purchaseOrders }) => {
    
    // --- ANALYTICS LOGIC ---
    const stats = useMemo(() => {
        // Filter out cancelled POs for valid stats
        const validPOs = purchaseOrders.filter(po => po.status !== 'cancelled' && po.status !== 'rejected');
        
        const totalSpend = validPOs.reduce((acc, curr) => acc + curr.totalEstimated, 0);
        const totalPOs = validPOs.length;
        
        // Supplier Distribution
        const supplierMap: Record<string, number> = {};
        validPOs.forEach(po => {
            supplierMap[po.supplierName] = (supplierMap[po.supplierName] || 0) + po.totalEstimated;
        });
        
        const topSuppliers = Object.entries(supplierMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5

        // Status Breakdown
        const statusBreakdown = {
            draft: purchaseOrders.filter(po => po.status === 'draft').length,
            pending: purchaseOrders.filter(po => po.status === 'pending' || po.status === 'pending_approval').length,
            completed: purchaseOrders.filter(po => po.status === 'received').length,
            processing: purchaseOrders.filter(po => ['ordered', 'processed', 'shipped'].includes(po.status)).length
        };

        // Average PO Value
        const avgPOValue = totalPOs > 0 ? totalSpend / totalPOs : 0;

        return { totalSpend, totalPOs, topSuppliers, statusBreakdown, avgPOValue };
    }, [purchaseOrders]);

    // Pie Chart CSS Generator
    const getConicGradient = () => {
        let currentDeg = 0;
        const total = stats.totalSpend || 1;
        const colors = ['#f97316', '#3b82f6', '#22c55e', '#eab308', '#a855f7'];
        
        const segments = stats.topSuppliers.map((sup, i) => {
            const deg = (sup.value / total) * 360;
            const color = colors[i % colors.length];
            const segment = `${color} ${currentDeg}deg ${currentDeg + deg}deg`;
            currentDeg += deg;
            return segment;
        });

        // Fill remaining with grey if not 100% (e.g. other suppliers)
        if (currentDeg < 360) {
            segments.push(`#334155 ${currentDeg}deg 360deg`);
        }

        return `conic-gradient(${segments.join(', ')})`;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Laporan Belanja & Procurement" size="lg">
            <div className="space-y-6">
                
                {/* 1. KEY METRICS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600/20 to-blue-900/10 border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="text-blue-400" size={18} />
                            <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">Total Belanja</span>
                        </div>
                        <p className="text-2xl font-black text-white"><CompactNumber value={stats.totalSpend} forceFull /></p>
                    </div>
                    
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                            <ShoppingCart className="text-orange-400" size={18} />
                            <span className="text-xs font-bold text-orange-200 uppercase tracking-wider">Total PO</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.totalPOs}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="text-green-400" size={18} />
                            <span className="text-xs font-bold text-green-200 uppercase tracking-wider">Rata-rata PO</span>
                        </div>
                        <p className="text-2xl font-bold text-white"><CompactNumber value={stats.avgPOValue} forceFull /></p>
                    </div>
                </div>

                {/* 2. VISUALIZATION & BREAKDOWN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* CHART */}
                    <div className="glass-panel p-5 rounded-2xl bg-black/20">
                        <h4 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                            <PieChart size={16} className="text-orange-500"/> Top 5 Supplier
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
                                {stats.topSuppliers.map((sup, i) => {
                                    const colors = ['bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
                                    const percent = ((sup.value / stats.totalSpend) * 100).toFixed(1);
                                    return (
                                        <div key={sup.name} className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${colors[i % colors.length]}`}></div>
                                                <span className="text-gray-300 truncate max-w-[100px]">{sup.name}</span>
                                            </div>
                                            <span className="font-bold text-white">{percent}%</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* STATUS BREAKDOWN */}
                    <div className="glass-panel p-5 rounded-2xl bg-black/20">
                        <h4 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                            <Package size={16} className="text-blue-500"/> Status Pesanan
                        </h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg border border-white/5">
                                <span className="text-xs text-gray-400">Selesai (Received)</span>
                                <span className="text-sm font-bold text-green-400">{stats.statusBreakdown.completed}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg border border-white/5">
                                <span className="text-xs text-gray-400">Diproses / Dikirim</span>
                                <span className="text-sm font-bold text-blue-400">{stats.statusBreakdown.processing}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg border border-white/5">
                                <span className="text-xs text-gray-400">Menunggu / Approval</span>
                                <span className="text-sm font-bold text-yellow-400">{stats.statusBreakdown.pending}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg border border-white/5">
                                <span className="text-xs text-gray-400">Draft</span>
                                <span className="text-sm font-bold text-gray-500">{stats.statusBreakdown.draft}</span>
                            </div>
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

export default ProcurementReportModal;
