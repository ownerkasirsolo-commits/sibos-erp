
import React from 'react';
import { CustomerDetail } from '../../crm/types';
import { CartItem } from '../../products/types';
import { User, ShoppingBag, Utensils, Trash2, Minus, Plus, Gift, PlusSquare } from 'lucide-react';
import CompactNumber from '../../../components/common/CompactNumber';

interface POSCartProps {
  mode: 'culinary' | 'retail';
  cart: CartItem[];
  selectedCustomer: CustomerDetail | null;
  onMemberClick: () => void;
  orderType: 'dine-in' | 'take-away';
  toggleOrderType: () => void;
  clearCart: () => void;
  updateQuantity: (id: string, delta: number) => void;
  onItemClick: (item: CartItem) => void;
  totals: { subtotal: number; tax: number; total: number };
  onAddCustomItem: () => void;
}

const POSCart: React.FC<POSCartProps> = ({ 
  mode, cart, selectedCustomer, onMemberClick, orderType, toggleOrderType, clearCart, updateQuantity, onItemClick, totals, onAddCustomItem 
}) => {
  return (
    <div className="w-[23%] flex flex-col border-r border-white/5 bg-[#0b1120] relative z-10 shadow-2xl">
      
      {/* HEADER: MEMBER INFO */}
      <div className="h-16 shrink-0 flex items-center justify-between px-3 border-b border-white/5 bg-black/20">
          <div 
            className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
            onClick={onMemberClick}
          >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${selectedCustomer ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white' : 'bg-white/10 text-gray-400 group-hover:bg-white/20 group-hover:text-white'}`}>
                  {selectedCustomer ? selectedCustomer.name.charAt(0) : <User size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold truncate leading-tight ${selectedCustomer ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                      {selectedCustomer ? selectedCustomer.name : (mode === 'retail' ? 'Pelanggan Umum' : 'Guest')}
                  </p>
                  {selectedCustomer && (
                      <div className="flex items-center gap-1 mt-0.5 overflow-hidden">
                          <span className="text-[9px] text-orange-400 whitespace-nowrap">{selectedCustomer.tier}</span>
                          <span className="text-[9px] text-gray-600">•</span>
                          <span className="text-[9px] text-gray-500 truncate">{selectedCustomer.points} pts</span>
                      </div>
                  )}
              </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1 shrink-0">
             {/* Only Show Dine-in Toggle for Culinary Mode */}
             {mode === 'culinary' && (
                 <button 
                    onClick={toggleOrderType}
                    className={`p-2 rounded-lg transition-colors border ${
                        orderType === 'take-away' 
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 hover:bg-blue-500/30' 
                        : 'bg-orange-500/20 border-orange-500/50 text-orange-400 hover:bg-orange-500/30'
                    }`}
                    title={orderType === 'take-away' ? 'Mode Takeaway' : 'Mode Dine-in'}
                 >
                    {orderType === 'take-away' ? <ShoppingBag size={16} /> : <Utensils size={16} />}
                 </button>
             )}
             
             <button 
                onClick={clearCart} 
                className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-colors" 
                title="Hapus Semua"
             >
                 <Trash2 size={16}/>
             </button>
          </div>
      </div>

      {/* MANUAL INPUT BAR (NEW) */}
      <div className="px-2 pt-2 shrink-0">
          <button 
              onClick={onAddCustomItem}
              className="w-full py-2.5 rounded-xl border border-dashed border-white/10 hover:border-orange-500/50 hover:bg-white/5 text-gray-400 hover:text-white flex items-center justify-center gap-2 transition-all group"
          >
              <PlusSquare size={16} className="text-orange-500/50 group-hover:text-orange-500" />
              <span className="text-xs font-bold">Input Item Manual</span>
          </button>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-2">
          {cart.map((item, index) => (
              <div 
                key={`${item.id}-${index}`} 
                className={`p-2 rounded-xl border group transition-all grid grid-cols-12 gap-2 items-center ${
                    item.isPromoBonus 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-white/[0.03] hover:bg-white/[0.05] border-transparent hover:border-white/10'
                }`}
              >
                  
                  <div 
                    className="col-span-7 cursor-pointer min-w-0"
                    onClick={() => !item.isPromoBonus && onItemClick(item)}
                  >
                      <div className={`text-xs font-bold leading-tight truncate flex items-center gap-1 ${item.isPromoBonus ? 'text-green-400' : 'text-gray-200'}`}>
                          {item.isPromoBonus && <Gift size={12} className="shrink-0" />}
                          <span className="truncate">{item.name}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis flex items-center gap-1">
                          {item.isPromoBonus ? (
                             <span className="text-green-400 font-bold">GRATIS</span>
                          ) : (
                             <span><CompactNumber value={item.price} currency={false} /> x {item.quantity}</span>
                          )}
                          
                          {item.appliedWholesale && !item.isPromoBonus && <span className="bg-blue-500/20 text-blue-400 px-1 rounded text-[8px] font-bold">GROSIR</span>}
                          {item.isPromoBonus && <span className="text-[8px] bg-green-500/20 text-green-400 px-1 rounded uppercase">{item.promoLabel}</span>}
                      </div>
                      {item.note && <p className="text-[10px] text-orange-400 italic truncate mt-0.5">"{item.note}"</p>}
                  </div>
                  
                  <div className="col-span-5 flex items-center justify-end gap-1">
                      {item.isPromoBonus ? (
                          <span className="text-xs font-bold text-green-400">{item.quantity} Pcs</span>
                      ) : (
                          <>
                              <button 
                                onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }} 
                                className="w-8 h-8 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors active:scale-90 border border-red-500/20 shrink-0"
                              >
                                <Minus size={14} strokeWidth={3}/>
                              </button>
                              
                              <button 
                                onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }} 
                                className="w-8 h-8 flex items-center justify-center bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors active:scale-90 border border-green-500/20 shrink-0"
                              >
                                <Plus size={14} strokeWidth={3}/>
                              </button>
                          </>
                      )}
                  </div>
              </div>
          ))}
      </div>

      {/* Totals Footer */}
      <div className="p-3 bg-black/40 border-t border-white/10 space-y-1 backdrop-blur-md shrink-0">
          <div className="flex justify-between text-xs text-gray-400">
              <span>Subtotal</span>
              <span className="font-mono"><CompactNumber value={totals.subtotal} /></span>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
              <span>Tax (11%)</span>
              <span className="font-mono"><CompactNumber value={totals.tax} /></span>
          </div>
          <div className="w-full h-px bg-white/10 my-1"></div>
          <div className="flex justify-between items-end">
              <span className="text-sm text-gray-300 font-bold">Total</span>
              <span className={`text-xl font-bold ${mode === 'retail' ? 'text-blue-400' : 'text-orange-500'}`}>
                  <CompactNumber value={totals.total} />
              </span>
          </div>
      </div>
    </div>
  );
};

export default POSCart;
