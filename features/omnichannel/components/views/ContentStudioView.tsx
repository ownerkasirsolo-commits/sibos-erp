
import React from 'react';
import { PenTool, Plus, Calendar, CheckCircle2, Clock, FileEdit, Sparkles } from 'lucide-react';
import GlassPanel from '../../../../components/common/GlassPanel';
import CreateContentModal from '../modals/CreateContentModal';
import { useContentStudioLogic } from '../../hooks/useContentStudioLogic';

// Props removed as data is fetched internally via hook
interface ContentStudioViewProps {}

const ContentStudioView: React.FC<ContentStudioViewProps> = () => {
    const {
        filterStatus, setFilterStatus,
        filteredPosts,
        isEditorOpen, setIsEditorOpen,
        isGenerating,
        generateCaption,
        generateIdeas,
        handleSavePost,
        handleCreateNew,
        handleEdit,
        editingPost
    } = useContentStudioLogic();

    const handleQuickIdea = async () => {
        const idea = await generateIdeas();
        if(idea) alert("Ide Konten:\n" + idea);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
             {/* HEADER */}
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-6 rounded-3xl border border-white/5">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <PenTool className="text-pink-500" /> Content Studio
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">Kelola konten sosial media, website, dan Google updates dari satu tempat.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleQuickIdea}
                        disabled={isGenerating}
                        className="bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/40 px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold transition-all"
                    >
                        <Sparkles size={16} /> {isGenerating ? 'Mencari Ide...' : 'Ide Konten AI'}
                    </button>
                    <button 
                        onClick={handleCreateNew}
                        className="bg-pink-600 hover:bg-pink-500 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg transition-all"
                    >
                        <Plus size={18} /> Buat Konten
                    </button>
                </div>
            </div>

            {/* TABS */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {[
                    { id: 'all', label: 'Semua', icon: FileEdit },
                    { id: 'published', label: 'Tayang', icon: CheckCircle2 },
                    { id: 'scheduled', label: 'Terjadwal', icon: Calendar },
                    { id: 'draft', label: 'Draft', icon: Clock },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFilterStatus(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${filterStatus === tab.id ? 'bg-white/10 text-white border-white/20' : 'bg-transparent border-transparent text-gray-500 hover:text-white'}`}
                    >
                        <tab.icon size={14} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* CONTENT GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-500 border-2 border-dashed border-white/5 rounded-3xl">
                        <p>Belum ada konten di sini.</p>
                        <button onClick={handleCreateNew} className="text-pink-500 font-bold mt-2 hover:underline">Buat Baru</button>
                    </div>
                ) : (
                    filteredPosts.map(post => (
                        <GlassPanel 
                            key={post.id} 
                            onClick={() => handleEdit(post)}
                            className="p-0 rounded-2xl overflow-hidden flex flex-col h-full border border-white/5 group hover:border-pink-500/30 transition-all cursor-pointer"
                        >
                            {/* Image / Thumbnail */}
                            <div className="h-48 bg-gray-800 relative overflow-hidden">
                                 {post.image ? (
                                     <img src={post.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                 ) : (
                                     <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 bg-gradient-to-br from-gray-800 to-black">
                                         <PenTool size={32} className="opacity-50 mb-2"/>
                                         <span className="text-[10px] uppercase font-bold tracking-widest">Text Only</span>
                                     </div>
                                 )}
                                 
                                 {/* Platform Badges */}
                                 <div className="absolute top-2 right-2 flex flex-col gap-1">
                                     {post.platforms.map(p => (
                                         <span key={p} className="bg-black/60 backdrop-blur-md text-white text-[9px] px-2 py-0.5 rounded capitalize border border-white/10">
                                             {p}
                                         </span>
                                     ))}
                                 </div>

                                 {/* Status Badge */}
                                 <div className={`absolute bottom-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase backdrop-blur-md ${
                                     post.status === 'Published' ? 'bg-green-500/80 text-white' : 
                                     post.status === 'Scheduled' ? 'bg-blue-500/80 text-white' : 
                                     'bg-gray-500/80 text-white'
                                 }`}>
                                     {post.status}
                                 </div>
                            </div>
                            
                            {/* Content Body */}
                            <div className="p-5 flex-1 flex flex-col">
                                <h4 className="font-bold text-white mb-2 line-clamp-1">{post.title || 'Tanpa Judul'}</h4>
                                <p className="text-xs text-gray-400 line-clamp-3 mb-4 flex-1 leading-relaxed">
                                    {post.content}
                                </p>
                                
                                <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-auto">
                                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                        <Calendar size={12}/> {new Date(post.date).toLocaleDateString()}
                                    </span>
                                    {post.aiGenerated && (
                                        <span className="text-[10px] text-purple-400 flex items-center gap-1" title="Dibuat dengan AI">
                                            <Sparkles size={10} /> AI Magic
                                        </span>
                                    )}
                                </div>
                            </div>
                        </GlassPanel>
                    ))
                )}
            </div>

            {/* MODAL EDITOR */}
            <CreateContentModal 
                isOpen={isEditorOpen} 
                onClose={() => setIsEditorOpen(false)} 
                onSave={handleSavePost}
                onGenerateAI={generateCaption}
                isGenerating={isGenerating}
                initialData={editingPost}
            />
        </div>
    );
};

export default ContentStudioView;
