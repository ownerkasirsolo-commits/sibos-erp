

import React from 'react';
// @FIX: Import PurchaseOrder from its new location in features/irm/types.
import { PurchaseOrder } from '../../../features/irm/types';
import { Plus, FileEdit, Printer, Share2, MessageCircle, Repeat } from 'lucide-react';
import { usePOListLogic } from '../../../hooks/useProcurementLogic';
import CompactNumber from '../../common/CompactNumber';

interface POListProps {
    onCreate: () => void;
    onContinueDraft: (po: PurchaseOrder) => void;
    onRepeat: (po: PurchaseOrder) => void;
    onReceive: (po: PurchaseOrder) => void;
}

const POList: React.FC<POListProps> = ({ onCreate, onContinueDraft, onRepeat, onReceive }) => {
    const { draftPOs, activePOs, getPoStatusDisplay, handlePrintPO } = usePOListLogic();

    return (
        <>
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Procurement & PO</h2>
                <button onClick={onCreate} className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg"><Plus size={18} /> Buat PO</button>
            </div>

            {draftPOs.length > 0 && (
                <div className="mb-6">
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
                    return (
                        <div key={po.id} className="glass-panel p-5 rounded-2xl flex flex-col lg:flex-row gap-6 hover:border-white/10 transition-colors">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-bold text-white text-lg">{po.supplierName}</h4>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${poStatus.style}`}>{poStatus.label}</span>
                                </div>
                                <p className="text-xs text-gray-400 mb-2">#{po.id} | {new Date(po.orderDate).toLocaleDateString()} | Oleh: {po.createdBy}</p>
                                <div className="flex gap-2 overflow-x-auto no-scrollbar">{po.items.map((item, idx) => (<span key={idx} className="text-xs bg-white/5 px-2 py-1 rounded text-gray-300 whitespace-nowrap">{item.ingredientName}</span>))}</div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <p className="font-bold text-white text-xl"><CompactNumber value={po.totalEstimated} /></p>
                                <div className="flex gap-2">
                                    <button onClick={() => handlePrintPO(po)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg"><Printer size={16}/></button>
                                    <button onClick={() => {}} className="p-2 bg-white/5 hover:bg-green-500 rounded-lg text-gray-300 hover:text-white" title="Share"><Share2 size={16}/></button>
                                    <button onClick={() => {}} className="p-2 bg-white/5 hover:bg-blue-500 rounded-lg text-gray-300 hover:text-white" title="Chat"><MessageCircle size={16}/></button>
                                    <button onClick={() => onRepeat(po)} className="p-2 bg-white/5 hover:bg-orange-500 rounded-lg text-gray-300 hover:text-white" title="Order Lagi"><Repeat size={16}/></button>
                                    {po.status === 'ordered' && <button onClick={() => onReceive(po)} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold text-xs flex items-center gap-2">Terima</button>}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </>
    );
};

export default POList;