
import React, { useState, useEffect, useRef } from 'react';
import { BusinessType } from '../../../types';
import { 
    Search, Scan, Trash2, User, CreditCard, 
    Delete, ArrowRight, Disc, Package, MoreHorizontal, 
    Keyboard, RefreshCw, AlertCircle, CheckCircle2,
    ArrowUp, ArrowDown
} from 'lucide-react';
import { printReceipt } from '../../../utils/printService';
import { usePOSLogic } from '../hooks/usePOSLogic';
import CompactNumber from '../../../components/common/CompactNumber';
import { CartItem } from '../../products/types';

// Components
import Modal from '../../../components/common/Modal';
import GlassPanel from '../../../components/common/GlassPanel';
import POSProductGrid from './POSProductGrid';

interface POSRetailProps {
  onExit?: () => void;
  onNavigate?: (view: string, searchTerm?: string) => void;
  onSwitchMode?: () => void; // Deprecated but kept for type safety if needed
}

const POSRetail: React.FC<POSRetailProps> = ({ onExit }) => {
  const {
    // State
    cart, filterQuery, setFilterQuery,
    currentShift, selectedCustomer, setSelectedCustomer,
    numpadValue, setNumpadValue,
    
    // Modals & Flags
    isMemberModalOpen, setIsMemberModalOpen,
    isPaymentMethodModalOpen, setIsPaymentMethodModalOpen,
    
    // Derived
    filteredProducts, categories, selectedCategory, setSelectedCategory,
    subtotal, tax, total,
    cashReceived, change, moneySuggestions,

    // Actions
    handleNumpadInput, handleClearCart,
    addToCart, updateQuantity, handleItemClick, handleCheckout,
    
    // Data
    currentUser, customers
  } = usePOSLogic(BusinessType.RETAIL);

  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [activeRowIndex, setActiveRowIndex] = useState<number>(0); // Untuk navigasi keyboard di list belanja
  const scanInputRef = useRef<HTMLInputElement>(null);

  // --- 1. AUTO FOCUS SCANNER ---
  // Scanner harus selalu siap menerima input kecuali modal terbuka
  useEffect(() => {
    if (!isCatalogOpen && !isPaymentMethodModalOpen && !isMemberModalOpen) {
        // Sedikit delay untuk memastikan render selesai
        const timer = setTimeout(() => scanInputRef.current?.focus(), 100);
        return () => clearTimeout(timer);
    }
  }, [cart, isCatalogOpen, isPaymentMethodModalOpen, isMemberModalOpen, currentShift]);

  // --- 2. KEYBOARD SHORTCUTS HANDLER ---
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (isCatalogOpen || isPaymentMethodModalOpen || isMemberModalOpen) return;

          switch(e.key) {
              case 'F1':
                  e.preventDefault();
                  setIsCatalogOpen(true);
                  break;
              case 'F2':
                  e.preventDefault();
                  setIsMemberModalOpen(true);
                  break;
              case 'F4':
              case 'Enter': // Jika control+enter atau kondisi tertentu untuk bayar
                  if (e.ctrlKey) {
                      e.preventDefault();
                      if (cart.length > 0) handleCheckout('cash');
                  }
                  break;
              case 'Delete':
                  if (cart.length > 0 && activeRowIndex >= 0 && activeRowIndex < cart.length) {
                      const item = cart[activeRowIndex];
                      updateQuantity(item.id, -item.quantity); // Remove all qty
                  }
                  break;
              case 'ArrowUp':
                  e.preventDefault();
                  setActiveRowIndex(prev => Math.max(0, prev - 1));
                  break;
              case 'ArrowDown':
                  e.preventDefault();
                  setActiveRowIndex(prev => Math.min(cart.length - 1, prev + 1));
                  break;
              case '+':
                  e.preventDefault();
                  if (cart.length > 0) updateQuantity(cart[activeRowIndex].id, 1);
                  break;
              case '-':
                  e.preventDefault();
                  if (cart.length > 0) updateQuantity(cart[activeRowIndex].id, -1);
                  break;
          }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, activeRowIndex, isCatalogOpen, isPaymentMethodModalOpen]);

  // Handle Scan Submit
  const handleScanSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          if (!filterQuery) {
              // Jika kosong & enter -> Buka bayar atau Catalog? 
              // Usually empty enter in Retail POS moves focus to payment
              if (cart.length > 0) setIsPaymentMethodModalOpen(true);
              return;
          }
          
          // 1. Exact Match Scan
          const exactMatch = filteredProducts.find(p => 
              p.sku?.toLowerCase() === filterQuery.toLowerCase() || 
              p.barcode === filterQuery
          );

          if (exactMatch) {
              addToCart(exactMatch);
              setFilterQuery(''); 
              // Scroll to bottom/new item
              setActiveRowIndex(cart.length); // Logic will auto adjust to length-1 next render
          } else {
              // 2. Fuzzy Match -> Open Catalog filtered
              setIsCatalogOpen(true);
          }
      }
  };

  return (
    <div className="flex h-screen bg-[#0f172a] overflow-hidden font-mono text-sm">
      
      {/* --- LEFT COLUMN: TRANSACTION TABLE (70%) --- */}
      <div className="w-[70%] flex flex-col border-r border-white/10 bg-[#0b1120] relative">
          
          {/* 1. TOP BAR: SCANNER & INFO */}
          <div className="h-16 shrink-0 flex items-center px-4 border-b border-white/10 bg-[#1e293b] gap-4 shadow-md z-20">
               <button onClick={onExit} className="p-2 rounded bg-white/5 text-gray-400 hover:text-white hover:bg-red-600 transition-colors">
                   <ArrowRight size={18} className="rotate-180" />
               </button>

               {/* MAIN SCANNER INPUT */}
               <div className="flex-1 relative group">
                   <div className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 animate-pulse">
                       <Scan size={20} />
                   </div>
                   <input 
                      ref={scanInputRef}
                      type="text" 
                      placeholder="Scan Barcode / SKU / Nama Barang (F1 Cari)"
                      value={filterQuery}
                      onChange={(e) => setFilterQuery(e.target.value)}
                      onKeyDown={handleScanSubmit}
                      className="w-full h-10 bg-black/40 border border-white/20 rounded-lg pl-10 pr-24 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-bold tracking-wide uppercase"
                      autoFocus
                   />
                   <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                       <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">ENTER</span>
                   </div>
               </div>

               {/* Quick Info */}
               <div className="flex items-center gap-4 text-xs text-gray-400">
                   <div className="flex items-center gap-2">
                       <User size={14} />
                       <span className="text-white font-bold">{currentUser?.name || 'Kasir'}</span>
                   </div>
                   <div className="h-4 w-px bg-white/10"></div>
                   <div className="flex items-center gap-2">
                       <span className={`w-2 h-2 rounded-full ${true ? 'bg-green-500' : 'bg-red-500'}`}></span>
                       <span>Online</span>
                   </div>
               </div>
          </div>

          {/* 2. TRANSACTION DATA GRID (TABLE) */}
          <div className="flex-1 overflow-hidden flex flex-col bg-[#0f172a]">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-white/10 bg-[#1e293b] text-gray-400 text-xs font-bold uppercase tracking-wider">
                  <div className="col-span-1 text-center">No</div>
                  <div className="col-span-2">Kode / SKU</div>
                  <div className="col-span-4">Nama Barang</div>
                  <div className="col-span-2 text-right">Harga</div>
                  <div className="col-span-1 text-center">Qty</div>
                  <div className="col-span-2 text-right">Subtotal</div>
              </div>

              {/* Table Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                  {cart.length === 0 ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 opacity-40 select-none pointer-events-none">
                          <Keyboard size={80} className="mb-4" />
                          <p className="text-2xl font-bold uppercase tracking-widest">Siap Transaksi</p>
                          <p className="text-sm mt-2">Scan barang atau tekan F1 untuk cari</p>
                      </div>
                  ) : (
                      cart.map((item, idx) => {
                          const isActive = idx === activeRowIndex;
                          return (
                              <div 
                                  key={`${item.id}-${idx}`} 
                                  onClick={() => { setActiveRowIndex(idx); handleItemClick(item); }}
                                  className={`grid grid-cols-12 gap-2 px-4 py-2 items-center border-b border-white/5 cursor-pointer text-sm transition-colors ${
                                      isActive 
                                      ? 'bg-blue-600/20 text-white' 
                                      : 'text-gray-300 hover:bg-white/5'
                                  }`}
                              >
                                  <div className="col-span-1 text-center text-gray-500">{idx + 1}</div>
                                  <div className="col-span-2 font-mono text-xs truncate">{item.sku || '-'}</div>
                                  <div className="col-span-4 font-bold truncate flex items-center gap-2">
                                      {item.name}
                                      {item.isPromoBonus && <span className="text-[9px] bg-green-500 text-black px-1 rounded font-bold">BONUS</span>}
                                  </div>
                                  <div className="col-span-2 text-right font-mono">
                                      <CompactNumber value={item.price} currency={false}/>
                                      {item.appliedWholesale && <span className="text-[9px] text-blue-400 block">Grosir</span>}
                                  </div>
                                  <div className="col-span-1 text-center font-bold relative">
                                      {/* Highlight Qty if Active */}
                                      {isActive && <div className="absolute inset-0 border border-orange-500 rounded pointer-events-none animate-pulse"></div>}
                                      {item.quantity}
                                  </div>
                                  <div className="col-span-2 text-right font-bold text-white font-mono">
                                      <CompactNumber value={item.quantity * item.price} currency={false}/>
                                  </div>
                              </div>
                          );
                      })
                  )}
              </div>
          </div>

          {/* 3. KEYBOARD HINTS FOOTER */}
          <div className="h-10 bg-[#1e293b] border-t border-white/10 flex items-center px-4 gap-4 text-xs text-gray-400 overflow-hidden shrink-0 select-none">
              <div className="flex items-center gap-1"><span className="bg-white/10 px-1.5 py-0.5 rounded text-white font-bold border border-white/10">F1</span> Cari Barang</div>
              <div className="flex items-center gap-1"><span className="bg-white/10 px-1.5 py-0.5 rounded text-white font-bold border border-white/10">F2</span> Member</div>
              <div className="flex items-center gap-1"><span className="bg-white/10 px-1.5 py-0.5 rounded text-white font-bold border border-white/10">DEL</span> Hapus Item</div>
              <div className="flex items-center gap-1"><span className="bg-white/10 px-1.5 py-0.5 rounded text-white font-bold border border-white/10">+ / -</span> Ubah Qty</div>
              <div className="flex items-center gap-1 ml-auto"><span className="bg-orange-600 px-2 py-0.5 rounded text-white font-bold border border-orange-500">CTRL+ENTER</span> Bayar</div>
          </div>
      </div>


      {/* --- RIGHT COLUMN: TOTALS & ACTIONS (30%) --- */}
      <div className="w-[30%] flex flex-col bg-[#111827] border-l border-white/10 h-full relative z-30 shadow-2xl">
          
          {/* 1. CUSTOMER & POINTS */}
          <div className="p-4 border-b border-white/10 bg-[#1f2937]">
              <div 
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedCustomer ? 'bg-blue-900/20 border-blue-500/50' : 'bg-black/30 border-white/10 hover:border-white/30'}`}
                  onClick={() => setIsMemberModalOpen(true)}
              >
                  <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${selectedCustomer ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                          {selectedCustomer ? selectedCustomer.name.charAt(0) : <User size={20} />}
                      </div>
                      <div>
                          <p className={`font-bold text-sm ${selectedCustomer ? 'text-white' : 'text-gray-400'}`}>
                              {selectedCustomer ? selectedCustomer.name : 'Pelanggan Umum'}
                          </p>
                          <p className="text-[10px] text-gray-500">
                              {selectedCustomer ? `${selectedCustomer.tier} • ${selectedCustomer.points} Pts` : 'Tekan F2 untuk member'}
                          </p>
                      </div>
                  </div>
                  {selectedCustomer && <button onClick={(e) => {e.stopPropagation(); setSelectedCustomer(null)}} className="text-gray-500 hover:text-white"><Delete size={16}/></button>}
              </div>
          </div>

          {/* 2. GIANT TOTAL DISPLAY (VFD Style) */}
          <div className="bg-black p-6 flex flex-col justify-center gap-1 border-b border-white/10 shadow-inner">
              <p className="text-xs text-orange-500 font-bold uppercase tracking-[0.2em] mb-2 text-right">Total Harus Dibayar</p>
              <h1 className="text-5xl md:text-6xl font-black text-green-500 tracking-tighter text-right font-mono" style={{ textShadow: "0 0 10px rgba(34, 197, 94, 0.5)" }}>
                 {total.toLocaleString()}
              </h1>
          </div>

          {/* 3. CALCULATION DETAILS */}
          <div className="p-4 space-y-2 bg-[#161e2e] border-b border-white/10 text-sm">
              <div className="flex justify-between text-gray-400">
                  <span>Total Item</span>
                  <span className="text-white font-bold">{cart.reduce((a,b) => a+b.quantity, 0)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                  <span>PPN (11%)</span>
                  <span>{tax.toLocaleString()}</span>
              </div>
              {/* Payment Preview */}
              {cashReceived > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-400">Tunai</span>
                          <span className="text-white font-mono">{cashReceived.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-bold">KEMBALI</span>
                          <span className="text-xl font-bold text-yellow-400 font-mono">{change.toLocaleString()}</span>
                      </div>
                  </div>
              )}
          </div>

          {/* 4. ACTION BUTTONS GRID */}
          <div className="flex-1 p-4 grid grid-cols-4 gap-2 bg-[#111827]">
              {/* NUMPAD */}
              {[7, 8, 9].map(n => <button key={n} onClick={() => handleNumpadInput(n.toString())} className="bg-gray-800 hover:bg-gray-700 text-white font-bold text-xl rounded-lg h-full border border-white/5">{n}</button>)}
              <button onClick={() => handleNumpadInput('Backspace')} className="bg-gray-800 hover:bg-red-900/30 text-red-400 hover:text-white rounded-lg flex items-center justify-center h-full border border-white/5"><Delete size={20}/></button>

              {[4, 5, 6].map(n => <button key={n} onClick={() => handleNumpadInput(n.toString())} className="bg-gray-800 hover:bg-gray-700 text-white font-bold text-xl rounded-lg h-full border border-white/5">{n}</button>)}
              <button onClick={() => handleNumpadInput('C')} className="bg-gray-800 hover:bg-yellow-900/30 text-yellow-400 hover:text-white font-bold text-lg rounded-lg h-full border border-white/5">C</button>

              {[1, 2, 3].map(n => <button key={n} onClick={() => handleNumpadInput(n.toString())} className="bg-gray-800 hover:bg-gray-700 text-white font-bold text-xl rounded-lg h-full border border-white/5">{n}</button>)}
              
              {/* PAY BUTTON (2 Rows Height) */}
              <button 
                  onClick={() => handleCheckout('cash')} 
                  className="row-span-2 bg-gradient-to-b from-green-600 to-green-700 hover:brightness-110 text-white font-bold rounded-lg shadow-lg flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform border border-green-500/50"
              >
                  <span className="text-[10px] uppercase tracking-widest opacity-80">BAYAR</span>
                  <span className="text-xs opacity-70">(Enter)</span>
              </button>

              <button onClick={() => handleNumpadInput('0')} className="col-span-2 bg-gray-800 hover:bg-gray-700 text-white font-bold text-xl rounded-lg h-full border border-white/5">0</button>
              <button onClick={() => handleNumpadInput('000')} className="bg-gray-800 hover:bg-gray-700 text-white font-bold text-xl rounded-lg h-full border border-white/5">000</button>

              {/* QUICK CASH SUGGESTIONS */}
              <div className="col-span-4 flex gap-2 mt-2">
                   {moneySuggestions.slice(0,3).map(amt => (
                       <button 
                           key={amt} 
                           onClick={() => setNumpadValue(amt.toString())}
                           className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg text-xs font-bold border border-white/10 transition-colors"
                       >
                           {amt / 1000}k
                       </button>
                   ))}
                   <button 
                        onClick={() => setIsPaymentMethodModalOpen(true)}
                        className="flex-1 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-white border border-blue-500/30 rounded-lg text-xs font-bold transition-colors"
                   >
                       Lainnya
                   </button>
              </div>

              {/* UTILITY BUTTONS */}
               <div className="col-span-4 grid grid-cols-3 gap-2 mt-1">
                   <button onClick={handleClearCart} className="py-3 bg-red-900/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg text-xs font-bold border border-red-500/30 transition-colors">Void All</button>
                   <button className="py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-xs font-bold border border-white/10 transition-colors">Pending</button>
                   <button className="py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-xs font-bold border border-white/10 transition-colors">Reprint</button>
               </div>
          </div>
      </div>
      
      {/* --- MODALS --- */}
      
      {/* CATALOG MODAL (F1) */}
      <Modal isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} title="Cari Barang (F1)" size="xl">
          <div className="h-[600px] flex flex-col">
              <POSProductGrid 
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  products={filteredProducts}
                  cart={cart}
                  addToCart={(p) => { addToCart(p); setIsCatalogOpen(false); }} 
              />
          </div>
      </Modal>

      {/* MEMBER & PAYMENT MODALS are handled by parent state passed down */}

    </div>
  );
};

export default POSRetail;
