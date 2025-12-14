
import React from 'react';
import { PurchaseOrder } from '@/features/irm/types';
import { Plus, FileEdit, Printer, Share2, MessageCircle, Repeat, Search, ArrowLeft, Network, FileQuestion, ArrowRight } from 'lucide-react';
import { usePOListLogic } from '@/features/irm/hooks/useProcurementLogic';
import CompactNumber from '@/components/common/CompactNumber';
import GlassInput from '@/components/common/GlassInput';

interface POListProps {
    onCreate: () => void;
    onContinueDraft: (po: PurchaseOrder) => void;
    onRepeat: (po: PurchaseOrder) => void;
    onReceive: (po: PurchaseOrder) => void;
    onViewDetail: (po: PurchaseOrder) => void; 
    onBackToDashboard: () => void;
}

const POList: React.FC<POListProps> = ({ onCreate, onContinueDraft, onRepeat, onReceive, onViewDetail, onBackToDashboard }) => {
    const { 
        draftPOs, 
        activePOs,
        purchaseRequests,
        activeTab, setActiveTab,
        getPoStatusDisplay, 
        handlePrintPO,
        searchTerm, setSearchTerm,
        filterStatus, setFilterStatus
    } = usePOListLogic();
    
    const poStatuses = ['All', 'ordered', 'processed', 'pending', 'shipped', 'received', 'cancelled'];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div className="flex items-center gap-3">
                    <button onClick={onBackToDashboard} className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10">
                        <ArrowLeft size={18} />
                    </button>
                    <h2 className="text-xl font-bold text-white">Daftar Purchase Order</h2>
                </div>
                
                {/* TAB SWITCHER */}
                <div className="flex bg-black/20 p-1 rounded-xl">
                    <button 
                        onClick={() => setActiveTab('PO')} 
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${activeTab === 'PO' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Purchase Orders
                    </button>
                    <button 
                        onClick={() => setActiveTab('PR')} 
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${activeTab === 'PR' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Requests (PR)
                        {purchaseRequests.length > 0 && <span className="ml-2 bg-white text-orange-600 px-1.5 rounded-full text-[9px]">{purchaseRequests.length}</span>}
                    </button>
                </div>
            </div>

            {/* FILTERS */}
            <div className="flex w-full gap-2">
                <GlassInput 
                    icon={Search} 
                    placeholder={activeTab === 'PO' ? "Cari PO..." : "Cari Request..."} 
                    className="py-2.5 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    wrapperClassName="flex-1"
                />
                {activeTab === 'PO' && (
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="glass-input rounded-xl text-sm capitalize w-32"
                    >
                         {poStatuses.map(s => <option key={s} value={s} className="bg-gray-900 capitalize">{s}</option>)}
                    </select>
                )}
                <button onClick={onCreate} className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg whitespace-nowrap">
                    <Plus size={18} /> {activeTab === 'PO' ? 'Buat PO' : 'Ajukan Request'}
                </button>
            </div>

            {/* TAB: PURCHASE ORDERS */}
            {activeTab === 'PO' && (
                <>
                    {draftPOs.length > 0 && (
                        <div className="my-6">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2"><FileEdit size={14}/> Draft</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {draftPOs.map(draft => (
                                    <div key={draft.id} onClick={() => onContinueDraft(draft)} className="bg-white/5 border border-dashed border-gray-600 hover:border-orange-500 p-4 rounded-xl cursor-pointer transition-colors">
                                        <h5 className="font-bold text-white">{draft.supplierName}</h5>
                                        <p className="text-xs text-gray-400">{draft.items.length} Barang &bull; Est. <CompactNumber value={draft.totalEstimated} /></p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {activePOs.sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()).map(po => {
                            const poStatus = getPoStatusDisplay(po.status, po.isB2B, po.paymentStatus);
                            const isShipped = po.status === 'shipped';
                            const canReceive = ['ordered', 'processed', 'shipped'].includes(po.status);

                            return (
                                <div 
                                    key={po.id} 
                                    onClick={() => onViewDetail(po)} 
                                    className={`glass-panel p-5 rounded-2xl flex flex-col lg:flex-row gap-6 hover:border-white/20 hover:bg-white/5 transition-all cursor-pointer ${po.isB2B ? 'border-l-4 border-l-cyan-500' : ''}`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-bold text-white text-lg group-hover:text-orange-400 transition-colors">{po.supplierName}</h4>
                                            {po.isB2B && <span title="SIBOS Network"><Network size={16} className="text-cyan-400" /></span>}
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${poStatus.style}`}>{poStatus.label}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mb-2">#{po.id} | {new Date(po.orderDate).toLocaleDateString()} | Oleh: {po.createdBy}</p>
                                        <div className="flex gap-2 overflow-x-auto no-scrollbar">{po.items.map((item, idx) => (<span key={idx} className="text-xs bg-black/20 px-2 py-1 rounded text-gray-400 whitespace-nowrap">{item.ingredientName}</span>))}</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <p className="font-bold text-white text-xl"><CompactNumber value={po.totalEstimated} /></p>
                                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => handlePrintPO(po)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg"><Printer size={16}/></button>
                                            <button onClick={() => onRepeat(po)} className="p-2 bg-white/5 hover:bg-orange-500 rounded-lg text-gray-300 hover:text-white" title="Re-Order"><Repeat size={16}/></button>
                                            {canReceive && (
                                                <button 
                                                    onClick={() => isShipped && onReceive(po)} 
                                                    disabled={!isShipped}
                                                    className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
                                                        isShipped 
                                                        ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:brightness-110 text-white shadow-orange-600/20' 
                                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                                                    }`}
                                                >
                                                    Terima
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        {activePOs.length === 0 && <p className="text-center text-gray-500 py-10">Tidak ada pesanan.</p>}
                    </div>
                </>
            )}

            {/* TAB: PURCHASE REQUESTS */}
            {activeTab === 'PR' && (
                <div className="space-y-4 animate-in slide-in-from-right-4">
                     {purchaseRequests.length === 0 ? (
                         <div className="text-center py-20 text-gray-500 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                             <FileQuestion size={48} className="mx-auto mb-4 opacity-20" />
                             <p>Belum ada Purchase Request dari staff.</p>
                             <button onClick={onCreate} className="mt-4 text-orange-400 text-xs font-bold hover:underline">Ajukan Request Baru</button>
                         </div>
                     ) : (
                         purchaseRequests.map(pr => (
                             <div key={pr.id} className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                 <div>
                                     <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-white">Request dari {pr.requestedBy}</h4>
                                        <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/30 uppercase font-bold">Pending</span>
                                     </div>
                                     <p className="text-xs text-gray-400 mb-2">#{pr.id} | {new Date(pr.requestDate).toLocaleDateString()}</p>
                                     <p className="text-sm text-gray-300 italic">"{pr.note}"</p>
                                     
                                     <div className="mt-3 flex gap-2 flex-wrap">
                                         {pr.items.map((item, idx) => (
                                             <span key={idx} className="text-xs bg-black/30 px-2 py-1 rounded text-gray-300">
                                                 {item.quantity} {item.unit} {item.ingredientName}
                                             </span>
                                         ))}
                                     </div>
                                 </div>
                                 
                                 <button 
                                    onClick={() => {
                                        // Mock Conversion: Pass PR data to Create Wizard logic in parent
                                        onCreate();
                                    }}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg"
                                >
                                    Convert to PO <ArrowRight size={14} />
                                </button>
                             </div>
                         ))
                     )}
                </div>
            )}
        </div>
    );
};

export default POList;
