
import React from 'react';
import { WebsiteConfig } from '../../types';
import { Globe, Save, Monitor, Smartphone, Eye, ExternalLink, Image as ImageIcon, Palette, Layout, Menu, Phone, Instagram, CheckCircle2 } from 'lucide-react';
import GlassPanel from '../../../../components/common/GlassPanel';
import GlassInput from '../../../../components/common/GlassInput';
import CompactNumber from '../../../../components/common/CompactNumber';
import { useGlobalContext } from '../../../../context/GlobalContext';

interface WebsiteBuilderViewProps {
    config: WebsiteConfig;
    onUpdate: (field: keyof WebsiteConfig, value: any) => void;
    onPublish: () => void;
}

const WebsiteBuilderView: React.FC<WebsiteBuilderViewProps> = ({ config, onUpdate, onPublish }) => {
    const { products } = useGlobalContext();
    const showcaseProducts = products.slice(0, 4);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in zoom-in-95 h-full">
            
            {/* LEFT COLUMN: EDITOR (5/12) */}
            <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar h-[calc(100vh-200px)]">
                
                {/* 1. STATUS & DOMAIN */}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-white text-sm flex items-center gap-2">
                            <Globe size={16} className="text-blue-400" /> Status Website
                        </h4>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                            config.status === 'Published' 
                            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                            {config.status}
                        </span>
                    </div>
                    
                    <div className="flex gap-2 items-center bg-black/30 p-2 rounded-xl border border-white/10 mb-4">
                        <Globe size={14} className="text-gray-500 ml-2" />
                        <span className="text-xs text-blue-400 font-mono truncate flex-1">{config.domain}</span>
                        <button className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white" title="Buka">
                            <ExternalLink size={14} />
                        </button>
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-400 px-1">
                        <span>Pengunjung (30 Hari)</span>
                        <span className="text-white font-bold"><CompactNumber value={config.visitors} currency={false} /></span>
                    </div>
                </div>

                {/* 2. GENERAL INFO */}
                <GlassPanel className="p-5 rounded-2xl border border-white/5">
                    <h4 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                        <Layout size={16} className="text-orange-500" /> Identitas Bisnis
                    </h4>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Nama Website (Title)</label>
                            <GlassInput 
                                value={config.title} 
                                onChange={e => onUpdate('title', e.target.value)} 
                                className="py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Tagline / Slogan</label>
                            <textarea 
                                className="w-full glass-input rounded-xl p-3 text-sm h-20 resize-none text-white"
                                value={config.tagline}
                                onChange={e => onUpdate('tagline', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Tentang Kami</label>
                             <textarea 
                                className="w-full glass-input rounded-xl p-3 text-sm h-24 resize-none text-white"
                                value={config.about}
                                onChange={e => onUpdate('about', e.target.value)}
                            />
                        </div>
                    </div>
                </GlassPanel>

                {/* 3. APPEARANCE */}
                <GlassPanel className="p-5 rounded-2xl border border-white/5">
                    <h4 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                        <Palette size={16} className="text-purple-500" /> Tampilan & Tema
                    </h4>
                    <div className="space-y-4">
                         <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Foto Hero (Cover)</label>
                            <div className="flex gap-2">
                                <GlassInput 
                                    value={config.heroImage} 
                                    onChange={e => onUpdate('heroImage', e.target.value)} 
                                    className="py-2 text-sm flex-1"
                                    placeholder="URL Gambar..."
                                />
                                <button className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white">
                                    <ImageIcon size={18} />
                                </button>
                            </div>
                        </div>
                         <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase mb-2 block">Warna Utama</label>
                            <div className="flex gap-2">
                                {['#f97316', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#ec4899'].map(color => (
                                    <button 
                                        key={color}
                                        onClick={() => onUpdate('primaryColor', color)}
                                        className={`w-8 h-8 rounded-full border-2 transition-all ${config.primaryColor === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </GlassPanel>

                {/* 4. CONTENT SECTIONS */}
                <GlassPanel className="p-5 rounded-2xl border border-white/5">
                     <h4 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                        <Menu size={16} className="text-green-500" /> Konten Halaman
                    </h4>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                            <span className="text-sm text-gray-300">Tampilkan Katalog Menu</span>
                            <input 
                                type="checkbox" 
                                checked={config.showMenu} 
                                onChange={e => onUpdate('showMenu', e.target.checked)} 
                                className="accent-green-500 w-4 h-4"
                            />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                            <span className="text-sm text-gray-300">Tampilkan Ulasan</span>
                            <input 
                                type="checkbox" 
                                checked={config.showReviews} 
                                onChange={e => onUpdate('showReviews', e.target.checked)} 
                                className="accent-green-500 w-4 h-4"
                            />
                        </div>
                    </div>
                </GlassPanel>

                 {/* 5. CONTACT */}
                <GlassPanel className="p-5 rounded-2xl border border-white/5 mb-8">
                     <h4 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                        <Phone size={16} className="text-teal-500" /> Kontak & Sosmed
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">WhatsApp</label>
                            <GlassInput 
                                value={config.contactWA} 
                                onChange={e => onUpdate('contactWA', e.target.value)} 
                                className="py-2 text-sm"
                                icon={Phone}
                            />
                        </div>
                        <div>
                             <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Instagram</label>
                            <GlassInput 
                                value={config.instagram} 
                                onChange={e => onUpdate('instagram', e.target.value)} 
                                className="py-2 text-sm"
                                icon={Instagram}
                            />
                        </div>
                    </div>
                </GlassPanel>

            </div>

            {/* RIGHT COLUMN: PREVIEW (7/12) */}
            <div className="lg:col-span-7 flex flex-col h-full">
                
                {/* PREVIEW HEADER */}
                <div className="flex justify-between items-center mb-4 px-2">
                    <div className="flex gap-2">
                        <div className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-bold text-white flex items-center gap-2 border border-white/10">
                            <Monitor size={14} /> Desktop
                        </div>
                         <div className="px-3 py-1.5 bg-black/20 rounded-lg text-xs font-bold text-gray-400 flex items-center gap-2 hover:bg-white/5 cursor-pointer">
                            <Smartphone size={14} /> Mobile
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2">
                            <Eye size={14} /> Preview
                        </button>
                        <button 
                            onClick={onPublish}
                            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg ${config.status === 'Published' ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-green-600 hover:bg-green-500 text-white'}`}
                        >
                            <Save size={14} /> {config.status === 'Published' ? 'Unpublish' : 'Publish Website'}
                        </button>
                    </div>
                </div>

                {/* PREVIEW FRAME (IPHONE MOCKUP STYLE CONTAINER FOR DESKTOP VIEW MOCK) */}
                <div className="flex-1 bg-white rounded-3xl overflow-hidden shadow-2xl relative border-8 border-[#1e293b]">
                     {/* BROWSER BAR MOCK */}
                     <div className="h-8 bg-gray-100 border-b flex items-center px-4 gap-2">
                         <div className="flex gap-1.5">
                             <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                             <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                             <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                         </div>
                         <div className="flex-1 bg-white mx-4 rounded-md h-5 text-[10px] flex items-center px-2 text-gray-400 shadow-sm">
                             https://{config.domain}
                         </div>
                     </div>

                     {/* WEBSITE CONTENT MOCK */}
                     <div className="h-full overflow-y-auto custom-scrollbar bg-gray-50 pb-20">
                         
                         {/* HERO SECTION */}
                         <div className="relative h-64 bg-gray-900 flex items-center justify-center text-center px-8">
                             <img src={config.heroImage} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Hero"/>
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                             <div className="relative z-10 text-white">
                                 <h1 className="text-3xl font-bold mb-2 drop-shadow-md">{config.title}</h1>
                                 <p className="text-sm opacity-90 max-w-md mx-auto leading-relaxed">{config.tagline}</p>
                                 <button 
                                    className="mt-6 px-6 py-2 rounded-full text-xs font-bold shadow-lg transition-transform hover:scale-105"
                                    style={{ backgroundColor: config.primaryColor }}
                                 >
                                     Pesan Sekarang
                                 </button>
                             </div>
                         </div>

                         {/* ABOUT SECTION */}
                         <div className="p-8 text-center max-w-lg mx-auto">
                             <h2 className="text-lg font-bold text-gray-800 mb-3">Tentang Kami</h2>
                             <p className="text-xs text-gray-600 leading-relaxed">{config.about}</p>
                         </div>

                         {/* MENU SHOWCASE */}
                         {config.showMenu && (
                             <div className="bg-white py-8 px-6">
                                 <h2 className="text-lg font-bold text-gray-800 mb-6 text-center">Menu Favorit</h2>
                                 <div className="grid grid-cols-2 gap-4">
                                     {showcaseProducts.map(p => (
                                         <div key={p.id} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                                             <div className="h-24 bg-gray-200">
                                                 <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                                             </div>
                                             <div className="p-3">
                                                 <h5 className="font-bold text-xs text-gray-800 truncate">{p.name}</h5>
                                                 <p className="text-[10px] text-gray-500 mt-1">Rp {p.price.toLocaleString()}</p>
                                                 <button 
                                                    className="w-full mt-2 py-1.5 rounded text-[10px] text-white font-bold"
                                                    style={{ backgroundColor: config.primaryColor }}
                                                 >
                                                     + Keranjang
                                                 </button>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                                 <div className="text-center mt-6">
                                     <button className="text-xs font-bold text-gray-500 hover:text-gray-800 border-b border-gray-300 pb-0.5">Lihat Semua Menu &rarr;</button>
                                 </div>
                             </div>
                         )}
                         
                         {/* FOOTER */}
                         <div className="bg-gray-900 text-white p-8 text-center">
                             <h3 className="font-bold mb-2">{config.title}</h3>
                             <div className="flex justify-center gap-4 text-xs text-gray-400 mb-4">
                                 {config.instagram && <span>IG: {config.instagram}</span>}
                                 {config.contactWA && <span>WA: {config.contactWA}</span>}
                             </div>
                             <p className="text-[10px] text-gray-600">Powered by SIBOS Ecosystem</p>
                         </div>

                     </div>
                </div>
            </div>
        </div>
    );
};

export default WebsiteBuilderView;
