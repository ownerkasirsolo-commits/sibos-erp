
import React from 'react';
import { SalesChannel } from '../../types';
import { ShoppingBag, Box, Activity, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import GlassPanel from '../../../../components/common/GlassPanel';
import GlassInput from '../../../../components/common/GlassInput';

interface MarketplacePanelProps {
    channels: SalesChannel[];
    onUpdateConfig: (id: string, field: keyof SalesChannel, value: any) => void;
}

const MarketplacePanel: React.FC<MarketplacePanelProps> = ({ channels, onUpdateConfig }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
             {/* Header */}
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <ShoppingBag className="text-blue-500" /> Marketplace & E-Commerce
                    </h3>
                    <p className="text-xs text-gray-400">Sinkronisasi stok realtime untuk mencegah overselling.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {channels.map(channel => (
                    <GlassPanel key={channel.id} className="p-5 rounded-2xl border border-white/5 relative overflow-hidden">
                         <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${channel.bg} ${channel.color}`}>
                                    <ShoppingBag size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">{channel.name}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className={`w-2 h-2 rounded-full ${channel.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                        <span className="text-xs text-gray-400">{channel.connected ? 'Terhubung API' : 'Terputus'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-500 font-bold uppercase">Pending Order</p>
                                <p className="text-xl font-bold text-white">12</p>
                            </div>
                         </div>

                         {/* Stock Config */}
                         <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-4">
                             <div className="flex items-center justify-between">
                                 <label className="text-xs text-gray-300 flex items-center gap-2">
                                     <RefreshCw size={14} className="text-blue-400"/> Sync Stok Otomatis
                                 </label>
                                 <input 
                                    type="checkbox" 
                                    checked={channel.syncStock} 
                                    onChange={(e) => onUpdateConfig(channel.id, 'syncStock', e.target.checked)}
                                    className="accent-blue-500 w-4 h-4 cursor-pointer" 
                                 />
                             </div>
                             
                             <div className="space-y-1">
                                 <div className="flex justify-between items-center mb-1">
                                     <label className="text-xs text-gray-300 flex items-center gap-2">
                                        <ShieldCheck size={14} className="text-green-400"/> Safety Stock (Buffer)
                                     </label>
                                     <span className="text-xs font-bold text-white">{channel.stockBuffer} Item</span>
                                 </div>
                                 <input 
                                    type="range" 
                                    min="0" max="20" 
                                    value={channel.stockBuffer} 
                                    onChange={(e) => onUpdateConfig(channel.id, 'stockBuffer', parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                                 />
                                 <p className="text-[9px] text-gray-500">
                                     Stok di marketplace akan dikurangi {channel.stockBuffer} unit dari stok asli untuk mencegah pembatalan pesanan.
                                 </p>
                             </div>
                         </div>

                         {/* Footer Stats */}
                         <div className="mt-4 flex gap-4 text-xs">
                             <div className="flex-1 p-2 rounded-lg bg-white/5 text-center">
                                 <span className="block text-gray-500 mb-1">Fee Transaksi</span>
                                 <span className="font-bold text-white">{channel.commission}%</span>
                             </div>
                             <div className="flex-1 p-2 rounded-lg bg-white/5 text-center">
                                 <span className="block text-gray-500 mb-1">Total SKU</span>
                                 <span className="font-bold text-white">154</span>
                             </div>
                         </div>
                    </GlassPanel>
                ))}
            </div>
        </div>
    );
};

export default MarketplacePanel;
