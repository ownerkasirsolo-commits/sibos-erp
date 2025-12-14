
import React, { useState } from 'react';
import { 
  Globe, ShoppingBag, MessageCircle, AlertTriangle, 
  RefreshCw, Wifi, WifiOff, Settings, 
  ArrowUpRight, QrCode, Smartphone, DollarSign,
  Monitor, MapPin, Star, Ticket, Tv, Printer, Edit3,
  Layers, Megaphone, Repeat, Search, ThumbsUp, ThumbsDown, Filter,
  Activity, TrendingUp, TrendingDown, Eye, Calculator, Info,
  PieChart, Save, Plus
} from 'lucide-react';
import CompactNumber from './common/CompactNumber';

const Omnichannel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pricing' | 'sync' | 'reputation' | 'campaign'>('overview');
  const [isPanicMode, setIsPanicMode] = useState(false);
  const [globalMarkup, setGlobalMarkup] = useState(20);
  const [simulatorBasePrice, setSimulatorBasePrice] = useState(35000);

  // Online Sales Channels (Transactional)
  const [channels, setChannels] = useState([
    { id: 'gofood', name: 'GoFood', type: 'Food Delivery', status: 'Open', connected: true, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', commission: 20 },
    { id: 'grabfood', name: 'GrabFood', type: 'Food Delivery', status: 'Open', connected: true, color: 'text-green-600', bg: 'bg-green-600/10', border: 'border-green-600/20', commission: 20 },
    { id: 'shopeefood', name: 'ShopeeFood', type: 'Food Delivery', status: 'Closed', connected: true, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', commission: 20 },
    { id: 'tokopedia', name: 'Tokopedia', type: 'Marketplace', status: 'Open', connected: true, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', commission: 5.5 }, // Decimal commission example
    { id: 'tiktok', name: 'TikTok Shop', type: 'Social Commerce', status: 'Open', connected: false, color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20', commission: 8.3 },
  ]);

  const toggleChannelStatus = (id: string) => {
    setChannels(prev => prev.map(ch => {
      if (ch.id === id && ch.connected) {
        return { ...ch, status: ch.status === 'Open' ? 'Closed' : 'Open' };
      }
      return ch;
    }));
  };

  const handlePanicMode = () => {
    if (window.confirm(isPanicMode 
      ? "Matikan Panic Mode?" 
      : "PERINGATAN: Panic Mode akan MENUTUP SEMUA toko online. Lanjutkan?")) {
      setIsPanicMode(!isPanicMode);
      if (!isPanicMode) {
        setChannels(prev => prev.map(ch => ch.connected ? { ...ch, status: 'Closed' } : ch));
      } else {
        setChannels(prev => prev.map(ch => ch.connected ? { ...ch, status: 'Open' } : ch));
      }
    }
  };

  // Helper for Simulator (Decimal Friendly)
  const calculateSimulation = () => {
      const markupPrice = simulatorBasePrice + (simulatorBasePrice * (globalMarkup / 100));
      // Average commission fee roughly 20% for simulation
      const appFee = markupPrice * 0.20; 
      const netReceive = markupPrice - appFee;
      const marginDiff = netReceive - simulatorBasePrice;
      return { markupPrice, appFee, netReceive, marginDiff };
  }
  
  const sim = calculateSimulation();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Navigation Tabs */}
      <div className="flex bg-black/20 p-1 rounded-xl w-full md:w-fit md:mx-auto overflow-x-auto no-scrollbar">
            {[
                { id: 'overview', label: 'Dashboard', icon: Globe },
                { id: 'pricing', label: 'Pricing', icon: Calculator }, 
                { id: 'sync', label: 'Menu Sync', icon: Repeat },
                { id: 'reputation', label: 'Review', icon: Star },
                { id: 'campaign', label: 'Promo', icon: Megaphone },
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 md:flex-none py-2.5 px-6 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                        activeTab === tab.id 
                        ? 'bg-orange-600 text-white shadow-lg' 
                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                    }`}
                >
                    <tab.icon size={14} />
                    <span>{tab.label}</span>
                </button>
            ))}
      </div>

      {/* TAB CONTENT: OVERVIEW (Existing Dashboard) */}
      {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
             {/* HEADER & GLOBAL STATUS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Connection Health */}
                <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <Globe size={24} />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-bold animate-pulse">
                        <Wifi size={12} /> Online
                    </div>
                </div>
                <h3 className="text-gray-400 text-sm font-medium">Channel Terhubung</h3>
                <div className="flex items-end gap-2 mt-1">
                    <span className="text-3xl font-bold text-white">4</span>
                    <span className="text-sm text-gray-500 mb-1">/ 5 Platform</span>
                </div>
                <p className="text-xs text-blue-300 mt-4 flex items-center gap-1">
                    <RefreshCw size={12} className="animate-spin" /> Auto-sync: Barusan
                </p>
                </div>

                {/* Sales Contribution */}
                <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                        <ShoppingBag size={24} />
                    </div>
                    <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/10 flex items-center gap-1">
                        <ArrowUpRight size={12} /> +24%
                    </span>
                </div>
                <h3 className="text-gray-400 text-sm font-medium">Omset Omnichannel</h3>
                <div className="mt-1 text-3xl font-bold text-white">
                    <CompactNumber value={18200000} />
                </div>
                <p className="text-xs text-gray-500 mt-4">Kontribusi 45% dari total pendapatan.</p>
                </div>

                {/* PANIC BUTTON */}
                <div className={`rounded-3xl p-6 relative overflow-hidden transition-all duration-300 border-2 cursor-pointer flex flex-col justify-between group ${isPanicMode ? 'bg-red-600 border-red-500 shadow-[0_0_50px_rgba(220,38,38,0.5)]' : 'bg-[#0f172a] border-red-900/50 hover:border-red-500/50'}`}
                    onClick={handlePanicMode}
                >
                <div className="flex justify-between items-start z-10">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isPanicMode ? 'bg-white text-red-600' : 'bg-red-500/10 text-red-500'}`}>
                        <AlertTriangle size={24} />
                    </div>
                    <div className={`w-4 h-4 rounded-full ${isPanicMode ? 'bg-white animate-ping' : 'bg-red-900'}`}></div>
                </div>
                
                <div className="z-10 mt-4">
                    <h3 className={`text-lg font-bold ${isPanicMode ? 'text-white' : 'text-red-500'}`}>
                    {isPanicMode ? 'PANIC MODE ACTIVE' : 'PANIC BUTTON'}
                    </h3>
                    <p className={`text-xs mt-1 ${isPanicMode ? 'text-red-100' : 'text-gray-400'}`}>
                    {isPanicMode ? 'SEMUA TOKO ONLINE DITUTUP PAKSA' : 'Tutup paksa semua toko online.'}
                    </p>
                </div>

                {/* Animated Background */}
                {isPanicMode && (
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-20 animate-pulse"></div>
                )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT COLUMN: CHANNELS & PRESENCE */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* Live Activity Stream */}
                    <div className="glass-panel rounded-3xl p-6 border border-white/5">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Activity className="text-green-500" /> Live Activity
                            </h2>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Realtime</span>
                        </div>
                        <div className="space-y-4">
                            {[
                                { platform: 'GoFood', order: '#GF-8821', status: 'New Order', time: '1m ago', color: 'text-green-500' },
                                { platform: 'GrabFood', order: '#GR-1102', status: 'Driver Assigned', time: '5m ago', color: 'text-green-600' },
                                { platform: 'ShopeeFood', order: '#SP-9921', status: 'Completed', time: '12m ago', color: 'text-orange-500' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${item.color} bg-current shadow-[0_0_8px_currentColor]`}></div>
                                        <div>
                                            <p className="font-bold text-white text-sm">{item.platform} <span className="text-gray-500 font-normal">| {item.order}</span></p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-300">{item.status}</p>
                                        <p className="text-[10px] text-gray-500">{item.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SALES CHANNELS */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <ShoppingBag className="text-orange-500" /> Platform Integrations
                            </h2>
                            <button className="glass-button px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 text-gray-400 hover:text-white">
                                <Settings size={14} /> Config
                            </button>
                        </div>

                        <div className="space-y-3">
                            {channels.map((channel) => (
                                <div key={channel.id} className={`glass-panel p-4 rounded-2xl border flex flex-col sm:flex-row items-center gap-4 transition-all ${channel.connected ? 'border-white/5' : 'border-dashed border-gray-700 opacity-70 hover:opacity-100'}`}>
                                    {/* Icon/Logo */}
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${channel.bg} ${channel.border} border`}>
                                        <ShoppingBag className={channel.color} size={24} />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 text-center sm:text-left min-w-0">
                                        <h4 className="font-bold text-white">{channel.name}</h4>
                                        <p className="text-xs text-gray-500">{channel.type}</p>
                                    </div>

                                    {/* Controls */}
                                    {channel.connected ? (
                                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end bg-black/20 p-2 rounded-xl sm:bg-transparent sm:p-0">
                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold ${
                                                channel.status === 'Open' 
                                                ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                                                : (channel.status === 'Closed' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-orange-500/10 border-orange-500/20 text-orange-400')
                                            }`}>
                                                {channel.status === 'Open' ? <Wifi size={12} /> : (channel.status === 'Closed' ? <WifiOff size={12} /> : <RefreshCw size={12} className="animate-spin" />)}
                                                <span className="uppercase">{channel.status}</span>
                                            </div>
                                            
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={channel.status === 'Open'} 
                                                    onChange={() => toggleChannelStatus(channel.id)}
                                                    disabled={isPanicMode}
                                                    className="sr-only peer" 
                                                />
                                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                            </label>
                                        </div>
                                    ) : (
                                        <button className="w-full sm:w-auto px-6 py-2 bg-white/5 hover:bg-orange-500 text-gray-400 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                                            <ArrowUpRight size={14} /> Link
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: TOOLS & STRATEGY */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* Competitor Monitor */}
                    <div className="glass-panel rounded-3xl p-6">
                         <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                            <Eye className="text-orange-500" /> Intel
                        </h3>
                        <div className="space-y-3">
                            <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="text-xs font-bold text-gray-300">Kopi Kenangan</h4>
                                    <span className="text-[10px] text-red-400 font-bold flex items-center gap-1"><TrendingDown size={10} /> Turun</span>
                                </div>
                                <p className="text-xs text-gray-500">Kopi Susu: <span className="text-gray-300 line-through decoration-red-500">18k</span> -> 15k</p>
                            </div>
                            <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="text-xs font-bold text-gray-300">Janji Jiwa</h4>
                                    <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1">Stabil</span>
                                </div>
                                <p className="text-xs text-gray-500">Kopi Susu: 18k</p>
                            </div>
                        </div>
                        <button className="w-full mt-3 text-xs text-orange-400 font-bold hover:underline">Analisis</button>
                    </div>

                    {/* Offline Marketing Assets */}
                    <div className="glass-panel rounded-3xl p-6">
                        <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                            <Printer className="text-orange-500" /> Assets
                        </h3>
                        
                        <div className="space-y-3">
                            {/* QR Menu */}
                            <div className="p-3 bg-black/20 rounded-2xl border border-white/5 flex items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer group">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white group-hover:text-orange-400 transition-colors">
                                    <QrCode size={20} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-white text-xs">QR Menu</h4>
                                    <p className="text-[10px] text-gray-500">Cetak Stiker</p>
                                </div>
                                <ArrowUpRight size={14} className="text-gray-600 group-hover:text-white" />
                            </div>

                            {/* Digital Signage */}
                            <div className="p-3 bg-black/20 rounded-2xl border border-white/5 flex items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer group">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white group-hover:text-orange-400 transition-colors">
                                    <Tv size={20} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-white text-xs">Signage</h4>
                                    <p className="text-[10px] text-gray-500">Atur Iklan TV</p>
                                </div>
                                <ArrowUpRight size={14} className="text-gray-600 group-hover:text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
      )}

      {/* TAB CONTENT: SMART PRICING STRATEGY (NEW) */}
      {activeTab === 'pricing' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 
                 {/* Left: Global Config */}
                 <div className="lg:col-span-2 space-y-6">
                     <div className="glass-panel p-8 rounded-3xl">
                         <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-orange-500/20 rounded-xl text-orange-400">
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Strategi Harga Global</h2>
                                <p className="text-sm text-gray-400">Atur markup otomatis untuk semua produk di setiap channel.</p>
                            </div>
                         </div>

                         <div className="space-y-4">
                             {channels.map((ch) => (
                                 <div key={ch.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                     <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${ch.bg} ${ch.color}`}>
                                         <ShoppingBag size={20} />
                                     </div>
                                     <div className="flex-1 min-w-0">
                                         <h4 className="font-bold text-white">{ch.name}</h4>
                                         <p className="text-xs text-gray-500">Komisi: {ch.commission}%</p>
                                     </div>
                                     <div className="flex items-center gap-3">
                                         <div className="text-right">
                                             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Markup</p>
                                             <div className="relative w-24">
                                                 <input 
                                                    type="number" 
                                                    defaultValue={20} 
                                                    step="0.1" // Enable Decimal
                                                    className="w-full bg-black/30 border border-white/10 rounded-lg py-1.5 px-2 text-right text-sm font-bold text-white focus:border-orange-500 outline-none" 
                                                 />
                                                 <span className="absolute right-7 top-1.5 text-xs text-gray-500">%</span>
                                             </div>
                                         </div>
                                         <div className="h-8 w-px bg-white/10 mx-2"></div>
                                         <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" defaultChecked className="sr-only peer" />
                                            <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                                        </label>
                                     </div>
                                 </div>
                             ))}
                         </div>
                         
                         <div className="mt-6 flex justify-end">
                             <button className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20 hover:scale-105 transition-transform flex items-center gap-2">
                                 <Save size={18} /> Terapkan Semua
                             </button>
                         </div>
                     </div>
                 </div>

                 {/* Right: Profit Simulator */}
                 <div className="lg:col-span-1">
                     <div className="glass-panel p-6 rounded-3xl h-full border border-orange-500/20 bg-orange-900/5">
                         <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                             <Calculator className="text-orange-400" /> Simulasi
                         </h3>
                         
                         <div className="space-y-6">
                             {/* Input Simulation */}
                             <div className="space-y-2">
                                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Harga Dasar</label>
                                 <div className="relative">
                                     <span className="absolute left-3 top-3 text-gray-500">Rp</span>
                                     <input 
                                        type="number" 
                                        value={simulatorBasePrice}
                                        onChange={(e) => setSimulatorBasePrice(Number(e.target.value))}
                                        step="any"
                                        className="w-full glass-input rounded-xl py-2.5 pl-8 pr-4 font-bold text-white" 
                                     />
                                 </div>
                             </div>

                             <div className="space-y-2">
                                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Markup (%)</label>
                                 <div className="relative">
                                     <input 
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        step="0.5" // Decimal steps
                                        value={globalMarkup}
                                        onChange={(e) => setGlobalMarkup(Number(e.target.value))}
                                        className="w-full accent-orange-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                     />
                                     <div className="flex justify-between mt-1">
                                         <span className="text-xs text-gray-500">0%</span>
                                         <span className="text-sm font-bold text-orange-400">{globalMarkup.toFixed(1)}%</span>
                                         <span className="text-xs text-gray-500">100%</span>
                                     </div>
                                 </div>
                             </div>

                             <div className="p-4 bg-black/20 rounded-2xl border border-white/5 space-y-3 text-sm">
                                 <div className="flex justify-between items-center text-gray-400">
                                     <span>Harga Jual:</span>
                                     <span className="font-bold text-white text-lg"><CompactNumber value={sim.markupPrice} /></span>
                                 </div>
                                 <div className="flex justify-between items-center text-gray-400">
                                     <span>Potongan (~20%):</span>
                                     <span className="font-bold text-red-400">- <CompactNumber value={sim.appFee} /></span>
                                 </div>
                                 <div className="w-full h-px bg-white/10"></div>
                                 <div className="flex justify-between items-center">
                                     <span className="font-bold text-gray-200">Net:</span>
                                     <span className="font-bold text-green-400 text-lg"><CompactNumber value={sim.netReceive} /></span>
                                 </div>
                                 
                                 {/* Analysis Bubble */}
                                 <div className={`p-3 rounded-xl text-xs font-bold text-center border ${sim.marginDiff >= 0 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                     {sim.marginDiff >= 0 
                                        ? <span>AMAN! Untung +<CompactNumber value={sim.marginDiff} /></span> 
                                        : <span>BAHAYA! Rugi -<CompactNumber value={Math.abs(sim.marginDiff)} /></span>
                                     }
                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>
          </div>
      )}

      {/* TAB CONTENT: MENU SYNC */}
      {activeTab === 'sync' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="glass-panel p-6 rounded-3xl border border-white/5 text-center flex flex-col items-center justify-center min-h-[400px]">
                 <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mb-6 text-orange-500">
                     <Repeat size={40} className="animate-spin-slow" />
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-2">Sync Menu & Stok</h3>
                 <p className="text-gray-400 max-w-md">
                     Sinkronisasi otomatis semua perubahan menu, harga, dan stok ke GoFood, GrabFood, ShopeeFood, dan TikTok Shop.
                 </p>
                 <button className="mt-8 px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20 hover:scale-105 transition-transform flex items-center gap-2">
                     <RefreshCw size={20} /> Mulai Sinkronisasi
                 </button>
                 <p className="mt-4 text-xs text-gray-500">Terakhir sinkronisasi: 2 menit yang lalu</p>
             </div>
          </div>
      )}

      {/* TAB CONTENT: REPUTATION */}
      {activeTab === 'reputation' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="glass-panel p-6 rounded-3xl border border-white/5">
                 <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-bold text-white flex items-center gap-2">
                         <Star className="text-yellow-500" /> Ulasan Pelanggan
                     </h3>
                     <div className="flex gap-2">
                         <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-sm font-bold border border-green-500/20">4.8/5.0 Rating</span>
                     </div>
                 </div>
                 
                 <div className="space-y-4">
                     {[
                         { user: 'Budi Santoso', rating: 5, text: 'Makanannya enak banget, pengiriman cepat!', platform: 'GoFood', date: 'Hari ini' },
                         { user: 'Siti Aminah', rating: 4, text: 'Rasanya oke, tapi agak sedikit asin.', platform: 'GrabFood', date: 'Kemarin' },
                         { user: 'Joko Anwar', rating: 5, text: 'Recommended banget! Bakal pesen lagi.', platform: 'ShopeeFood', date: '2 hari lalu' },
                     ].map((review, i) => (
                         <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 flex gap-4">
                             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center font-bold text-white shrink-0">
                                 {review.user.charAt(0)}
                             </div>
                             <div className="flex-1">
                                 <div className="flex justify-between items-start">
                                     <h4 className="font-bold text-white text-sm">{review.user}</h4>
                                     <span className="text-[10px] text-gray-500">{review.date} • {review.platform}</span>
                                 </div>
                                 <div className="flex text-yellow-500 my-1">
                                     {[...Array(review.rating)].map((_, j) => <Star key={j} size={12} fill="currentColor" />)}
                                 </div>
                                 <p className="text-sm text-gray-300">{review.text}</p>
                             </div>
                         </div>
                     ))}
                 </div>
                 <button className="w-full mt-6 py-3 text-sm font-bold text-gray-400 hover:text-white bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                     Lihat Semua Ulasan
                 </button>
             </div>
          </div>
      )}

      {/* TAB CONTENT: CAMPAIGN */}
      {activeTab === 'campaign' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="glass-panel p-6 rounded-3xl border border-white/5 text-center flex flex-col items-center justify-center min-h-[400px]">
                 <div className="w-20 h-20 bg-pink-500/20 rounded-full flex items-center justify-center mb-6 text-pink-500">
                     <Megaphone size={40} />
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-2">Campaign & Promo</h3>
                 <p className="text-gray-400 max-w-md">
                     Buat promo diskon coret, bundling, atau flash sale di semua platform sekaligus.
                 </p>
                 <button className="mt-8 px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-pink-600/20 hover:scale-105 transition-transform flex items-center gap-2">
                     <Plus size={20} /> Buat Campaign Baru
                 </button>
             </div>
          </div>
      )}

    </div>
  );
};

export default Omnichannel;
