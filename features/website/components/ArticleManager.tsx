
import React, { useState, useEffect } from 'react';
import { BlogPost, WebsiteConfig } from '../types';
import { Plus, Edit3, Trash2, ArrowLeft, Image as ImageIcon, Save, CheckCircle2, Globe, Search, Sparkles, Lightbulb, Copy } from 'lucide-react';
import GlassPanel from '../../../components/common/GlassPanel';
import GlassInput from '../../../components/common/GlassInput';

interface ArticleManagerProps {
    articles: BlogPost[];
    onAdd: (post: BlogPost) => void;
    onUpdate: (post: BlogPost) => void;
    onDelete: (id: string) => void;
    websiteConfig: WebsiteConfig;
    onResearch: (type: 'keywords' | 'ideas', topic?: string) => void;
    aiResults: string[];
    isGenerating: boolean;
}

const ArticleManager: React.FC<ArticleManagerProps> = ({ 
    articles, onAdd, onUpdate, onDelete, websiteConfig,
    onResearch, aiResults, isGenerating
}) => {
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [showResearch, setShowResearch] = useState(false);
    const [researchTopic, setResearchTopic] = useState('');

    // Form State
    const [formData, setFormData] = useState<BlogPost>({
        id: '',
        title: '',
        slug: '',
        image: '',
        excerpt: '',
        content: '',
        status: 'Draft',
        date: new Date().toISOString().split('T')[0],
        seoTitle: '',
        seoDescription: ''
    });

    // Helper to generate slug from title
    const generateSlug = (text: string) => {
        return text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    };

    const handleNewPost = () => {
        const newId = `POST-${Date.now()}`;
        setFormData({
            id: newId,
            title: '',
            slug: '',
            image: '',
            excerpt: '',
            content: '',
            status: 'Draft',
            date: new Date().toISOString().split('T')[0],
            seoTitle: '',
            seoDescription: ''
        });
        setEditingPost(null);
        setView('editor');
    };

    const handleEditPost = (post: BlogPost) => {
        setFormData(post);
        setEditingPost(post);
        setView('editor');
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setFormData(prev => ({
            ...prev,
            title: val,
            slug: !editingPost ? generateSlug(val) : prev.slug, // Auto slug only on new post
            seoTitle: !editingPost ? val : prev.seoTitle // Auto SEO title on new
        }));
    };

    const handleSave = () => {
        if (!formData.title) return alert("Judul wajib diisi");
        
        if (editingPost) {
            onUpdate(formData);
        } else {
            onAdd(formData);
        }
        setView('list');
    };

    const useIdea = (text: string) => {
        if (view === 'editor') {
            setFormData(prev => ({
                ...prev,
                title: text,
                slug: generateSlug(text),
                seoTitle: text
            }));
            alert("Judul diterapkan!");
        } else {
             navigator.clipboard.writeText(text);
             alert("Teks disalin!");
        }
    };

    if (view === 'list') {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-white text-sm">Daftar Artikel</h3>
                    <button onClick={handleNewPost} className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors">
                        <Plus size={14} /> Tulis Baru
                    </button>
                </div>
                
                <div className="space-y-3">
                    {articles.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 border border-dashed border-white/10 rounded-xl bg-white/5">
                            <p className="text-xs">Belum ada artikel.</p>
                        </div>
                    ) : (
                        articles.map(post => (
                            <div key={post.id} className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-orange-500/30 transition-all group">
                                <div className="flex gap-3">
                                    <div className="w-16 h-16 bg-gray-800 rounded-lg shrink-0 overflow-hidden">
                                        {post.image ? (
                                            <img src={post.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-600"><ImageIcon size={16}/></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-white text-sm truncate">{post.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${post.status === 'Published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                {post.status}
                                            </span>
                                            <span className="text-[10px] text-gray-500">{post.date}</span>
                                        </div>
                                        <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEditPost(post)} className="text-xs text-blue-400 hover:text-white flex items-center gap-1"><Edit3 size={12}/> Edit</button>
                                            <button onClick={() => onDelete(post.id)} className="text-xs text-red-400 hover:text-white flex items-center gap-1"><Trash2 size={12}/> Hapus</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center justify-between">
                <button onClick={() => setView('list')} className="text-gray-400 hover:text-white flex items-center gap-1 text-xs font-bold">
                    <ArrowLeft size={14} /> Kembali
                </button>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setShowResearch(!showResearch)}
                        className={`p-2 rounded-lg text-xs font-bold transition-all ${showResearch ? 'bg-purple-600 text-white' : 'bg-white/5 text-purple-400 border border-purple-500/30'}`}
                    >
                        <Sparkles size={16} />
                    </button>
                    <select 
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                        className="bg-black/30 text-white text-xs font-bold px-2 py-1.5 rounded-lg border border-white/10 outline-none"
                    >
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                    </select>
                    <button onClick={handleSave} className="bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                        <Save size={14} /> Simpan
                    </button>
                </div>
            </div>

            {/* AI RESEARCH PANEL */}
            {showResearch && (
                <GlassPanel className="p-4 rounded-xl border border-purple-500/30 bg-purple-900/10 animate-in slide-in-from-top-4">
                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <Sparkles size={16} className="text-purple-400"/> AI Research Studio
                    </h4>
                    <div className="flex gap-2 mb-3">
                        <GlassInput 
                            value={researchTopic}
                            onChange={e => setResearchTopic(e.target.value)}
                            placeholder="Topik (misal: kopi, tips bisnis)..."
                            className="py-1.5 text-xs"
                        />
                    </div>
                    <div className="flex gap-2 mb-4">
                         <button 
                            onClick={() => onResearch('keywords', researchTopic)}
                            disabled={isGenerating}
                            className="flex-1 py-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 rounded-lg text-xs font-bold border border-purple-500/30"
                        >
                            Cari Keywords
                        </button>
                        <button 
                            onClick={() => onResearch('ideas', researchTopic)}
                            disabled={isGenerating}
                            className="flex-1 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 rounded-lg text-xs font-bold border border-blue-500/30"
                        >
                            Ide Judul
                        </button>
                    </div>

                    {isGenerating ? (
                        <div className="text-center py-4 text-xs text-gray-400 animate-pulse">Sedang berpikir...</div>
                    ) : (
                        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                            {aiResults.map((res, i) => (
                                <div key={i} className="flex justify-between items-center p-2 bg-black/20 rounded-lg hover:bg-black/40 group">
                                    <span className="text-xs text-gray-300">{res}</span>
                                    <button 
                                        onClick={() => useIdea(res)} 
                                        className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Gunakan"
                                    >
                                        <Copy size={12} />
                                    </button>
                                </div>
                            ))}
                            {aiResults.length === 0 && <p className="text-center text-[10px] text-gray-500 italic">Hasil akan muncul di sini.</p>}
                        </div>
                    )}
                </GlassPanel>
            )}

            <div className="space-y-4">
                {/* Main Content */}
                <GlassPanel className="p-4 rounded-xl border border-white/5">
                    <div className="space-y-3">
                        <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Judul Artikel</label>
                            <GlassInput 
                                value={formData.title} 
                                onChange={handleTitleChange}
                                placeholder="Masukkan judul menarik..."
                                className="font-bold"
                            />
                        </div>
                        <div>
                             <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">URL Gambar (Cover)</label>
                             <GlassInput 
                                value={formData.image} 
                                onChange={(e) => setFormData({...formData, image: e.target.value})}
                                placeholder="https://..."
                                className="text-xs"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Ringkasan (Excerpt)</label>
                            <textarea 
                                className="w-full glass-input rounded-xl p-3 text-xs h-20 resize-none text-white"
                                value={formData.excerpt}
                                onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                                placeholder="Ringkasan singkat untuk tampilan kartu..."
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Konten Artikel</label>
                            <textarea 
                                className="w-full glass-input rounded-xl p-3 text-sm h-40 resize-none text-white font-serif leading-relaxed"
                                value={formData.content}
                                onChange={(e) => setFormData({...formData, content: e.target.value})}
                                placeholder="Tulis artikel lengkap di sini..."
                            />
                        </div>
                    </div>
                </GlassPanel>

                {/* SEO Optimization Box */}
                <GlassPanel className="p-4 rounded-xl border border-blue-500/20 bg-blue-900/5">
                    <h4 className="text-xs font-bold text-blue-400 uppercase mb-4 flex items-center gap-2">
                        <Search size={14} /> Optimasi SEO (Google Preview)
                    </h4>
                    
                    {/* Google Search Preview */}
                    <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                                {websiteConfig.logo ? <img src={websiteConfig.logo} className="w-full h-full object-cover"/> : <Globe size={14} className="text-gray-500"/>}
                            </div>
                            <div className="text-xs text-gray-800">
                                <span className="font-bold">{websiteConfig.domain}</span>
                                <span className="text-gray-500"> › blog › {formData.slug || 'judul-artikel'}</span>
                            </div>
                        </div>
                        <h3 className="text-lg text-[#1a0dab] hover:underline cursor-pointer font-medium leading-snug truncate">
                            {formData.seoTitle || formData.title || 'Judul Artikel Anda'}
                        </h3>
                        <p className="text-sm text-[#4d5156] mt-1 line-clamp-2">
                            {formData.seoDescription || formData.excerpt || 'Deskripsi artikel akan muncul di sini...'}
                        </p>
                    </div>

                    <div className="space-y-3">
                         <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Slug (URL)</label>
                            <div className="flex items-center gap-1 bg-black/20 rounded-xl px-3 py-2 border border-white/10">
                                <span className="text-xs text-gray-500">{websiteConfig.domain}/blog/</span>
                                <input 
                                    type="text"
                                    className="flex-1 bg-transparent text-white text-xs outline-none"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                                    placeholder="judul-artikel"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Meta Title</label>
                            <GlassInput 
                                value={formData.seoTitle} 
                                onChange={(e) => setFormData({...formData, seoTitle: e.target.value})}
                                className="text-xs"
                                placeholder="Judul khusus untuk Google..."
                            />
                            <div className="flex justify-between mt-1">
                                <span className="text-[9px] text-gray-500">Maks 60 karakter</span>
                                <span className={`text-[9px] font-bold ${formData.seoTitle.length > 60 ? 'text-red-400' : 'text-green-400'}`}>{formData.seoTitle.length} chars</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Meta Description</label>
                            <textarea 
                                className="w-full glass-input rounded-xl p-3 text-xs h-20 resize-none text-white"
                                value={formData.seoDescription}
                                onChange={(e) => setFormData({...formData, seoDescription: e.target.value})}
                                placeholder="Deskripsi yang memancing klik..."
                            />
                             <div className="flex justify-between mt-1">
                                <span className="text-[9px] text-gray-500">Maks 160 karakter</span>
                                <span className={`text-[9px] font-bold ${formData.seoDescription.length > 160 ? 'text-red-400' : 'text-green-400'}`}>{formData.seoDescription.length} chars</span>
                            </div>
                        </div>
                    </div>
                </GlassPanel>
            </div>
        </div>
    );
};

export default ArticleManager;
