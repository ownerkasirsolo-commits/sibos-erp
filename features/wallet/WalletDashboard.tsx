
import React from 'react';
import { useWalletLogic } from './hooks/useWalletLogic';
import WalletCard from './components/WalletCard';
import GlassPanel from '../../components/common/GlassPanel';
import Modal from '../../components/common/Modal';
import GlassInput from '../../components/common/GlassInput';
import { ArrowUpRight, ArrowDownLeft, History, CreditCard, Crown, Zap, ExternalLink } from 'lucide-react';
import CompactNumber from '../../components/common/CompactNumber';

interface WalletDashboardProps {
    onNavigate: (view: string) => void;
}

const WalletDashboard: React.FC<WalletDashboardProps> = ({ onNavigate }) => {
    const { 
        balance, transactions, 
        isTopUpModalOpen, setIsTopUpModalOpen,
        topUpAmount, setTopUpAmount,
        selectedMethod, setSelectedMethod, paymentMethods,
        handleTopUp
    } = useWalletLogic();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        Billing & Wallet
                    </h2>
                    <p className="text-sm text-gray-400">Pusat pembayaran dan saldo aktif SIBOS Pay.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column: Wallet & Subscription Status (5/12) */}
                <div className="lg:col-span-5 space-y-6">
                    <WalletCard balance={balance} onTopUp={() => setIsTopUpModalOpen(true)} />
                    
                    {/* SUBSCRIPTION STATUS CARD (THE BRIDGE) */}
                    <div className="p-1 rounded-3xl bg-gradient-to-br from-orange-500/20 via-red-500/20 to-purple-500/20 border border-white/10">
                        <GlassPanel className="p-5 rounded-[20px] bg-[#0f172a]/90 backdrop-blur-xl">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center shadow-lg">
                                        <Crown size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">Paket Saat Ini</h4>
                                        <p className="text-xs text-orange-400 font-bold">Premium Enterprise</p>
                                    </div>
                                </div>
                                <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded text-[10px] font-bold border border-green-500/20">AKTIF</span>
                            </div>

                            <div className="flex justify-between items-end text-xs text-gray-400 mb-4">
                                <span>Berakhir pada:</span>
                                <span className="text-white font-bold">25 Des 2025</span>
                            </div>

                            <div className="w-full bg-white/10 h-1.5 rounded-full mb-4 overflow-hidden">
                                <div className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full" style={{ width: '45%' }}></div>
                            </div>

                            {/* BRIDGE BUTTON: Navigates to Settings */}
                            <button 
                                onClick={() => onNavigate('settings')}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/50 rounded-xl text-xs font-bold text-gray-300 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <Zap size={14} className="text-yellow-400" /> Kelola Langganan di Pengaturan <ExternalLink size={12}/>
                            </button>
                        </GlassPanel>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <GlassPanel className="p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border border-green-500/20 bg-green-500/5">
                            <div className="p-3 bg-green-500/20 rounded-full text-green-400">
                                <ArrowDownLeft size={24} />
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-gray-400">Masuk (30 Hari)</p>
                                <p className="text-lg font-bold text-white"><CompactNumber value={5000000} /></p>
                            </div>
                        </GlassPanel>
                        <GlassPanel className="p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border border-red-500/20 bg-red-500/5">
                            <div className="p-3 bg-red-500/20 rounded-full text-red-400">
                                <ArrowUpRight size={24} />
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-gray-400">Keluar (30 Hari)</p>
                                <p className="text-lg font-bold text-white"><CompactNumber value={300000} /></p>
                            </div>
                        </GlassPanel>
                    </div>
                </div>

                {/* Right Column: Transactions (7/12) */}
                <div className="lg:col-span-7">
                    <GlassPanel className="h-full p-6 rounded-3xl border border-white/5 bg-black/20">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <History size={18} className="text-gray-400"/> Riwayat Transaksi
                            </h3>
                            <button className="text-xs text-orange-400 font-bold hover:underline">Lihat Semua</button>
                        </div>

                        <div className="space-y-4">
                            {transactions.map(trx => (
                                <div key={trx.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${trx.type === 'credit' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {trx.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white">{trx.category}</h4>
                                            <p className="text-xs text-gray-400">{trx.description}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold font-mono ${trx.type === 'credit' ? 'text-green-400' : 'text-white'}`}>
                                            {trx.type === 'credit' ? '+' : '-'}<CompactNumber value={trx.amount} />
                                        </p>
                                        <p className="text-[10px] text-gray-500">{new Date(trx.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassPanel>
                </div>
            </div>

            {/* TOP UP MODAL */}
            <Modal isOpen={isTopUpModalOpen} onClose={() => setIsTopUpModalOpen(false)} title="Isi Saldo Dompet">
                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Nominal Top Up</label>
                        <div className="relative">
                            <span className="absolute left-4 top-3.5 text-white font-bold">Rp</span>
                            <GlassInput 
                                type="number" 
                                value={topUpAmount}
                                onChange={(e) => setTopUpAmount(Number(e.target.value))}
                                className="pl-10 text-lg font-bold"
                                placeholder="0"
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-2 mt-2">
                            {[50000, 100000, 250000, 500000].map(amt => (
                                <button 
                                    key={amt}
                                    onClick={() => setTopUpAmount(amt)}
                                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-gray-300 border border-white/5"
                                >
                                    {amt / 1000}k
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Metode Pembayaran</label>
                        <div className="space-y-2">
                            {paymentMethods.map(method => (
                                <div 
                                    key={method.id}
                                    onClick={() => setSelectedMethod(method.id)}
                                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${selectedMethod === method.id ? 'bg-orange-500/10 border-orange-500' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-8 bg-white rounded flex items-center justify-center">
                                             <span className="text-[10px] font-black text-black">{method.logo}</span>
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${selectedMethod === method.id ? 'text-orange-400' : 'text-white'}`}>{method.name}</p>
                                            {method.accountNumber && <p className="text-xs text-gray-500">{method.accountNumber}</p>}
                                        </div>
                                    </div>
                                    {selectedMethod === method.id && <div className="w-4 h-4 bg-orange-500 rounded-full"></div>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={handleTopUp}
                        className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                    >
                        <CreditCard size={18} /> Konfirmasi Top Up
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default WalletDashboard;
