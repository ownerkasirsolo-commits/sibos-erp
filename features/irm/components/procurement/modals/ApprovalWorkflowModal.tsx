
import React from 'react';
import { PurchaseOrder } from '../../../types';
import Modal from '../../../../../components/common/Modal';
import { CheckCircle2, XCircle, User, Calendar, FileText } from 'lucide-react';
import CompactNumber from '../../../../../components/common/CompactNumber';

interface ApprovalWorkflowModalProps {
    isOpen: boolean;
    onClose: () => void;
    po: PurchaseOrder | null;
    onApprove: (po: PurchaseOrder) => void;
    onReject: (po: PurchaseOrder) => void;
}

const ApprovalWorkflowModal: React.FC<ApprovalWorkflowModalProps> = ({ 
    isOpen, onClose, po, onApprove, onReject 
}) => {
    if (!po) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Persetujuan Purchase Order" size="lg">
            <div className="space-y-6">
                
                {/* Warning Header */}
                <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl flex items-start gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400">
                        <FileText size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-orange-400 text-sm">Nominal Tinggi Terdeteksi</h4>
                        <p className="text-xs text-gray-400 mt-1">
                            PO ini memiliki total di atas batas wewenang staff (Rp 5.000.000). Mohon tinjau item sebelum menyetujui.
                        </p>
                    </div>
                </div>

                {/* PO Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Dibuat Oleh</p>
                        <div className="flex items-center gap-2 text-white">
                            <User size={14} /> {po.createdBy}
                        </div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Tanggal</p>
                        <div className="flex items-center gap-2 text-white">
                            <Calendar size={14} /> {new Date(po.orderDate).toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
                    <div className="p-3 bg-white/5 border-b border-white/5 flex justify-between text-xs font-bold text-gray-400 uppercase">
                        <span>Nama Barang</span>
                        <span>Subtotal</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {po.items.map((item, idx) => (
                            <div key={idx} className="p-3 border-b border-white/5 last:border-0 flex justify-between items-center text-sm">
                                <div>
                                    <p className="text-white font-medium">{item.ingredientName}</p>
                                    <p className="text-xs text-gray-500">{item.quantity} {item.unit} x <CompactNumber value={item.cost} /></p>
                                </div>
                                <p className="font-mono font-bold text-white"><CompactNumber value={item.quantity * item.cost} /></p>
                            </div>
                        ))}
                    </div>
                    <div className="p-3 bg-white/5 border-t border-white/5 flex justify-between items-center">
                        <span className="font-bold text-white">Total Akhir</span>
                        <span className="text-lg font-black text-orange-500"><CompactNumber value={po.totalEstimated} /></span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <button 
                        onClick={() => { onReject(po); onClose(); }} 
                        className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                    >
                        <XCircle size={18} /> Tolak
                    </button>
                    <button 
                        onClick={() => { onApprove(po); onClose(); }} 
                        className="flex-[2] py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-600/20 transition-all"
                    >
                        <CheckCircle2 size={18} /> Setujui Order
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ApprovalWorkflowModal;
