
import React from 'react';
import { useCentralDistributionLogic } from '../../../hooks/useDistributionLogic';

const CentralDistribution: React.FC = () => {
    const {
        filteredStockTransfers,
        selectedTransfer,
        isTransferDetailOpen, setIsTransferDetailOpen,
        shippingItems,
        handleOpenShipmentModal,
        updateShippingQty,
        handleProcessShipment
    } = useCentralDistributionLogic();

    return (
        <>
            <div className="mb-4"><h2 className="text-xl font-bold text-white">Permintaan Masuk</h2></div>
            <div className="space-y-4">
                {filteredStockTransfers.filter(t => t.status !== 'received').map(trf => (
                    <div key={trf.id} className="glass-panel p-5 rounded-2xl">
                        <div className="flex justify-between mb-2"><h4 className="font-bold text-white">{trf.targetOutletName}</h4><span className="text-xs uppercase">{trf.status}</span></div>
                        <div className="flex flex-wrap gap-2 mb-4">{trf.items.map((item, i) => <span key={i} className="text-xs bg-black/30 px-2 py-1 rounded text-gray-300">{item.quantityRequested} {item.ingredientName}</span>)}</div>
                        {trf.status === 'pending' && <button onClick={() => handleOpenShipmentModal(trf)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Kirim Barang</button>}
                    </div>
                ))}
            </div>

            {/* MODAL: SHIPMENT DETAIL */}
            {isTransferDetailOpen && selectedTransfer && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsTransferDetailOpen(false)} />
                    <div className="glass-panel w-full max-w-lg p-6 rounded-3xl relative z-10 animate-in zoom-in-95">
                        <h3 className="text-lg font-bold text-white mb-4">Detail Pengiriman</h3>
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {shippingItems.map((item, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                                    <div><p className="font-bold text-white">{item.ingredientName}</p><p className="text-xs text-gray-400">Request: {item.quantityRequested}</p></div>
                                    <div><label className="text-[10px] text-gray-500 uppercase">Dikirim</label><input type="number" className="w-20 glass-input rounded-lg p-2 text-white text-right" value={item.quantityShipped} onChange={e => updateShippingQty(i, parseFloat(e.target.value))} /></div>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleProcessShipment} className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl">Proses Kirim</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default CentralDistribution;
