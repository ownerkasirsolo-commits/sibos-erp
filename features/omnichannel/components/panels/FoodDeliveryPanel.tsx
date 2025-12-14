
import React from 'react';
import { SalesChannel } from '../../types';
import { Bike, Power, Calculator, Clock, CheckCircle2, DollarSign } from 'lucide-react';
import GlassPanel from '../../../../components/common/GlassPanel';
import GlassInput from '../../../../components/common/GlassInput';
import CompactNumber from '../../../../components/common/CompactNumber';

interface FoodDeliveryPanelProps {
    channels: SalesChannel[];
    onToggleStatus: (id: string) => void;
    onUpdateConfig: (id: string, field: keyof SalesChannel, value: any) => void;
    onBulkStatus: (status: 'Open' | 'Closed') => void;
}

const FoodDeliveryPanel: React.FC<FoodDeliveryPanelProps> = ({ channels, onToggleStatus, onUpdateConfig, onBulkStatus }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            {/* Header Control */}
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Bike className="text-orange-500" /> Restoran Online (Food Delivery)
                    </h3>
                    <p className="text-xs text-gray-400">Atur status buka/tutup dan strategi harga untuk aplikasi pesan antar.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => onBulkStatus('Open')} className="px-4 py-2 bg-green-600/20 text-green-400 border border-green-600/30 rounded-xl text-xs font-bold hover:bg-green-600 hover:text-white transition-colors">Buka Semua</button>
                    <button onClick={() => onBulkStatus('Closed')} className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-colors">Tutup Semua</button>
                </div>
            </div>

            {/* Channels Grid */}
            <div className="grid grid-cols-1 gap-4">
                {channels.map(channel => {
                    // Simple Simulation
                    const basePrice = 35000;
                    const sellingPrice = basePrice + (basePrice * (channel.markup / 100));
                    const platformFee = sellingPrice * (channel.commission / 100);
                    const netReceive = sellingPrice - platformFee;
                    const isProfit = netReceive >= basePrice;

                    return (
                        <GlassPanel key={channel.id} className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-6 transition-all ${channel.status === 'Open' ? 'border-green-500/30 bg-green-900/5' : 'border-white/5 bg-white/5 grayscale opacity-80'}`}>
                            {/* Left: Identity & Status */}
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${channel.bg} ${channel.color}`}>
                                            <Bike size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg">{channel.name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${channel.status === 'Open' ? 'bg-green-500 text-black border-green-500' : 'bg-red-500 text-white border-red-500'}`}>
                                                    {channel.status === 'Open' ? 'BUKA' : 'TUTUP'}
                                                </div>
                                                <span className="text-[10px] text-gray-400">Fee: {channel.commission}%</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => onToggleStatus(channel.id)}
                                        className={`p-3 rounded-full border transition-all ${channel.status === 'Open' ? 'bg-green-500 text-white border-green-400 shadow-[0_0_15px_#22c55e]' : 'bg-white/10 text-gray-400 border-white/10 hover:bg-white/20'}`}
                                    >
                                        <Power size={20} />
                                    </button>
                                </div>

                                {/* Auto Actions */}
                                <div className="flex items-center gap-4 text-xs text-gray-300">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={channel.autoAccept} onChange={(e) => onUpdateConfig(channel.id, 'autoAccept', e.target.checked)} className="accent-orange-500 w-4 h-4 rounded" />
                                        <span>Terima Otomatis</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={channel.syncStock} onChange={(e) => onUpdateConfig(channel.id, 'syncStock', e.target.checked)} className="accent-orange-500 w-4 h-4 rounded" />
                                        <span>Sync Stok Menu</span>
                                    </label>
                                </div>
                            </div>

                            {/* Right: Pricing Strategy */}
                            <div className="md:w-72 bg-black/20 rounded-xl p-3 border border-white/5">
                                <div className="flex items-center gap-2 mb-3 text-orange-400 text-xs font-bold uppercase tracking-wider border-b border-white/5 pb-2">
                                    <Calculator size={12} /> Simulasi Harga
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                                            <span>Markup Harga</span>
                                            <span className="text-white font-bold">{channel.markup}%</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="0" max="100" step="1"
                                            value={channel.markup}
                                            onChange={(e) => onUpdateConfig(channel.id, 'markup', parseFloat(e.target.value))}
                                            className="w-full accent-orange-500 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                                        <div className="bg-white/5 p-2 rounded-lg">
                                            <span className="text-gray-500 block">Jual di App</span>
                                            <span className="text-white font-bold text-xs"><CompactNumber value={sellingPrice} /></span>
                                        </div>
                                        <div className={`p-2 rounded-lg border ${isProfit ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                            <span className={`block ${isProfit ? 'text-green-400' : 'text-red-400'}`}>Terima Bersih</span>
                                            <span className={`font-bold text-xs ${isProfit ? 'text-white' : 'text-red-200'}`}><CompactNumber value={netReceive} /></span>
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-gray-500 italic text-center">*Simulasi modal 35rb</p>
                                </div>
                            </div>
                        </GlassPanel>
                    );
                })}
            </div>
        </div>
    );
};

export default FoodDeliveryPanel;
