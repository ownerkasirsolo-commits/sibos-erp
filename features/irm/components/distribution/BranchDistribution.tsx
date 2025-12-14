
import React, { useState } from 'react';
import { Plus, X, Search, Filter, PackageCheck, Truck, Clock, Activity } from 'lucide-react';
import { useBranchDistributionLogic } from '../../hooks/useDistributionLogic';
import GlassInput from '../../../../components/common/GlassInput';
import GlassPanel from '../../../../components/common/GlassPanel';
import StatWidget from '../../../../components/common/StatWidget';
import LiveLogPanel from '../../../../components/common/LiveLogPanel';

const BranchDistribution: React.FC = () => {
    const {
        ingredients,
        isRequestingStock, setIsRequestingStock,
        reqItems, setReqItems,
        newItemId, setNewItemId,
        newItemQty, setNewItemQty,
        newItemUnit, setNewItemUnit,
        filteredStockTransfers,
        handleAddItemToRequest,
        handleSubmitRequest,
        handleReceiveShipment,
        
        searchTerm, setSearchTerm,
        filterStatus, setFilterStatus,
        stats,
        isLiveLogOpen, setIsLiveLogOpen,
        liveLogs
    } = useBranchDistributionLogic();

    const [isFilterExpanded, setIsFilterExpanded] = useState(false);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-right-4 relative">
            
            {/* LEFT COLUMN: MAIN CONTENT (9/12) */}
            <div className="lg:col-span-9 flex flex-col gap-4">
                
                {/* HEADER TOOLBAR */}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-4">
                    {/* Title Section (Raw Header style) */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                Distribusi Stok (Outlet)
                                <button 
                                    onClick={() => setIsLiveLogOpen(true)}
                                    className={`p-1.5 rounded-lg transition-colors animate-pulse ${isLiveLogOpen ? 'bg-orange-500 text-white' : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white'}`}
                                    title="Live Activity Log"
                                >
                                    <Activity size={16} />
                                </button>
                            </h2>
                            <p className="text-xs text-gray-400 mt-1">Kelola permintaan stok ke gudang pusat.</p>
                        </div>
                    </div>
                    
                    {!isRequestingStock && (
                        <>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <GlassInput 
                                    icon={Search} 
                                    placeholder="Cari ID Request..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="py-2.5 text-sm"
                                    wrapperClassName="flex-1"
                                />
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                                        className={`p-2.5 px-4 rounded-xl border flex items-center gap-2 text-sm font-bold transition-colors ${isFilterExpanded ? 'bg-orange-600 text-white border-orange-600' : 'bg-white/5 text-gray-300 border-white/5 hover:bg-white/10'}`}
                                    >
                                        <Filter size={18} />
                                    </button>
                                    <button 
                                        onClick={() => setIsRequestingStock(true)} 
                                        className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg"
                                    >
                                        <Plus size={18} /> Request Baru
                                    </button>
                                </div>
                            </div>

                            {isFilterExpanded && (
                                <div className="pt-3 border-t border-white/10 animate-in slide-in-from-top-2">
                                    <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Status</label>
                                    <select 
                                        value={filterStatus} 
                                        onChange={e => setFilterStatus(e.target.value as any)}
                                        className="w-full sm:w-64 glass-input rounded-xl text-sm py-2 px-3 bg-[#1e293b] appearance-none cursor-pointer"
                                    >
                                        <option value="All">Semua Status</option>
                                        <option value="pending">Pending (Menunggu Pusat)</option>
                                        <option value="shipped">Dikirim (Perlu Diterima)</option>
                                        <option value="received">Selesai</option>
                                    </select>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* CONTENT LIST */}
                {!isRequestingStock ? (
                    <div className="space-y-3">
                        {filteredStockTransfers.length === 0 ? (
                            <div className="text-center py-20 text-gray-500 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                                <Truck size={48} className="mx-auto mb-4 opacity-20" />
                                <p>Belum ada riwayat permintaan stok.</p>
                            </div>
                        ) : filteredStockTransfers.map(trf => (
                            <div key={trf.id} className="glass-panel p-4 rounded-2xl flex justify-between items-center border border-white/5 hover:bg-white/5 transition-colors">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-bold text-white text-sm">{trf.id}</p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${
                                            trf.status === 'shipped' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                            trf.status === 'received' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                        }`}>{trf.status}</span>
                                    </div>
                                    <p className="text-xs text-gray-400">{new Date(trf.requestDate).toLocaleDateString()} • {trf.items.length} Item</p>
                                </div>
                                {trf.status === 'shipped' && (
                                    <button onClick={() => handleReceiveShipment(trf)} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-green-900/20 transition-all flex items-center gap-2">
                                        <PackageCheck size={16} /> Terima Barang
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    /* REQUEST FORM */
                    <div className="glass-panel p-6 rounded-3xl border border-orange-500/30 bg-black/20">
                        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                            <h3 className="text-lg font-bold text-white">Form Request Stok</h3>
                            <button onClick={() => setIsRequestingStock(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={20}/></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
                            <div className="md:col-span-6">
                                <select className="w-full glass-input rounded-xl p-3 text-sm appearance-none cursor-pointer" value={newItemId} onChange={e => {setNewItemId(e.target.value); const i = ingredients.find(ing => ing.id === e.target.value); if(i) setNewItemUnit(i.unit);}}>
                                    <option value="" className="bg-gray-900">Pilih Barang...</option>
                                    {ingredients.map(i => <option key={i.id} value={i.id} className="bg-gray-900">{i.name}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-3"><input type="number" placeholder="Jml" className="w-full glass-input rounded-xl p-3 text-sm" value={newItemQty} onChange={e => setNewItemQty(e.target.value)}/></div>
                            <div className="md:col-span-3"><button onClick={handleAddItemToRequest} className="w-full h-full bg-white/10 hover:bg-orange-500 rounded-xl font-bold transition-colors">Tambah</button></div>
                        </div>
                        <div className="space-y-2 mb-6 bg-white/5 p-4 rounded-xl max-h-60 overflow-y-auto custom-scrollbar">
                            {reqItems.length === 0 ? <p className="text-center text-gray-500 text-sm">Belum ada item ditambahkan.</p> : reqItems.map((item, i) => <div key={i} className="flex justify-between p-2 bg-white/5 rounded-lg text-sm border border-white/5"><span>{item.ingredientName}</span><span className="font-bold">{item.quantityRequested} {item.unit}</span></div>)}
                        </div>
                        <div className="flex justify-end">
                            <button onClick={handleSubmitRequest} disabled={reqItems.length === 0} className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">Kirim Request</button>
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT COLUMN: STATS (3/12) */}
            <div className="lg:col-span-3 flex flex-col gap-4">
                <GlassPanel className="p-5 rounded-2xl border border-white/5">
                     <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Ringkasan</h4>
                     <div className="space-y-3">
                        <StatWidget label="Total Request" value={stats.total} icon={Truck} colorClass="text-blue-400" />
                        <StatWidget label="Pending" value={stats.pending} icon={Clock} colorClass="text-yellow-400" bgClass="bg-yellow-500/10 border-yellow-500/20" />
                        <StatWidget label="Perlu Diterima" value={stats.shipped} icon={PackageCheck} colorClass="text-green-400" bgClass="bg-green-500/10 border-green-500/20" />
                     </div>
                </GlassPanel>
            </div>

            {/* LIVE LOG PANEL */}
            <LiveLogPanel 
                isOpen={isLiveLogOpen}
                onClose={() => setIsLiveLogOpen(false)}
                title="Aktivitas Distribusi (Outlet)"
                logs={liveLogs}
            />
        </div>
    );
};

export default BranchDistribution;
