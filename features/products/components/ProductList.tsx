
import React, { useState } from 'react';
import { BusinessType } from '../../../types'; 
// @FIX: Import extended type from hook
import { AnalyzedProduct } from '../hooks/useProductListLogic';
import { Plus, AlertCircle, ChefHat, Search, TrendingDown, PackageCheck, AlertTriangle, Filter, Star, Ghost, Puzzle, TrendingUp } from 'lucide-react';
import CompactNumber from '../../../components/common/CompactNumber';
import GlassPanel from '../../../components/common/GlassPanel';
import GlassInput from '../../../components/common/GlassInput';
import { useGlobalContext } from '../../../context/GlobalContext';

interface ProductListProps {
  products: AnalyzedProduct[]; // Use extended type
  selectedProductId: string | null;
  onSelectProduct: (id: string) => void;
  onAddProduct: () => void;
  filterMode: 'all' | 'no-recipe' | 'low-stock' | 'star' | 'dog';
  setFilterMode: (mode: 'all' | 'no-recipe' | 'low-stock' | 'star' | 'dog') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  mobileView: 'list' | 'editor';
}

const ProductList: React.FC<ProductListProps> = ({ 
  products, selectedProductId, onSelectProduct, onAddProduct, filterMode, setFilterMode, 
  searchTerm, setSearchTerm, mobileView 
}) => {
  const { activeBusiness } = useGlobalContext();
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const isRetail = activeBusiness?.type === BusinessType.RETAIL;

  // Diction
  const labels = {
      searchPlaceholder: isRetail ? "Cari nama barang, SKU..." : "Cari menu...",
      addButton: isRetail ? "Tambah Barang" : "Tambah Menu",
      itemType: isRetail ? "Produk" : "Menu"
  };
  
  // Helper to get Matrix Icon & Color
  const getMatrixBadge = (category: string) => {
      switch(category) {
          case 'Star': return { icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', label: 'STAR' };
          case 'Plowhorse': return { icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30', label: 'PLOW' };
          case 'Puzzle': return { icon: Puzzle, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', label: 'PUZZLE' };
          case 'Dog': return { icon: Ghost, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', label: 'DOG' };
          default: return null;
      }
  };

  return (
    <div className={`flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar h-full`}>
      
      {/* Header Actions Row */}
      <div className="flex items-center gap-2 shrink-0">
          <GlassInput 
            icon={Search}
            placeholder={labels.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="py-2.5 text-xs"
            wrapperClassName="flex-1"
          />
          <button 
             onClick={() => setIsFilterExpanded(!isFilterExpanded)}
             className={`p-2.5 rounded-xl border transition-colors ${isFilterExpanded ? 'bg-orange-500 text-white border-orange-500' : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'}`}
             title="Filter"
          >
             <Filter size={18} />
          </button>
      </div>

      {/* Collapsible Filters */}
      {isFilterExpanded && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0 animate-in slide-in-from-top-2 duration-200 bg-black/20 p-2 rounded-xl">
             <button 
                  onClick={() => setFilterMode('all')}
                  className={`col-span-2 sm:col-span-1 px-3 py-2 rounded-xl text-[10px] font-bold border whitespace-nowrap transition-colors ${filterMode === 'all' ? 'bg-white/20 text-white border-white/30' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}
              >
                  Semua
              </button>
              <button 
                  onClick={() => setFilterMode('star')}
                  className={`px-3 py-2 rounded-xl text-[10px] font-bold border whitespace-nowrap transition-colors flex items-center justify-center gap-1 ${filterMode === 'star' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : 'bg-white/5 border-transparent text-yellow-500/60 hover:bg-white/10'}`}
              >
                  <Star size={12} /> Stars
              </button>
              <button 
                  onClick={() => setFilterMode('dog')}
                  className={`px-3 py-2 rounded-xl text-[10px] font-bold border whitespace-nowrap transition-colors flex items-center justify-center gap-1 ${filterMode === 'dog' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-white/5 border-transparent text-red-500/60 hover:bg-white/10'}`}
              >
                  <Ghost size={12} /> Dogs
              </button>
              <button 
                  onClick={() => setFilterMode('low-stock')}
                  className={`px-3 py-2 rounded-xl text-[10px] font-bold border whitespace-nowrap transition-colors flex items-center justify-center gap-1 ${filterMode === 'low-stock' ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}
              >
                  <TrendingDown size={12} /> Stok &lt; 10
              </button>
          </div>
      )}

      {/* Add Product Button */}
      <button 
          onClick={onAddProduct}
          className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:brightness-110 text-white rounded-xl flex items-center justify-center gap-2 font-bold text-xs shadow-lg shadow-orange-500/20 transition-transform active:scale-95 shrink-0"
      >
           <Plus size={16} strokeWidth={3} />
           <span>{labels.addButton}</span>
      </button>

      {/* Product List */}
      <div className="space-y-2 pb-20 flex-1">
          {products.map((product) => {
              const isSelected = selectedProductId === product.id;
              const hasRecipe = product.hasRecipe;
              const yieldCount = product.calculatedYield;
              
              // Status Logic
              let statusColor = 'text-green-400';
              let statusBg = 'bg-green-500/10';
              let statusText = `${yieldCount}`;

              if (!hasRecipe && product.businessType === BusinessType.CULINARY) {
                   statusColor = 'text-gray-500';
                   statusBg = 'bg-gray-500/10';
                   statusText = '?';
              } else if (yieldCount <= 0) {
                   statusColor = 'text-red-500';
                   statusBg = 'bg-red-500/10';
                   statusText = '0';
              } else if (yieldCount < 10) {
                   statusColor = 'text-orange-400';
                   statusBg = 'bg-orange-500/10';
                   statusText = `${yieldCount}`;
              }
              
              const matrix = getMatrixBadge(product.matrixCategory);

              return (
                  <GlassPanel 
                      key={product.id} 
                      onClick={() => onSelectProduct(product.id)}
                      className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border flex gap-3 relative overflow-hidden group ${isSelected ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/10' : 'border-transparent hover:border-white/10 hover:bg-white/10'}`}
                  >
                      <div className="w-12 h-12 rounded-lg bg-gray-800 shrink-0 overflow-hidden ml-2 relative">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex justify-between items-start">
                              <h4 className={`font-bold text-xs truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>{product.name}</h4>
                              
                              {/* MATRIX INDICATOR */}
                              {matrix && (
                                  <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded border ${matrix.bg} ${matrix.color} text-[8px] font-bold shadow-sm`}>
                                      <matrix.icon size={8} /> {matrix.label}
                                  </div>
                              )}
                          </div>
                          
                          <p className="text-[10px] text-gray-500 truncate">{product.category}</p>
                          
                          <div className="flex items-center justify-between mt-1">
                              <span className="text-orange-400 font-bold text-[10px]"><CompactNumber value={product.price} /></span>
                              
                              {/* YIELD / STOCK STATUS */}
                              <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${statusBg} ${statusColor}`}>
                                  {yieldCount <= 0 ? <AlertTriangle size={8} /> : <PackageCheck size={8} />}
                                  <span>{statusText}</span>
                              </div>
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
