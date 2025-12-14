
import React from 'react';
import { Repeat, RefreshCw, CheckCircle2 } from 'lucide-react';
import GlassPanel from '../../../../components/common/GlassPanel';
import { SyncHistoryItem } from '../../types';

interface MenuSyncViewProps {
    syncHistory: SyncHistoryItem[];
}

const MenuSyncView: React.FC<MenuSyncViewProps> = ({ syncHistory }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in zoom-in-95">
        <div className="lg:col-span-9">
            <div className="glass-panel p-8 rounded-3xl border border-white/5 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-24 h-24 bg-orange-500/20 rounded-full flex items-center justify-center mb-6 text-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                    <Repeat size={48} className="animate-spin-slow" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Sync Menu & Stok</h3>
                <p className="text-gray-400 max-w-md leading-relaxed">
                    Sinkronisasi otomatis semua perubahan menu, harga, dan stok ke GoFood, GrabFood, ShopeeFood, dan TikTok Shop.
                </p>
                <button className="mt-8 px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20 hover:scale-105 transition-transform flex items-center gap-3 text-lg">
                    <RefreshCw size={24} /> Mulai Sinkronisasi
                </button>
                <div className="mt-6 flex gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500"/> Harga</span>
                    <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500"/> Stok</span>
                    <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500"/> Foto</span>
                    <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500"/> Deskripsi</span>
                </div>
            </div>
        </div>
        
        <div className="lg:col-span-3">
            <GlassPanel className="p-5 rounded-2xl border border-white/5">
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Riwayat Sync</h4>
            <div className="space-y-4 relative border-l border-white/10 ml-1 pl-4">
                {syncHistory.map((item, i) => (
                    <div key={item.id} className="relative">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-green-500 rounded-full border border-[#0f172a]"></div>
                        <p className="text-xs font-bold text-white">Sukses - Auto Sync</p>
                        <p className="text-[10px] text-gray-500">{item.itemsUpdated} Item Updated</p>
                        <p className="text-[10px] text-gray-600 mt-0.5">{item.timestamp}</p>
                    </div>
                ))}
            </div>
            </GlassPanel>
        </div>
    </div>
  );
};

export default MenuSyncView;
