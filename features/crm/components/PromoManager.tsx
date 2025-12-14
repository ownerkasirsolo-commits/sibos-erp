
import React, { useState } from 'react';
import { Gift, Plus, Trash2, Power, AlertCircle, Save, Megaphone, Clock } from 'lucide-react';
import { useGlobalContext } from '../../../context/GlobalContext';
import { Promotion } from '../../products/types';
import GlassPanel from '../../../components/common/GlassPanel';
import GlassInput from '../../../components/common/GlassInput';
import Modal from '../../../components/common/Modal';
import StatWidget from '../../../components/common/StatWidget';

const PromoManager: React.FC = () => {
    const { promotions, addPromotion, togglePromotion, deletePromotion, products } = useGlobalContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form State
    const [name, setName] = useState('');
    const [buyProductId, setBuyProductId] = useState('');
    const [buyQuantity, setBuyQuantity] = useState(2);
    const [getProductId, setGetProductId] = useState('');
    const [getQuantity, setGetQuantity] = useState(1);

    const activePromoCount = promotions.filter(p => p.active).length;

    const handleSubmit = () => {
        if (!name || !buyProductId || !getProductId) return;
        const newPromo: Promotion = {
            id: `PROMO-${Date.now()}`,
            name,
            type: 'bogo',
            buyProductId,
            buyQuantity: Number(buyQuantity),
            getProductId,
            getQuantity: Number(getQuantity),
            active: true
        };
        addPromotion(newPromo);
        setIsModalOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setName('');
        setBuyProductId('');
        setBuyQuantity(2);
        setGetProductId('');
        setGetQuantity(1);
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-right-4 relative">
            
            {/* LEFT COLUMN: MAIN CONTENT (9/12) */}
            <div className="lg:col-span-9 flex flex-col gap-6">
                
                {/* Header Banner */}
                <GlassPanel className="p-8 rounded-3xl bg-gradient-to-br from-pink-900/20 to-black border-pink-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-b from-pink-400 to-pink-600 flex items-center justify-center shadow-[0_0_40px_-10px_rgba(236,72,153,0.6)] shrink-0">
                                <Gift size={32} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Promo & Campaign</h3>
                                <p className="text-gray-400 mt-1 max-w-lg text-sm">
                                    Atur promo taktis beli gratis (Buy X Get Y) untuk meningkatkan penjualan produk tertentu.
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl shadow-lg shadow-pink-600/20 flex items-center gap-2 transition-transform hover:scale-105 whitespace-nowrap"
                        >
                            <Plus size={18} /> Buat Promo Baru
                        </button>
                    </div>
                </GlassPanel>

                {/* Promo Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {promotions.length === 0 ? (
                        <div className="col-span-full text-center py-20 text-gray-500 bg-white/5 rounded-2xl border border-dashed border-gray-700">
                            <Gift size={48} className="mx-auto mb-4 opacity-20"/>
                            <p>Belum ada promo aktif.</p>
                        </div>
                    ) : (
                        promotions.map(promo => {
                            const buyProduct = products.find(p => p.id === promo.buyProductId)?.name || 'Unknown';
                            const getProduct = products.find(p => p.id === promo.getProductId)?.name || 'Unknown';

                            return (
                                <div key={promo.id} className={`p-4 rounded-2xl border transition-all ${promo.active ? 'bg-white/5 border-pink-500/30' : 'bg-black/20 border-white/5 opacity-60'}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-bold text-white text-lg line-clamp-1">{promo.name}</h4>
                                        <button 
                                            onClick={() => togglePromotion(promo.id)}
                                            className={`p-1.5 rounded-lg transition-colors ${promo.active ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-500'}`}
                                            title={promo.active ? "Nonaktifkan" : "Aktifkan"}
                                        >
                                            <Power size={16} />
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-2 text-sm text-gray-300 bg-black/20 p-3 rounded-xl border border-white/5">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Syarat:</span>
                                            <span className="font-bold truncate max-w-[120px]">Beli {promo.buyQuantity} x {buyProduct}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Bonus:</span>
                                            <span className="font-bold text-pink-400 truncate max-w-[120px]">Gratis {promo.getQuantity} x {getProduct}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-between items-center">
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${promo.active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {promo.active ? 'Running' : 'Stopped'}
                                        </span>
                                        <button onClick={() => deletePromotion(promo.id)} className="text-red-400 hover:text-white p-2 rounded hover:bg-red-500/20 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {/* RIGHT COLUMN: WIDGETS (3/12) */}
            <div className="lg:col-span-3 flex flex-col gap-4">
                <GlassPanel className="p-5 rounded-2xl border border-white/5">
                    <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Ringkasan Promo</h4>
                    <div className="space-y-3">
                        <StatWidget 
                            label="Total Promo" 
                            value={promotions.length} 
                            icon={Megaphone} 
                            colorClass="text-pink-400" 
                        />
                        <StatWidget 
                            label="Sedang Aktif" 
                            value={activePromoCount} 
                            icon={Clock} 
                            colorClass="text-green-400" 
                            bgClass="bg-green-500/10 border-green-500/20"
                        />
                    </div>
                </GlassPanel>

                <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20 text-xs text-pink-200/80 leading-relaxed">
                    <p className="font-bold text-pink-400 mb-1">Strategi Promo:</p>
                    Gunakan promo <b>Buy 2 Get 1</b> untuk produk dengan margin tinggi tapi perputaran lambat (Slow Moving) untuk menghabiskan stok.
                </div>
            </div>

            {/* MODAL CREATE PROMO */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Aturan Promo">
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nama Promo</label>
                        <GlassInput value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Beli Kopi Gratis Donat" />
                    </div>

                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                        <h4 className="font-bold text-white text-sm flex items-center gap-2"><AlertCircle size={14} className="text-orange-500"/> Syarat Pembelian</h4>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                                <label className="text-[10px] text-gray-500 block mb-1">Produk</label>
                                <select className="w-full glass-input rounded-lg p-2 text-sm appearance-none cursor-pointer" value={buyProductId} onChange={e => setBuyProductId(e.target.value)}>
                                    <option value="">Pilih Produk...</option>
                                    {products.map(p => <option key={p.id} value={p.id} className="bg-gray-900">{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 block mb-1">Jml</label>
                                <input type="number" className="w-full glass-input rounded-lg p-2 text-sm text-center" value={buyQuantity} onChange={e => setBuyQuantity(Number(e.target.value))} />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-pink-500/5 rounded-xl border border-pink-500/20 space-y-3">
                        <h4 className="font-bold text-pink-400 text-sm flex items-center gap-2"><Gift size={14} /> Bonus Didapat</h4>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                                <label className="text-[10px] text-gray-500 block mb-1">Produk Bonus</label>
                                <select className="w-full glass-input rounded-lg p-2 text-sm appearance-none" value={getProductId} onChange={e => setGetProductId(e.target.value)}>
                                    <option value="">Pilih Bonus...</option>
                                    {products.map(p => <option key={p.id} value={p.id} className="bg-gray-900">{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 block mb-1">Jml</label>
                                <input type="number" className="w-full glass-input rounded-lg p-2 text-sm text-center" value={getQuantity} onChange={e => setGetQuantity(Number(e.target.value))} />
                            </div>
                        </div>
                    </div>

                    <button onClick={handleSubmit} className="w-full py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
                        <Save size={18} /> Simpan Promo
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default PromoManager;
