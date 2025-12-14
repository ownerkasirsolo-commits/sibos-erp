
import React, { useState } from 'react';
import { 
  Rocket, Code, PieChart, Users, ArrowRight, ShieldCheck, 
  Cpu, Globe, Zap, Handshake, ChevronRight, CheckCircle2 
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [activeRole, setActiveRole] = useState<'investor' | 'developer' | 'partner'>('investor');

  return (
    <div className="min-h-screen bg-[#000000] text-gray-200 font-sans selection:bg-orange-500/30 overflow-x-hidden">
      
      {/* BACKGROUND FX */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-orange-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
      </div>

      {/* NAVBAR */}
      <nav className="relative z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-orange-500/20">
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-white">SIBOS <span className="text-orange-500">.io</span></span>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={onEnterApp}
             className="text-sm font-bold text-gray-400 hover:text-white transition-colors"
           >
             Login
           </button>
           <button 
             onClick={onEnterApp}
             className="px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-xs font-bold text-white transition-all"
           >
             Join Ecosystem
           </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-20 pb-32 px-6 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold uppercase tracking-widest mb-6 animate-in fade-in slide-in-from-bottom-4">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
          Pre-Launch Phase: Batch 1
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-700">
          Bisnis Itu Kejam.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-purple-600">
            Yang Lambat, Mati.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-10 duration-1000">
          Dunia bergerak terlalu cepat untuk sistem POS "biasa aja". 
          SIBOS hadir bukan untuk bersaing, tapi untuk <strong className="text-white">mengakhiri kompetisi</strong>. 
          Satu ekosistem terintegrasi untuk POS, Supply Chain, HR, dan AI Intelligence.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <button 
            onClick={onEnterApp}
            className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:brightness-110 text-white font-bold rounded-2xl shadow-[0_0_30px_-5px_rgba(234,88,12,0.4)] transition-all transform hover:scale-105 flex items-center gap-3"
          >
            <Rocket size={20} /> AMANKAN AKSES AWAL
          </button>
          <p className="text-xs text-gray-500 mt-2 md:mt-0">
            *Hanya tersisa 145 slot untuk Batch 1
          </p>
        </div>
      </section>

      {/* KILLER FEATURES GRID */}
      <section className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-[#1a1a1a] to-black border border-white/10 relative overflow-hidden group hover:border-orange-500/30 transition-all">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Zap size={120} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">The Boss AI</h3>
                <p className="text-gray-400 mb-6 max-w-md">Bukan sekadar asisten. Dia yang mikir strategi saat lo tidur. Analisa data, prediksi tren, dan eksekusi marketing otomatis.</p>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-bold text-gray-300 border border-white/5">Forecasting</span>
                    <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-bold text-gray-300 border border-white/5">Auto-Briefing</span>
                </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#0f0f0f] border border-white/10 hover:border-blue-500/30 transition-all group">
                <Globe size={40} className="text-blue-500 mb-4 group-hover:scale-110 transition-transform"/>
                <h3 className="text-xl font-bold text-white mb-2">Omnichannel God Mode</h3>
                <p className="text-gray-400 text-sm">Jualan di GoFood, Shopee, TikTok, Instagram sekaligus. Atur stok dari satu layar. Ga pake ribet.</p>
            </div>

            <div className="p-8 rounded-3xl bg-[#0f0f0f] border border-white/10 hover:border-green-500/30 transition-all group">
                <Handshake size={40} className="text-green-500 mb-4 group-hover:scale-110 transition-transform"/>
                <h3 className="text-xl font-bold text-white mb-2">B2B Network</h3>
                <p className="text-gray-400 text-sm">Terhubung langsung dengan supplier dan distributor dalam satu ekosistem. Restock cuma sekali klik.</p>
            </div>

            <div className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-[#1a1a1a] to-black border border-white/10 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">Multi-Business, Multi-Outlet</h3>
                    <p className="text-gray-400 mb-4">Punya cafe, toko baju, dan bengkel? Kelola semuanya dalam satu akun SIBOS. Tanpa log out, tanpa pusing.</p>
                    <button onClick={onEnterApp} className="text-orange-500 font-bold flex items-center gap-2 hover:gap-3 transition-all">Lihat Demo <ArrowRight size={16}/></button>
                </div>
                <div className="w-full md:w-1/3 aspect-video bg-white/5 rounded-xl border border-white/5 flex items-center justify-center">
                    <span className="text-xs text-gray-600 font-mono">Interactive Dashboard UI</span>
                </div>
            </div>
        </div>
      </section>

      {/* THE COMMUNITY & ROLES */}
      <section className="relative z-10 py-20 bg-black/40 border-y border-white/5">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Build. Own. Earn.</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">SIBOS bukan sekadar SaaS. Ini adalah pergerakan. Kami mengundang lo untuk mengambil peran dalam ekosistem ini.</p>
            </div>

            <div className="flex flex-col md:flex-row justify-center gap-4 mb-8">
                {(['investor', 'developer', 'partner'] as const).map((role) => (
                    <button
                        key={role}
                        onClick={() => setActiveRole(role)}
                        className={`px-6 py-3 rounded-xl font-bold text-sm transition-all border ${activeRole === role ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-white/10 hover:text-white'}`}
                    >
                        {role === 'investor' ? 'ANGEL INVESTOR' : role === 'developer' ? 'CORE ENGINEER' : 'ECOSYSTEM PARTNER'}
                    </button>
                ))}
            </div>

            <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10 max-w-4xl mx-auto bg-[#0a0a0a]">
                {activeRole === 'investor' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                    <PieChart className="text-green-500"/> Jangan Cuma Nonton
                                </h3>
                                <p className="text-gray-400 mb-6 leading-relaxed">
                                    Ingat saat orang menertawakan ide <i>cloud kitchen</i>? Jangan sampai lo jadi penonton lagi saat SIBOS mendominasi pasar UMKM & Enterprise Indonesia.
                                </p>
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                        <span className="text-gray-400 text-sm">Valuasi Awal (Pre-Seed)</span>
                                        <span className="text-xl font-bold text-white">Rp 5 Miliar</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                        <span className="text-gray-400 text-sm">Alokasi Investor</span>
                                        <span className="text-xl font-bold text-orange-500">20% Saham</span>
                                    </div>
                                </div>
                                <button className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
                                    Lihat Pitch Deck
                                </button>
                            </div>
                            
                            {/* PIE CHART VISUALIZATION */}
                            <div className="w-64 h-64 relative shrink-0">
                                <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                                    {/* Founder 45% */}
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f97316" strokeWidth="20" strokeDasharray="125.6 251.2" /> 
                                    {/* Co-Founder 25% */}
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="20" strokeDasharray="70 251.2" strokeDashoffset="-125.6" />
                                    {/* Investor 20% */}
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#22c55e" strokeWidth="20" strokeDasharray="56 251.2" strokeDashoffset="-195.6" />
                                    {/* Reserve 10% */}
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#64748b" strokeWidth="20" strokeDasharray="28 251.2" strokeDashoffset="-251.6" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-xs font-bold text-gray-500">SIBOS</span>
                                    <span className="text-xl font-black text-white">EQUITY</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 text-center text-[10px] uppercase font-bold tracking-widest">
                            <div className="text-orange-500">Founder 45%</div>
                            <div className="text-blue-500">Co-Founder 25%</div>
                            <div className="text-green-500">Investor 20%</div>
                            <div className="text-slate-500">Cadangan 10%</div>
                        </div>
                    </div>
                )}

                {activeRole === 'developer' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                         <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <Code className="text-blue-500"/> Code the Future
                        </h3>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Bosan bikin aplikasi CRUD yang gitu-gitu aja? Tantang skill lo buat bangun arsitektur yang kompleks, AI-driven, dan scalable. Kami cari arsitek digital, bukan sekadar tukang koding.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <h4 className="font-bold text-white mb-1">Tech Stack Modern</h4>
                                <p className="text-xs text-gray-400">React, TypeScript, Node.js, AI Integration, Real-time Socket.</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <h4 className="font-bold text-white mb-1">Stock Option</h4>
                                <p className="text-xs text-gray-400">Developer inti mendapatkan jatah dari alokasi Co-founder/Cadangan.</p>
                            </div>
                        </div>
                        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors">
                            Join the Elite Team
                        </button>
                    </div>
                )}

                {activeRole === 'partner' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                         <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <Handshake className="text-purple-500"/> Grow Together
                        </h3>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Punya jaringan bisnis? Atau punya produk SaaS lain? Jadilah partner integrator atau reseller SIBOS. Ekosistem ini terbuka untuk kolaborasi, bukan monopoli.
                        </p>
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 size={16} className="text-purple-500" />
                                <span className="text-sm text-gray-300">Revenue Sharing Model hingga 30%</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 size={16} className="text-purple-500" />
                                <span className="text-sm text-gray-300">API Access & White Label Option</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 size={16} className="text-purple-500" />
                                <span className="text-sm text-gray-300">Dedicated Support Team</span>
                            </div>
                        </div>
                        <button className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors">
                            Ajukan Partnership
                        </button>
                    </div>
                )}
            </div>
         </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black py-12 px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">S</div>
              <span className="font-bold text-white">SIBOS Ecosystem</span>
          </div>
          <p className="text-xs text-gray-500 mb-8">Crafted for the bold. Built in Indonesia. Global Vision.</p>
          <div className="flex justify-center gap-6 text-xs text-gray-400">
              <a href="#" className="hover:text-white">Privacy</a>
              <a href="#" className="hover:text-white">Terms</a>
              <a href="#" className="hover:text-white">Contact</a>
          </div>
      </footer>
    </div>
  );
};

export default LandingPage;
