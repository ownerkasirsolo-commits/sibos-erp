
import React, { useState } from 'react';
import { SocialContent } from '../types';
import { Sparkles, Image as ImageIcon, Send, Globe, Instagram, Youtube, Facebook, Copy } from 'lucide-react';
import GlassPanel from '../../../components/common/GlassPanel';
import GlassInput from '../../../components/common/GlassInput';

interface SmartContentStudioProps {
    contents: SocialContent[];
    onGenerate: (topic: string, tone: string) => Promise<string>;
    onAdd: (content: SocialContent) => void;
    isGenerating: boolean;
}

const SmartContentStudio: React.FC<SmartContentStudioProps> = ({ contents, onGenerate, onAdd, isGenerating }) => {
    const [topic, setTopic] = useState('');
    const [tone, setTone] = useState('Professional & Friendly');
    const [generatedCaption, setGeneratedCaption] = useState('');
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram']);

    const handleGenerate = async () => {
        if(!topic) return;
        const result = await onGenerate(topic, tone);
        setGeneratedCaption(result);
    };

    const handlePublish = () => {
        if(!generatedCaption) return;
        onAdd({
            id: `post-${Date.now()}`,
            caption: generatedCaption,
            platforms: selectedPlatforms as any,
            status: 'published',
            aiGenerated: true
        });
        setGeneratedCaption('');
        setTopic('');
    };

    const togglePlatform = (p: string) => {
        setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4">
            
            {/* CREATOR PANEL */}
            <div className="space-y-6">
                <GlassPanel className="p-6 rounded-3xl bg-gradient-to-br from-purple-900/20 to-black border-purple-500/20">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="text-purple-400" size={20} />
                        <h3 className="font-bold text-white">AI Content Generator</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block">Topik Konten</label>
                            <GlassInput 
                                placeholder="Contoh: Promo akhir bulan, Menu baru..." 
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                            />
                        </div>
                        <div>
                             <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block">Gaya Bahasa (Tone)</label>
                             <div className="flex gap-2">
                                 {['Professional', 'Lucu / Santai', 'Urgent / Promo'].map(t => (
                                     <button 
                                        key={t}
                                        onClick={() => setTone(t)}
                                        className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${tone === t ? 'bg-purple-600 text-white border-purple-500' : 'bg-white/5 text-gray-400 border-transparent'}`}
                                     >
                                         {t}
                                     </button>
                                 ))}
                             </div>
                        </div>
                        
                        <button 
                            onClick={handleGenerate}
                            disabled={isGenerating || !topic}
                            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {isGenerating ? <span className="animate-pulse">Sedang Menulis...</span> : <><Sparkles size={16}/> Generate Caption</>}
                        </button>
                    </div>
                </GlassPanel>

                {/* EDITOR RESULT */}
                <GlassPanel className="p-6 rounded-3xl border border-white/5">
                    <div className="flex justify-between mb-2">
                        <h4 className="text-sm font-bold text-white">Draft Postingan</h4>
                        <button className="text-gray-400 hover:text-white"><ImageIcon size={16}/></button>
                    </div>
                    <textarea 
                        className="w-full h-32 bg-black/30 rounded-xl p-3 text-sm text-gray-200 border border-white/10 focus:border-purple-500 outline-none resize-none"
                        value={generatedCaption}
                        onChange={e => setGeneratedCaption(e.target.value)}
                        placeholder="Hasil generate akan muncul di sini..."
                    ></textarea>
                    
                    <div className="mt-4">
                        <p className="text-[10px] text-gray-400 mb-2 uppercase font-bold">Publish Ke:</p>
                        <div className="flex gap-2 mb-4">
                            {['instagram', 'tiktok', 'facebook', 'google'].map(p => (
                                <button 
                                    key={p} 
                                    onClick={() => togglePlatform(p)}
                                    className={`p-2 rounded-lg border transition-all ${selectedPlatforms.includes(p) ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-transparent text-gray-500'}`}
                                >
                                    {p === 'instagram' ? <Instagram size={14}/> : p === 'google' ? <Globe size={14}/> : <div className="capitalize text-xs">{p}</div>}
                                </button>
                            ))}
                        </div>
                        <button onClick={handlePublish} disabled={!generatedCaption} className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
                            <Send size={16} /> Publish Sekarang
                        </button>
                    </div>
                </GlassPanel>
            </div>

            {/* FEED PREVIEW (Right) */}
            <div className="space-y-4">
                <h3 className="font-bold text-white">Feed Terkini</h3>
                <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {contents.map(content => (
                        <div key={content.id} className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                             <div className="flex gap-2 mb-3">
                                 {content.platforms.map(p => (
                                     <span key={p} className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300 capitalize">{p}</span>
                                 ))}
                                 <span className={`text-[10px] px-2 py-0.5 rounded ml-auto font-bold uppercase ${content.status === 'published' ? 'text-green-400 bg-green-500/10' : 'text-yellow-400 bg-yellow-500/10'}`}>{content.status}</span>
                             </div>
                             <p className="text-sm text-gray-300 mb-3">{content.caption}</p>
                             {content.aiGenerated && (
                                 <div className="flex items-center gap-1 text-[10px] text-purple-400">
                                     <Sparkles size={10} /> Generated by AI
                                 </div>
                             )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SmartContentStudio;
