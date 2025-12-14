
import React, { useState } from 'react';
import { Package, Truck, X, CheckCircle2, User, Clock, AlertCircle } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import { B2BRequest } from '../../../b2b/types';
import CompactNumber from '../../../../components/common/CompactNumber';
import GlassInput from '../../../../components/common/GlassInput';

interface IncomingOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    request: B2BRequest | null;
    onProcess: (id: string) => void;
    onShip: (id: string, trackingInfo: string) => void;
    onReject: (id: string) => void;
}

const IncomingOrderModal: React.FC<IncomingOrderModalProps> = ({ 
    isOpen, onClose, request, onProcess, onShip, onReject 
}) => {
    const [trackingInfo, setTrackingInfo] = useState('');

    if (!request) return null;

    const isPending = request.status === 'pending';
    const isProcessed = request.status === 'processed';
    const isShipped = request.status === 'shipped';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Detail Pesanan Masuk (B2B)" size="lg">
            <div className="space-y-6">
                
                {/* Header Info */}
                <div className="flex justify-between items-start bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div>
                        <h4 className="text-lg font-bold text-white flex items-center gap-2">
                            <User size={18} className="text-orange-500" /> {request.sourceName}
                        </h4>
                        <p className="text-sm text-gray-400 mt-1">Order ID: <span className="font-mono text-white">{request.originalPoId}</span></p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Clock size={12} /> {new Date(request.timestamp).toLocaleString()}
                        </p>
                    </div>
                    <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                            isPending ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                            isProcessed ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                            isShipped ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                            'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}>
                            {request.status === 'processed' ? 'Sedang Disiapkan' : request.status}
                        </span>
                    </div>
                </div>

                {/* Items List */}
                <div className="glass-panel p-4 rounded-2xl bg-black/20">
                    <h5 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Daftar Barang</h5>
                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                        {request.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                                <div>
                                    <p className="font-bold text-white text-sm">{item.ingredientName}</p>
                                    <p className="text-xs text-gray-400">{item.quantity} {item.unit} x <CompactNumber value={item.cost} /></p>
                                </div>
                                <p className="font-bold text-white text-sm"><CompactNumber value={item.quantity * item.cost} /></p>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
                        <span className="text-gray-400 font-bold">Total Nilai</span>
                        <span className="text-xl font-bold text-orange-500"><CompactNumber value={request.totalAmount} /></span>
                    </div>
                </div>

                {/* Actions Workflow */}
                <div className="pt-4 border-t border-white/10">
                    {isPending && (
                        <div className="flex gap-3">
                            <button onClick={() => onReject(request.id)} className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-xl border border-red-500/30 transition-all">
                                Tolak Pesanan
                            </button>
                            <button onClick={() => onProcess(request.id)} className="flex-[2] py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                                <Package size={18} /> Proses Pesanan (Siapkan Barang)
                            </button>
                        </div>
                    )}

                    {isProcessed && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
                                <AlertCircle size={18} className="text-blue-400 mt-0.5" />
                                <div className="text-xs text-blue-200">
                                    <p className="font-bold mb-1">Barang Sedang Disiapkan</p>
                                    <p>Pastikan fisik barang sudah dikemas dan siap dikirim sebelum menekan tombol kirim.</p>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Info Pengiriman (Resi / Nama Supir)</label>
                                <GlassInput 
                                    placeholder="Contoh: JNE-882193 atau Pak Budi (Supir)"
                                    value={trackingInfo}
                                    onChange={(e) => setTrackingInfo(e.target.value)}
                                    className="text-sm"
                                />
                            </div>

                            <button 
                                onClick={() => onShip(request.id, trackingInfo || 'Dikirim Kurir Internal')} 
                                className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <Truck size={18} /> Kirim Barang & Potong Stok
                            </button>
                        </div>
                    )}

                    {isShipped && (
                        <div className="text-center p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                            <CheckCircle2 size={32} className="mx-auto text-green-500 mb-2" />
                            <h4 className="font-bold text-green-400">Pesanan Telah Dikirim</h4>
                            <p className="text-xs text-green-300 mt-1">Resi: {request.note || '-'}</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default IncomingOrderModal;
