
import React, { useState } from 'react';
import { SalesChannel, SalesChannelType } from '../../types';
import { Bike, Power, Calculator, Info, ShoppingBag, Settings, MoreHorizontal, Video, TrendingUp, ShoppingCart, RefreshCw, Plus, Globe, Megaphone, Lock, Clock, Laptop, Tag, MessageCircle, Database } from 'lucide-react';
import GlassPanel from '../../../../components/common/GlassPanel';
import CompactNumber from '../../../../components/common/CompactNumber';
import { useChannelLogic } from '../../hooks/useChannelLogic';
import ChannelSettingsModal from '../modals/ChannelSettingsModal';
import AddChannelModal from '../modals/AddChannelModal';

interface ChannelManagerViewProps {
    isPanicMode: boolean;
    handlePanicMode: () => void;
    simulatorBasePrice?: number;
    setSimulatorBasePrice?: (val: number) => void;
    calculateSimulation?: (markup: number) => any;
}

const ChannelManagerView: React.FC<ChannelManagerViewProps> = ({ isPanicMode }) => {
  const { 
      channels, 
      foodChannels,
      marketChannels,
      socialChannels,
      toggleStatus, 
      updateConfig,
      handleBulkStatus,
      addChannel
  } = useChannelLogic();

  // Local State
  const [selectedChannel, setSelectedChannel] = useState<SalesChannel | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleOpenSettings = (channel: SalesChannel) => {
      setSelectedChannel(channel);
      setIsSettingsOpen(true);
  };

  const handleSaveSettings = (id: string, config: any) => {
      Object.entries(config).forEach(([key, val]) => {
          updateConfig(id, key as keyof SalesChannel, val);
      });
  };

  const handleAddChannel = (platform: any) => {
      // Mock implementation
      alert("Fitur tambah channel manual sedang dalam pemeliharaan.");
      setIsAddModalOpen(false);
  };

  const renderChannelCard = (channel: SalesChannel) => {
      const isComingSoon = channel.status === 'Maintenance';
      const isConnected = channel.connected;
      const isOpen = channel.status === 'Open';
      const performance = channel.performance || { todayRevenue: 0, todayOrders: 0, rating: 0 };
      
      // Icon Logic
      let Icon = ShoppingBag;
      if (channel.id.includes('tiktok')) Icon = Video;
      else if (channel.type === 'food_delivery') Icon = Bike;
      else if (channel.id === 'google_shopping') Icon = Tag; 

      return (
          <GlassPanel key={channel.id} className={`p-0 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 border relative ${isComingSoon ? 'border-white/5 bg-white/5 opacity-70' : (isOpen ? 'border-white/10 bg-[#0f172a] hover:shadow-lg' : 'border-white/5 bg-[#0f172a]/50')}`}>
              
              {/* Coming Soon Overlay */}
              {isComingSoon && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] z-20 flex flex-col items-center justify-center text-center p-4">
                      <div className="bg-white/10 p-3 rounded-full mb-2">
                          <Lock size={24} className="text-gray-400" />
                      </div>
                      <h4 className="font-bold text-white text-sm uppercase tracking-wider">Coming Soon</h4>
                      <p className="text-[10px] text-gray-400 mt-1">Integrasi {channel.name} sedang dikembangkan.</p>
                      <button className="mt-3 px-4 py-1.5 bg-orange-600/20 text-orange-400 border border-orange-600/30 rounded-lg text-[10px] font-bold">
                          Notify Me
                      </button>
                  </div>
              )}

              {/* Header */}
              <div className="p-3 md:p-4 flex flex-col sm:flex-row justify-between items-start border-b border-white/5 bg-white/[0.02] gap-2 sm:gap-0">
                  <div className="flex items-center gap-2 md:gap-3">
                      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0 ${channel.bg} ${channel.color}`}>
                          <Icon size={16} className="md:w-5 md:h-5" />
                      </div>
                      <div className="min-w-0">
                          <h4 className="font-bold text-white text-xs md:text-sm truncate">{channel.name}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                              <span className="text-[9px] md:text-[10px] text-gray-400">{isConnected ? 'Terhubung' : 'Terputus'}</span>
                          </div>
                      </div>
                  </div>
                  
                  {/* Toggle Switch (Hidden if Coming Soon) */}
                  {!isComingSoon && (
                      <button 
                          onClick={() => toggleStatus(channel.id)}
                          className={`relative w-9 h-5 md:w-11 md:h-6 rounded-full transition-colors duration-300 self-end sm:self-auto ${isOpen ? 'bg-green-500' : 'bg-gray-700'}`}
                          title={isOpen ? "Tutup Toko" : "Buka Toko"}
                      >
                          <div className={`absolute top-0.5 left-0.5 md:top-1 md:left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-md ${isOpen ? 'translate-x-4 md:translate-x-5' : 'translate-x-0'}`}></div>
                      </button>
                  )}
              </div>

              {/* Body: Metrics */}
              <div className="flex-1 p-3 md:p-4 grid grid-cols-1 gap-3">
                  <div className="grid grid-cols-2 gap-2">
                      <div>
                          <p className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase mb-0.5">Omset</p>
                          <p className={`font-bold text-sm md:text-lg ${performance.todayRevenue > 0 ? 'text-white' : 'text-gray-600'}`}>
                              <CompactNumber value={performance.todayRevenue} />
                          </p>
                      </div>
                      <div>
                          <p className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase mb-0.5">Order</p>
                          <p className={`font-bold text-sm md:text-lg ${performance.todayOrders > 0 ? 'text-white' : 'text-gray-600'}`}>
                              {performance.todayOrders}
                          </p>
                      </div>
                  </div>
              </div>

              {/* Footer: Actions */}
              <div className="p-2 bg-black/20 flex gap-2">
                  <button 
                      onClick={() => !isComingSoon && handleOpenSettings(channel)}
                      disabled={isComingSoon}
                      className="flex-1 py-1.5 md:py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[10px] md:text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                      <Settings size={12} className="md:w-3.5 md:h-3.5" /> Konfigurasi
                  </button>
              </div>
          </GlassPanel>
      );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
            <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Globe size={20} className="text-blue-500" /> Integrasi Kanal
                </h2>
                <p className="text-sm text-gray-400">Pusat kontrol integrasi. Hubungkan akun untuk sinkronisasi data.</p>
            </div>
            <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold border border-white/10 transition-all w-full sm:w-auto justify-center"
            >
                <Plus size={18} /> Tambah Kanal
            </button>
        </div>

        {/* SECTION 1: ENGAGEMENT CHANNELS (PRIORITY) */}
        <div>
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-pink-500/20 text-pink-500 rounded-xl">
                    <MessageCircle size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Social & Messaging <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded ml-2 uppercase font-bold">Sync Only</span></h3>
                    <p className="text-xs text-gray-400">Kanal ini hanya untuk <b>balas chat (Inbox)</b> dan <b>sync katalog produk</b>. Untuk posting konten, gunakan menu <b>Pusat Pemasaran</b>.</p>
                </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                 {/* Google Business Special Card */}
                 {channels.filter(c => c.id === 'google').map(google => (
                     <GlassPanel key={google.id} className="p-0 rounded-2xl overflow-hidden flex flex-col border border-blue-500/30 bg-blue-900/10 hover:shadow-lg transition-all">
                         <div className="p-4 border-b border-white/5 flex justify-between items-center">
                             <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-2">
                                     <img src="https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Business_Profile_Logo.svg" alt="G" className="w-full h-full object-contain"/>
                                 </div>
                                 <div>
                                     <h4 className="font-bold text-white text-sm">Google Business</h4>
                                     <p className="text-[10px] text-green-400 font-bold">Verified • Connected</p>
                                 </div>
                             </div>
                             <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                         </div>
                         <div className="p-4 flex-1">
                             <p className="text-xs text-blue-200 mb-3">
                                 Integrasi aktif untuk:
                             </p>
                             <ul className="text-xs text-gray-400 space-y-1 mb-4 list-disc pl-4">
                                <li>Balas Ulasan (Review)</li>
                                <li>Update Jam Buka/Tutup</li>
                                <li>Sync Info Lokasi</li>
                             </ul>
                             <button onClick={() => handleOpenSettings(google)} className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors">
                                 Kelola Profil
                             </button>
                         </div>
                     </GlassPanel>
                 ))}

                 {/* Social Media Cards */}
                 {socialChannels.filter(c => c.id !== 'google').map(channel => (
                     <GlassPanel key={channel.id} className="p-0 rounded-2xl overflow-hidden flex flex-col border border-white/10 bg-[#0f172a] hover:border-pink-500/30 transition-all">
                         <div className="p-4 border-b border-white/5 flex justify-between items-center">
                             <div className="flex items-center gap-3">
                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${channel.bg} ${channel.color}`}>
                                     <Globe size={20} />
                                 </div>
                                 <div>
                                     <h4 className="font-bold text-white text-sm">{channel.name}</h4>
                                     <p className="text-[10px] text-gray-400">
                                         {channel.followers ? <CompactNumber value={channel.followers} currency={false}/> : 0} Followers
                                     </p>
                                 </div>
                             </div>
                             <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                         </div>
                         <div className="p-4 flex-1 flex flex-col justify-end">
                             <div className="text-xs text-gray-400 mb-3 space-y-1">
                                <p className="flex items-center gap-2"><MessageCircle size={12}/> Tarik Chat ke Inbox</p>
                                <p className="flex items-center gap-2"><Database size={12}/> Sync Katalog Toko</p>
                             </div>
                             <div className="flex gap-2">
                                 <button onClick={() => handleOpenSettings(channel)} className="w-full py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-xs font-bold border border-white/5 transition-colors">
                                     Konfigurasi Chat
                                 </button>
                             </div>
                         </div>
                     </GlassPanel>
                 ))}
                 
                 {/* Website Card (Active) */}
                 {marketChannels.filter(c => c.id === 'website').map(renderChannelCard)}
            </div>
        </div>

        {/* SECTION 2: SALES CHANNELS (TRANSACTIONAL) */}
        <div>
            <div className="flex items-center gap-3 mb-4 pt-6 border-t border-white/5">
                <div className="p-2.5 bg-green-500/20 text-green-400 rounded-xl">
                    <ShoppingCart size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-300">Sales Channel (Marketplace & Food)</h3>
                    <p className="text-xs text-gray-500">Integrasi stok dan order otomatis.</p>
                </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {/* RENDER GOOGLE SHOPPING HERE if enabled */}
                {marketChannels.filter(c => c.id !== 'website').map(renderChannelCard)}
                {foodChannels.map(renderChannelCard)}
            </div>
        </div>

        {/* SETTINGS MODAL */}
        <ChannelSettingsModal 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)} 
            channel={selectedChannel}
            onSave={handleSaveSettings}
        />

        {/* ADD CHANNEL MODAL */}
        <AddChannelModal 
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAddChannel={handleAddChannel}
            existingChannelIds={channels.map(c => c.id)}
        />

    </div>
  );
};

export default ChannelManagerView;
