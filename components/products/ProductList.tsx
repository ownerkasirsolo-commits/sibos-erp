
import React from 'react';
import { BusinessType } from '../../types'; 
// @FIX: 'Product' type was incorrectly imported from '../../types'. It has been moved to its own module.
import { Product } from '../../features/products/types';
import { Plus, MoreHorizontal, AlertCircle, ChefHat, Search } from 'lucide-react';
import CompactNumber from '../common/CompactNumber';
import GlassPanel from '../common/GlassPanel';
import GlassInput from '../common/GlassInput';

interface ProductListProps {
  products: Product[];
  selectedProductId: string | null;
  onSelectProduct: (id: string) => void;
  filterMode: 'all' | 'no-recipe';
  setFilterMode: (mode: 'all' | 'no-recipe') => void;
  mobileView: 'list' | 'editor';
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ 
  products, selectedProductId, onSelectProduct, filterMode, setFilterMode, mobileView, searchTerm, setSearchTerm
}) => {
  
  const visibleProducts = products.filter(p => {
    if (filterMode === 'no-recipe') return !p.hasRecipe && p.businessType === BusinessType.CULINARY;
    return true;
  });

  return (
    <div className={`col-span-12 lg:col-span-4 flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar transition-all duration-300
        ${mobileView === 'editor' ? 'hidden lg:flex' : 'flex'}
        lg:h-[calc(100vh-140px)]
    `}>
      
      {/* Header Actions Row */}
      <div className="flex items-center gap-2">
          {/* Search */}
          <GlassInput 
            icon={Search}
            placeholder="Cari..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="py-2 text-sm"
            wrapperClassName="flex-1"
          />

          <button className="w-10 h-10 shrink-0 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center text-gray-400 hover:text-white" title="Opsi">
              <MoreHorizontal size={20} />
          </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button 
              onClick={() => setFilterMode('all')}
              className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold border whitespace-nowrap transition-colors ${filterMode === 'all' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}
          >
              Semua
          </button>
          <button 
              onClick={() => setFilterMode('no-recipe')}
              className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold border whitespace-nowrap transition-colors flex items-center justify-center gap-2 ${filterMode === 'no-recipe' ? 'bg-red-500 text-white border-red-500' : 'bg-white/5 border-transparent text-red-400 hover:bg-white/10'}`}
          >
              <AlertCircle size={14} /> <span className="hidden sm:inline">Tanpa Resep</span>
          </button>
      </div>

      {/* Add Product Button */}
      <button 
          className="w-full py-4 border border-dashed border-gray-600 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:text-orange-400 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all group"
      >
           <Plus size={18} className="group-hover:scale-110 transition-transform" />
           <span className="text-sm font-bold">Menu +</span>
      </button>

      {/* Product List */}
      <div className="space-y-3 pb-8">
          {visibleProducts.map((product) => {
              const isSelected = selectedProductId === product.id;
              const hasRecipe = product.hasRecipe;
              
              return (
                  <GlassPanel 
                      key={product.id} 
                      onClick={() => onSelectProduct(product.id)}
                      className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border flex gap-3 relative overflow-hidden ${isSelected ? 'border-orange-500 bg-orange-500/5 shadow-lg shadow-orange-500/10' : 'border-transparent hover:border-white/10 hover:bg-white/10'}`}
                  >
                      {/* Recipe Indicator Bar (Only for Culinary) */}
                      {product.businessType === BusinessType.CULINARY && (
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${hasRecipe ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      )}

                      <div className="w-16 h-16 rounded-lg bg-gray-800 shrink-0 overflow-hidden ml-2">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex justify-between items-start">
                              <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>{product.name}</h4>
                              {product.businessType === BusinessType.CULINARY && (
                                  <div className={`p-1 rounded-md ${hasRecipe ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`} title={hasRecipe ? "Resep Lengkap" : "Resep Belum Ada"}>
                                      <ChefHat size={14} />
                                  </div>
                              )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{product.category} • {product.sku}</p>
                          <div className="flex items-center justify-between mt-1">
                              <span className="text-orange-400 font-bold text-xs"><CompactNumber value={product.price} /></span>
                              {product.stock !== undefined && <span className="text-[10px] text-gray-400">Stok: {product.stock}</span>}
                          </div>
                      </div>
                  </GlassPanel>
              );
          })}
      </div>
    </div>
  );
};

export default ProductList;
