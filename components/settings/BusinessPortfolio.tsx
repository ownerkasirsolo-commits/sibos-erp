

import React, { useState } from 'react';
import { Building2, Plus, Store, ChevronRight, ChevronDown, MapPin, Briefcase, ArrowLeft } from 'lucide-react';
// @FIX: Import BusinessConfig from its new location in features/irm/types.
import { BusinessType } from '../../types';
import { BusinessConfig } from '../../features/irm/types';
import GeneralBusinessSettings from './GeneralBusinessSettings';
import OutletManager from './OutletManager';
import { MOCK_BUSINESSES } from '../../constants'; // Use centralized mock data

const BusinessPortfolio: React.FC = () => {
  const [expandedBusinessId, setExpandedBusinessId] = useState<string | null>(MOCK_BUSINESSES[0].id);
  const [selectedOutletId, setSelectedOutletId] = useState<string | null>(null);
  const [isCreatingBusiness, setIsCreatingBusiness] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'editor'>('list');

  const handleBusinessClick = (bizId: string) => {
    // If clicking the already expanded business, just ensure we show business settings (deselect outlet)
    if (expandedBusinessId === bizId) {
        setSelectedOutletId(null);
    } else {
        // Expand the new business and show its settings
        setExpandedBusinessId(bizId);
        setSelectedOutletId(null);
    }
    setIsCreatingBusiness(false);
    setMobileView('editor'); // Switch to editor on mobile
  };

  const handleOutletClick = (e: React.MouseEvent, outletId: string) => {
    e.stopPropagation(); // Prevent triggering business click
    setSelectedOutletId(outletId);
    setIsCreatingBusiness(false);
    setMobileView('editor'); // Switch to editor on mobile
  };

  const handleCreateBusiness = () => {
    setExpandedBusinessId(null);
    setSelectedOutletId(null);
    setIsCreatingBusiness(true);
    setMobileView('editor'); // Switch to editor on mobile
  }

  // Determine what to show in the right column
  const activeBusiness = MOCK_BUSINESSES.find(b => b.id === expandedBusinessId);
  const activeOutlet = activeBusiness?.outlets.find(o => o.id === selectedOutletId);

  return (
    <div className={`flex flex-col lg:grid lg:grid-cols-12 gap-6 animate-in fade-in duration-300 relative ${mobileView === 'list' ? '' : 'h-auto'}`}>
      
      {/* LEFT COLUMN: NAVIGATION & SELECTION */}
      <div className={`col-span-12 lg:col-span-4 flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar transition-all duration-300
          ${mobileView === 'editor' ? 'hidden lg:flex' : 'flex'}
          lg:h-[calc(100vh-180px)]
      `}>
        
        {/* 1. Add Business Button */}
        <button 
            onClick={handleCreateBusiness}
            className={`w-full py-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-200 group ${isCreatingBusiness ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700 hover:border-orange-500/50 hover:bg-white/5'}`}
        >
             <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isCreatingBusiness ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-400 group-hover:bg-orange-500/20 group-hover:text-orange-400'}`}>
               <Plus size={20} />
             </div>
             <span className={`text-sm font-bold ${isCreatingBusiness ? 'text-orange-400' : 'text-gray-400 group-hover:text-gray-200'}`}>Tambah Bisnis Baru</span>
        </button>

        {/* 2. Business List */}
        <div className="space-y-3">
            {MOCK_BUSINESSES.map((biz) => {
                const isExpanded = expandedBusinessId === biz.id;
                const isBusinessSelected = isExpanded && selectedOutletId === null;

                return (
                    <div key={biz.id} className={`space-y-2 ${!biz.active ? 'opacity-60' : ''}`}>
                        {/* Business Card */}
                        <div 
                            onClick={() => handleBusinessClick(biz.id)}
                            className={`glass-panel p-4 rounded-2xl cursor-pointer transition-all duration-200 border relative overflow-hidden ${isBusinessSelected ? 'border-orange-500 shadow-[0_0_20px_-10px_rgba(249,115,22,0.5)] bg-orange-500/5' : 'border-transparent hover:border-white/10 hover:bg-white/5'}`}
                        >
                            {isBusinessSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>}
                            
                            <div className="flex items-center gap-4">
                                <img src={biz.logo} alt={biz.name} className="w-12 h-12 rounded-xl object-cover bg-gray-800" />
                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-bold text-sm truncate ${isBusinessSelected ? 'text-white' : 'text-gray-300'}`}>{biz.name}</h4>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs text-gray-500">{biz.type}</p>
                                        {!biz.active && <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded uppercase font-bold">Non-aktif</span>}
                                    </div>
                                </div>
                                {isExpanded ? <ChevronDown size={18} className="text-orange-500" /> : <ChevronRight size={18} className="text-gray-600" />}
                            </div>
                        </div>

                        {/* Accordion Content (Outlets) */}
                        {isExpanded && (
                            <div className="pl-6 space-y-2 animate-in slide-in-from-top-2 duration-200">
                                {/* Add Outlet Button */}
                                <button className="w-full py-2.5 flex items-center gap-3 px-4 rounded-xl border border-dashed border-gray-700 text-gray-500 hover:text-orange-400 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all text-xs font-bold group">
                                    <Plus size={14} className="group-hover:rotate-90 transition-transform"/>
                                    <span>Tambah Outlet Baru</span>
                                </button>

                                {/* Outlet List */}
                                {biz.outlets.map(outlet => {
                                    const isOutletActive = selectedOutletId === outlet.id;
                                    return (
                                        <div 
                                            key={outlet.id}
                                            onClick={(e) => handleOutletClick(e, outlet.id)}
                                            className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${isOutletActive ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-gray-200'}`}
                                        >
                                            <Store size={16} className={isOutletActive ? 'text-orange-500' : 'text-gray-500'} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center">
                                                    <p className="text-xs font-bold truncate">{outlet.name}</p>
                                                    {outlet.active && <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></span>}
                                                </div>
                                                <p className="text-[10px] text-gray-600 truncate flex items-center gap-1">
                                                    <MapPin size={8} /> {outlet.address}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      </div>

      {/* RIGHT COLUMN: EDITOR & SETTINGS */}
      <div className={`col-span-12 lg:col-span-8 overflow-y-auto custom-scrollbar glass-panel rounded-3xl p-1 bg-black/20 transition-all duration-300
          ${mobileView === 'list' ? 'hidden lg:block' : 'block'}
          lg:h-[calc(100vh-180px)]
      `}>
         
         {/* Mobile Back Button */}
         <div className="lg:hidden p-4 border-b border-white/5 flex items-center gap-3 text-gray-400 hover:text-white cursor-pointer bg-white/5 mb-2" onClick={() => setMobileView('list')}>
            <ArrowLeft size={18} />
            <span className="text-sm font-bold">Kembali ke Daftar Bisnis</span>
         </div>

         {isCreatingBusiness ? (
             <div className="h-full flex flex-col items-center justify-center text-center p-8">
                 <div className="w-20 h-20 rounded-3xl bg-orange-500/10 flex items-center justify-center mb-4 border border-dashed border-orange-500/30">
                     <Plus size={40} className="text-orange-500" />
                 </div>
                 <h3 className="text-xl font-bold text-white">Mulai Bisnis Baru</h3>
                 <p className="text-gray-400 text-sm mt-2 max-w-md">Siapkan entitas bisnis baru Anda. Tentukan nama, logo, dan kategori usaha (F&B, Ritel, Jasa, dll).</p>
                 <button className="mt-6 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">
                     Isi Formulir Bisnis
                 </button>
             </div>
         ) : activeBusiness ? (
             selectedOutletId && activeOutlet ? (
                 // RENDER OUTLET SETTINGS
                 <div className="h-full p-3 md:p-6 animate-in fade-in zoom-in-95 duration-200">
                     <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-500">
                            <Store size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">{activeOutlet.name}</h3>
                            <p className="text-xs text-gray-400">Pengaturan Operasional Outlet</p>
                        </div>
                        {activeOutlet.active && (
                            <span className="ml-auto px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-lg border border-green-500/20">
                                STATUS: AKTIF
                            </span>
                        )}
                     </div>
                     <OutletManager />
                 </div>
             ) : (
                 // RENDER BUSINESS SETTINGS
                 <div className="h-full p-4 md:p-6 animate-in fade-in zoom-in-95 duration-200">
                     <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <Briefcase size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Pengaturan Bisnis: {activeBusiness.name}</h3>
                            <p className="text-xs text-gray-400">Identitas Brand & Konfigurasi Global</p>
                        </div>
                     </div>
                     <GeneralBusinessSettings 
                        businessConfig={{
                            name: activeBusiness.name,
                            type: activeBusiness.type,
                            currency: 'IDR'
                        }} 
                     />
                 </div>
             )
         ) : (
             <div className="h-full flex items-center justify-center text-gray-500">
                 Pilih bisnis untuk dikelola
             </div>
         )}
      </div>
    </div>
  );
};

export default BusinessPortfolio;