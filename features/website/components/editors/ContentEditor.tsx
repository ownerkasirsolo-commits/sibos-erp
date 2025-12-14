
import React from 'react';
import { WebsiteConfig } from '../../types';
import { Type, Phone, Sparkles } from 'lucide-react';
import GlassPanel from '../../../../components/common/GlassPanel';
import GlassInput from '../../../../components/common/GlassInput';

interface ContentEditorProps {
    config: WebsiteConfig;
    onUpdate: (field: keyof WebsiteConfig, value: any) => void;
    onGenerateAI: (type: 'tagline' | 'about') => void;
    isGenerating: boolean;
}

const ContentEditor: React.FC<ContentEditorProps> = ({ config, onUpdate, onGenerateAI, isGenerating }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
             <GlassPanel className="p-5 rounded-2xl border border-white/5">
                <h4 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                    <Type size={16} className="text-green-400" /> Teks Utama
                </h4>
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Judul Website</label>
                        <GlassInput 
                            value={config.title} 
                            onChange={e => onUpdate('title', e.target.value)}
                            className="py-2"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] text-gray-500 font-bold uppercase block">Tagline / Slogan</label>
                            <button 
                                onClick={() => onGenerateAI('tagline')}
                                disabled={isGenerating}
                                className="text-[10px] flex items-center gap-1 text-orange-400 hover:text-orange-300 disabled:opacity-50"
                            >
                                <Sparkles size={10} /> {isGenerating ? 'Menulis...' : 'Buat dgn AI'}
                            </button>
                        </div>
                        <textarea 
                            className="w-full glass-input rounded-xl p-3 text-sm h-20 resize-none text-white focus:border-orange-500/50"
                            value={config.tagline}
                            onChange={e => onUpdate('tagline', e.target.value)}
                        />
                    </div>
                     <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] text-gray-500 font-bold uppercase block">Tentang Bisnis</label>
                            <button 
                                onClick={() => onGenerateAI('about')}
                                disabled={isGenerating}
                                className="text-[10px] flex items-center gap-1 text-orange-400 hover:text-orange-300 disabled:opacity-50"
                            >
                                <Sparkles size={10} /> {isGenerating ? 'Berpikir...' : 'Buat dgn AI'}
                            </button>
                        </div>
                        <textarea 
                            className="w-full glass-input rounded-xl p-3 text-sm h-32 resize-none text-white focus:border-orange-500/50 leading-relaxed"
                            value={config.about}
                            onChange={e => onUpdate('about', e.target.value)}
                        />
                    </div>
                </div>
             </GlassPanel>
             
             <GlassPanel className="p-5 rounded-2xl border border-white/5">
                <h4 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                    <Phone size={16} className="text-orange-400" /> Kontak Info
                </h4>
                <div className="grid grid-cols-2 gap-3">
                     <div className="col-span-2">
                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Alamat</label>
                        <GlassInput 
                            value={config.address} 
                            onChange={e => onUpdate('address', e.target.value)}
                            className="py-2 text-xs"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">WhatsApp</label>
                        <GlassInput 
                            value={config.contactWA} 
                            onChange={e => onUpdate('contactWA', e.target.value)}
                            className="py-2 text-xs"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Instagram</label>
                        <GlassInput 
                            value={config.instagram} 
                            onChange={e => onUpdate('instagram', e.target.value)}
                            className="py-2 text-xs"
                        />
                    </div>
                </div>
             </GlassPanel>
        </div>
    );
};

export default ContentEditor;
