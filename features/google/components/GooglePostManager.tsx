
import React, { useState } from 'react';
import { GooglePost } from '../types';
import { Plus, Trash2, Image as ImageIcon, Calendar, Sparkles, Send } from 'lucide-react';
import GlassPanel from '../../../components/common/GlassPanel';
import GlassInput from '../../../components/common/GlassInput';
import Modal from '../../../components/common/Modal';

interface GooglePostManagerProps {
    posts: GooglePost[];
    onCreate: (post: GooglePost) => void;
    onDelete: (id: string) => void;
    onGenerateAI: (topic: string) => Promise<string>;
    isAiLoading: boolean;
}

const GooglePostManager: React.FC<GooglePostManagerProps> = ({ posts, onCreate, onDelete, onGenerateAI, isAiLoading }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [postType, setPostType] = useState<'UPDATE' | 'OFFER' | 'EVENT'>('UPDATE');
    const [summary, setSummary] = useState('');
    const [aiTopic, setAiTopic] = useState('');
    
    const handleGenerate = async () => {
        if(!aiTopic) return;
        const result = await onGenerateAI(aiTopic);
        if(result) setSummary(result);
    };

    const handleSubmit = () => {
        const newPost: GooglePost = {
            id: `post-${Date.now()}`,
            type: postType,
            summary: summary,
            status: 'LIVE',
            views: 0,
            clicks: 0,
            publishDate: new Date().toISOString().split('T')[0],
            mediaUrl: 'https://via.placeholder.com/500x300' // Mock image
        };
        onCreate(newPost);
        setIsModalOpen(false);
        setSummary('');
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
             <div className="flex justify-between items-center">
                 <h3 className="text-xl font-bold text-white">Postingan & Update</h3>
                 <button onClick={() => setIsModalOpen(true)} className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg">
                     <Plus size={18} /> Buat Postingan
                 </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {posts.map(post => (
                     <div key={post.id} className="glass-panel p-0 rounded-2xl overflow-hidden group">
                         <div className="h-40 bg-gray-800 relative">
                             {post.mediaUrl && <img src={post.mediaUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"/>}
                             <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold text-white uppercase backdrop-blur-md border border-white/10">
                                 {post.type}
                             </div>
                         </div>
                         <div className="p-4">
                             <p className="text-sm text-gray-300 line-clamp-3 mb-4">{post.summary}</p>
                             <div className="flex justify-between items-center text-xs text-gray-500 border-t border-white/10 pt-3">
                                 <span>{post.views} Views • {post.clicks} Clicks</span>
                                 <button onClick={() => onDelete(post.id)} className="text-red-400 hover:text-red-300">
                                     <Trash2 size={16} />
                                 </button>
                             </div>
                         </div>
                     </div>
                 ))}
             </div>

             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Postingan Google">
                 <div className="space-y-4">
                     <div className="flex gap-2 p-1 bg-black/40 rounded-xl">
                         {(['UPDATE', 'OFFER', 'EVENT'] as const).map(t => (
                             <button 
                                key={t} 
                                onClick={() => setPostType(t)}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${postType === t ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}
                             >
                                 {t}
                             </button>
                         ))}
                     </div>
                     
                     <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                         <div className="flex gap-2 mb-2">
                             <GlassInput 
                                placeholder="Topik (misal: Promo Akhir Tahun)..." 
                                value={aiTopic}
                                onChange={e => setAiTopic(e.target.value)}
                                className="text-sm"
                             />
                             <button onClick={handleGenerate} disabled={isAiLoading || !aiTopic} className="bg-purple-600 hover:bg-purple-500 text-white px-3 rounded-xl disabled:opacity-50">
                                 <Sparkles size={18} className={isAiLoading ? "animate-spin" : ""} />
                             </button>
                         </div>
                         <p className="text-[10px] text-purple-300">Gunakan AI untuk membuat caption menarik dalam sekejap.</p>
                     </div>

                     <div>
                         <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Konten Postingan</label>
                         <textarea 
                            className="w-full glass-input rounded-xl p-3 text-sm h-32 resize-none text-white"
                            placeholder="Tulis update terbaru bisnis Anda..."
                            value={summary}
                            onChange={e => setSummary(e.target.value)}
                         />
                     </div>

                     <div className="flex gap-2">
                         <button className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/10">
                             <ImageIcon size={16} /> Foto
                         </button>
                         {postType === 'OFFER' && (
                             <button className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/10">
                                 <Calendar size={16} /> Durasi
                             </button>
                         )}
                     </div>

                     <button onClick={handleSubmit} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 mt-2">
                         <Send size={16} /> Publish ke Google
                     </button>
                 </div>
             </Modal>
        </div>
    );
};

export default GooglePostManager;
