
import React from 'react';
import { Product } from '../../../../products/types';
import { Plus, Minus, TrendingUp, TrendingDown } from 'lucide-react';
import CompactNumber from '../../../../../components/common/CompactNumber';

interface CatalogItemCardProps {
  product: Product;
  qtyInCart: number;
  onUpdateQty: (product: Product, newQty: number) => void;
  comparisonPrice?: number; // Optional prop for price comparison logic
}

const CatalogItemCard: React.FC<CatalogItemCardProps> = ({ product, qtyInCart, onUpdateQty, comparisonPrice }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value) || 0;
      onUpdateQty(product, val);
  };

  // Price Trend Logic
  let priceDiffPercent = 0;
  let isPriceUp = false;
  let isPriceDown = false;

  if (comparisonPrice && comparisonPrice > 0) {
      const diff = product.price - comparisonPrice;
      priceDiffPercent = (diff / comparisonPrice) * 100;
      isPriceUp = diff > 0;
      isPriceDown = diff < 0;
  }

  return (
    <div 
      className={`relative p-3 rounded-xl group transition-all flex flex-col h-full border ${
          qtyInCart > 0 
          ? 'bg-orange-500/10 border-orange-500 shadow-[0_0_15px_-5px_rgba(249,115,22,0.3)]' 
          : 'bg-white/5 border-white/5 hover:border-orange-500/50 hover:bg-white/10'
      }`}
    >
      <div className="relative mb-3">
        <div className="w-full aspect-square rounded-lg bg-gray-800 overflow-hidden">
           <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
        </div>
        
        {/* Info Badges */}
        <div className="absolute top-1 right-1 flex flex-col gap-1 items-end">
            {product.stock !== undefined && (
                <div className="bg-black/60 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded font-bold border border-white/10">
                    Stok: {product.stock}
                </div>
            )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <h5 className={`font-bold text-xs leading-tight mb-1 line-clamp-2 transition-colors ${qtyInCart > 0 ? 'text-orange-400' : 'text-white group-hover:text-orange-400'}`}>
            {product.name}
        </h5>
        <p className="text-[10px] text-gray-500 mb-2 font-mono">{product.sku}</p>
        
        <div className="mt-auto pt-2">
            <div className="flex justify-between items-end mb-2">
                <div className="flex flex-col">
                    <span className="font-bold text-white text-sm">
                        <CompactNumber value={product.price} />
                        <span className="text-[10px] text-gray-500 font-normal ml-1">/{product.unit}</span>
                    </span>
                    
                    {/* PRICE TREND INDICATOR */}
                    {Math.abs(priceDiffPercent) > 1 && (
                        <div className={`flex items-center gap-1 text-[9px] font-bold mt-0.5 ${isPriceUp ? 'text-red-400' : 'text-green-400'}`}>
                            {isPriceUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            <span>{Math.abs(priceDiffPercent).toFixed(0)}% {isPriceUp ? 'Naik' : 'Turun'}</span>
                        </div>
                    )}
                </div>
            </div>

            {qtyInCart > 0 ? (
                <div className="flex items-center h-8 bg-black/40 rounded-lg border border-orange-500/50 overflow-hidden">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onUpdateQty(product, Math.max(0, qtyInCart - 1)); }}
                        className="w-8 h-full flex items-center justify-center text-white hover:bg-orange-600 transition-colors"
                    >
                        <Minus size={14} />
                    </button>
                    <input 
                        type="number" 
                        className="flex-1 w-full h-full bg-transparent text-center text-xs font-bold text-white outline-none appearance-none"
                        value={qtyInCart}
                        onChange={handleInputChange}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button 
                        onClick={(e) => { e.stopPropagation(); onUpdateQty(product, qtyInCart + 1); }}
                        className="w-8 h-full flex items-center justify-center text-white hover:bg-orange-600 transition-colors"
                    >
                        <Plus size={14} />
                    </button>
                </div>
            ) : (
                <button 
                    onClick={() => onUpdateQty(product, 1)}
                    className="w-full h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold bg-white/10 hover:bg-orange-600 transition-colors gap-1 group/btn"
                >
                    <Plus size={14} className="group-hover/btn:scale-110 transition-transform"/> Tambah
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default CatalogItemCard;
