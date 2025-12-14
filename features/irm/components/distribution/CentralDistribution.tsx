
import React, { useState } from 'react';
import { useCentralDistributionLogic } from '../../hooks/useDistributionLogic';
import { Search, Filter, Truck, PackageCheck, Clock, Activity } from 'lucide-react';
import GlassInput from '../../../../components/common/GlassInput';
import GlassPanel from '../../../../components/common/GlassPanel';
import StatWidget from '../../../../components/common/StatWidget';
import LiveLogPanel from '../../../../components/common/LiveLogPanel';

const CentralDistribution: React.FC = () => {
    const {
        filteredStockTransfers,
        selectedTransfer,
        isTransferDetailOpen, setIsTransferDetailOpen,
        shippingItems,
        handleOpenShipmentModal,
        updateShippingQty,
        handleProcessShipment,
        
        searchTerm, setSearchTerm,
        filterStatus, setFilterStatus,
        stats,
        isLiveLogOpen, setIsLiveLogOpen,
        liveLogs
    } = useCentralDistributionLogic();

    const [isFilterExpanded, setIsFilterExpanded] = useState(false);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-right-4 relative">
            
            {/* LEFT COLUMN: MAIN CONTENT (9/12) */}
            <div className="lg:col-span-9 flex flex-col gap-4">
                
                {/* HEADER */}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-4">
                    {/* Title Section (Raw Header style) */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                Pusat Distribusi
                                <button 
                                    onClick={() => setIsLiveLogOpen(true)}
                                    className={`p-1.5 rounded-lg transition-colors animate-pulse ${isLiveLogOpen ? 'bg-orange-500 text-white' : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white'}`}
                                    title="Live Activity Log"
                                >
                                    <Activity size={16} />
                                </button>
                            </h2>
                            <p className="text-xs text-gray-400 mt-1">Kelola dan proses permintaan stok dari cabang.</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                        <GlassInput 
                            icon={Search} 
                            placeholder="Cari ID, Outlet..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="py-2.5 text-sm"
                            wrapperClassName="flex-1"
                        />
                        <button 
                            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                            className={`p-2.5 px-4 rounded-xl border flex items-center gap-2 text-sm font-bold transition-colors ${isFilterExpanded ? 'bg-orange-600 text-white border-orange-600' : 'bg-white/5 text-gray-300 border-white/5 hover:bg-white/10'}`}
                        >
                            <Filter size={18} /> <span className="hidden sm:inline">Filter</span>
                        </button>
                    </div>

                    {isFilterExpanded && (
                        <div className="pt-3 border-t border-white/10 animate-in slide-in-from-top-2">
                            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Status Pengiriman</label>
                            <select 
                                value={filterStatus} 
                                onChange={e => setFilterStatus(e.target.value as any)}
                                className="w-full sm:w-64 glass-input rounded-xl text-sm py-2 px-3 bg-[#1e293b] appearance-none cursor-pointer"
                            >
                                <option value="All">Semua</option>
                                <option value="pending">Pending (Perlu Dikirim)</option>
                                <option value="shipped">Sedang Dikirim</option>
                                <option value="received">Selesai</option>
                            </select>
                        </div>
                    )}
                </div>

                {/* LIST */}
                <div className="space-y-4">
                    {filteredStockTransfers.length === 0 ? (
                        <div className="text-center py-20 text-gray-500 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                            <PackageCheck size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Tidak ada permintaan yang sesuai filter.</p>
                        </div>
                    ) : filteredStockTransfers.map(trf => (
                        <div key={trf.id} className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                            <div className="flex-1">
                                <div className="flex justify-between mb-2">
                                    <h4 className="font-bold text-white text-lg">{trf.targetOutletName}</h4>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                                        trf.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                        trf.status === 'shipped' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                        'bg-green-500/10 text-green-400 border-green-500/20'
                                    }`}>{trf.status}</span>
                                </div>
                                <p className="text-xs text-gray-400 mb-3">Req ID: {trf.id} • {new Date(trf.requestDate).toLocaleString()}</p>
                                <div className="flex flex-wrap gap-2">
                                    {trf.items.slice(0, 3).map((item, i) => (
                                        <span key={i} className="text-xs bg-black/30 px-2 py-1 rounded text-gray-300 border border-white/5">
                                            {item.quantityRequested} {item.unit} {item.ingredientName}
                                        </span>
                                    ))}
                                    {trf.items.length > 3 && <span className="text-xs text-gray-500 self-center">+{trf.items.length - 3} lainnya</span>}
                                </div>
                            </div>
                            {trf.status === 'pending' && (
                                <button 
                                    onClick={() => handleOpenShipmentModal(trf)} 
                                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <Truck size={16} /> Proses Kirim
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT COLUMN: STATS (3/12) */}
            <div className="lg:col-span-3 flex flex-col gap-4">
                <GlassPanel className="p-5 rounded-2xl border border-white/5">
                     <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Ringkasan</h4>
                     <div className="space-y-3">
                        <StatWidget label="Permintaan Baru" value={stats.pending} icon={Clock} colorClass="text-yellow-400" bgClass="bg-yellow-500/10 border-yellow-500/20" />
                        <StatWidget label="Dikirim Hari Ini" value={stats.shippedToday} icon={Truck} colorClass="text-blue-400" />
                     </div>
                </GlassPanel>
            </div>

            {/* LIVE LOG PANEL */}
            <LiveLogPanel 
                isOpen={isLiveLogOpen}
                onClose={() => setIsLiveLogOpen(false)}
                title="Aktivitas Distribusi (Pusat)"
                logs={liveLogs}
            />

            {/* MODAL: SHIPMENT DETAIL */}
            {isTransferDetailOpen && selectedTransfer && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsTransferDetailOpen(false)} />
                    <div className="glass-panel w-full max-w-lg p-6 rounded-3xl relative z-10 animate-in zoom-in-95">
                        <h3 className="text-lg font-bold text-white mb-4">Proses Pengiriman</h3>
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {shippingItems.map((item, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div><p className="font-bold text-white text-sm">{item.ingredientName}</p><p className="text-xs text-gray-400">Minta: {item.quantityRequested} {item.unit}</p></div>
                                    <div><label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Kirim</label><input type="number" className="w-20 glass-input rounded-lg p-2 text-white text-right font-bold text-sm" value={item.quantityShipped} onChange={e => updateShippingQty(i, parseFloat(e.target.value))} /></div>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setIsTransferDetailOpen(false)} className="flex-1 py-3 border border-white/10 text-gray-300 font-bold rounded-xl hover:bg-white/5 transition-colors">Batal</button>
                            <button onClick={handleProcessShipment} className="flex-[2] py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all">Konfirmasi Kirim</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CentralDistribution;
