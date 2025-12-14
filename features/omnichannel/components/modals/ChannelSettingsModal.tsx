
import React, { useState, useEffect } from 'react';
import { ConnectedAccount, SalesChannel } from '../../types';
import Modal from '../../../../components/common/Modal';
import { Calculator, ShieldCheck, RefreshCw, Save, MessageSquare, Link, Zap, Settings, TrendingUp, DollarSign, Layers, AlertCircle } from 'lucide-react';
import GlassInput from '../../../../components/common/GlassInput';
import CompactNumber from '../../../../components/common/CompactNumber';

// Helper to simulate profit
const simulateProfit = (basePrice: number, markupPercent: number, commissionPercent: number) => {
    const sellingPrice = basePrice + (basePrice * (markupPercent / 100));
    const platformFee = sellingPrice * (commissionPercent / 100);
    const netReceive = sellingPrice - platformFee;
    const profit = netReceive - basePrice;
    const margin = (profit / netReceive) * 100;
    return { sellingPrice, platformFee, netReceive, profit, margin };
};

interface ChannelSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    // We pass SalesChannel directly now as it has more config fields than ConnectedAccount in our updated types
    channel: SalesChannel | null; 
    onSave: (id: string, config: any) => void;
}

const ChannelSettingsModal: React.FC<ChannelSettingsModalProps> = ({ isOpen, onClose, channel, onSave }) => {
    const isSocialMedia = channel?.type === 'social_media';
    
    // Config State
    const [markupPercent, setMarkupPercent] = useState(0); 
    const [syncStock, setSyncStock] = useState(true);
    const [stockBuffer, setStockBuffer] = useState(0); 
    const [autoAccept, setAutoAccept] = useState(true);
    
    // Social State
    const [autoReply, setAutoReply] = useState(false);
    const [autoReplyMessage, setAutoReplyMessage] = useState('');
    const [bioLink, setBioLink] = useState('');
    
    // Simulation State
    const [basePriceInput, setBasePriceInput] = useState(35000); // Default simulation base

    const [activeTab, setActiveTab] = useState('tab1');

    useEffect(() => {
        if (channel) {
            setMarkupPercent(channel.markup || 0);
            setSyncStock(channel.syncStock ?? true);
            setStockBuffer(channel.stockBuffer || 0);
            setAutoAccept(channel.autoAccept ?? true);
            setAutoReply(channel.autoReply ?? false);
            setAutoReplyMessage(channel.autoReplyMessage || '');
            setBioLink(channel.bioLink || '');
        }
    }, [channel, isOpen]);

    if (!channel) return null;

    const tabs = isSocialMedia ? [
        { id: 'tab1', label: 'Interaksi', icon: MessageSquare },
        { id: 'tab2', label: 'Traffic', icon: Link }
    ] : [
        { id: 'tab1', label: 'Pricing & Laba', icon: Calculator },
        { id: 'tab2', label: 'Stok & Produk', icon: ShieldCheck },
        { id: 'tab3', label: 'Operasional', icon: Zap }
    ];

    const handleSave = () => {
        const config = isSocialMedia 
            ? { autoReply, autoReplyMessage, bioLink } 
            : { markup: markupPercent, syncStock, stockBuffer, autoAccept };
        
        onSave(channel.id, config);
        onClose();
    };

    // Calc simulation
    const sim = simulateProfit(basePriceInput, markupPercent, channel.commission || 0);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Konfigurasi ${channel.name}`} size="lg">
            <div className="flex flex-col h-[600px] lg:h-[500px]">
                
                {/* Tabs Navigation */}
                <div className="flex gap-2 mb-6 border-b border-white/10 pb-1 overflow-x-auto no-scrollbar">
                    {tabs.map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 text-sm font-bold rounded-t-xl transition-colors flex items-center gap-2 whitespace-nowrap ${
                                activeTab === tab.id 
                                ? 'bg-orange-600 text-white' 
                                : 'text-gray-400 hover:text-white bg-white/5'
                            }`}
                        >
                            <tab.icon size={14} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                    
                    {/* --- TAB 1: PRICING STRATEGY (NON-SOCIAL) --- */}
                    {!isSocialMedia && activeTab === 'tab1' && (
                        <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 p-5 rounded-2xl">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="text-orange-400 font-bold text-sm flex items-center gap-2">
                                            <Calculator size={16} /> Markup Otomatis
                                        </h4>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Naikkan harga jual di aplikasi untuk menutupi biaya komisi {channel.commission}%.
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] text-gray-500 uppercase font-bold">Markup Aktif</span>
                                        <p className="text-2xl font-black text-white">{markupPercent}%</p>
                                    </div>
                                </div>
                                <input 
                                    type="range" min="0" max="100" step="1" 
                                    value={markupPercent} onChange={(e) => setMarkupPercent(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                />
                                <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-mono">
                                    <span>0% (Harga Normal)</span>
                                    <span>50%</span>
                                    <span>100%</span>
                                </div>
                            </div>

                            {/* Live Simulator */}
                            <div className="bg-black/30 border border-white/10 rounded-2xl p-5">
                                <h5 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                                    <TrendingUp size={16} className="text-green-400"/> Simulasi Laba Rugi
                                </h5>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Harga Modal (HPP)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-gray-400 text-xs">Rp</span>
                                            <input 
                                                type="number" 
                                                value={basePriceInput}
                                                onChange={(e) => setBasePriceInput(Number(e.target.value))}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-8 pr-3 text-white text-sm font-bold focus:border-orange-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Harga Jual App</span>
                                            <span className="text-white font-bold"><CompactNumber value={sim.sellingPrice} /></span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Potongan App ({channel.commission}%)</span>
                                            <span className="text-red-400 font-mono">-<CompactNumber value={sim.platformFee} /></span>
                                        </div>
                                        <div className="h-px bg-white/10 my-1"></div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-300 font-bold">Terima Bersih</span>
                                            <span className={`font-bold text-lg ${sim.profit >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                                                <CompactNumber value={sim.netReceive} />
                                            </span>
                                        </div>
                                        <div className="flex justify-end gap-2 text-xs">
                                             <span className={sim.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                                                 {sim.profit >= 0 ? '+' : ''}<CompactNumber value={sim.profit} />
                                             </span>
                                             <span className="text-gray-500">
                                                 Margin: {sim.margin.toFixed(1)}%
                                             </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB 2: INVENTORY & STOCK (NON-SOCIAL) --- */}
                    {!isSocialMedia && activeTab === 'tab2' && (
                        <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                             <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div>
                                    <h4 className="font-bold text-white text-sm">Sinkronisasi Stok Realtime</h4>
                                    <p className="text-xs text-gray-400 mt-1">Potong stok otomatis di {channel.name} saat barang laku di kasir.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={syncStock} onChange={(e) => setSyncStock(e.target.checked)} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                <div className="flex justify-between items-center mb-3">
                                     <h4 className="font-bold text-gray-300 text-sm flex items-center gap-2">
                                         <ShieldCheck size={16} className="text-green-400"/> Safety Stock (Buffer)
                                     </h4>
                                     <span className="text-white font-bold bg-white/10 px-2 py-1 rounded text-xs">{stockBuffer} Unit</span>
                                </div>
                                <input 
                                    type="range" min="0" max="20" step="1" 
                                    value={stockBuffer} onChange={(e) => setStockBuffer(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                                />
                                <div className="mt-3 flex gap-2 items-start p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                    <AlertCircle size={14} className="text-yellow-500 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-yellow-200/80 leading-relaxed">
                                        Stok di {channel.name} akan dikurangi <b>{stockBuffer}</b> unit dari stok asli. Ini berguna mencegah pembatalan pesanan jika ada selisih stok fisik.
                                    </p>
                                </div>
                            </div>
                            
                            {/* Category Filter Mock */}
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 opacity-50 pointer-events-none grayscale">
                                <div className="flex justify-between mb-2">
                                    <h4 className="font-bold text-white text-sm">Filter Kategori Menu</h4>
                                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded">Segera Hadir</span>
                                </div>
                                <p className="text-xs text-gray-500">Pilih kategori menu yang ingin ditampilkan di {channel.name}.</p>
                            </div>
                        </div>
                    )}

                    {/* --- TAB 3: OPERATIONAL (NON-SOCIAL) --- */}
                    {!isSocialMedia && activeTab === 'tab3' && (
                         <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                             <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div>
                                    <h4 className="font-bold text-white text-sm">Terima Pesanan Otomatis</h4>
                                    <p className="text-xs text-gray-400 mt-1">Langsung terima order masuk tanpa konfirmasi manual (Auto-Accept).</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={autoAccept} onChange={(e) => setAutoAccept(e.target.checked)} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                            </div>
                         </div>
                    )}

                    {/* --- SOCIAL TABS --- */}
                    {isSocialMedia && activeTab === 'tab1' && (
                         <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                             <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div>
                                    <h4 className="font-bold text-white text-sm">Auto-Reply DM</h4>
                                    <p className="text-xs text-gray-400 mt-1">Balas otomatis pesan masuk.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={autoReply} onChange={(e) => setAutoReply(e.target.checked)} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                                </label>
                            </div>
                            
                            {autoReply && (
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Pesan Balasan</label>
                                    <textarea 
                                        className="w-full glass-input rounded-xl p-3 text-sm h-32 resize-none text-white"
                                        value={autoReplyMessage}
                                        onChange={(e) => setAutoReplyMessage(e.target.value)}
                                    />
                                </div>
                            )}
                         </div>
                    )}
                    
                    {isSocialMedia && activeTab === 'tab2' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                                <h4 className="text-blue-300 font-bold text-sm mb-2">Link Bio (Traffic Source)</h4>
                                <p className="text-xs text-blue-200 mb-4">
                                    Arahkan pengunjung profil {channel.name} langsung ke menu pemesanan online SIBOS.
                                </p>
                                <GlassInput 
                                    value={bioLink}
                                    onChange={(e) => setBioLink(e.target.value)}
                                    placeholder="https://..."
                                    className="text-sm"
                                />
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-white/10 flex justify-end gap-3 mt-auto">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-xl border border-white/10 text-gray-400 font-bold text-xs hover:bg-white/5">Batal</button>
                    <button onClick={handleSave} className="px-8 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 text-xs transition-transform active:scale-95">
                        <Save size={16} /> Simpan Konfigurasi
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ChannelSettingsModal;
