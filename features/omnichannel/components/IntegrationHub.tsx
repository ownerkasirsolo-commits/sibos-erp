
import React from 'react';
import { ConnectedAccount } from '../types';
import { CheckCircle, AlertCircle, RefreshCw, Plus, ArrowRight, Settings } from 'lucide-react';
import GlassPanel from '../../../components/common/GlassPanel';
import StatWidget from '../../../components/common/StatWidget';

interface IntegrationHubProps {
    accounts: ConnectedAccount[];
    onPlatformClick: (account: ConnectedAccount) => void;
    onSettingsClick?: (account: ConnectedAccount) => void;
    onAddChannelClick?: () => void; // Added prop
}

const IntegrationHub: React.FC<IntegrationHubProps> = ({ accounts, onPlatformClick, onSettingsClick, onAddChannelClick }) => {
  
  const handleConfigClick = (e: React.MouseEvent, acc: ConnectedAccount) => {
      e.stopPropagation();
      if(onSettingsClick) onSettingsClick(acc);
      else onPlatformClick(acc); // Fallback
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/20">
                 <h4 className="text-blue-300 font-bold text-sm uppercase">Total Koneksi</h4>
                 <p className="text-3xl font-black text-white mt-1">{accounts.filter(a => a.status === 'connected').length}</p>
                 <p className="text-xs text-blue-200 mt-2">Platform Aktif</p>
             </div>
             <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                 <h4 className="text-gray-400 font-bold text-sm uppercase">Total Pendapatan (Bulan Ini)</h4>
                 <p className="text-3xl font-black text-white mt-1">Rp 15.0JT</p>
                 <p className="text-xs text-green-400 mt-2">+12% dari bulan lalu</p>
             </div>
             <button 
                onClick={onAddChannelClick}
                className="p-4 rounded-2xl border-2 border-dashed border-white/10 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all flex flex-col items-center justify-center text-gray-400 hover:text-white group"
             >
                 <Plus size={24} className="mb-2 group-hover:scale-110 transition-transform"/>
                 <span className="text-sm font-bold">Tambah Kanal Manual</span>
             </button>
        </div>

        {/* Connections Grid */}
        <div>
            <h3 className="text-lg font-bold text-white mb-4">Kanal Terhubung</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map(acc => (
                    <div 
                        key={acc.id} 
                        onClick={() => onPlatformClick(acc)}
                        className={`glass-panel p-5 rounded-2xl border transition-all group relative overflow-hidden cursor-pointer ${
                            acc.status === 'connected' 
                            ? 'border-white/5 hover:border-white/20' 
                            : 'border-white/5 bg-black/40 grayscale hover:grayscale-0 hover:border-orange-500/50'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg capitalize shadow-lg ${
                                    acc.platformId === 'shopee' ? 'bg-orange-500' :
                                    acc.platformId === 'tokopedia' ? 'bg-green-600' :
                                    acc.platformId === 'tiktok' ? 'bg-black border border-white/20' :
                                    acc.platformId === 'google' ? 'bg-blue-600' :
                                    acc.platformId === 'instagram' ? 'bg-pink-600' : 'bg-gray-700'
                                }`}>
                                    {acc.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">{acc.name}</h4>
                                    <p className="text-[10px] text-gray-400 capitalize">{acc.platformId}</p>
                                </div>
                            </div>
                            
                            {/* Status Indicator */}
                            {acc.status === 'connected' ? (
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
                            ) : (
                                <span className="px-2 py-0.5 rounded text-[9px] bg-white/10 text-gray-400 font-bold uppercase group-hover:bg-orange-600 group-hover:text-white transition-colors">Connect</span>
                            )}
                        </div>
                        
                        {acc.status === 'connected' ? (
                            <>
                                {acc.metrics && (
                                    <div className="grid grid-cols-3 gap-2 py-3 border-t border-white/5">
                                        <div className="text-center">
                                            <p className="text-[10px] text-gray-500">Orders</p>
                                            <p className="font-bold text-white">{acc.metrics.orders}</p>
                                        </div>
                                        <div className="text-center border-l border-white/5">
                                            <p className="text-xs text-gray-500">Rev</p>
                                            <p className="font-bold text-white text-xs">{(acc.metrics.revenue / 1000000).toFixed(1)}jt</p>
                                        </div>
                                        <div className="text-center border-l border-white/5">
                                            <p className="text-[10px] text-gray-500">Rating</p>
                                            <p className="font-bold text-yellow-400">{acc.metrics.rating}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="mt-2 flex justify-between items-center text-[10px] text-gray-500">
                                    <span className="flex items-center gap-1"><RefreshCw size={10}/> {acc.lastSync}</span>
                                    <button 
                                        onClick={(e) => handleConfigClick(e, acc)}
                                        className="flex items-center gap-1 text-gray-400 hover:text-orange-400 transition-colors bg-white/5 hover:bg-white/10 px-2 py-1 rounded"
                                    >
                                        <Settings size={10}/> Konfigurasi
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-gray-500 group-hover:text-white transition-colors">
                                <span className="text-xs">Klik untuk menghubungkan</span>
                                <ArrowRight size={14} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default IntegrationHub;
