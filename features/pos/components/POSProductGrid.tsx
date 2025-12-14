
import React from 'react';
import { Product, CartItem } from '../../products/types';
import { PackageX, Tag } from 'lucide-react';

interface POSProductGridProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  products: any[]; // Using any to accept extended product type with maxYield from hook
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
              const inCartItem = cart.find(c => c.id === product.id);
              const inCartQty = inCartItem ? inCartItem.quantity : 0;
              const maxYield = product.maxYield; // Injected from hook
              const isOutOfStock = maxYield <= 0;
              const isLowStock = maxYield > 0 && maxYield <= 5;
              const canAddMore = !isOutOfStock && inCartQty < maxYield;
              
              // Check for Wholesale Tiers
              const hasWholesale = product.wholesalePrices && product.wholesalePrices.length > 0;

              return (
                <div 
                  key={product.id} 
                  onClick={() => {
                      if (canAddMore) addToCart(product);
                  }}
                  className={`relative bg-white/[0.03] border rounded-xl p-2 cursor-pointer group transition-all flex flex-col h-36 overflow-hidden
                    ${isOutOfStock 
                        ? 'opacity-50 cursor-not-allowed border-red-500/20 bg-red-900/10 grayscale' 
                        : 'border-white/5 hover:bg-white/[0.08] hover:border-orange-500/30 active:scale-95'
                    }
                    ${inCartItem ? 'border-orange-500/40 bg-orange-500/5' : ''}
                  `}
                >
                  {/* Stock Badge */}
                  {!isOutOfStock && (
                      <div className={`absolute top-1 left-1 text-[8px] font-bold px-1.5 py-0.5 rounded z-10 ${isLowStock ? 'bg-red-500 text-white animate-pulse' : 'bg-black/50 text-gray-300'}`}>
                          {maxYield - inCartQty} Left
                      </div>
                  )}

                  {inCartItem && (
                      <div className="absolute top-1 right-1 bg-orange-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md z-10 animate-in zoom-in">
                          {inCartQty}
                      </div>
                  )}
                  
                  {isOutOfStock && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 backdrop-blur-[1px]">
                          <PackageX size={24} className="text-red-500 mb-1" />
                          <span className="text-[10px] font-bold text-red-400 uppercase">Habis</span>
                      </div>
                  )}
                  
                  <div className="w-full h-16 rounded-lg bg-black/30 overflow-hidden mb-2 relative">
                      <img src={product.image} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                      <h3 className="font-bold text-gray-200 text-[10px] leading-snug line-clamp-2">{product.name}</h3>
                      <div className="flex justify-between items-end">
                          <span className={`font-bold text-xs ${isOutOfStock ? 'text-gray-500' : 'text-orange-400'}`}>
                              {(product.price/1000).toFixed(0)}k
                          </span>
                          {hasWholesale && (
                              <span className="text-[8px] bg-blue-500/20 text-blue-300 px-1 py-0.5 rounded flex items-center gap-0.5" title="Harga Grosir Tersedia">
                                  <Tag size={8} /> Grosir
                              </span>
                          )}
                      </div>
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
