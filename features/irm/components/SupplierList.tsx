
import React, { useRef, useState, useMemo } from 'react';
import { Supplier } from '../types';
import { MessageCircle, Network, Plus, Search, Globe, Star, ShieldCheck, Filter, Upload, Download, FileBarChart, ChevronUp, ChevronDown, ChevronsLeft, ChevronsRight, Building2, Store, Users, MoreHorizontal } from 'lucide-react';
import { useSupplierLogic } from '../hooks/useSupplierLogic';
import GlassInput from '../../../components/common/GlassInput';
import GlassSelect from '../../../components/common/GlassSelect';
import UniversalChatWidget from '../../../features/communication/components/UniversalChatWidget';
import { useChatSystem } from '../../../features/communication/hooks/useChatSystem';
import { ChatContact } from '../../../features/communication/types';
import SupplierDirectoryModal from './modals/SupplierDirectoryModal';
import SupplierReportModal from './modals/SupplierReportModal'; 
import LiveLogPanel from '../../../components/common/LiveLogPanel'; 
import GlassPanel from '../../../components/common/GlassPanel';
import StatWidget from '../../../components/common/StatWidget'; 

const SupplierList: React.FC = () => {
  const {
      suppliers,
      totalSuppliersCount,
      categories,
      availableBusinesses,
      activeBusinessId,
      stats,
      
      searchTerm, setSearchTerm,
      filterCategory, setFilterCategory,
      filterType, setFilterType,
      filterScore, setFilterScore, 
      sortConfig,
      currentPage, setCurrentPage,
      totalPages,

      isQuickAddSupplierOpen, setIsQuickAddSupplierOpen,
      isDirectoryOpen, setIsDirectoryOpen,
      isReportModalOpen, setIsReportModalOpen,
      isLiveLogOpen, setIsLiveLogOpen,
      liveLogs,

      handleSort,
      handleExportCSV,
      handleImportCSV,
      addSupplier
  } = useSupplierLogic();
  
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [quickSupName, setQuickSupName] = useState('');
  const [quickSupContact, setQuickSupContact] = useState('');
  const [quickSupPhone, setQuickSupPhone] = useState('');
  const [quickSupCategory, setQuickSupCategory] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -- CHAT INTEGRATION --
  const chatContacts: ChatContact[] = suppliers.map(s => ({
        id: s.id,
        name: s.name,
        role: s.category,
        type: s.isSibosNetwork ? 'internal' : 'external',
        isOnline: true,
        phone: s.phone
    }));

  const chatSystem = useChatSystem(chatContacts);

  const handleContactSupplier = (supplierId: string) => {
      const contact = chatContacts.find(c => c.id === supplierId);
      if (contact) {
          chatSystem.handleOpen();
          chatSystem.handleSelectContact(contact);
      }
  };

  const handleAddFromDirectory = (biz: any) => {
      const newSupplier: Supplier = {
          id: `SUP-${Date.now()}`,
          name: biz.name,
          contact: 'Admin System', 
          phone: 'Terhubung via App',
          category: biz.type === 'RETAIL' ? 'Grosir & Ritel' : 'Mitra B2B',
          isSibosNetwork: true,
          performanceScore: 100 
      };
      addSupplier(newSupplier);
      alert(`Berhasil terhubung dengan ${biz.name}!`);
      setIsDirectoryOpen(false);
  };

  const handleSaveQuickSupplier = () => {
      if (!quickSupName) return;
      const newSupplier: Supplier = {
          id: `SUP-${Date.now()}`,
          name: quickSupName,
          contact: quickSupContact || 'Admin',
          phone: quickSupPhone || '-',
          category: quickSupCategory || 'Umum',
          isSibosNetwork: false,
          performanceScore: 100 
      };
      addSupplier(newSupplier);
      setIsQuickAddSupplierOpen(false);
      setQuickSupName(''); setQuickSupContact(''); setQuickSupPhone('');
  };

  const currentSupplierNames = useMemo(() => suppliers.map(s => s.name), [suppliers]);

  const getScoreColor = (score: number) => {
      if (score >= 90) return 'text-green-400 bg-green-500/10 border-green-500/20';
      if (score >= 70) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      if (score >= 50) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-right-4 relative">
       
       {/* LEFT COLUMN: LIST TABLE (9/12) */}
       <div className="lg:col-span-9 flex flex-col gap-4">
           
           {/* HEADER TOOLBAR */}
           <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-4">
                
                {/* Title Section (Matching StockList Structure) */}
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            Database Supplier
                            <button 
                                onClick={() => setIsLiveLogOpen(true)}
                                className={`p-1.5 rounded-lg transition-colors animate-pulse ${isLiveLogOpen ? 'bg-orange-500 text-white' : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white'}`}
                                title="Live Activity Log"
                            >
                                <FileBarChart size={16} />
                            </button>
                        </h2>
                        <p className="text-xs text-gray-400 mt-1">Total {totalSuppliersCount} mitra aktif terdaftar.</p>
                    </div>
                </div>

                {/* Toolbar Actions */}
                <div className="flex flex-col sm:flex-row gap-2">
                    <GlassInput 
                        icon={Search} 
                        placeholder="Cari nama, kontak..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="py-2.5 text-sm"
                        wrapperClassName="flex-1"
                    />
                    
                    <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                        <button 
                            onClick={() => setIsReportModalOpen(true)}
                            className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl border border-white/5 transition-colors" 
                            title="Laporan"
                        >
                            <FileBarChart size={18} />
                        </button>

                        <button 
                            onClick={handleExportCSV}
                            className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl border border-white/5 transition-colors" 
                            title="Export CSV"
                        >
                            <Upload size={18} />
                        </button>
                        
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl border border-white/5 transition-colors" 
                            title="Import CSV"
                        >
                            <Download size={18} />
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleImportCSV} />

                        <button 
                            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                            className={`p-2.5 px-4 rounded-xl border flex items-center gap-2 text-sm font-bold transition-colors ${isFilterExpanded ? 'bg-orange-600 text-white border-orange-600' : 'bg-white/5 text-gray-300 border-white/5 hover:bg-white/10'}`}
                        >
                            <Filter size={18} /> <span className="hidden sm:inline">Filter</span>
                        </button>

                        <button 
                            onClick={() => setIsDirectoryOpen(true)} 
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-blue-500/20 whitespace-nowrap border border-blue-500/50"
                        >
                            <Globe size={18} /> <span className="hidden lg:inline">Direktori</span>
                        </button>

                        <button 
                            onClick={() => setIsQuickAddSupplierOpen(true)} 
                            className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg whitespace-nowrap"
                        >
                            <Plus size={18} /> <span className="hidden lg:inline">Baru</span>
                        </button>
                    </div>
                </div>

                {/* EXPANDABLE FILTER PANEL */}
                {isFilterExpanded && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10 animate-in slide-in-from-top-2">
                        <GlassSelect
                            label="Kategori"
                            value={filterCategory}
                            onChange={e => setFilterCategory(e.target.value)}
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </GlassSelect>
                        
                        <GlassSelect
                            label="Tipe Kemitraan"
                            value={filterType}
                            onChange={e => setFilterType(e.target.value as any)}
                        >
                            <option value="All">Semua Tipe</option>
                            <option value="Network">SIBOS Network (B2B)</option>
                            <option value="Regular">Supplier Biasa</option>
                        </GlassSelect>
                        
                        <GlassSelect
                            label="Performa / Skor"
                            value={filterScore}
                            onChange={e => setFilterScore(e.target.value as any)}
                        >
                            <option value="All">Semua Skor</option>
                            <option value="Excellent">Excellent (&gt; 90)</option>
                            <option value="Good">Good (70-90)</option>
                            <option value="Poor">Poor (&lt; 70)</option>
                        </GlassSelect>
                    </div>
                )}
           </div>

           {/* SUPPLIER TABLE LIST */}
           <div className="overflow-x-auto rounded-2xl border border-white/5 bg-black/20">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                   <th className="p-4 rounded-tl-2xl">
                     <button onClick={() => handleSort('name')} className="flex items-center gap-1">
                       Nama Supplier {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}
                     </button>
                   </th>
                   <th className="p-4">Kategori</th>
                   <th className="p-4">Kontak</th>
                   <th className="p-4 text-center">
                     <button onClick={() => handleSort('performanceScore')} className="flex items-center gap-1 justify-center">
                       Skor {sortConfig.key === 'performanceScore' && (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}
                     </button>
                   </th>
                   <th className="p-4 text-center">Tipe</th>
                   <th className="p-4 rounded-tr-2xl text-right">Aksi</th>
                 </tr>
               </thead>
               <tbody className="text-sm text-gray-300">
                 {suppliers.map((sup) => {
                   const score = sup.performanceScore ?? 100;
                   return (
                     <tr key={sup.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                       <td className="p-4 font-bold text-white">{sup.name}</td>
                       <td className="p-4"><span className="bg-white/5 text-gray-400 px-2 py-1 rounded-lg text-xs border border-white/5">{sup.category}</span></td>
                       <td className="p-4">
                           <div className="flex flex-col">
                               <span className="text-xs text-gray-300">{sup.contact}</span>
                               <span className="text-[10px] text-gray-500">{sup.phone}</span>
                           </div>
                       </td>
                       <td className="p-4 text-center">
                           <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getScoreColor(score)}`}>
                               {score}
                           </span>
                       </td>
                       <td className="p-4 text-center">
                           {sup.isSibosNetwork ? (
                               <span className="inline-flex items-center justify-center gap-1 text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">
                                   <Network size={10} /> Network
                               </span>
                           ) : (
                               <span className="text-[10px] text-gray-500">Regular</span>
                           )}
                       </td>
                       <td className="p-4 text-right">
                           <div className="flex items-center justify-end gap-2">
                               <button 
                                    onClick={() => handleContactSupplier(sup.id)} 
                                    className={`p-2 rounded-lg transition-colors hover:text-white ${sup.isSibosNetwork ? 'text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500' : 'text-green-400 bg-green-500/10 hover:bg-green-500'}`}
                                    title="Hubungi"
                               >
                                   <MessageCircle size={16}/>
                               </button>
                               <button className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                                   <MoreHorizontal size={16} />
                               </button>
                           </div>
                       </td>
                     </tr>
                   )
                 })}
               </tbody>
             </table>
           </div>
           
           {/* PAGINATION */}
           <div className="flex justify-between items-center text-sm text-gray-400 px-2">
                <p>Menampilkan {suppliers.length} dari {totalSuppliersCount} supplier</p>
                <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 rounded-lg bg-white/5 disabled:opacity-50"><ChevronsLeft size={16}/></button>
                    <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="p-2 rounded-lg bg-white/5 disabled:opacity-50"><ChevronUp size={16} className="-rotate-90"/></button>
                    <span className="font-bold text-white">{currentPage} / {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-white/5 disabled:opacity-50"><ChevronDown size={16} className="-rotate-90"/></button>
                    <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-white/5 disabled:opacity-50"><ChevronsRight size={16}/></button>
                </div>
           </div>
           
           {suppliers.length === 0 && (
               <div className="text-center py-20 text-gray-500 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                   <Users size={48} className="mx-auto mb-4 opacity-20" />
                   <p>Tidak ada supplier ditemukan.</p>
               </div>
           )}
       </div>

       {/* RIGHT COLUMN: SUMMARY & WIDGETS (3/12) */}
       <div className="lg:col-span-3 flex flex-col gap-6">
           
           {/* Summary Stats */}
           <GlassPanel className="p-5 rounded-2xl border border-white/5">
               <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Ringkasan Mitra</h4>
               <div className="space-y-3">
                   <StatWidget 
                        label="Total Supplier" 
                        value={stats.total} 
                        icon={Building2} 
                        colorClass="text-blue-400" 
                   />
                   <StatWidget 
                        label="Network B2B" 
                        value={stats.network} 
                        icon={Network} 
                        colorClass="text-cyan-400" 
                        bgClass="bg-cyan-500/10 border-cyan-500/20"
                   />
                   <StatWidget 
                        label="Manual / Offline" 
                        value={stats.offline} 
                        icon={Store} 
                        colorClass="text-orange-400" 
                        bgClass="bg-orange-500/10 border-orange-500/20"
                   />
               </div>
           </GlassPanel>

           {/* TOP 5 SUPPLIERS WIDGET */}
           <GlassPanel className="p-5 rounded-2xl bg-black/20 border border-white/5">
                <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                    <Star size={14} className="text-yellow-500"/> Top 5 Performa
                </h4>
                <div className="space-y-3">
                    {stats.top5.map((sup, i) => (
                        <div key={sup.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <span className={`text-xs font-bold w-4 ${i === 0 ? 'text-yellow-400' : 'text-gray-500'}`}>#{i+1}</span>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-gray-200 truncate">{sup.name}</p>
                                    <p className="text-[9px] text-gray-500">{sup.category}</p>
                                </div>
                            </div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getScoreColor(sup.performanceScore || 0)}`}>
                                {sup.performanceScore || 0}
                            </span>
                        </div>
                    ))}
                    {stats.top5.length === 0 && <p className="text-xs text-gray-500 text-center py-4">Belum ada data performa.</p>}
                </div>
           </GlassPanel>

           {/* Quick Tip */}
           <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-xs text-blue-200/80 leading-relaxed">
               <div className="flex items-center gap-2 mb-2 text-blue-400 font-bold">
                   <ShieldCheck size={14} />
                   <span>Mitra Terpercaya</span>
               </div>
               Gunakan fitur <b>Cari Direktori</b> untuk menemukan supplier yang sudah terverifikasi dalam ekosistem SIBOS. Transaksi lebih aman dan terintegrasi.
           </div>
       </div>

       {/* ATOMIC MODAL: DIRECTORY SEARCH */}
       <SupplierDirectoryModal 
          isOpen={isDirectoryOpen}
          onClose={() => setIsDirectoryOpen(false)}
          availableBusinesses={availableBusinesses}
          activeBusinessId={activeBusinessId}
          currentSupplierNames={currentSupplierNames}
          onAddBusiness={handleAddFromDirectory}
       />

       {/* ATOMIC MODAL: REPORT */}
       <SupplierReportModal 
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          suppliers={suppliers}
       />

       {/* ATOMIC COMPONENT: LIVE LOG PANEL */}
       <LiveLogPanel
            isOpen={isLiveLogOpen}
            onClose={() => setIsLiveLogOpen(false)}
            title="Log Aktivitas Supplier"
            logs={liveLogs}
            onDownload={() => alert("Downloading Logs...")}
       />

       {/* MODAL: QUICK ADD MANUAL */}
       {isQuickAddSupplierOpen && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsQuickAddSupplierOpen(false)} />
               <div className="glass-panel w-full max-w-md p-6 rounded-3xl relative z-10 animate-in zoom-in-95">
                   <h3 className="text-lg font-bold text-white mb-4">Tambah Supplier Manual</h3>
                   <div className="space-y-3">
                       <div>
                           <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Nama Supplier</label>
                           <GlassInput placeholder="Nama Supplier / Toko" value={quickSupName} onChange={e => setQuickSupName(e.target.value)} autoFocus />
                       </div>
                       <div>
                           <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Kontak Person</label>
                           <GlassInput placeholder="Sales / Admin" value={quickSupContact} onChange={e => setQuickSupContact(e.target.value)} />
                       </div>
                       <div>
                           <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">No Telepon / WA</label>
                           <GlassInput placeholder="0812..." value={quickSupPhone} onChange={e => setQuickSupPhone(e.target.value)} />
                       </div>
                       <div>
                           <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Kategori</label>
                           <GlassInput placeholder="Contoh: Sembako" value={quickSupCategory} onChange={e => setQuickSupCategory(e.target.value)} />
                       </div>
                       
                       <div className="flex gap-2 mt-4 pt-2">
                           <button onClick={() => setIsQuickAddSupplierOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-xl border border-white/5">Batal</button>
                           <button onClick={handleSaveQuickSupplier} className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-lg">Simpan</button>
                       </div>
                   </div>
               </div>
           </div>
       )}

       {/* UNIVERSAL CHAT WIDGET */}
       <UniversalChatWidget
            title="Kontak Supplier"
            isOpen={chatSystem.isOpen}
            onClose={chatSystem.handleClose}
            activeContact={chatSystem.activeContact}
            contacts={chatSystem.filteredContacts}
            searchQuery={chatSystem.searchQuery}
            onSearchChange={chatSystem.setSearchQuery}
            onSelectContact={chatSystem.handleSelectContact}
            onBackToContacts={chatSystem.handleBackToContacts}
            messages={chatSystem.currentMessages}
            inputValue={chatSystem.inputValue}
            onInputChange={chatSystem.setInputValue}
            onSendMessage={chatSystem.handleSendMessage}
        />
    </div>
  );
};

export default SupplierList;
