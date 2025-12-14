
import React from 'react';
import { WebsiteConfig, BlogPost } from '../types';
import { Product } from '../../products/types';
import { MapPin, Phone, Instagram, Star, ShoppingBag, Menu, X, ArrowRight, FileText, Image as ImageIcon } from 'lucide-react';
import CompactNumber from '../../../components/common/CompactNumber';

interface PreviewPanelProps {
    config: WebsiteConfig;
    products: Product[];
    articles: BlogPost[];
    mode: 'mobile' | 'desktop';
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ config, products, articles, mode }) => {
    // Determine container width based on mode
    const containerClass = mode === 'mobile' 
        ? 'w-[375px] h-[667px] rounded-[3rem] border-8 border-[#1e293b]' 
        : 'w-full h-full rounded-xl border-4 border-[#1e293b]';

    const isGlass = config.themeMode === 'glass';
    const isDark = config.themeMode === 'dark';
    
    // Dynamic Styles based on Config
    const bgClass = isGlass 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' 
        : isDark 
            ? 'bg-[#121212] text-white' 
            : 'bg-white text-gray-900';
            
    const cardClass = isGlass
        ? 'bg-white/10 backdrop-blur-md border border-white/10'
        : isDark
            ? 'bg-[#1e1e1e] border border-gray-800'
            : 'bg-gray-50 border border-gray-200';

    const textColor = isDark ? 'text-gray-400' : 'text-gray-600';
    const headingColor = isDark ? 'text-white' : 'text-gray-900';

    return (
        <div className={`relative overflow-hidden shadow-2xl transition-all duration-500 mx-auto ${containerClass} bg-black`}>
            {/* Notch for Mobile */}
            {mode === 'mobile' && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1e293b] rounded-b-xl z-50"></div>
            )}

            {/* Simulated Browser Bar for Desktop */}
            {mode === 'desktop' && (
                <div className="h-8 bg-gray-100 border-b flex items-center px-4 gap-2 shrink-0">
                     <div className="flex gap-1.5">
                         <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                         <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                         <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                     </div>
                     <div className="flex-1 bg-white mx-4 rounded-md h-5 text-[10px] flex items-center px-2 text-gray-400 shadow-sm truncate">
                         https://{config.domain}
                     </div>
                </div>
            )}

            {/* WEBSITE CONTENT SCROLLABLE AREA */}
            <div className={`h-full overflow-y-auto custom-scrollbar relative ${bgClass}`}>
                
                {/* Navbar */}
                <nav className={`sticky top-0 z-40 p-4 flex justify-between items-center ${isGlass ? 'bg-black/20 backdrop-blur-md' : (isDark ? 'bg-[#121212]/90' : 'bg-white/90')} border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                    <h1 className={`font-bold text-lg ${headingColor}`}>{config.title}</h1>
                    <button className={headingColor}>
                        <Menu size={20} />
                    </button>
                </nav>

                {/* Hero Section */}
                <header className="relative h-64 flex items-center justify-center text-center px-6">
                    <img src={config.heroImage} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Hero" />
                    <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-[#121212]' : 'from-white'} to-transparent`}></div>
                    <div className="relative z-10 space-y-3">
                        <h2 className={`text-3xl font-black drop-shadow-lg leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.tagline}</h2>
                        <button 
                            className="px-6 py-2 rounded-full text-xs font-bold text-white shadow-lg transform active:scale-95 transition-transform"
                            style={{ backgroundColor: config.primaryColor }}
                        >
                            Pesan Sekarang
                        </button>
                    </div>
                </header>

                {/* About Section */}
                <section className="p-6">
                    <h3 className={`font-bold text-lg mb-2 ${headingColor}`}>Tentang Kami</h3>
                    <p className={`text-xs leading-relaxed ${textColor}`}>
                        {config.about}
                    </p>
                </section>
                
                {/* Gallery Section - NEW */}
                {config.showGallery && config.gallery.length > 0 && (
                    <section className="p-6 pt-2">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`font-bold text-lg ${headingColor}`}>Galeri</h3>
                            <span className="text-xs opacity-60">Lihat Semua &rarr;</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {config.gallery.slice(0, 4).map((item) => (
                                <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden group">
                                    <img src={item.url} alt={item.caption} className="w-full h-full object-cover" />
                                    {item.caption && (
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                            <p className="text-[10px] text-white font-bold truncate">{item.caption}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Menu Section */}
                {config.showMenu && (
                    <section className="p-6 pt-2">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`font-bold text-lg ${headingColor}`}>Menu Favorit</h3>
                            <span className="text-xs opacity-60">Lihat Semua &rarr;</span>
                        </div>
                        <div className={`grid ${mode === 'desktop' ? 'grid-cols-4' : 'grid-cols-2'} gap-3`}>
                            {products.map(p => (
                                <div key={p.id} className={`rounded-xl overflow-hidden ${cardClass}`}>
                                    <div className="aspect-square bg-gray-700">
                                        <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                                    </div>
                                    <div className="p-2">
                                        <h4 className={`font-bold text-xs truncate ${headingColor}`}>{p.name}</h4>
                                        <p className="text-[10px] opacity-70 mb-2 truncate">{p.category}</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold" style={{ color: config.primaryColor }}>
                                                <CompactNumber value={p.price} currency />
                                            </span>
                                            <button className="p-1 rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 transition-colors">
                                                <ShoppingBag size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
                
                {/* Blog Section */}
                {config.showBlog && (
                    <section className="p-6 pt-2 bg-black/5 dark:bg-white/5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`font-bold text-lg ${headingColor}`}>Berita & Artikel</h3>
                            <span className="text-xs opacity-60">Blog &rarr;</span>
                        </div>
                        <div className="space-y-4">
                            {articles.filter(a => a.status === 'Published').length === 0 ? (
                                <p className="text-xs text-gray-500 italic text-center py-4">Belum ada artikel dipublish.</p>
                            ) : (
                                articles.filter(a => a.status === 'Published').slice(0, 3).map(post => (
                                    <div key={post.id} className={`flex gap-3 p-3 rounded-xl ${cardClass}`}>
                                        <div className="w-20 h-20 bg-gray-700 rounded-lg shrink-0 overflow-hidden">
                                            {post.image ? <img src={post.image} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center"><FileText size={16} className="opacity-50"/></div>}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col">
                                            <h4 className={`font-bold text-xs line-clamp-2 ${headingColor} mb-1`}>{post.title}</h4>
                                            <p className={`text-[10px] ${textColor} line-clamp-2 leading-relaxed mb-auto`}>{post.excerpt}</p>
                                            <span className="text-[9px] opacity-50 mt-2">{post.date}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                )}

                {/* Reviews Section */}
                {config.showReviews && (
                    <section className="p-6 pt-4">
                        <h3 className={`font-bold text-lg mb-4 ${headingColor}`}>Kata Mereka</h3>
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className={`min-w-[200px] p-3 rounded-xl ${cardClass}`}>
                                    <div className="flex gap-1 text-yellow-400 mb-2">
                                        {[...Array(5)].map((_, j) => <Star key={j} size={10} fill="currentColor" />)}
                                    </div>
                                    <p className={`text-[10px] italic opacity-80 mb-2 ${textColor}`}>"Rasa makanannya enak banget, pengiriman juga cepat!"</p>
                                    <p className={`text-[10px] font-bold ${headingColor}`}>- Budi Santoso</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Footer */}
                <footer className={`mt-8 p-8 text-center ${isDark ? 'bg-black/40' : 'bg-gray-100'}`}>
                    <h4 className={`font-bold mb-4 ${headingColor}`}>{config.title}</h4>
                    {config.showLocation && (
                        <div className={`flex justify-center items-center gap-2 text-xs opacity-60 mb-2 ${textColor}`}>
                            <MapPin size={12} /> {config.address}
                        </div>
                    )}
                    <div className={`flex justify-center gap-4 text-xs opacity-60 mb-6 ${textColor}`}>
                        <span className="flex items-center gap-1"><Instagram size={12} /> {config.instagram}</span>
                        <span className="flex items-center gap-1"><Phone size={12} /> {config.contactWA}</span>
                    </div>
                    <p className="text-[9px] opacity-40">Powered by SIBOS Ecosystem</p>
                </footer>

            </div>
        </div>
    );
};

export default PreviewPanel;
