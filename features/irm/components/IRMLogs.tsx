
import React from 'react';
import { Activity, Search, History, Archive, Truck, ShoppingCart } from 'lucide-react';
import { useIRMLogs } from '../hooks/useIRMLogs';
import GlassInput from '../../../components/common/GlassInput';
import GlassPanel from '../../../components/common/GlassPanel';
import CompactNumber from '../../../components/common/CompactNumber';
import SectionHeader from '../../../components/common/SectionHeader';
import { useGlobalContext } from '../../../context/GlobalContext';

const IRMLogs: React.FC = () => {
    const { 
        activeTab, setActiveTab, 
        searchTerm, setSearchTerm, 
        visibleLogs, totalLogs 
    } = useIRMLogs();

    const categories = ['All', 'Stock', 'Procurement', 'Distribution', 'Supplier'];
    
    // Quick access via context if needed for future logic, 
    // though currently stats are derived in the hook.
    // Removed unused variables to clean up.
    // const { stockAdjustments, purchaseOrders, stockTransfers } = useGlobalContext(); 
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-right-4 relative">
            
            {/* LEFT COLUMN: LIST (9/12) */}
            <div className="lg:col-span-9 flex flex-col gap-4">
                
                {/* HEADER & SEARCH */}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-4">
                    <SectionHeader 
                        title="Audit & Aktivitas IRM" 
                        subtitle="Jejak digital seluruh pergerakan stok dan transaksi."
                    />
                    
                    <div className="mt-4">
                        <GlassInput 
                            icon={Search} 
                            placeholder="Cari aktivitas, user, ID..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="py-2.5 text-sm"
                        />
                    </div>
                </div>

                {/* LOG LIST */}
                <GlassPanel className="p-0 rounded-2xl overflow-hidden min-h-[500px] border border-white/5 bg-black/20">
                    <div className="overflow-y-auto max-h-[600px] custom-scrollbar p-4 space-y-4">
                        {visibleLogs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                <Activity size={48} className="mb-4 opacity-20" />
                                <p>Tidak ada aktivitas ditemukan.</p>
                            </div>
                        ) : (
                            visibleLogs.map(log => (
                                <div key={log.id} className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group">
                                    {/* Time Column */}
                                    <div className="w-24 shrink-0 text-right">
                                        <p className="text-xs font-bold text-white">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                        <p className="text-[10px] text-gray-500">{new Date(log.timestamp).toLocaleDateString()}</p>
                                    </div>

                                    {/* Indicator Line */}
                                    <div className="relative flex flex-col items-center">
                                        <div className={`w-3 h-3 rounded-full border-2 bg-[#0f172a] z-10 ${
                                            log.type === 'success' ? 'border-green-500' :
                                            log.type === 'warning' ? 'border-orange-500' :
                                            log.type === 'danger' ? 'border-red-500' :
                                            'border-blue-500'
                                        }`}></div>
                                        <div className="w-px h-full bg-white/10 absolute top-3"></div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 pb-4 border-b border-white/5 group-last:border-0 group-last:pb-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-gray-200 text-sm">{log.message}</h4>
                                            {/* @ts-ignore */}
                                            {log.category && <span className="text-[10px] uppercase font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded ml-2">{log.category}</span>}
                                        </div>
                                        
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-lg">
                                                <div className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center text-[8px] font-bold text-white">
                                                    {log.user.charAt(0)}
                                                </div>
                                                <span>{log.user}</span>
                                            </div>
                                            
                                            {log.value !== undefined && (
                                                <span className="text-xs font-mono font-bold text-white">
                                                    Nilai: <CompactNumber value={log.value} />
                                                </span>
                                            )}
                                            
                                            <span className="text-[10px] text-gray-600 font-mono ml-auto">ID: {log.id}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </GlassPanel>
            </div>

            {/* RIGHT COLUMN: FILTER & INFO (3/12) */}
            <div className="lg:col-span-3 flex flex-col gap-4">
                <GlassPanel className="p-5 rounded-2xl border border-white/5">
                    <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Filter Kategori</h4>
                    <div className="space-y-2">
                        {categories.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setActiveTab(cat as any)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors flex justify-between items-center ${
                                    activeTab === cat 
                                    ? 'bg-orange-500 text-white shadow-lg' 
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <span>{cat === 'All' ? 'Semua' : cat}</span>
                            </button>
                        ))}
                    </div>
                </GlassPanel>

                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-xs text-blue-200/80 leading-relaxed">
                    <div className="flex items-center gap-2 mb-2 text-blue-400 font-bold">
                        <History size={14} />
                        <span>Security Audit</span>
                    </div>
                    Log aktivitas IRM disimpan permanen untuk audit operasional. Filter kategori untuk analisa cepat pergerakan barang.
                </div>
            </div>
        </div>
    );
};

export default IRMLogs;
