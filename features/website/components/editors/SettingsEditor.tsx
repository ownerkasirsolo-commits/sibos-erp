
import React from 'react';
import { WebsiteConfig } from '../../types';
import { Globe, Eye, Lock } from 'lucide-react';
import GlassPanel from '../../../../components/common/GlassPanel';
import GlassInput from '../../../../components/common/GlassInput';

interface SettingsEditorProps {
    config: WebsiteConfig;
    onUpdate: (field: keyof WebsiteConfig, value: any) => void;
}

const SettingsEditor: React.FC<SettingsEditorProps> = ({ config, onUpdate }) => {
    return (
         <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
             <GlassPanel className="p-5 rounded-2xl border border-white/5">
                <h4 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                    <Globe size={16} className="text-orange-400" /> Domain & Hosting
                </h4>
                <div className="space-y-4">
                     <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Subdomain SIBOS</label>
                        <div className="flex gap-2">
                            <GlassInput 
                                value={config.domain.split('.')[0]}
                                onChange={e => onUpdate('domain', `${e.target.value}.sibos.id`)}
                                className="py-2 text-sm font-mono flex-1"
                            />
                            <div className="bg-white/10 px-3 py-2 rounded-xl flex items-center text-gray-400 text-sm">.sibos.id</div>
                        </div>
                    </div>
                     <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
                         <div>
                             <p className="text-xs text-white font-bold">Custom Domain</p>
                             <p className="text-[10px] text-gray-500">Gunakan domain .com sendiri</p>
                         </div>
                         <button className="px-3 py-1.5 bg-orange-600/20 text-orange-400 text-[10px] font-bold rounded-lg border border-orange-600/30 flex items-center gap-1">
                             <Lock size={10} /> Premium
                         </button>
                     </div>
                </div>
             </GlassPanel>

             <GlassPanel className="p-5 rounded-2xl border border-white/5">
                <h4 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                    <Eye size={16} className="text-teal-400" /> Visibilitas Modul
                </h4>
                <div className="space-y-2">
                    {[
                        { label: 'Tampilkan Menu', key: 'showMenu' },
                        { label: 'Tampilkan Ulasan', key: 'showReviews' },
                        { label: 'Tampilkan Blog / Artikel', key: 'showBlog' },
                        { label: 'Tampilkan Peta Lokasi', key: 'showLocation' },
                    ].map((item: any) => (
                        <div key={item.key} className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5">
                            <span className="text-xs text-gray-300">{item.label}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={(config as any)[item.key]} 
                                    onChange={e => onUpdate(item.key, e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500"></div>
                            </label>
                        </div>
                    ))}
                </div>
             </GlassPanel>
         </div>
    );
};

export default SettingsEditor;
