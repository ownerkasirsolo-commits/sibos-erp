import React, { useState } from 'react';
import { MOCK_SIGNAGE } from '../constants';
// FIX: Corrected import path for SignageContent from `../types` to its feature module.
import { SignageContent } from '../features/signage/types';
import { Tv, Play, Pause, Trash2, Plus, Image as ImageIcon, Video, MonitorPlay } from 'lucide-react';

const Signage: React.FC = () => {
  const [contentList, setContentList] = useState<SignageContent[]>(MOCK_SIGNAGE);

  const toggleActive = (id: string) => {
    setContentList(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Tv className="text-orange-500" /> Digital Signage
                </h2>
                <p className="text-sm text-gray-400">Kelola konten iklan TV.</p>
            </div>
            <button className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-orange-600/20">
                <Plus size={20} /> Upload +
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Playlist Manager */}
            <div className="lg:col-span-2 space-y-4">
                {contentList.map((item) => (
                    <div key={item.id} className={`glass-panel p-4 rounded-2xl flex items-center gap-4 transition-all ${!item.active && 'opacity-60 grayscale'}`}>
                        {/* Thumbnail */}
                        <div className="w-32 h-20 bg-gray-800 rounded-xl overflow-hidden relative shrink-0">
                            <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                {item.type === 'image' ? <ImageIcon className="text-white" size={20} /> : <Video className="text-white" size={20} />}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white text-lg">{item.name}</h4>
                            <p className="text-sm text-gray-400 flex items-center gap-2">
                                {item.duration}s • <span className="uppercase">{item.type}</span>
                            </p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => toggleActive(item.id)}
                                className={`p-3 rounded-xl transition-colors ${item.active ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                            >
                                {item.active ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                            </button>
                            <button className="p-3 rounded-xl bg-white/5 text-red-400 hover:bg-red-600 hover:text-white transition-colors">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Preview & Devices */}
            <div className="space-y-6">
                <div className="glass-panel p-6 rounded-3xl">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><MonitorPlay size={18} /> Preview</h3>
                    <div className="aspect-video bg-black rounded-xl overflow-hidden relative border border-white/10">
                         {/* Simple Preview of First Active Item */}
                         {contentList.find(c => c.active) ? (
                            <img src={contentList.find(c => c.active)?.url} className="w-full h-full object-cover" />
                         ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-500">No Content Playing</div>
                         )}
                         <div className="absolute bottom-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase animate-pulse">
                             Live
                         </div>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-3xl">
                    <h3 className="font-bold text-white mb-4">Perangkat</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
                                <span className="text-sm font-bold text-gray-200">TV Utama</span>
                            </div>
                            <span className="text-xs text-green-400">Online</span>
                        </div>
                         <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
                                <span className="text-sm font-bold text-gray-200">Customer Display</span>
                            </div>
                            <span className="text-xs text-green-400">Online</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Signage;