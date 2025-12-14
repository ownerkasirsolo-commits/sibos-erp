
import React, { useState } from 'react';
import { PackageCheck, Truck, Check, FileText, User } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import { B2BRequest } from '../../../b2b/types';
import GlassInput from '../../../../components/common/GlassInput';
import CompactNumber from '../../../../components/common/CompactNumber';

interface OrderProcessingModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: B2BRequest | null;
    onShip: (courierInfo: { driverName: string, plateNumber: string }) => void;
    currentUser: { name: string; role: string } | null;
}

const OrderProcessingModal: React.FC<OrderProcessingModalProps> = ({ 
    isOpen, onClose, order, onShip, currentUser 
}) => {
    const [step, setStep] = useState<1 | 2>(1);
    const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
    
    // Courier State
    const [driverName, setDriverName] = useState('');
    const [plateNumber, setPlateNumber] = useState('');

    if (!order) return null;

    // Toggle Checkbox
    const handleCheck = (index: number) => {
        setCheckedItems(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const allChecked = order.items.every((_, idx) => checkedItems[idx]);

    const handleNext = () => {
        if (allChecked) setStep(2);
    };

    const handleSubmitShipping = () => {
        if (!driverName || !plateNumber) {
            alert("Harap lengkapi data kurir!");
            return;
        }
        onShip({ driverName, plateNumber });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={step === 1 ? "Checklist & Quality Control" : "Terbitkan Surat Jalan"} size="lg">
            <div className="space-y-6">
                
                {/* Header Info */}
                <div className="flex justify-between items-start bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div>
                        <h4 className="text-lg font-bold text-white">Pesanan: {order.sourceName}</h4>
                        <p className="text-sm text-gray-400">ID: {order.originalPoId}</p>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2 justify-end text-sm text-gray-400">
                            <User size={14} />
                            <span>Staff: {currentUser?.name || 'Admin'}</span>
                        </div>
                        <p className="text-xs text-orange-400 mt-1">Status: Persiapan Barang</p>
                    </div>
                </div>

                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4">
                        <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl flex items-start gap-3 mb-4">
                            <PackageCheck size={20} className="text-blue-400 mt-0.5" />
                            <div className="text-sm text-blue-200">
                                <p className="font-bold">Instruksi QC:</p>
                                <p>Pastikan barang tersedia, kemasan baik, dan jumlah sesuai. Centang barang yang sudah siap.</p>
                            </div>
                        </div>

                        <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar p-1">
                            {order.items.map((item, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => handleCheck(idx)}
                                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${checkedItems[idx] ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${checkedItems[idx] ? 'bg-green-500 border-green-500 text-white' : 'border-gray-500 text-transparent'}`}>
                                            <Check size={14} />
                                        </div>
                                        <div>
                                            <p className={`font-bold text-sm ${checkedItems[idx] ? 'text-white' : 'text-gray-300'}`}>{item.ingredientName}</p>
                                            <p className="text-xs text-gray-500">{item.quantity} {item.unit}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xs font-bold ${checkedItems[idx] ? 'text-green-400' : 'text-gray-500'}`}>
                                            {checkedItems[idx] ? 'Siap' : 'Belum'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
                            <button 
                                onClick={handleNext}
                                disabled={!allChecked}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
                            >
                                Lanjut Pengiriman <Truck size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4">
                        <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-xl flex items-start gap-3 mb-6">
                            <FileText size={20} className="text-orange-400 mt-0.5" />
                            <div className="text-sm text-orange-200">
                                <p className="font-bold">Penerbitan Surat Jalan (Delivery Order)</p>
                                <p>Sistem akan otomatis men-generate nomor resi. Mohon lengkapi identitas kurir.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Nama Kurir / Driver</label>
                                <GlassInput 
                                    placeholder="Contoh: Pak Budi"
                                    value={driverName}
                                    onChange={(e) => setDriverName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Plat Nomor Kendaraan</label>
                                <GlassInput 
                                    placeholder="Contoh: B 1234 CD"
                                    value={plateNumber}
                                    onChange={(e) => setPlateNumber(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-white/10 flex gap-3 justify-end">
                            <button onClick={() => setStep(1)} className="px-6 py-3 border border-white/10 text-gray-400 hover:text-white rounded-xl">Kembali</button>
                            <button 
                                onClick={handleSubmitShipping}
                                className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg flex items-center gap-2"
                            >
                                <FileText size={18} /> Terbitkan Surat Jalan
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default OrderProcessingModal;
