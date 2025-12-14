
import React, { useState, useEffect } from 'react';
import { MarketingPlatform, MarketingPost } from '../types';
import Modal from '../../../components/common/Modal';
import GlassInput from '../../../components/common/GlassInput';
import { Sparkles, Image as ImageIcon, Send, Globe, Instagram, Facebook, MapPin, CheckCircle2, Search, BarChart3, AlertCircle, MessageCircle, Video, Youtube, Linkedin } from 'lucide-react';

interface PostCreatorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPublish: (post: MarketingPost) => Promise<boolean>;
    onGenerateAI: (topic: string, tone: string) => Promise<string>;
    isGenerating: boolean;
    // New Props for SEO hook
    onAnalyzeSeo?: (title: string, content: string, keyword: string) => number;
    onGetKeywords?: (topic: string) => Promise<string[]>;
}

const PostCreatorModal: React.FC<PostCreatorModalProps> = ({ 
    isOpen, onClose, onPublish, onGenerateAI, isGenerating, 
    onAnalyzeSeo, onGetKeywords 
}) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [selectedPlatforms, setSelectedPlatforms] = useState<MarketingPlatform[]>(['instagram', 'google']);
    const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');
    
    // AI State
    const [aiTopic, setAiTopic] = useState('');
    const [aiTone, setAiTone] = useState('Fun & Viral');

    // SEO State
    const [focusKeyword, setFocusKeyword] = useState('');
    const [seoTitle, setSeoTitle] = useState('');
    const [metaDesc, setMetaDesc] = useState('');
    const [seoScore, setSeoScore] = useState(0);
    const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);

    // Realtime SEO Analysis
    useEffect(() => {
        if (onAnalyzeSeo) {
            const score = onAnalyzeSeo(title, content, focusKeyword);
            setSeoScore(score);
        }
        // Auto-fill SEO fields if empty
        if (!seoTitle && title) setSeoTitle(title);
        if (!metaDesc && content) setMetaDesc(content.substring(0, 150));
    }, [title, content, focusKeyword, onAnalyzeSeo]);

    const togglePlatform = (p: MarketingPlatform) => {
        setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
    };

    const handleGenerateContent = async () => {
        if (!aiTopic) return;
        const res = await onGenerateAI(aiTopic, aiTone);
        if (res) {
            setContent(res);
            if (!title) setTitle(aiTopic);
            // Auto switch to SEO tab if Website is selected
            if (selectedPlatforms.includes('website')) setActiveTab('seo');
        }
    };

    const handleResearchKeywords = async () => {
        if (!aiTopic && !title) return alert("Isi topik atau judul dulu!");
        if (onGetKeywords) {
            const keywords = await onGetKeywords(aiTopic || title);
            setSuggestedKeywords(keywords);
        }
    };

    const handleSubmit = async () => {
        if (!content) return alert("Konten tidak boleh kosong!");
        
        const newPost: MarketingPost = {
            id: `POST-${Date.now()}`,
            title: title || 'Update Baru',
            content,
            image: mediaUrl,
            platforms: selectedPlatforms,
            status: 'Published',
            date: new Date().toISOString(),
            type: 'promo', // Default to promo for marketing dashboard creator
            aiGenerated: !!aiTopic,
            seo: {
                focusKeyword,
                seoTitle: seoTitle || title,
                metaDescription: metaDesc || content.substring(0, 150),
                score: seoScore
            }
        };

        await onPublish(newPost);
        alert(`Konten berhasil disebar! SEO Score: ${seoScore}/100`);
        onClose();
        // Reset
        setTitle(''); setContent(''); setMediaUrl(''); setAiTopic(''); setFocusKeyword('');
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500 border-green-500';
        if (score >= 50) return 'text-yellow-500 border-yellow-500';
        return 'text-red-500 border-red-500';
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Buat Konten Baru" size="lg">
            <div className="flex flex-col h-[600px] lg:h-auto">
                
                {/* Platform Selector (Sticky Top) */}
                <div className="mb-4 bg-black/20 p-2 rounded-xl">
                     <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block ml-1">Target Platform</label>
                     <div className="flex gap-2 flex-wrap">
                         <button onClick={() => togglePlatform('google')} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedPlatforms.includes('google') ? 'bg-blue-600 text-white border-blue-500' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                             <MapPin size={12}/> Google
                         </button>
                         <button onClick={() => togglePlatform('website')} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedPlatforms.includes('website') ? 'bg-orange-600 text-white border-orange-500' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                             <Globe size={12}/> Website
                         </button>
                         <button onClick={() => togglePlatform('instagram')} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedPlatforms.includes('instagram') ? 'bg-pink-600 text-white border-pink-500' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                             <Instagram size={12}/> Instagram
                         </button>
                         <button onClick={() => togglePlatform('facebook')} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedPlatforms.includes('facebook') ? 'bg-blue-800 text-white border-blue-700' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                             <Facebook size={12}/> Facebook
                         </button>
                         
                         {/* NEW PLATFORMS */}
                         <button onClick={() => togglePlatform('whatsapp')} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedPlatforms.includes('whatsapp') ? 'bg-green-600 text-white border-green-500' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                             <MessageCircle size={12}/> WhatsApp
                         </button>
                         <button onClick={() => togglePlatform('tiktok')} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedPlatforms.includes('tiktok') ? 'bg-black text-white border-gray-600' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                             <Video size={12}/> TikTok
                         </button>
                         <button onClick={() => togglePlatform('youtube')} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedPlatforms.includes('youtube') ? 'bg-red-600 text-white border-red-500' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                             <Youtube size={12}/> YouTube
                         </button>
                         <button onClick={() => togglePlatform('linkedin')} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedPlatforms.includes('linkedin') ? 'bg-blue-700 text-white border-blue-600' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                             <Linkedin size={12}/> LinkedIn
                         </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    
                    {/* LEFT: EDITOR */}
                    <div className="space-y-4">
                        
                        {/* Tab Switcher */}
                        <div className="flex bg-white/5 p-1 rounded-lg">
                            <button onClick={() => setActiveTab('content')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'content' ? 'bg-white/10 text-white shadow' : 'text-gray-400'}`}>Isi Konten</button>
                            <button onClick={() => setActiveTab('seo')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === 'seo' ? 'bg-blue-600/20 text-blue-400 shadow' : 'text-gray-400'}`}>
                                <Search size={12}/> Optimasi SEO
                            </button>
                        </div>

                        {activeTab === 'content' ? (
                            <div className="space-y-3 animate-in fade-in slide-in-from-left-4">
                                {/* AI Tools */}
                                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-2">
                                    <div className="flex justify-between items-center">
                                         <h4 className="text-xs font-bold text-purple-300 flex items-center gap-1"><Sparkles size={12}/> AI Magic Writer</h4>
                                    </div>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="Topik (misal: Promo Gajian)" 
                                            className="flex-1 bg-black/20 rounded-lg px-3 py-1.5 text-xs text-white outline-none border border-white/10 focus:border-purple-500"
                                            value={aiTopic}
                                            onChange={e => setAiTopic(e.target.value)}
                                        />
                                        <button onClick={handleGenerateContent} disabled={isGenerating || !aiTopic} className="bg-purple-600 hover:bg-purple-500 text-white px-3 rounded-lg text-xs font-bold disabled:opacity-50">
                                            {isGenerating ? '...' : 'Buat'}
                                        </button>
                                    </div>
                                </div>

                                <GlassInput placeholder="Judul / Headline" value={title} onChange={e => setTitle(e.target.value)} className="font-bold"/>
                                <textarea 
                                    className="w-full glass-input rounded-xl p-3 text-sm h-40 resize-none text-white leading-relaxed"
                                    placeholder="Tulis caption atau isi konten di sini..."
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                />
                                <GlassInput 
                                    icon={ImageIcon}
                                    placeholder="URL Gambar / Video..." 
                                    value={mediaUrl} 
                                    onChange={e => setMediaUrl(e.target.value)}
                                    className="text-xs"
                                />
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                {/* SEO Score Card */}
                                <div className="p-4 rounded-xl bg-black/20 border border-white/10 flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-black text-lg bg-black/40 ${getScoreColor(seoScore)}`}>
                                        {seoScore}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-white text-sm">Skor SEO</h4>
                                        <div className="flex gap-1 mt-1 text-[10px] text-gray-400">
                                            {seoScore < 50 ? 'Kurang Optimal' : (seoScore < 80 ? 'Cukup Baik' : 'Sangat Baik')}
                                        </div>
                                    </div>
                                </div>

                                {/* Keyword Research */}
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Fokus Kata Kunci (Keyword)</label>
                                    <div className="flex gap-2 mb-2">
                                        <GlassInput 
                                            value={focusKeyword} 
                                            onChange={e => setFocusKeyword(e.target.value)} 
                                            placeholder="cth: kopi enak jakarta"
                                            className="py-1.5 text-xs"
                                            wrapperClassName="flex-1"
                                        />
                                        <button 
                                            onClick={handleResearchKeywords}
                                            disabled={isGenerating}
                                            className="bg-white/10 hover:bg-white/20 text-gray-300 px-3 rounded-lg text-xs font-bold border border-white/10"
                                        >
                                            <Sparkles size={14} className={isGenerating ? "animate-spin" : ""} />
                                        </button>
                                    </div>
                                    {suggestedKeywords.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {suggestedKeywords.map(k => (
                                                <button key={k} onClick={() => setFocusKeyword(k)} className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] border border-blue-500/20 hover:bg-blue-500/30">
                                                    {k}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Meta Editor */}
                                <div className="space-y-3 pt-2 border-t border-white/10">
                                    <h5 className="text-xs font-bold text-white flex items-center gap-2"><Globe size={12}/> Tampilan di Google</h5>
                                    <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                                        <p className="text-xs text-[#202124] mb-0.5 truncate">sibos.id › blog › {title.toLowerCase().replace(/ /g, '-')}</p>
                                        <h3 className="text-[#1a0dab] text-sm font-medium hover:underline truncate cursor-pointer">{seoTitle || title || 'Judul Halaman Anda'}</h3>
                                        <p className="text-xs text-[#4d5156] line-clamp-2">{metaDesc || content.substring(0, 150) || 'Deskripsi halaman akan muncul di sini...'}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <input 
                                            type="text" 
                                            placeholder="SEO Title (Custom)"
                                            className="w-full bg-black/20 rounded-lg px-3 py-2 text-xs text-white border border-white/10 focus:border-blue-500 outline-none"
                                            value={seoTitle}
                                            onChange={e => setSeoTitle(e.target.value)}
                                        />
                                        <textarea 
                                            placeholder="Meta Description (Custom)"
                                            className="w-full bg-black/20 rounded-lg px-3 py-2 text-xs text-white border border-white/10 focus:border-blue-500 outline-none resize-none h-20"
                                            value={metaDesc}
                                            onChange={e => setMetaDesc(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: PREVIEW & CHECKLIST */}
                    <div className="bg-black/40 rounded-2xl border border-white/5 p-4 flex flex-col">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-4 text-center">Live Preview</h4>
                        
                        <div className="flex-1 bg-white text-black rounded-xl overflow-hidden shadow-lg mx-auto w-64 flex flex-col mb-4">
                            {/* Instagram Style Preview */}
                            <div className="px-3 py-2 border-b flex items-center gap-2">
                                <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                                <span className="text-xs font-bold">sibos.official</span>
                            </div>
                            <div className="bg-gray-200 aspect-square w-full flex items-center justify-center overflow-hidden relative">
                                {mediaUrl ? <img src={mediaUrl} className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-400 opacity-50" size={32} />}
                            </div>
                            <div className="p-3 text-xs leading-snug">
                                <span className="font-bold mr-1">sibos.official</span>
                                <span className="whitespace-pre-wrap">{content || 'Preview caption...'}</span>
                            </div>
                        </div>

                        {/* SEO Checklist (Only show if Keyword is set) */}
                        {focusKeyword && (
                            <div className="bg-black/20 p-3 rounded-xl mb-4">
                                <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase">SEO Checklist</p>
                                <ul className="space-y-1 text-xs">
                                    <li className={`flex items-center gap-2 ${title.toLowerCase().includes(focusKeyword.toLowerCase()) ? 'text-green-400' : 'text-gray-500'}`}>
                                        <CheckCircle2 size={12} /> Keyword di Judul
                                    </li>
                                    <li className={`flex items-center gap-2 ${content.toLowerCase().includes(focusKeyword.toLowerCase()) ? 'text-green-400' : 'text-gray-500'}`}>
                                        <CheckCircle2 size={12} /> Keyword di Konten
                                    </li>
                                    <li className={`flex items-center gap-2 ${content.split(' ').length > 50 ? 'text-green-400' : 'text-gray-500'}`}>
                                        <CheckCircle2 size={12} /> Panjang Konten (&gt;50 kata)
                                    </li>
                                </ul>
                            </div>
                        )}

                        <button 
                            onClick={handleSubmit}
                            className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 mt-auto"
                        >
                            <Send size={16} /> Publish Sekarang
                        </button>
                    </div>

                </div>

            </div>
        </Modal>
    );
};

export default PostCreatorModal;
