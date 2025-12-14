
import React, { useState } from 'react';
import { ConnectedAccount, PlatformId } from '../../types';
import Modal from '../../../../components/common/Modal';
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, Loader2, Link } from 'lucide-react';
import { ShoppingBag, Globe, Video, Instagram, MapPin } from 'lucide-react';

interface PlatformConnectModalProps {
    isOpen: boolean;
    onClose: () => void;
    platform: ConnectedAccount | null;
    onConnect: (id: string) => void;
}

const PlatformConnectModal: React.FC<PlatformConnectModalProps> = ({ isOpen, onClose, platform, onConnect }) => {
    const [step, setStep] = useState<'intro' | 'connecting' | 'success'>('intro');

    if (!platform) return null;

    const handleStartConnect = () => {
        setStep('connecting');
        // Simulate API Handshake delay
        setTimeout(() => {
            onConnect(platform.id);
            setStep('success');
            // Auto close after success
            setTimeout(() => {
                onClose();
                setStep('intro'); // Reset for next time
            }, 1500);
        }, 2000);
    };

    const getPlatformIcon = (id: PlatformId) => {
        switch(id) {
            case 'shopee': return <ShoppingBag size={40} className="text-orange-500" />;
            case 'tokopedia': return <ShoppingBag size={40} className="text-green-500" />;
            case 'tiktok': return <Video size={40} className="text-black" />;
            case 'instagram': return <Instagram size={40} className="text-pink-500" />;
            case 'google': return <MapPin size={40} className="text-blue-500" />;
            default: return <Globe size={40} className="text-blue-400" />;
        }
    };

    const getPermissions = (id: PlatformId) => {
        if (['gofood', 'grabfood', 'shopeefood'].includes(id)) {
            return ['Terima Pesanan Otomatis', 'Update Stok Menu', 'Edit Harga & Menu', 'Baca Laporan Penjualan'];
        }
        return ['Sync Stok Produk', 'Proses Pesanan', 'Update Nomor Resi', 'Baca Chat Pelanggan'];
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Hubungkan ${platform.name}`} size="md">
            <div className="flex flex-col items-center text-center p-4">
                
                {step === 'intro' && (
                    <div className="space-y-6 animate-in zoom-in-95">
                        <div className="flex items-center justify-center gap-6 mb-4">
                            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center border border-white/10">
                                <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                                    <Link size={24} className="text-white" />
                                </div>
                            </div>
                            
                            {/* Animated Dots */}
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-75"></div>
                                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-150"></div>
                            </div>

                            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center border border-white/10 shadow-lg shadow-white/5">
                                {getPlatformIcon(platform.platformId)}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white">Otorisasi Akses</h3>
                            <p className="text-sm text-gray-400 mt-2">
                                SIBOS meminta izin untuk mengakses toko Anda di <b>{platform.name}</b> untuk keperluan berikut:
                            </p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-left space-y-3">
                            {getPermissions(platform.platformId).map((perm, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="p-1 bg-green-500/20 rounded-full">
                                        <CheckCircle2 size={12} className="text-green-400" />
                                    </div>
                                    <span className="text-sm text-gray-300">{perm}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 w-full">
                            <button 
                                onClick={handleStartConnect}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                <ShieldCheck size={18} /> Izinkan & Hubungkan
                            </button>
                            <p className="text-[10px] text-gray-500 mt-3 flex items-center justify-center gap-1">
                                <AlertCircle size={10} /> Koneksi aman menggunakan enkripsi OAuth 2.0
                            </p>
                        </div>
                    </div>
                )}

                {step === 'connecting' && (
                    <div className="py-10 space-y-6 animate-in fade-in">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full border-4 border-white/10 border-t-orange-500 animate-spin mx-auto"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                {getPlatformIcon(platform.platformId)}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Menghubungkan...</h3>
                            <p className="text-sm text-gray-400 mt-1">Sedang melakukan sinkronisasi data awal.</p>
                        </div>
                    </div>
                )}

                {step === 'success' && (
                    <div className="py-10 space-y-6 animate-in zoom-in">
                        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_#22c55e]">
                            <CheckCircle2 size={48} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">Berhasil Terhubung!</h3>
                            <p className="text-sm text-gray-400 mt-2">
                                Toko <b>{platform.name}</b> kini aktif di Nexus SIBOS.
                            </p>
                        </div>
                    </div>
                )}

            </div>
        </Modal>
    );
};

export default PlatformConnectModal;
