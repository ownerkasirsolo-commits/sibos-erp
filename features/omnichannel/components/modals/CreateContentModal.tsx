
import React, { useState, useEffect } from 'react';
import { OmniPost } from '../../types';
import Modal from '../../../../components/common/Modal';
import GlassInput from '../../../../components/common/GlassInput';
import { Image as ImageIcon, Send, Sparkles, MapPin, Instagram, Globe, Video, Smile, Hash, Calendar, Smartphone, X, Wand2 } from 'lucide-react';

interface CreateContentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (post: OmniPost) => void;
    onGenerateAI: (topic: string, tone: string, platform: string) => Promise<string>;
    isGenerating: boolean;
    initialData?: OmniPost | null;
}

const CreateContentModal: React.FC<CreateContentModalProps> = ({ 
    isOpen, onClose, onSave, onGenerateAI, isGenerating, initialData 
}) => {
    // Form State
    const [content, setContent] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram']);
    const [scheduleDate, setScheduleDate] = useState('');
    const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('published');
    
    // AI State
    const [aiTopic, setAiTopic] = useState('');
    const [aiTone, setAiTone] = useState('Fun & Casual');
    const [showAiPanel, setShowAiPanel] = useState(false);

    // Preview State
    const [previewPlatform, setPreviewPlatform] = useState('instagram');

    useEffect(() => {
        if (initialData) {
            setContent(initialData.content);
            setMediaUrl(initialData.image || '');
            setSelectedPlatforms(initialData.platforms);
            setStatus(initialData.status);
            setScheduleDate(initialData.date);
        } else {
            // Reset
            setContent('');
            setMediaUrl('');
            setSelectedPlatforms(['instagram']);
            setStatus('published');
            setScheduleDate(new Date().toISOString().split('T')[0]);
        }
    }, [initialData, isOpen]);

    const togglePlatform = (p: string) => {
        setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
        if (!selectedPlatforms.includes(p)) setPreviewPlatform(p); // Auto switch preview
    };

    const handleGenerate = async () => {
        if (!aiTopic) return;
        const res = await onGenerateAI(aiTopic, aiTone, previewPlatform);
        if (res) setContent(res);
        setShowAiPanel(false);
    };

    const handleSubmit = () => {
        const newPost: OmniPost = {
            id: initialData?.id || `POST-${Date.now()}`,
            title: aiTopic || 'New Post', // Fallback title
            content,
            type: 'promo', // Default
            status: scheduleDate && new Date(scheduleDate) > new Date() ? 'scheduled' : status,
            platforms: selectedPlatforms,
            date: scheduleDate || new Date().toISOString().split('T')[0],
            image: mediaUrl,
            aiGenerated: !!aiTopic
        };
        onSave(newPost);
    };

    // --- PREVIEW COMPONENTS ---
    const renderPreview = () => {
        const isIG = previewPlatform === 'instagram';
        const isGoogle = previewPlatform === 'google';
        
        return (
            <div className="w-[280px] h-[500px] bg-black rounded-[3rem] border-8 border-gray-800 relative overflow-hidden shadow-2xl mx-auto flex flex-col">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-gray-800 rounded-b-xl z-20"></div>
                
                {/* Screen Content */}
                <div className="flex-1 bg-white overflow-y-auto custom-scrollbar text-black pt-8">
                    {/* App Header */}
                    <div className={`px-4 py-2 border-b flex justify-between items-center ${isGoogle ? 'bg-white' : 'bg-white'}`}>
                        <span className="font-bold text-xs">{isIG ? 'Instagram' : (isGoogle ? 'Google Maps' : 'Website')}</span>
                        <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                    </div>

                    {/* Post Content */}
                    <div className={isGoogle ? "p-4" : ""}>
                        {/* User Info */}
                        <div className="flex items-center gap-2 px-4 py-2">
                            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">S</div>
                            <div>
                                <p className="text-xs font-bold">SIBOS Official</p>
                                {isGoogle && <p className="text-[9px] text-gray-500">Pemilik Bisnis</p>}
                            </div>
                        </div>

                        {/* Image */}
                        <div className={`bg-gray-200 w-full ${isIG ? 'aspect-square' : 'aspect-video rounded-xl'} overflow-hidden relative`}>
                            {mediaUrl ? (
                                <img src={mediaUrl} className="w-full h-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">No Media</div>
                            )}
                        </div>

                        {/* Actions (IG Style) */}
                        {isIG && (
                            <div className="px-4 py-2 flex gap-3">
                                <div className="w-5 h-5 rounded-full border border-black"></div>
                                <div className="w-5 h-5 rounded-full border border-black"></div>
                                <div className="w-5 h-5 rounded-full border border-black"></div>
                            </div>
                        )}

                        {/* Caption */}
                        <div className="px-4 pb-4">
                            {isIG && <p className="text-xs font-bold mb-1">1,240 likes</p>}
                            <p className="text-xs leading-relaxed whitespace-pre-wrap">
                                <span className="font-bold">sibos.id </span>
                                {content || <span className="text-gray-400 italic">Preview caption akan muncul di sini...</span>}
                            </p>
                            {isIG && <p className="text-[10px] text-gray-400 mt-1">View all 12 comments</p>}
                            {isGoogle && (
                                <button className="mt-3 w-full py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg">
                                    Learn more
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Content Studio" size="xl">
            <div className="flex flex-col lg:flex-row h-[600px] gap-6">
                
                {/* LEFT: EDITOR CONTROLS */}
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
                    
                    {/* Platform Selector */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Publish Ke</label>
                        <div className="flex gap-2">
                             {[
                                 { id: 'instagram', icon: Instagram }, 
                                 { id: 'google', icon: MapPin }, 
                                 { id: 'website', icon: Globe },
                                 { id: 'tiktok', icon: Video }
                             ].map(p => (
                                 <button 
                                    key={p.id}
                                    onClick={() => togglePlatform(p.id)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${selectedPlatforms.includes(p.id) ? 'bg-orange-600 text-white border-orange-500' : 'bg-white/5 border-transparent text-gray-500 hover:text-white'}`}
                                 >
                                     <p.icon size={16} /> <span className="capitalize">{p.id}</span>
                                 </button>
                             ))}
                        </div>
                    </div>

                    {/* AI Tools */}
                    <div className={`rounded-xl border transition-all overflow-hidden ${showAiPanel ? 'bg-purple-900/20 border-purple-500/50 p-4' : 'border-transparent'}`}>
                        {!showAiPanel ? (
                            <button onClick={() => setShowAiPanel(true)} className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg">
                                <Sparkles size={14} /> Tulis dengan AI Magic
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><Wand2 size={14} className="text-purple-400"/> AI Generator</h4>
                                    <button onClick={() => setShowAiPanel(false)}><X size={14} className="text-gray-400"/></button>
                                </div>
                                <GlassInput 
                                    placeholder="Topik postingan (cth: Promo Gajian)" 
                                    value={aiTopic} 
                                    onChange={e => setAiTopic(e.target.value)} 
                                    className="text-xs"
                                />
                                <div className="flex gap-2">
                                    {['Professional', 'Fun & Santai', 'Urgent/Promo'].map(t => (
                                        <button key={t} onClick={() => setAiTone(t)} className={`px-2 py-1 rounded text-[10px] border ${aiTone === t ? 'bg-purple-500 text-white border-purple-500' : 'text-gray-400 border-white/10'}`}>{t}</button>
                                    ))}
                                </div>
                                <button 
                                    onClick={handleGenerate} 
                                    disabled={isGenerating || !aiTopic}
                                    className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                                >
                                    {isGenerating ? <span className="animate-spin">⏳</span> : <Sparkles size={14}/>} Generate Caption
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Main Input */}
                    <div className="flex-1 space-y-3">
                        <textarea 
                            className="w-full h-32 glass-input rounded-xl p-4 text-sm resize-none text-white leading-relaxed"
                            placeholder="Tulis caption menarik di sini..."
                            value={content}
                            onChange={e => setContent(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <GlassInput 
                                placeholder="URL Gambar / Video..." 
                                value={mediaUrl} 
                                onChange={e => setMediaUrl(e.target.value)} 
                                icon={ImageIcon}
                                wrapperClassName="flex-1"
                                className="text-xs"
                            />
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="p-3 bg-white/5 rounded-xl flex items-center gap-3">
                        <Calendar size={18} className="text-gray-400" />
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block">Jadwal Tayang</label>
                            <input 
                                type="date" 
                                value={scheduleDate} 
                                onChange={e => setScheduleDate(e.target.value)} 
                                className="bg-transparent text-white text-sm outline-none w-full font-bold"
                            />
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button onClick={onClose} className="flex-1 py-3 border border-white/10 text-gray-400 font-bold rounded-xl hover:bg-white/5">Batal</button>
                        <button onClick={handleSubmit} className="flex-[2] py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 hover:brightness-110 transition-all">
                            <Send size={18} /> {scheduleDate && new Date(scheduleDate) > new Date() ? 'Jadwalkan' : 'Publish Sekarang'}
                        </button>
                    </div>

                </div>

                {/* RIGHT: LIVE PREVIEW */}
                <div className="w-[320px] shrink-0 hidden lg:flex flex-col items-center bg-[#1e293b] rounded-2xl p-4 border border-white/5">
                    <div className="mb-4 flex gap-2 p-1 bg-black/40 rounded-lg">
                        {selectedPlatforms.map(p => (
                            <button 
                                key={p}
                                onClick={() => setPreviewPlatform(p)}
                                className={`p-2 rounded-md transition-colors ${previewPlatform === p ? 'bg-white/20 text-white' : 'text-gray-500 hover:text-white'}`}
                                title={`Preview ${p}`}
                            >
                                {p === 'instagram' ? <Instagram size={14}/> : p === 'google' ? <MapPin size={14}/> : <Globe size={14}/>}
                            </button>
                        ))}
                    </div>
                    {renderPreview()}
                    <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-500">
                        <Smartphone size={12} /> Live Preview
                    </div>
                </div>

            </div>
        </Modal>
    );
};

export default CreateContentModal;
