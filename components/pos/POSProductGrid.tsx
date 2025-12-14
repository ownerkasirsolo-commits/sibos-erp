
import React from 'react';
// @FIX: 'Product' and 'CartItem' types were incorrectly imported from '../../types'. They have been moved to their own module.
import { Product, CartItem } from '../../features/products/types';

interface POSProductGridProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  products: Product[];
  cart: CartItem[];
  addToCart: (p: Product) => void;
}

const POSProductGrid: React.FC<POSProductGridProps> = ({ 
  categories, selectedCategory, onSelectCategory, products, cart, addToCart 
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Categories */}
      <div className="py-3 px-4 flex gap-2 overflow-x-auto no-scrollbar border-b border-white/5 bg-black/10 shrink-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === cat 
                    ? 'bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-900/20' 
                    : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
      </div>

      {/* Product Grid - DENSE LAYOUT */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        <div className="grid grid-cols-3 md:grid-cols-5 xl:grid-cols-7 gap-2">
          {products.map(product => {
              const inCart = cart.find(c => c.id === product.id);
              return (
                <div 
                  key={product.id} 
                  onClick={() => addToCart(product)}
                  className={`relative bg-white/[0.03] border border-white/5 rounded-xl p-2 cursor-pointer group hover:bg-white/[0.08] hover:border-orange-500/30 transition-all active:scale-95 flex flex-col h-32 ${inCart ? 'border-orange-500/40 bg-orange-500/5' : ''}`}
                >
                  {inCart && (
                      <div className="absolute top-1 right-1 bg-orange-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md z-10 animate-in zoom-in">
                          {inCart.quantity}
                      </div>
                  )}
                  
                  <div className="w-full h-16 rounded-lg bg-black/30 overflow-hidden mb-2">
                      <img src={product.image} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                      <h3 className="font-bold text-gray-200 text-[10px] leading-snug line-clamp-2">{product.name}</h3>
                      <span className="text-orange-400 font-bold text-xs">{(product.price/1000).toFixed(0)}k</span>
                  </div>
                </div>
              )
          })}
        </div>
      </div>
    </div>
  );
};

export default POSProductGrid;
