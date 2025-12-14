import React from 'react';
import { PurchaseOrder } from '@/features/irm/types';
import { Camera, AlertCircle, CheckCircle2 } from 'lucide-react';
import { usePOReceiveLogic } from '@/features/irm/hooks/useProcurementLogic';

interface POReceiveWizardProps {
    po: PurchaseOrder;
    onClose: () => void;
    onSuccess: () => void;
}

const POReceiveWizard: React.FC<POReceiveWizardProps> = ({ po, onClose, onSuccess }) => {
    const {
        receiveWizardStep, setReceiveWizardStep,
        receivingItems, 
        receivePaymentMethod, setReceivePaymentMethod,
        tempoDuration, setTempoDuration,
        selectedBank, setSelectedBank,
        updateReceivingItem,
        calculateReceivingBill,
        handleSubmitReceive
    } = usePOReceiveLogic(po, onSuccess);

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="glass-panel w-full max-w-2xl p-6 rounded-3xl relative z-10 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                {/* Wizard Header */}
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white">Terima Barang</h3>
                        <p className="text-xs text-gray-400">PO #{po.id} &bull; {po.supplierName}</p>
                    </div>
                    <div className="flex gap-2">
                        {[1,2,3].map(step => (
                            <div key={step} className={`w-2.5 h-2.5 rounded-full ${receiveWizardStep >= step ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                        ))}
                    </div>
                </div>

                {/* STEP 1: ITEM CHECK */}
                {receiveWizardStep === 1 && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-right-4">
                        <h4 className="text-sm font-bold text-white mb-3">1. Cek Fisik Barang</h4>
                        <div className="space-y-4">
                            {receivingItems.map((item, i) => {
                                const isDiscrepancy = item.receivedQuantity !== item.quantity;
                                return (
                                <div key={i} className={`p-4 rounded-xl border ${isDiscrepancy ? 'bg-orange-900/10 border-orange-500/30' : 'bg-white/5 border-white/5'}`}>
                                    <div className="flex justify-between mb-2">
                                        <span className="font-bold text-white">{item.ingredientName}</span>
                                        <span className="text-xs text-gray-400">Order: {item.quantity} {item.unit}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] uppercase text-gray-500 font-bold">Diterima</label>
                                            <input type="number" className="w-full glass-input rounded-lg p-2 text-white" value={item.receivedQuantity} onChange={e => updateReceivingItem(i, 'receivedQuantity', parseFloat(e.target.value))} />
                                        </div>
                                        {isDiscrepancy && (
                                            <div className="flex items-end">
                                                <button className="w-full p-2 bg-white/10 hover:bg-orange-500 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                                                    <Camera size={14} /> Ambil Foto
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {isDiscrepancy && (
                                        <div className="mt-2 animate-in fade-in">
                                            <label className="text-[10px] uppercase text-orange-400 font-bold flex items-center gap-1"><AlertCircle size={10}/> Alasan Selisih</label>
                                            <select 
                                                className="w-full glass-input rounded-lg p-2 text-xs text-white mt-1"
                                                value={item.discrepancyReason || ''}
                                                onChange={(e) => updateReceivingItem(i, 'discrepancyReason', e.target.value)}
                                            >
                                                <option value="" className="bg-gray-900">Pilih Alasan...</option>
                                                <option value="bonus" className="bg-gray-900 text-green-400">Bonus (Gratis)</option>
                                                <option value="damaged" className="bg-gray-900">Barang Rusak</option>
                                                <option value="missing" className="bg-gray-900">Barang Kurang</option>
                                            </select>
                                            {item.discrepancyReason === 'bonus' && <p className="text-[9px] text-green-400 mt-1 italic">*Tagihan dihitung sesuai jumlah order.</p>}
                                        </div>
                                    )}
                                </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* STEP 2: PAYMENT */}
                {receiveWizardStep === 2 && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-right-4">
                        <h4 className="text-sm font-bold text-white mb-3">2. Pembayaran</h4>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 mb-4">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-400">Total Tagihan</span>
                                <span className="text-2xl font-bold text-orange-500">Rp {calculateReceivingBill().toLocaleString()}</span>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-500 font-bold uppercase">Metode Bayar</label>
                                    <select className="w-full glass-input rounded-xl p-3 mt-1 text-white" value={receivePaymentMethod} onChange={e => setReceivePaymentMethod(e.target.value as any)}>
                                        <option value="cash" className="bg-gray-900">Tunai (Kasir)</option>
                                        <option value="transfer" className="bg-gray-900">Transfer Bank</option>
                                        <option value="tempo" className="bg-gray-900">Hutang / Tempo</option>
                                    </select>
                                </div>

                                {receivePaymentMethod === 'tempo' && (
                                    <div className="animate-in fade-in">
                                        <label className="text-xs text-gray-500 font-bold uppercase">Termin (Hari)</label>
                                        <div className="flex gap-2 items-center">
                                            <input type="number" className="w-20 glass-input rounded-xl p-3 mt-1 text-white text-center" value={tempoDuration} onChange={e => setTempoDuration(Number(e.target.value))} />
                                            <div className="text-sm text-gray-400 mt-1">
                                                Jatuh Tempo: <span className="text-white font-bold">{new Date(Date.now() + (Number(tempoDuration) * 86400000)).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {receivePaymentMethod === 'transfer' && (
                                    <div className="animate-in fade-in">
                                        <label className="text-xs text-gray-500 font-bold uppercase">Bank Sumber</label>
                                        <select className="w-full glass-input rounded-xl p-3 mt-1 text-white" value={selectedBank} onChange={e => setSelectedBank(e.target.value)}>
                                            <option value="BCA" className="bg-gray-900">BCA - 1234567890</option>
                                            <option value="MANDIRI" className="bg-gray-900">MANDIRI - 0987654321</option>
                                            <option value="BRI" className="bg-gray-900">BRI - 1122334455</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: SUMMARY */}
                {receiveWizardStep === 3 && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-right-4">
                        <h4 className="text-sm font-bold text-white mb-3">3. Konfirmasi Penerimaan</h4>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                                <span className="text-gray-400">Total Item</span>
                                <span className="font-bold text-white">{receivingItems.length} SKU</span>
                            </div>
                            <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                                <span className="text-gray-400">Pembayaran</span>
                                <span className="font-bold text-white uppercase">{receivePaymentMethod}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                                <span className="text-orange-200">Total Akhir</span>
                                <span className="font-bold text-orange-500 text-lg">Rp {calculateReceivingBill().toLocaleString()}</span>
                            </div>
                            
                            <div className="p-3 rounded-lg border border-dashed border-gray-600 text-gray-400 text-xs italic">
                                Pastikan semua data fisik dan pembayaran sudah sesuai. Stok akan otomatis bertambah setelah konfirmasi.
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Nav */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
                    {receiveWizardStep === 1 ? (
                        <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 transition-colors">Batal</button>
                    ) : (
                        <button onClick={() => setReceiveWizardStep(prev => prev - 1 as any)} className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 transition-colors">Kembali</button>
                    )}
                    
                    {receiveWizardStep < 3 ? (
                        <button onClick={() => setReceiveWizardStep(prev => prev + 1 as any)} className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">Lanjut</button>
                    ) : (
                        <button onClick={handleSubmitReceive} className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                            <CheckCircle2 size={18} /> Selesai
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default POReceiveWizard;