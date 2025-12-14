
import React, { useState, useEffect } from 'react';
import { CheckCircle2, Store, Calculator, MessageCircle, AlertCircle, UserCheck } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import { B2BRequest } from '../../../b2b/types';
import { PurchaseOrderItem } from '../../types';
import CompactNumber from '../../../../components/common/CompactNumber';
import { useGlobalContext } from '../../../../context/GlobalContext';
import { B2BService } from '../../../b2b/B2BService';

interface OrderReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: B2BRequest | null;
    onProcess: () => void;
    onReject: () => void;
    onChat: () => void;
    currentUser: { name: string } | null;
}

const OrderReviewModal: React.FC<OrderReviewModalProps> = ({ 
    isOpen, onClose, order, onProcess, onReject, onChat, currentUser
}) => {
    const { products } = useGlobalContext();
    const [reviewedItems, setReviewedItems] = useState<PurchaseOrderItem[]>([]);
    
    // Initialize items when order opens
    useEffect(() => {
        if (order) {
            setReviewedItems(JSON.parse(JSON.stringify(order.items)));
        }
    }, [order]);

    if (!order) return null;

    // Helper to find local product stock
    const getLocalStock = (itemName: string) => {
        const product = products.find(p => p.name.toLowerCase() === itemName.toLowerCase());
        return product ? product.stock || 0 : 0;
    };

    const handleQtyChange = (index: number, newQty: number) => {
        const updated = [...reviewedItems];
        updated[index].quantity = newQty;
        setReviewedItems(updated);
    };

    const handlePriceChange = (index: number, newPrice: number) => {
        const updated = [...reviewedItems];
        updated[index].cost = newPrice;
        setReviewedItems(updated);
    };

    const totalAmount = reviewedItems.reduce((acc, item) => acc + (item.quantity * item.cost), 0);
    const hasChanges = JSON.stringify(order.items) !== JSON.stringify(reviewedItems);

    const handleConfirm = async () => {
        if (hasChanges) {
            // Update items AND PRICES in DB first if changed (Negotiation result)
            await B2BService.updateOrderQuantities(order.id, reviewedItems);
        }
        // Proceed to process
        onProcess();
    };

    const isPending = order.status === 'pending';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Tinjau Pesanan Masuk" size="lg">
            <div className="space-y-6">
                
                {/* Header Context */}
                <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex justify-between items-center">
                    <div>
                        <h4 className="font-bold text-white text-lg">{order.sourceName}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                            <span>ID: {order.originalPoId}</span>
                            <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                            <span className="font-mono text-orange-400">{new Date(order.timestamp).toLocaleTimeString()}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={onChat}
                            className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
                        >
                            <MessageCircle size={16} /> Chat Pemesan
                        </button>
                    </div>
                </div>

                {/* Audit Info if processed */}
                {order.acceptedBy && (
                    <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 p-2 rounded-lg border border-green-500/20">
                        <UserCheck size={14} />
                        <span>Diterima oleh: {order.acceptedBy}</span>
                    </div>
                )}

                {/* Comparison Table */}
                <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-gray-400 font-bold uppercase text-xs">
                            <tr>
                                <th className="p-3">Nama Barang</th>
                                <th className="p-3 text-center">Stok Real</th>
                                <th className="p-3 text-center w-24">Harga Satuan</th>
                                <th className="p-3 text-center w-20">Qty</th>
                                <th className="p-3 text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {reviewedItems.map((item, idx) => {
                                const realStock = getLocalStock(item.ingredientName);
                                const isStockLow = realStock < item.quantity;
                                
                                return (
                                    <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-3">
                                            <p className="font-bold text-white">{item.ingredientName}</p>
                                            <p className="text-xs text-gray-500">{item.unit}</p>
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className={`flex items-center justify-center gap-1 ${isStockLow ? 'text-red-400' : 'text-green-400'}`}>
                                                <Store size={12} />
                                                <span className="font-mono font-bold">{realStock}</span>
                                            </div>
                                        </td>
                                        <td className="p-3 text-center">
                                            {/* Editable Price */}
                                            {isPending ? (
                                                <input 
                                                    type="number" 
                                                    className="w-24 bg-black/30 border border-white/10 rounded-lg py-1 px-2 text-right text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                                                    value={item.cost}
                                                    onChange={(e) => handlePriceChange(idx, parseFloat(e.target.value) || 0)}
                                                />
                                            ) : (
                                                <span className="font-mono text-gray-300"><CompactNumber value={item.cost} currency={false}/></span>
                                            )}
                                        </td>
                                        <td className="p-3 text-center">
                                            {/* Editable Qty */}
                                            {isPending ? (
                                                <div className="relative">
                                                    <input 
                                                        type="number" 
                                                        className={`w-16 bg-black/30 border rounded-lg py-1 px-2 text-center font-bold focus:outline-none focus:ring-1 ${isStockLow && item.quantity > realStock ? 'border-red-500 text-red-400 focus:ring-red-500' : 'border-white/10 text-white focus:ring-orange-500'}`}
                                                        value={item.quantity}
                                                        onChange={(e) => handleQtyChange(idx, parseFloat(e.target.value) || 0)}
                                                    />
                                                    {isStockLow && item.quantity > realStock && (
                                                        <div className="absolute -bottom-4 left-0 right-0 flex justify-center">
                                                            <AlertCircle size={10} className="text-red-500" />
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="font-bold text-white">{item.quantity}</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-right font-bold text-white">
                                            <CompactNumber value={item.quantity * item.cost} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-xs text-gray-500 uppercase font-bold">Total Disetujui</p>
                            <p className="text-xl font-bold text-orange-500"><CompactNumber value={totalAmount} /></p>
                        </div>
                        {hasChanges && isPending && (
                            <p className="text-xs text-blue-400 flex items-center gap-1 italic animate-in fade-in">
                                <Calculator size={12} /> Data disesuaikan (Negosiasi)
                            </p>
                        )}
                    </div>

                    {isPending ? (
                        <div className="flex gap-3 w-full md:w-auto">
                            <button 
                                onClick={onReject}
                                className="flex-1 md:flex-none px-6 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold transition-colors text-sm"
                            >
                                Tolak
                            </button>
                            <button 
                                onClick={handleConfirm}
                                className="flex-1 md:flex-none px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 transition-transform active:scale-95 text-sm"
                            >
                                <CheckCircle2 size={18} /> Terima
                            </button>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-400 italic">
                            Pesanan ini sudah diproses.
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default OrderReviewModal;
