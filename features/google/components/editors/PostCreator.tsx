
import React, { useState } from 'react';
import { GooglePost, ConnectedPlatform } from '../../types';
import { Image as ImageIcon, Calendar, Sparkles, Send, Instagram, Facebook, FileText, Briefcase, Globe, MessageCircle } from 'lucide-react';
import GlassInput from '../../../../components/common/GlassInput';
import { useGlobalContext } from '../../../../context/GlobalContext';

interface PostCreatorProps {
    platforms: ConnectedPlatform[];
    onCreate: (post: GooglePost, crossPostTargets: string[]) => void;
    onGenerateAI: (topic: string) => Promise<string>;
    isAiLoading: boolean;
    onClose: () => void;
}

const PostCreator: React.FC<PostCreatorProps> = ({ platforms, onCreate, onGenerateAI, isAiLoading, onClose }) => {
    // Access Global Context to save Article/Job directly
    const { addArticle, addVacancy, addGalleryItem } = useGlobalContext();

    const [postType, setPostType] = useState<'UPDATE' | 'OFFER' | 'ARTICLE' | 'JOB' | 'GALLERY'>('UPDATE');
    
    // Common State
    const [summary, setSummary] = useState(''); // Used as "Caption" or "Short Description"
    const [mediaUrl, setMediaUrl] = useState('');
    const [aiTopic, setAiTopic] = useState('');
    const [crossPostTargets, setCrossPostTargets] = useState<string[]>([]);
    
    // Article Specific
    const [articleTitle, setArticleTitle] = useState('');
    const [articleContent, setArticleContent] = useState('');

    // Job Specific
    const [jobTitle, setJobTitle] = useState('');
    const [jobSalary, setJobSalary] = useState('');

    const handleGenerate = async () => {
        if(!aiTopic) return;
        const result = await onGenerateAI(aiTopic);
        if(result) {
            if (postType === 'ARTICLE') setArticleContent(result);
            else setSummary(result);
        }
    };

    const toggleTarget = (id: string) => {
        setCrossPostTargets(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    };

    const handleSubmit = async () => {
        const timestamp = new Date().toISOString();
        let finalSummary = summary;
        let postTypeForGoogle: any = 'UPDATE';

        // 1. SMART DISTRIBUTION LOGIC
        if (postType === 'ARTICLE') {
            // Save to Website
            await addArticle({
                id: `BLOG-${Date.now()}`,
                title: articleTitle,
                slug: articleTitle.toLowerCase().replace(/\s/g, '-'),
                image: mediaUrl || 'https://via.placeholder.com/600x400',
                excerpt: summary,
                content: articleContent,
                status: 'Published',
                date: timestamp.split('T')[0],
                seoTitle: articleTitle,
                seoDescription: summary
            });
            finalSummary = `📝 [ARTIKEL BARU] ${articleTitle}\n\n${summary}\n\nBaca selengkapnya di website kami.`;
            postTypeForGoogle = 'UPDATE';
            if (!crossPostTargets.includes('website')) toggleTarget('website'); // Force mark as synced
        } 
        else if (postType === 'JOB') {
            // Save to HRM
            await addVacancy({
                id: `VAC-${Date.now()}`,
                title: jobTitle,
                department: 'General',
                type: 'Full-time',
                salaryRange: jobSalary,
                status: 'Published',
                description: summary,
                applicantsCount: 0,
                postedChannels: ['Google', ...crossPostTargets]
            });
            finalSummary = `💼 [LOWONGAN KERJA] ${jobTitle}\nSalary: ${jobSalary}\n\n${summary}\n\nLamar sekarang!`;
            postTypeForGoogle = 'UPDATE'; // Google posts for jobs usually updates or events
        }
        else if (postType === 'GALLERY') {
             // Save to Website Gallery
             await addGalleryItem({
                 id: `GAL-${Date.now()}`,
                 type: 'image',
                 url: mediaUrl,
                 caption: summary
             });
             postTypeForGoogle = 'UPDATE';
        }
        else {
            // Standard Update/Offer
            postTypeForGoogle = postType;
        }

        // 2. CREATE GOOGLE POST
        const newPost: GooglePost = {
            id: `post-${Date.now()}`,
            type: postTypeForGoogle,
            summary: finalSummary,
            status: 'LIVE',
            views: 0,
            clicks: 0,
            publishDate: timestamp.split('T')[0],
            mediaUrl: mediaUrl || 'https://via.placeholder.com/500x300',
            crossPostedTo: crossPostTargets
        };

        onCreate(newPost, crossPostTargets);
        onClose();
    };

    const socialPlatforms = platforms.filter(p => p.isConnected && (p.id === 'instagram' || p.id === 'facebook'));

    return (
        <div className="space-y-4">
             {/* TYPE SELECTOR - EXTENDED */}
             <div className="flex gap-2 p-1 bg-black/40 rounded-xl overflow-x-auto no-scrollbar">
                 {[
                     { id: 'UPDATE', label: 'Update', icon: MessageCircle },
                     { id: 'OFFER', label: 'Promo', icon: Calendar },
                     { id: 'ARTICLE', label: 'Artikel', icon: FileText },
                     { id: 'GALLERY', label: 'Galeri', icon: ImageIcon },
                     { id: 'JOB', label: 'Loker', icon: Briefcase },
                 ].map(t => (
                     <button 
                        key={t.id} 
                        onClick={() => setPostType(t.id as any)}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${postType === t.id ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}
                     >
                         {/* @ts-ignore */}
                         <t.icon size={12} /> {t.label}
                     </button>
                 ))}
             </div>
             
             {/* AI ASSIST */}
             <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                 <div className="flex gap-2 mb-2">
                     <GlassInput 
                        placeholder={postType === 'ARTICLE' ? "Topik Artikel..." : "Topik Postingan..."}
                        value={aiTopic}
                        onChange={e => setAiTopic(e.target.value)}
                        className="text-sm"
                     />
                     <button onClick={handleGenerate} disabled={isAiLoading || !aiTopic} className="bg-purple-600 hover:bg-purple-500 text-white px-3 rounded-xl disabled:opacity-50">
                         <Sparkles size={18} className={isAiLoading ? "animate-spin" : ""} />
                     </button>
                 </div>
                 <p className="text-[10px] text-purple-300">AI akan membuatkan draft konten otomatis.</p>
             </div>

             {/* DYNAMIC EDITOR FIELDS */}
             <div className="space-y-3">
                 
                 {postType === 'ARTICLE' && (
                     <div>
                         <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Judul Artikel</label>
                         <GlassInput value={articleTitle} onChange={e => setArticleTitle(e.target.value)} placeholder="Judul menarik..." />
                     </div>
                 )}

                 {postType === 'JOB' && (
                     <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Posisi</label>
                            <GlassInput value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Contoh: Barista" />
                         </div>
                         <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Gaji</label>
                            <GlassInput value={jobSalary} onChange={e => setJobSalary(e.target.value)} placeholder="Contoh: 3-5 Juta" />
                         </div>
                     </div>
                 )}

                 <div>
                     <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">
                         {postType === 'ARTICLE' ? 'Ringkasan (untuk Sosmed/GBP)' : 'Konten / Caption'}
                     </label>
                     <textarea 
                        className="w-full glass-input rounded-xl p-3 text-sm h-24 resize-none text-white"
                        placeholder="Tulis caption..."
                        value={summary}
                        onChange={e => setSummary(e.target.value)}
                     />
                 </div>

                 {postType === 'ARTICLE' && (
                     <div>
                         <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Isi Lengkap Artikel (Untuk Website)</label>
                         <textarea 
                            className="w-full glass-input rounded-xl p-3 text-sm h-32 resize-none text-white"
                            placeholder="Tulis artikel lengkap di sini..."
                            value={articleContent}
                            onChange={e => setArticleContent(e.target.value)}
                         />
                     </div>
                 )}

                 <div className="flex gap-2 items-center">
                     <button className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/10">
                         <ImageIcon size={16} /> {mediaUrl ? 'Ganti Foto' : 'Upload Foto'}
                     </button>
                     {/* Mock URL input for demo */}
                     <GlassInput 
                        placeholder="URL Gambar..." 
                        value={mediaUrl} 
                        onChange={e => setMediaUrl(e.target.value)} 
                        className="flex-1"
                        wrapperClassName="flex-[2]"
                     />
                 </div>
             </div>
            
            {/* SMART CROSS POSTING OPTIONS */}
            <div className="p-3 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl border border-white/10">
                <p className="text-xs font-bold text-blue-300 uppercase mb-2 flex items-center gap-2">
                    <Globe size={12} /> Distribusi Pintar (Cross-Posting)
                </p>
                <div className="flex flex-wrap gap-2">
                    {/* Website Chip (Auto-selected for certain types) */}
                    {(postType === 'ARTICLE' || postType === 'JOB' || postType === 'GALLERY') && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white border border-blue-500">
                            <Globe size={12}/> Website {postType === 'JOB' ? '(Karir)' : (postType === 'GALLERY' ? '(Galeri)' : '(Blog)')}
                        </div>
                    )}
                    
                    {/* Social Chips */}
                    {socialPlatforms.map(p => (
                        <button
                            key={p.id}
                            onClick={() => toggleTarget(p.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                crossPostTargets.includes(p.id) 
                                ? 'bg-pink-600/40 border-pink-500 text-white' 
                                : 'bg-black/20 border-white/10 text-gray-500 hover:text-white'
                            }`}
                        >
                            {p.id === 'instagram' ? <Instagram size={12}/> : <Facebook size={12}/>}
                            {p.name}
                        </button>
                    ))}
                </div>
            </div>

             <button onClick={handleSubmit} className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 mt-2">
                 <Send size={16} /> 
                 Publish ke Ecosystem
             </button>
        </div>
    );
};

export default PostCreator;
