
import React from 'react';
// @FIX: 'CartItem' type was incorrectly imported from '../../types'. It has been moved to its own module.
// @FIX: 'CustomerDetail' type was incorrectly imported from '../../types'. It has been moved to its own feature module.
import { CustomerDetail } from '../../features/crm/types';
import { CartItem } from '../../features/products/types';
import { User, ShoppingBag, Utensils, Trash2, Minus, Plus } from 'lucide-react';

interface POSCartProps {
  cart: CartItem[];
  selectedCustomer: CustomerDetail | null;
  onMemberClick: () => void;
  orderType: 'dine-in' | 'take-away';
  toggleOrderType: () => void;
  clearCart: () => void;
  updateQuantity: (id: string, delta: number) => void;
  onItemClick: (item: CartItem) => void;
  totals: { subtotal: number; tax: number; total: number };
}

const POSCart: React.FC<POSCartProps> = ({ 
  cart, selectedCustomer, onMemberClick, orderType, toggleOrderType, clearCart, updateQuantity, onItemClick, totals 
}) => {
  return (
    <div className="w-[23%] flex flex-col border-r border-white/5 bg-[#0b1120] relative z-10 shadow-2xl">
      
      {/* HEADER: MEMBER INFO */}
      <div className="h-16 shrink-0 flex items-center justify-between px-3 border-b border-white/5 bg-black/20">
          <div 
            className="flex items-center gap-3 cursor-pointer group flex-1"
            onClick={onMemberClick}
          >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${selectedCustomer ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white' : 'bg-white/10 text-gray-400 group-hover:bg-white/20 group-hover:text-white'}`}>
                  {selectedCustomer ? selectedCustomer.name.charAt(0) : <User size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold truncate leading-tight ${selectedCustomer ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                      {selectedCustomer ? selectedCustomer.name : 'Guest'}
                  </p>
                  {selectedCustomer && (
                      <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[9px] text-orange-400">{selectedCustomer.tier}</span>
                          <span className="text-[9px] text-gray-600">•</span>
                          <span className="text-[9px] text-gray-500">{selectedCustomer.points} pts</span>
                      </div>
                  )}
              </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1">
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
             
             <button 
                onClick={clearCart} 
                className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-colors" 
                title="Hapus"
             >
                 <Trash2 size={16}/>
             </button>
          </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-2">
          {cart.map((item) => (
              <div key={item.id} className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] border border-transparent hover:border-white/10 group transition-all grid grid-cols-12 gap-2 items-center">
                  
                  <div 
                    className="col-span-7 cursor-pointer"
                    onClick={() => onItemClick(item)}
                  >
                      <div className="text-xs font-bold text-gray-200 leading-tight truncate">{item.name}</div>
                      <div className="text-[10px] text-gray-500 font-mono mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis flex items-center gap-1">
                          <span>{item.price.toLocaleString()} x {item.quantity}</span>
                          {item.appliedWholesale && <span className="bg-green-500/20 text-green-400 px-1 rounded text-[8px] font-bold">GROSIR</span>}
                      </div>
                      {item.note && <p className="text-[10px] text-orange-400 italic truncate mt-0.5">"{item.note}"</p>}
                  </div>
                  
                  <div className="col-span-5 flex items-center justify-end gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }} 
                        className="w-10 h-10 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors active:scale-90 border border-red-500/20"
                      >
                        <Minus size={16} strokeWidth={3}/>
                      </button>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }} 
                        className="w-10 h-10 flex items-center justify-center bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors active:scale-90 border border-green-500/20"
                      >
                        <Plus size={16} strokeWidth={3}/>
                      </button>
                  </div>
              </div>
          ))}
      </div>

      {/* Totals Footer */}
      <div className="p-3 bg-black/40 border-t border-white/10 space-y-1 backdrop-blur-md">
          <div className="flex justify-between text-xs text-gray-400">
              <span>Subtotal</span>
              <span>{totals.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
              <span>Tax (11%)</span>
              <span>{totals.tax.toLocaleString()}</span>
          </div>
          <div className="w-full h-px bg-white/10 my-1"></div>
          <div className="flex justify-between items-end">
              <span className="text-sm text-gray-300 font-bold">Total</span>
              <span className="text-xl font-bold text-orange-500">Rp {totals.total.toLocaleString()}</span>
          </div>
      </div>
    </div>
  );
};

export default POSCart;
