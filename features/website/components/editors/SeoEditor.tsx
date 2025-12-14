
import React from 'react';
import { WebsiteConfig } from '../../types';
import { Search, Sparkles } from 'lucide-react';
import GlassPanel from '../../../../components/common/GlassPanel';
import GlassInput from '../../../../components/common/GlassInput';

interface SeoEditorProps {
    config: WebsiteConfig;
    onUpdate: (field: keyof WebsiteConfig, value: any) => void;
    onGenerateAI: (type: 'seo') => void;
    isGenerating: boolean;
}

const SeoEditor: React.FC<SeoEditorProps> = ({ config, onUpdate, onGenerateAI, isGenerating }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
            <GlassPanel className="p-5 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                        <Search size={16} className="text-blue-400" /> Pengaturan SEO Global
                    </h4>
                    <button 
                        onClick={() => onGenerateAI('seo')}
                        disabled={isGenerating}
                        className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        <Sparkles size={12} /> {isGenerating ? 'Mengoptimalkan...' : 'Auto Optimize AI'}
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Meta Title (Homepage)</label>
                        <GlassInput 
                            value={config.seoTitle} 
                            onChange={e => onUpdate('seoTitle', e.target.value)}
                            placeholder="Judul di hasil pencarian Google"
                            className="py-2"
                        />
                        <div className="flex justify-between mt-1">
                             <p className="text-[10px] text-gray-500">Disarankan maks 60 karakter.</p>
                             <p className={`text-[10px] font-bold ${config.seoTitle.length > 60 ? 'text-red-400' : 'text-green-400'}`}>{config.seoTitle.length} chars</p>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Meta Description</label>
                        <textarea 
                            className="w-full glass-input rounded-xl p-3 text-sm h-24 resize-none text-white focus:border-blue-500/50"
                            value={config.seoDescription}
                            onChange={e => onUpdate('seoDescription', e.target.value)}
                            placeholder="Deskripsi singkat yang muncul di Google..."
                        />
                        <div className="flex justify-between mt-1">
                             <p className="text-[10px] text-gray-500">Disarankan maks 160 karakter.</p>
                             <p className={`text-[10px] font-bold ${config.seoDescription.length > 160 ? 'text-red-400' : 'text-green-400'}`}>{config.seoDescription.length} chars</p>
                        </div>
                    </div>
                </div>
            </GlassPanel>
            
            {/* Google Preview */}
            <div className="p-4 rounded-xl bg-[#1e293b] border border-white/5">
                <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Preview di Google</p>
                <div className="bg-white p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px] text-gray-500">W</div>
                        <div>
                            <p className="text-xs text-[#202124]">{config.domain}</p>
                            <p className="text-[10px] text-[#5f6368]">https://{config.domain}</p>
                        </div>
                    </div>
                    <p className="text-lg text-[#1a0dab] truncate hover:underline cursor-pointer font-medium leading-snug">
                        {config.seoTitle || config.title}
                    </p>
                    <p className="text-sm text-[#4d5156] mt-1 line-clamp-2 leading-relaxed">
                        {config.seoDescription || config.about}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SeoEditor;
