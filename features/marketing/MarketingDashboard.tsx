
import React, { useState } from 'react';
import { Megaphone, Globe, Instagram, Facebook, Video, Search, Filter, Plus, Calendar, BarChart2, Lock, Youtube, MessageCircle, Linkedin, MapPin as MapPinIcon } from 'lucide-react';
import { useContentLogic } from './hooks/useContentLogic';
import GlassInput from '../../components/common/GlassInput';
import GlassPanel from '../../components/common/GlassPanel';
import StatWidget from '../../components/common/StatWidget';
import PostCreatorModal from './components/PostCreatorModal';

const MarketingDashboard: React.FC = () => {
    const { posts, isGenerating, generateCaption, publishPost, generateSeoKeywords, analyzeSeoScore } = useContentLogic();
    const [isCreatorOpen, setIsCreatorOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const activePlatforms = [
        { id: 'website', name: 'Website Usaha', icon: Globe, color: 'text-orange-400', status: 'Connected' },
        { id: 'google', name: 'Google Business', icon: MapPinIcon, color: 'text-blue-400', status: 'Connected' },
        { id: 'whatsapp', name: 'WhatsApp Status', icon: MessageCircle, color: 'text-green-500', status: 'Connected' },
        { id: 'instagram', name: 'Instagram Feed/Story', icon: Instagram, color: 'text-pink-400', status: 'Connected' },
        { id: 'tiktok', name: 'TikTok', icon: Video, color: 'text-gray-400', status: 'Connected' },
        { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-600', status: 'Coming Soon' },
        { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700', status: 'Coming Soon' },
    ];

    const filteredPosts = posts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            
            {/* 1. HEADER & STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatWidget label="Total Postingan" value={posts.length} icon={Megaphone} colorClass="text-orange-400" />
                <StatWidget label="Jangkauan (Est)" value="12.5K" icon={Globe} colorClass="text-blue-400" />
                <StatWidget label="Interaksi" value="840" icon={BarChart2} colorClass="text-green-400" />
                
                <button 
                    onClick={() => setIsCreatorOpen(true)}
                    className="p-4 rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold shadow-lg flex flex-col items-center justify-center gap-1 hover:brightness-110 transition-all group"
                >
                    <Plus size={24} className="group-hover:scale-110 transition-transform" />
                    <span className="text-sm">Buat Konten Baru</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT: CONTENT LIST (8/12) */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                        <h3 className="font-bold text-white">Riwayat Konten</h3>
                        <div className="flex gap-2">
                             <GlassInput 
                                icon={Search} 
                                placeholder="Cari konten..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="py-1.5 text-xs w-48"
                             />
                        </div>
                    </div>

                    <div className="space-y-3">
                        {filteredPosts.map(post => (
                            <GlassPanel key={post.id} className="p-4 rounded-2xl flex gap-4 hover:border-white/20 transition-colors cursor-pointer group">
                                <div className="w-20 h-20 bg-gray-800 rounded-xl overflow-hidden shrink-0">
                                    <img src={post.image || 'https://via.placeholder.com/100'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={post.title} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-white text-base truncate">{post.title}</h4>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${post.status === 'Published' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-white/10 text-gray-400 border-white/10'}`}>
                                            {post.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{post.content}</p>
                                    
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex gap-1 items-center">
                                            {post.platforms.map(p => (
                                                <div key={p} className="p-1 bg-white/10 rounded text-gray-300" title={p}>
                                                    {p === 'google' ? <MapPinIcon size={10}/> : 
                                                     p === 'instagram' ? <Instagram size={10}/> : 
                                                     p === 'whatsapp' ? <MessageCircle size={10}/> :
                                                     p === 'tiktok' ? <Video size={10}/> :
                                                     p === 'youtube' ? <Youtube size={10}/> :
                                                     p === 'linkedin' ? <Linkedin size={10}/> :
                                                     <Globe size={10}/>}
                                                </div>
                                            ))}
                                            <span className="text-[10px] text-gray-500 ml-2">
                                                <Calendar size={10} className="inline mr-1"/> {new Date(post.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {post.seo && post.seo.score > 0 && (
                                            <div className={`text-[10px] font-bold px-2 py-0.5 rounded border ${post.seo.score >= 80 ? 'text-green-400 border-green-500/30' : 'text-yellow-400 border-yellow-500/30'}`}>
                                                SEO Score: {post.seo.score}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </GlassPanel>
                        ))}
                    </div>
                </div>

                {/* RIGHT: CONNECTED PLATFORMS (4/12) */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <h3 className="font-bold text-white mb-1">Target Publikasi</h3>
                        <p className="text-xs text-gray-400 mb-4">Kanal yang siap menerima postingan konten.</p>
                        <div className="space-y-3">
                            {activePlatforms.map(p => (
                                <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl border ${p.status === 'Connected' ? 'bg-white/5 border-white/5' : 'bg-black/20 border-transparent opacity-60'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-black/30 ${p.color}`}>
                                            <p.icon size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">{p.name}</p>
                                            <p className="text-[10px] text-gray-500">{p.status}</p>
                                        </div>
                                    </div>
                                    {p.status === 'Coming Soon' && <Lock size={14} className="text-gray-500"/>}
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-200 leading-relaxed">
                        <p className="font-bold mb-1">Pro Tip:</p>
                        Gunakan fitur <b>SEO Optimizer</b> saat membuat konten untuk meningkatkan visibilitas di Google Search.
                    </div>
                </div>
            </div>

            <PostCreatorModal 
                isOpen={isCreatorOpen}
                onClose={() => setIsCreatorOpen(false)}
                onPublish={publishPost}
                onGenerateAI={generateCaption}
                isGenerating={isGenerating}
                onAnalyzeSeo={analyzeSeoScore}
                onGetKeywords={generateSeoKeywords}
            />
        </div>
    );
};

export default MarketingDashboard;
