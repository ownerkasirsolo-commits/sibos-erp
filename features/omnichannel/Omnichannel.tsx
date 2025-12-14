
import React, { useState } from 'react';
import { 
  Globe, ShoppingBag, MessageCircle, AlertTriangle, 
  RefreshCw, Wifi, WifiOff, Settings, 
  ArrowUpRight, QrCode, Smartphone, DollarSign,
  Monitor, MapPin, Star, Ticket, Tv, Printer, Edit3,
  Layers, Megaphone, Repeat, Search, ThumbsUp, ThumbsDown, Filter,
  Activity, TrendingUp, TrendingDown, Eye, Calculator, Info,
  PieChart, Save, Plus, BarChart2, Share2, Link, ChevronDown, PenTool
} from 'lucide-react';
import CompactNumber from '../../components/common/CompactNumber';
import { useOmnichannelLogic } from './hooks/useOmnichannelLogic';
import ChannelManagerView from './components/views/ChannelManagerView';
import OrderCentralView from './components/views/OrderCentralView';
import ReputationView from './components/views/ReputationView';
import MenuSyncView from './components/views/MenuSyncView';
import ProductMappingView from './components/views/ProductMappingView'; 
import OmniInboxView from './components/views/OmniInboxView'; 
import ContentStudioView from './components/views/ContentStudioView'; // Import Studio
import GlassPanel from '../../components/common/GlassPanel';

const Omnichannel: React.FC = () => {
  const { 
      activeTab, setActiveTab,
      isPanicMode, handlePanicMode,
      simulatorBasePrice, setSimulatorBasePrice, calculateSimulation,
      // Data
      stats, reviewStats,
      reviews, syncHistory, incomingOrders, handleAcceptOrder,
      unlinkedProducts, handleLinkProduct, handleAutoMapAll,
      // Inbox Data
      conversations, activeConversation, setActiveConversationId, handleSendMessage, handleGenerateAiReply, aiReplyDraft, setAiReplyDraft, isGeneratingReply
  } = useOmnichannelLogic();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* 1. TOP HEADER: GLOBAL STATUS (THE PULSE) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <GlassPanel className="p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between border-l-4 border-l-green-500 gap-2">
              <div>
                  <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-wider">Status Toko</p>
                  <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                      <Wifi size={18} className="text-green-500" /> {stats.activeCount} Online
                  </h3>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 animate-pulse self-end md:self-auto">
                  <Activity size={16} />
              </div>
          </GlassPanel>

          <GlassPanel className="p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-2">
               <div>
                  <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-wider">Pending</p>
                  <h3 className="text-base md:text-lg font-bold text-white">{stats.pendingOrders} Order</h3>
              </div>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center self-end md:self-auto ${stats.pendingOrders > 0 ? 'bg-orange-500 text-white animate-bounce' : 'bg-white/10 text-gray-400'}`}>
                  <ShoppingBag size={16} />
              </div>
          </GlassPanel>

          <GlassPanel className="p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-2">
               <div>
                  <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-wider">Omset Channel</p>
                  <h3 className="text-base md:text-lg font-bold text-white"><CompactNumber value={stats.totalRevenue} /></h3>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center self-end md:self-auto">
                  <TrendingUp size={16} />
              </div>
          </GlassPanel>

          {/* PANIC BUTTON (SAFETY) */}
          <button 
              onClick={handlePanicMode}
              className={`p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between transition-all border-2 gap-2 ${isPanicMode ? 'bg-red-600 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]' : 'bg-red-900/10 border-red-500/30 text-red-500 hover:bg-red-900/30'}`}
          >
               <div className="text-left">
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Emergency</p>
                  <h3 className="text-sm font-bold">{isPanicMode ? 'PANIC ON' : 'TUTUP SEMUA'}</h3>
              </div>
              <AlertTriangle size={20} className={`self-end md:self-auto ${isPanicMode ? 'animate-ping' : ''}`} />
          </button>
      </div>

      {/* 2. MAIN NAVIGATION (PILLS - Separated by Context) */}
      <div className="flex flex-col md:flex-row gap-6">
          
          {/* SIDEBAR NAVIGATION */}
          <div className="w-full md:w-64 flex-shrink-0 space-y-6">
              
              {/* MOBILE DROPDOWN */}
              <div className="md:hidden relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
                     <Globe size={18} />
                  </div>
                  <select 
                      value={activeTab}
                      onChange={(e) => setActiveTab(e.target.value as any)}
                      className="w-full appearance-none bg-[#1e293b] text-white py-3 pl-10 pr-10 rounded-xl font-bold text-sm outline-none border border-white/20 focus:border-orange-500 relative z-0"
                  >
                      <option value="commerce">Channel Manager</option>
                      <option value="orders">Order Central</option>
                      <option value="inbox">Inbox Pelanggan</option>
                      <option value="mapping">Product Mapping</option>
                      <option value="sync">Menu Sync</option>
                      <option value="content">Content Studio</option>
                      <option value="reputation">Reputasi & Review</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={18} />
              </div>

              {/* DESKTOP SIDEBAR */}
              <div className="hidden md:block space-y-6">
                  <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Commerce (Jualan)</h4>
                      <div className="space-y-1">
                          <button 
                              onClick={() => setActiveTab('commerce')}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'commerce' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                          >
                              <Globe size={18} /> Channel Manager
                          </button>
                          <button 
                              onClick={() => setActiveTab('orders')}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'orders' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                          >
                              <ShoppingBag size={18} /> Order Central
                          </button>
                          <button 
                              onClick={() => setActiveTab('inbox')}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'inbox' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                          >
                              <MessageCircle size={18} /> Inbox Pelanggan
                              <span className="ml-auto bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold">3</span>
                          </button>
                          <button 
                              onClick={() => setActiveTab('mapping')}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'mapping' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                          >
                              <Link size={18} /> Product Mapping
                              {unlinkedProducts.length > 0 && <span className="ml-auto bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold">{unlinkedProducts.length}</span>}
                          </button>
                           <button 
                              onClick={() => setActiveTab('sync')}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'sync' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                          >
                              <RefreshCw size={18} /> Menu Sync
                          </button>
                      </div>
                  </div>

                  <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Engagement</h4>
                      <div className="space-y-1">
                          <button 
                              onClick={() => setActiveTab('content')}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'content' ? 'bg-pink-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                          >
                              <PenTool size={18} /> Content Studio
                          </button>
                          <button 
                              onClick={() => setActiveTab('reputation')}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'reputation' ? 'bg-pink-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                          >
                              <Star size={18} /> Reputasi & Review
                          </button>
                      </div>
                  </div>
              </div>
          </div>

          {/* 3. CONTENT AREA (DYNAMIC VIEW) */}
          <div className="flex-1 min-w-0">
              {activeTab === 'commerce' && (
                  <ChannelManagerView 
                      isPanicMode={isPanicMode}
                      handlePanicMode={handlePanicMode}
                      simulatorBasePrice={simulatorBasePrice}
                      setSimulatorBasePrice={setSimulatorBasePrice}
                      calculateSimulation={calculateSimulation}
                  />
              )}

              {activeTab === 'orders' && (
                  <OrderCentralView 
                      orders={incomingOrders}
                      onAccept={handleAcceptOrder}
                  />
              )}

              {activeTab === 'inbox' && (
                  <OmniInboxView 
                      conversations={conversations}
                      activeConversation={activeConversation}
                      onSelectConversation={setActiveConversationId}
                      onSendMessage={handleSendMessage}
                      onGenerateReply={handleGenerateAiReply}
                      aiReplyDraft={aiReplyDraft}
                      setAiReplyDraft={setAiReplyDraft}
                      isGeneratingReply={isGeneratingReply}
                  />
              )}

              {activeTab === 'mapping' && (
                  <ProductMappingView 
                      unlinkedProducts={unlinkedProducts}
                      onLink={handleLinkProduct}
                      onAutoMap={handleAutoMapAll}
                  />
              )}

              {activeTab === 'sync' && (
                  <MenuSyncView syncHistory={syncHistory} />
              )}
              
              {/* Content Studio Integrated Here */}
              {activeTab === 'content' && (
                  <ContentStudioView />
              )}

              {activeTab === 'reputation' && (
                  <ReputationView 
                      reviews={reviews} 
                      rating={reviewStats.rating} 
                      total={reviewStats.total}
                  />
              )}
          </div>
      </div>
    </div>
  );
};

export default Omnichannel;
