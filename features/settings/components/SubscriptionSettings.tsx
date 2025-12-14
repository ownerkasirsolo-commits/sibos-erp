
import React, { useState } from 'react';
import { CheckCircle2, FileText, Star, CreditCard, Wallet, AlertCircle, TrendingUp, Download } from 'lucide-react';
import { useGlobalContext } from '../../../context/GlobalContext';
import CompactNumber from '../../../components/common/CompactNumber';
import Modal from '../../../components/common/Modal';
import GlassPanel from '../../../components/common/GlassPanel';
import WalletCard from '../../wallet/components/WalletCard';

const SubscriptionSettings: React.FC = () => {
    const { walletBalance, processWalletPayment } = useGlobalContext();
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<'Juragan' | 'Sultan'>('Juragan');

    const plans = {
        Juragan: { price: 250000, name: 'Paket Juragan', benefits: ['Hingga 2 Outlet', 'Cloud Sync', 'Laporan Dasar'] },
        Sultan: { price: 1000000, name: 'Paket Sultan', benefits: ['Unlimited Outlet', 'AI Boss', 'Priority Support'] }
    };

    const currentPlanPrice = plans[selectedPlan].price;
    const canAfford = walletBalance.amount >= currentPlanPrice;

    const handlePayment = async () => {
        if (!canAfford) {
            alert("Saldo tidak cukup! Silakan Top Up dulu.");
            return;
        }
        
        const success = await processWalletPayment(
            currentPlanPrice, 
            `Perpanjangan ${plans[selectedPlan].name}`, 
            'Subscription'
        );

        if (success) {
            alert(`Berhasil berlangganan ${plans[selectedPlan].name}!`);
            setIsUpgradeModalOpen(false);
        } else {
            alert("Transaksi Gagal.");
        }
    };

    const planFeatures = [
        "Hingga 5 Outlet",
        "Manajemen Produk & Stok Tanpa Batas",
        "Akses Penuh Asisten AI",
        "Laporan Analitik Lanjutan",
        "Dukungan Prioritas 24/7"
    ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-right-4">
        
        {/* LEFT COLUMN: WALLET & HISTORY (Sidebar Style) */}
        <div className="lg:col-span-1 space-y-6">
            
            {/* Wallet Card Component (Reused for Premium Look) */}
            <div className="filter drop-shadow-2xl">
                <WalletCard 
                    balance={walletBalance} 
                    onTopUp={() => window.location.hash = '#/wallet'} 
                />
            </div>
            
            <div className="text-[10px] text-gray-500 text-center px-4">
                *Saldo ini digunakan otomatis untuk perpanjangan paket.
            </div>

            {/* Invoice History */}
            <GlassPanel className="p-6 rounded-3xl border border-white/5 h-fit">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <FileText size={18} className="text-blue-400"/> Tagihan
                    </h3>
                </div>
                <div className="space-y-3">
                    {[
                        {invoice: "INV-2024-12A", date: "25 Des 2024", amount: 500000, status: "Lunas"},
                        {invoice: "INV-2023-12A", date: "25 Des 2023", amount: 500000, status: "Lunas"},
                        {invoice: "INV-2022-12A", date: "25 Des 2022", amount: 250000, status: "Lunas"},
                    ].map((item, i) => (
                        <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group cursor-pointer">
                            <div className="flex justify-between items-start mb-1">
                                <p className="font-bold text-white text-xs">{item.invoice}</p>
                                <span className="text-[9px] font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/20">{item.status}</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <p className="text-[10px] text-gray-500">{item.date}</p>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-gray-300 text-sm"><CompactNumber value={item.amount} currency /></p>
                                    <button className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Download size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="w-full mt-4 text-xs font-bold text-gray-400 hover:text-white py-2 border border-white/5 rounded-xl hover:bg-white/5 transition-all">
                    Lihat Semua Riwayat
                </button>
            </GlassPanel>
        </div>

        {/* RIGHT COLUMN: ACTIVE PLAN DETAILS (Main Content) */}
        <div className="lg:col-span-2 space-y-6">
            <GlassPanel className="p-0 rounded-3xl overflow-hidden border border-white/5 relative">
                 {/* Banner Background */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-orange-600 to-red-900 opacity-80"></div>
                
                <div className="relative z-10 p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                             <Star className="text-orange-500 fill-orange-500" size={32} />
                        </div>
                        <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                            AKTIF
                        </span>
                    </div>
                    
                    <h3 className="text-3xl font-bold text-white mb-2">Paket SIBOS Premium</h3>
                    <p className="text-gray-300 text-sm mb-8 max-w-md leading-relaxed">
                        Nikmati akses penuh ke seluruh fitur canggih untuk mengembangkan bisnis Anda lebih cepat.
                    </p>

                    <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Masa Aktif Hingga</p>
                                <p className="text-xl font-bold text-white">25 Desember 2025</p>
                            </div>
                             <button 
                                onClick={() => setIsUpgradeModalOpen(true)}
                                className="w-full md:w-auto px-6 py-3 bg-white text-orange-600 font-bold rounded-xl shadow-lg hover:bg-gray-100 transition-transform hover:scale-105 whitespace-nowrap flex items-center justify-center gap-2"
                             >
                                <TrendingUp size={18} /> Perpanjang / Upgrade
                            </button>
                        </div>
                    </div>
                </div>
            </GlassPanel>
            
            <GlassPanel className="p-6 rounded-3xl border border-white/5">
                <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircle2 className="text-green-500" size={18} /> Fitur Paket Anda
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {planFeatures.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-gray-300 text-sm">{feature}</span>
                        </div>
                    ))}
                </div>
            </GlassPanel>
        </div>

        {/* UPGRADE / PAYMENT MODAL */}
        <Modal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} title="Pilih Paket Langganan" size="lg">
            <div className="space-y-6">
                {/* Plan Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(['Juragan', 'Sultan'] as const).map(planKey => {
                        const plan = plans[planKey];
                        const isSelected = selectedPlan === planKey;
                        return (
                            <div 
                                key={planKey}
                                onClick={() => setSelectedPlan(planKey)}
                                className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${isSelected ? 'bg-orange-500/10 border-orange-500 ring-1 ring-orange-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                            >
                                {isSelected && <div className="absolute top-2 right-2 text-orange-500"><CheckCircle2 size={20}/></div>}
                                <h4 className="font-bold text-white text-lg">{plan.name}</h4>
                                <p className="text-2xl font-black text-white mt-2 mb-4">
                                    <CompactNumber value={plan.price} /> <span className="text-xs font-normal text-gray-400">/ bulan</span>
                                </p>
                                <ul className="space-y-2">
                                    {plan.benefits.map((b, i) => (
                                        <li key={i} className="text-xs text-gray-300 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div> {b}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )
                    })}
                </div>

                {/* Payment Section */}
                <div className="pt-6 border-t border-white/10">
                    <h4 className="font-bold text-white mb-4">Metode Pembayaran</h4>
                    
                    <div className="p-4 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 border border-white/10 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                 <Wallet size={24} />
                             </div>
                             <div>
                                 <p className="font-bold text-white">SIBOS Pay</p>
                                 <p className="text-xs text-gray-400">Saldo: <span className="text-green-400 font-bold"><CompactNumber value={walletBalance.amount} /></span></p>
                             </div>
                         </div>
                         {canAfford ? (
                             <div className="text-green-400 text-xs font-bold flex items-center gap-1">
                                 <CheckCircle2 size={14} /> Saldo Cukup
                             </div>
                         ) : (
                             <div className="text-red-400 text-xs font-bold flex items-center gap-1">
                                 <AlertCircle size={14} /> Saldo Kurang
                             </div>
                         )}
                    </div>
                    
                    <div className="mt-6 flex gap-3">
                         <button onClick={() => setIsUpgradeModalOpen(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 font-bold hover:bg-white/5">
                             Batal
                         </button>
                         {canAfford ? (
                             <button onClick={handlePayment} className="flex-[2] py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105">
                                 Bayar Sekarang (<CompactNumber value={currentPlanPrice} />)
                             </button>
                         ) : (
                             <button className="flex-[2] py-3 bg-gray-700 text-gray-400 font-bold rounded-xl cursor-not-allowed">
                                 Saldo Tidak Cukup
                             </button>
                         )}
                    </div>
                    {!canAfford && (
                        <p className="text-center text-xs text-red-400 mt-3">
                            Harap Top Up dompet Anda terlebih dahulu di menu <b>Dompet</b>.
                        </p>
                    )}
                </div>
            </div>
        </Modal>
    </div>
  );
};

export default SubscriptionSettings;
