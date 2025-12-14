
import React, { useRef, useState } from 'react';
import { UnitType, BusinessType } from '../../../types';
import { ClipboardList, Plus, X, Search, ChevronUp, ChevronDown, ChevronsLeft, ChevronsRight, AlertTriangle, CheckCircle, TrendingDown, ShoppingCart, Truck, History, Clock, Wand2, ShieldCheck, Info, Filter, Download, Upload, Activity, FileText, FileBarChart, FlaskConical } from 'lucide-react';
import { useStockLogic } from '../hooks/useStockLogic';
import GlassInput from '../../../components/common/GlassInput';
import GlassSelect from '../../../components/common/GlassSelect'; // ATOMIC COMPONENT
import GlassPanel from '../../../components/common/GlassPanel';
import { Ingredient } from '../types';
import AddIngredientModal from './modals/AddIngredientModal';
import StockReportModal from './modals/StockReportModal';
import ProductionModal from './modals/ProductionModal';
import CompactNumber from '../../../components/common/CompactNumber';
import LiveLogPanel from '../../../components/common/LiveLogPanel';
import { useGlobalContext } from '../../../context/GlobalContext';

interface StockListProps {
  initialSearchTerm?: string;
  onRestock?: (item: Ingredient) => void;
}

const StockList: React.FC<StockListProps> = ({ initialSearchTerm, onRestock }) => {
  const { activeBusiness } = useGlobalContext();
  const isRetail = activeBusiness?.type === BusinessType.RETAIL;

  const {
    ingredients,
    totalIngredientsCount,
    activeOutlet,
    currentUser,
    
    // Modals
    isOpnameModalOpen, setIsOpnameModalOpen,
    isHistoryModalOpen, setIsHistoryModalOpen,
    isAddModalOpen, setIsAddModalOpen,
    isLiveLogOpen, setIsLiveLogOpen,
    isReportModalOpen, setIsReportModalOpen, 
    isProductionModalOpen, setIsProductionModalOpen,
    
    selectedIngredient,
    editingIngredient,
    opnameRealQty, setOpnameRealQty,
    opnameReason, setOpnameReason,
    opnameNote, setOpnameNote,
    activeHistory,
    
    // Filters & Sort
    searchTerm, setSearchTerm,
    filterCategory, setFilterCategory,
    filterStatus, setFilterStatus,
    filterSupplier, setFilterSupplier,
    sortConfig,
    currentPage, setCurrentPage,
    totalPages,
    categories,
    supplierList,

    // Handlers
    handleSort,
    getStockStatus,
    getStockVelocity,
    getIncomingStock,
    handleOpenOpname,
    handleSubmitOpname,
    handleOpenHistory,
    handleAddIngredient,
    handleEditIngredient,
    handleSaveIngredient,
    handleExportCSV,
    handleImportCSV,
    handleBulkAutoRestock,
    
    // Production Handlers
    handleOpenProduction,
    handleProduce,

    // Data
    criticalItemsCount,
    liveLogs
  } = useStockLogic({ initialSearchTerm });

  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stockStats = {
      critical: ingredients.filter(i => i.stock <= i.minStock).length,
      warning: ingredients.filter(i => i.stock > i.minStock && i.stock <= i.minStock * 2).length,
      safe: ingredients.filter(i => i.stock > i.minStock * 2).length
  };
  
  const isOwnerOrManager = currentUser?.role === 'Owner' || currentUser?.role === 'Manager';
  
  // Diction
  const labels = {
      title: isRetail ? "Stok Barang Dagang" : "Data Bahan Baku",
      searchPlaceholder: isRetail ? "Cari barang, SKU..." : "Cari bahan, bumbu...",
      columnName: isRetail ? "Nama Barang" : "Nama Bahan",
      addItem: isRetail ? "Barang +" : "Bahan +",
      unit: isRetail ? "Unit/Pcs" : "Satuan"
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-right-4 relative">
        
       {/* LEFT COLUMN: STOCK TABLE (9/12) */}
       <div className="lg:col-span-9 flex flex-col gap-4">
           
           {/* HEADER TOOLBAR */}
           <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-4">
              {/* Title Section */}
              <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        {labels.title}
                        {isOwnerOrManager && (
                            <button 
                                onClick={() => setIsLiveLogOpen(true)}
                                className="bg-orange-500/20 text-orange-400 p-1.5 rounded-lg hover:bg-orange-500 hover:text-white transition-colors animate-pulse"
                                title="Live Activity Log"
                            >
                                <Activity size={16} />
                            </button>
                        )}
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">Total {totalIngredientsCount} SKU aktif di {activeOutlet?.name}</p>
                  </div>
              </div>

              {/* SEARCH & ACTIONS ROW */}
              <div className="flex flex-col sm:flex-row gap-2">
                    <GlassInput 
                        icon={Search} 
                        placeholder={labels.searchPlaceholder}
                        className="py-2.5 text-sm"
                        wrapperClassName="flex-1"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    
                    {/* BUTTON GROUP */}
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setIsReportModalOpen(true)}
                            className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl border border-white/5 transition-colors" 
                            title="Analisa & Laporan"
                        >
                            <FileBarChart size={18} />
                        </button>

                        <button 
                            onClick={handleExportCSV}
                            className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl border border-white/5 transition-colors" 
                            title="Export CSV (Download)"
                        >
                            <Upload size={18} />
                        </button>
                        
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl border border-white/5 transition-colors" 
                            title="Import CSV (Upload)"
                        >
                            <Download size={18} />
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept=".csv" 
                            onChange={handleImportCSV} 
                        />

                        <button 
                            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                            className={`p-2.5 px-4 rounded-xl border flex items-center gap-2 text-sm font-bold transition-colors ${isFilterExpanded ? 'bg-orange-600 text-white border-orange-600' : 'bg-white/5 text-gray-300 border-white/5 hover:bg-white/10'}`}
                        >
                            <Filter size={18} /> <span className="hidden sm:inline">Filter</span>
                        </button>

                        {/* ADD INGREDIENT BUTTON */}
                        <button 
                            onClick={handleAddIngredient} 
                            className="px-4 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 hover:brightness-110 text-white rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-orange-500/20 transition-all whitespace-nowrap"
                        >
                            <Plus size={18} /> <span className="hidden md:inline">{labels.addItem}</span>
                        </button>
                    </div>
              </div>

              {/* EXPANDABLE FILTER PANEL - USING ATOMIC GLASS SELECT */}
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
                          label="Status Stok"
                          value={filterStatus}
                          onChange={e => setFilterStatus(e.target.value as any)}
                      >
                           <option value="All">Semua Status</option>
                           <option value="Critical">Kritis (Perlu Restock)</option>
                           <option value="Warning">Menipis</option>
                           <option value="Safe">Aman</option>
                      </GlassSelect>
                      
                      <GlassSelect 
                          label="Supplier"
                          value={filterSupplier}
                          onChange={e => setFilterSupplier(e.target.value)}
                      >
                           {supplierList.map(sup => <option key={sup} value={sup}>{sup}</option>)}
                      </GlassSelect>
                  </div>
              )}
           </div>

           {/* TABLE */}
           <div className="overflow-x-auto rounded-2xl border border-white/5 bg-black/20">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                   <th className="p-4">
                     <button onClick={() => handleSort('name')} className="flex items-center gap-1">
                       {labels.columnName} {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}
                     </button>
                   </th>
                   <th className="p-4 text-center">{labels.unit}</th>
                   <th className="p-4 text-right">Harga</th>
                   <th className="p-4 text-center">
                     <button onClick={() => handleSort('stock')} className="flex items-center gap-1">
                       Stok {sortConfig.key === 'stock' && (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}
                     </button>
                   </th>
                   <th className="p-4 text-center">Status</th>
                   <th className="p-4 text-right">Aksi</th>
                 </tr>
               </thead>
               <tbody className="text-sm text-gray-300">
                 {ingredients.map((item) => {
                   const status = getStockStatus(item);
                   const daysLeft = getStockVelocity(item);
                   const displayStock = (item.unit === UnitType.KG || item.unit === UnitType.LITER) ? item.stock.toFixed(2) : item.stock;
                   const incomingQty = getIncomingStock(item.id);
                   const isSemiFinished = item.type === 'semi_finished';

                   return (
                     <tr 
                        key={item.id} 
                        className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer"
                        onClick={() => handleEditIngredient(item)}
                     >
                       <td className="p-4">
                           <div>
                               <div className="flex items-center gap-2">
                                   <p className="font-bold text-white text-sm">{item.name}</p>
                                   {isSemiFinished && <span className="bg-orange-500/20 text-orange-400 text-[9px] px-1.5 py-0.5 rounded border border-orange-500/30 flex items-center gap-1"><FlaskConical size={8}/> OLAHAN</span>}
                               </div>
                               <span className="text-[10px] text-gray-500 font-mono bg-white/5 px-1.5 py-0.5 rounded">{item.category}</span>
                           </div>
                       </td>
                       <td className="p-4 text-center text-gray-400 text-xs">{item.unit}</td>
                       <td className="p-4 text-right font-mono text-xs">Rp {item.avgCost.toLocaleString()}</td>
                       <td className="p-4 text-center">
                           <div className="flex flex-col items-center">
                               <span className={`font-bold ${item.stock <= item.minStock ? 'text-red-400' : 'text-white'}`}>{displayStock}</span>
                               {incomingQty > 0 && (
                                   <span className="text-[9px] text-blue-400 flex items-center gap-0.5 mt-0.5" title="Sedang dipesan/dikirim">
                                       <Truck size={8} /> +{incomingQty}
                                   </span>
                               )}
                           </div>
                       </td>
                       <td className="p-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${status.bg} ${status.color} ${status.border} uppercase`}>{status.label}</span>
                                {daysLeft < 4 && (
                                    <span className={`text-[9px] font-bold flex items-center gap-1 ${daysLeft < 2 ? 'text-red-500' : 'text-orange-400'}`}>
                                        <Clock size={10} /> {daysLeft < 1 ? '<1 Hari' : `${daysLeft.toFixed(1)} Hari`}
                                    </span>
                                )}
                            </div>
                       </td>
                       <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}> 
                           <div className="flex items-center justify-end gap-2">
                               {isSemiFinished ? (
                                   <button 
                                      onClick={() => handleOpenProduction(item)} 
                                      className="p-2 bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white rounded-lg transition-colors"
                                      title="Catat Produksi"
                                   >
                                       <FlaskConical size={16} />
                                   </button>
                               ) : (
                                   <button 
                                      onClick={() => onRestock && onRestock(item)} 
                                      className="p-2 bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white rounded-lg transition-colors"
                                      title="Restock / Belanja"
                                   >
                                       <ShoppingCart size={16} />
                                   </button>
                               )}
                               
                               <button 
                                  onClick={() => handleOpenOpname(item)} 
                                  className="p-2 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white rounded-lg transition-colors"
                                  title="Opname Stok"
                               >
                                   <ClipboardList size={16} />
                               </button>
                               <button 
                                  onClick={() => handleOpenHistory(item)} 
                                  className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors"
                                  title="Kartu Stok / Riwayat"
                               >
                                   <History size={16} />
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
                <p>Menampilkan {ingredients.length} dari {totalIngredientsCount} item</p>
                <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 rounded-lg bg-white/5 disabled:opacity-50"><ChevronsLeft size={16}/></button>
                    <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="p-2 rounded-lg bg-white/5 disabled:opacity-50"><ChevronUp size={16} className="-rotate-90"/></button>
                    <span className="font-bold text-white">{currentPage} / {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-white/5 disabled:opacity-50"><ChevronDown size={16} className="-rotate-90"/></button>
                    <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-white/5 disabled:opacity-50"><ChevronsRight size={16}/></button>
                </div>
           </div>
       </div>

       {/* RIGHT COLUMN: SUMMARY & TOOLS (3/12) */}
       <div className="lg:col-span-3 flex flex-col gap-6">
           
           {/* Stock Summary Card */}
           <GlassPanel className="p-5 rounded-2xl border border-white/5">
               <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Ringkasan Stok</h4>
               <div className="space-y-3">
                   {/* CRITICAL CARD with ACTION */}
                   <div className="flex flex-col p-3 bg-red-500/10 rounded-xl border border-red-500/20 transition-all">
                       <div className="flex items-center justify-between mb-1">
                           <div className="flex items-center gap-2">
                               <AlertTriangle size={16} className="text-red-500" />
                               <span className="text-xs font-bold text-red-400">Kritis</span>
                           </div>
                           <span className="text-lg font-bold text-white">{stockStats.critical}</span>
                       </div>
                       {/* THE MAGIC BUTTON */}
                       <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBulkAutoRestock();
                            }}
                            className={`mt-2 w-full py-2 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
                                criticalItemsCount > 0 
                                ? 'bg-red-600 hover:bg-red-500 cursor-pointer animate-pulse' 
                                : 'bg-gray-700 cursor-not-allowed opacity-50'
                            }`}
                            disabled={criticalItemsCount === 0}
                       >
                           <Wand2 size={12} /> Auto-Restock ({criticalItemsCount})
                       </button>
                   </div>

                   <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                       <div className="flex items-center gap-2">
                           <TrendingDown size={16} className="text-orange-500" />
                           <span className="text-xs font-bold text-orange-400">Menipis</span>
                       </div>
                       <span className="text-lg font-bold text-white">{stockStats.warning}</span>
                   </div>

                   <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                       <div className="flex items-center gap-2">
                           <CheckCircle size={16} className="text-green-500" />
                           <span className="text-xs font-bold text-green-400">Aman</span>
                       </div>
                       <span className="text-lg font-bold text-white">{stockStats.safe}</span>
                   </div>
               </div>
           </GlassPanel>

           {/* Info/Tip */}
           <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-xs text-blue-200/80 leading-relaxed">
               <div className="flex items-center gap-2 mb-2 text-blue-400 font-bold">
                   <Info size={14} />
                   <span>Tips Gudang</span>
               </div>
               Gunakan fitur <b>Export</b> untuk backup data berkala atau <b>Import</b> untuk update stok massal dari Excel.
           </div>
       </div>

       {/* ATOMIC COMPONENT: LIVE LOG PANEL */}
       <LiveLogPanel 
           isOpen={isLiveLogOpen}
           onClose={() => setIsLiveLogOpen(false)}
           title="Log Aktivitas Inventory"
           logs={liveLogs}
           onDownload={() => alert("Downloading logs...")}
       />

        {/* MODAL: STOCK OPNAME */}
      {isOpnameModalOpen && selectedIngredient && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsOpnameModalOpen(false)} />
              <div className="glass-panel w-full max-w-md p-6 rounded-3xl relative z-10 animate-in zoom-in-95">
                  {/* HEADER WITH CLOSE BUTTON */}
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-white">Stock Opname: {selectedIngredient.name}</h3>
                      <button 
                        onClick={() => setIsOpnameModalOpen(false)} 
                        className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                      >
                        <X size={20} />
                      </button>
                  </div>

                  <div className="space-y-4">
                      <div><label className="text-xs font-bold text-gray-500">Stok Sistem</label><p className="text-xl font-mono text-gray-400">{selectedIngredient.stock} {selectedIngredient.unit}</p></div>
                      <div>
                          <label className="text-xs font-bold text-gray-500">Stok Fisik (Real)</label>
                          <input type="number" className="w-full glass-input rounded-xl p-3 text-white font-bold text-lg mt-1" value={opnameRealQty} onChange={e => setOpnameRealQty(Number(e.target.value))} autoFocus />
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <p className="text-xs text-gray-400 mb-1">Selisih (Variance)</p>
                          <p className={`text-lg font-bold ${(Number(opnameRealQty) - selectedIngredient.stock) < 0 ? 'text-red-400' : 'text-green-400'}`}>
                              {(Number(opnameRealQty) - selectedIngredient.stock).toFixed(2)} {selectedIngredient.unit}
                          </p>
                      </div>
                      <div>
                          {/* Atomic Glass Select */}
                          <GlassSelect
                              label="Alasan"
                              value={opnameReason}
                              onChange={e => setOpnameReason(e.target.value as any)}
                              options={[
                                  { value: "Opname", label: "Opname Rutin" },
                                  { value: "Rusak", label: "Barang Rusak" },
                                  { value: "Hilang", label: "Barang Hilang" },
                                  { value: "Expired", label: "Kadaluarsa" }
                              ]}
                          />
                      </div>
                      <button onClick={handleSubmitOpname} className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl">Simpan</button>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL: STOCK HISTORY */}
      {isHistoryModalOpen && selectedIngredient && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsHistoryModalOpen(false)} />
              <div className="glass-panel w-full max-w-2xl p-6 rounded-3xl relative z-10 animate-in zoom-in-95 h-[80vh] flex flex-col">
                  <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                      <h3 className="text-xl font-bold text-white">Kartu Stok: {selectedIngredient.name}</h3>
                      <button onClick={() => setIsHistoryModalOpen(false)}><X/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                      {activeHistory.length === 0 ? <p className="text-center text-gray-500 py-10">Belum ada riwayat.</p> : activeHistory.map(h => (
                          <div key={h.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                              <div>
                                  <div className="flex items-center gap-2">
                                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${h.quantityChange > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{h.type}</span>
                                      <span className="text-xs text-gray-500">{new Date(h.date).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-sm text-gray-300 mt-1">{h.notes}</p>
                              </div>
                              <div className="text-right">
                                  <p className={`font-mono font-bold ${h.quantityChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                      {h.quantityChange > 0 ? '+' : ''}{h.quantityChange}
                                  </p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* MODAL: ADD / EDIT INGREDIENT */}
      <AddIngredientModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          onSave={handleSaveIngredient}
          activeOutletId={activeOutlet?.id || ''}
          initialData={editingIngredient} 
      />

      {/* MODAL: REPORT ANALYTICS (NEW) */}
      <StockReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          ingredients={ingredients}
      />
      
      {/* MODAL: PRODUCTION (NEW) */}
      {selectedIngredient && (
          <ProductionModal 
              isOpen={isProductionModalOpen} 
              onClose={() => setIsProductionModalOpen(false)} 
              ingredient={selectedIngredient}
              onProduce={handleProduce}
          />
      )}
    </div>
  );
};

export default StockList;
