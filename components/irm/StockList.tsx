import React from 'react';
import { UnitType } from '../../types';
import { MoreHorizontal, Plus, X, Search, ChevronUp, ChevronDown, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useStockLogic } from '../../hooks/useStockLogic';
import GlassInput from '../common/GlassInput';

interface StockListProps {
  initialSearchTerm?: string;
}

const StockList: React.FC<StockListProps> = ({ initialSearchTerm }) => {
  const {
    ingredients,
    totalIngredientsCount,
    isOpnameModalOpen, setIsOpnameModalOpen,
    isHistoryModalOpen, setIsHistoryModalOpen,
    selectedIngredient,
    opnameRealQty, setOpnameRealQty,
    opnameReason, setOpnameReason,
    opnameNote, setOpnameNote,
    activeHistory,
    searchTerm, setSearchTerm,
    filterCategory, setFilterCategory,
    sortConfig,
    currentPage, setCurrentPage,
    totalPages,
    categories,
    handleSort,
    getStockStatus,
    handleOpenOpname,
    handleSubmitOpname,
    handleOpenHistory,
    handleAddIngredient
  } = useStockLogic({ initialSearchTerm });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Inventory</h2>
            <p className="text-sm text-gray-400">Pantau stok bahan baku.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <GlassInput 
              icon={Search} 
              placeholder="Cari bahan..." 
              className="py-2.5 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
             <select 
                value={filterCategory} 
                onChange={e => setFilterCategory(e.target.value)}
                className="glass-input rounded-xl text-sm py-2.5"
            >
                {categories.map(cat => <option key={cat} value={cat} className="bg-gray-900">{cat}</option>)}
            </select>
            <button onClick={handleAddIngredient} className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-orange-600/20">
              <Plus size={18} /> <span className="hidden sm:inline">Bahan +</span>
            </button>
          </div>
       </div>
       <div className="overflow-x-auto rounded-2xl border border-white/5">
         <table className="w-full text-left border-collapse">
           <thead>
             <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
               <th className="p-4 rounded-tl-2xl">
                 <button onClick={() => handleSort('name')} className="flex items-center gap-1">
                   Bahan {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}
                 </button>
               </th>
               <th className="p-4">Kategori</th>
               <th className="p-4 text-center">Satuan</th>
               <th className="p-4 text-right">Harga</th>
               <th className="p-4 text-center">
                 <button onClick={() => handleSort('stock')} className="flex items-center gap-1">
                   Stok {sortConfig.key === 'stock' && (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}
                 </button>
               </th>
               <th className="p-4 text-center">Status</th>
               <th className="p-4 rounded-tr-2xl"></th>
             </tr>
           </thead>
           <tbody className="text-sm text-gray-300">
             {ingredients.map((item) => {
               const status = getStockStatus(item);
               const displayStock = (item.unit === UnitType.KG || item.unit === UnitType.LITER) ? item.stock.toFixed(2) : item.stock;
               return (
                 <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                   <td className="p-4"><div><p className="font-bold text-white">{item.name}</p><p className="text-xs text-gray-500 font-mono">{item.sku}</p></div></td>
                   <td className="p-4"><span className="px-2 py-1 rounded-lg bg-white/5 text-xs text-gray-400 border border-white/5">{item.category}</span></td>
                   <td className="p-4 text-center text-gray-400">{item.unit}</td>
                   <td className="p-4 text-right font-mono">Rp {item.avgCost.toLocaleString()}</td>
                   <td className="p-4 text-center"><span className={`font-bold ${item.stock <= item.minStock ? 'text-red-400' : 'text-white'}`}>{displayStock}</span></td>
                   <td className="p-4 text-center"><span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${status.bg} ${status.color} ${status.border} uppercase`}>{status.label}</span></td>
                   <td className="p-4 text-right">
                       <div className="relative group/menu">
                           <button className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors peer"><MoreHorizontal size={16} /></button>
                           <div className="absolute right-0 top-full mt-1 w-40 bg-[#1e293b] border border-white/10 rounded-xl shadow-xl z-50 hidden peer-hover:block hover:block animate-in fade-in zoom-in-95">
                               <button onClick={() => handleOpenOpname(item)} className="w-full text-left px-4 py-2 hover:bg-white/5 text-xs font-bold text-gray-300 hover:text-white first:rounded-t-xl">Opname Stok</button>
                               <button onClick={() => handleOpenHistory(item)} className="w-full text-left px-4 py-2 hover:bg-white/5 text-xs font-bold text-gray-300 hover:text-white last:rounded-b-xl">Kartu Stok</button>
                           </div>
                       </div>
                   </td>
                 </tr>
               )
             })}
           </tbody>
         </table>
       </div>
       
       {/* PAGINATION */}
       <div className="flex justify-between items-center text-sm text-gray-400">
            <p>Menampilkan {ingredients.length} dari {totalIngredientsCount} item</p>
            <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 rounded-lg bg-white/5 disabled:opacity-50"><ChevronsLeft size={16}/></button>
                <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="p-2 rounded-lg bg-white/5 disabled:opacity-50"><ChevronUp size={16} className="-rotate-90"/></button>
                <span className="font-bold text-white">{currentPage} / {totalPages}</span>
                <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-white/5 disabled:opacity-50"><ChevronDown size={16} className="-rotate-90"/></button>
                <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-white/5 disabled:opacity-50"><ChevronsRight size={16}/></button>
            </div>
       </div>

        {/* MODAL: STOCK OPNAME */}
      {isOpnameModalOpen && selectedIngredient && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsOpnameModalOpen(false)} />
              <div className="glass-panel w-full max-w-md p-6 rounded-3xl relative z-10 animate-in zoom-in-95">
                  <h3 className="text-lg font-bold text-white mb-4">Stock Opname: {selectedIngredient.name}</h3>
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
                          <label className="text-xs font-bold text-gray-500">Alasan</label>
                          <select className="w-full glass-input rounded-xl p-3 mt-1 text-white" value={opnameReason} onChange={e => setOpnameReason(e.target.value as any)}>
                              <option value="Opname" className="bg-gray-900">Opname Rutin</option>
                              <option value="Rusak" className="bg-gray-900">Barang Rusak</option>
                              <option value="Hilang" className="bg-gray-900">Barang Hilang</option>
                              <option value="Expired" className="bg-gray-900">Kadaluarsa</option>
                          </select>
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
    </div>
  );
};

export default StockList;