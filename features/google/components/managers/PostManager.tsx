
import React, { useState } from 'react';
import { GooglePost, ConnectedPlatform } from '../../types';
import { Plus, Trash2, Instagram, Facebook } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import PostCreator from '../editors/PostCreator';

interface PostManagerProps {
    posts: GooglePost[];
    platforms: ConnectedPlatform[];
    onCreate: (post: GooglePost, crossPostTargets: string[]) => void;
    onDelete: (id: string) => void;
    onGenerateAI: (topic: string) => Promise<string>;
    isAiLoading: boolean;
}

const PostManager: React.FC<PostManagerProps> = ({ 
    posts, platforms, onCreate, onDelete, onGenerateAI, isAiLoading 
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                             {post.crossPostedTo && post.crossPostedTo.length > 0 && (
                                 <div className="absolute bottom-2 left-2 flex gap-1">
                                     {post.crossPostedTo.includes('instagram') && <div className="p-1 bg-pink-600 rounded text-white"><Instagram size={10}/></div>}
                                     {post.crossPostedTo.includes('facebook') && <div className="p-1 bg-blue-600 rounded text-white"><Facebook size={10}/></div>}
                                 </div>
                             )}
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

             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Postingan">
                 <PostCreator 
                    platforms={platforms}
                    onCreate={onCreate}
                    onGenerateAI={onGenerateAI}
                    isAiLoading={isAiLoading}
                    onClose={() => setIsModalOpen(false)}
                 />
             </Modal>
        </div>
    );
};

export default PostManager;
