
import React, { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../../../services/db';
import { Product } from '../../../../products/types';
import { PurchaseOrderItem } from '../../types';
import { Search, ShoppingBag, Wifi } from 'lucide-react';
import GlassInput from '../../../../../components/common/GlassInput';
import CatalogItemCard from './CatalogItemCard';

interface SupplierCatalogProps {
  supplierName: string;
  catalogProducts: Product[]; 
  poItems: PurchaseOrderItem[]; 
  onItemSelect: (product: Product, qty: number) => void;
}

const SupplierCatalog: React.FC<SupplierCatalogProps> = ({ supplierName, catalogProducts, poItems, onItemSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // FETCH LIVE DATA FROM DB (Ingredients) to compare Stock & Cost
  const liveIngredients = useLiveQuery(() => db.ingredients.toArray()) || [];

  // Merge Catalog Data with Live Inventory Data (Stock & Avg Cost)
  const mergedProducts = useMemo(() => {
      return catalogProducts.map(cp => {
          // Try to match catalog item with local ingredient by Name or SKU
          const liveData = liveIngredients.find(ing => 
              ing.name.toLowerCase() === cp.name.toLowerCase() || 
              (ing.sku && cp.sku && ing.sku === cp.sku)
          );
          
          return { 
              ...cp, 
              stock: liveData ? liveData.stock : 0,
              // Attach local avgCost to the product object for comparison in the card
              localAvgCost: liveData ? liveData.avgCost : 0 
          };
      });
  }, [catalogProducts, liveIngredients]);

  const categories = useMemo(() => ['All', ...Array.from(new Set(mergedProducts.map(p => p.category)))], [mergedProducts]);

  const filteredItems = useMemo(() => {
      return mergedProducts.filter(p => {
          const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
          const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
          return matchSearch && matchCat;
      });
  }, [mergedProducts, searchTerm, selectedCategory]);

  return (
    <div className="flex flex-col h-full bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
        {/* Catalog Header */}
        <div className="p-4 border-b border-white/5 bg-white/5">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-white flex items-center gap-2">
                    <ShoppingBag size={16} className="text-orange-500"/> Katalog: {supplierName}
                </h4>
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                        <Wifi size={10} /> Live Data
                    </span>
                    <span className="text-xs text-gray-400 bg-black/20 px-2 py-1 rounded">{filteredItems.length} Item</span>
                </div>
            </div>
            
            <div className="flex gap-2">
                <GlassInput 
                    icon={Search} 
                    placeholder="Cari barang..."
                    className="py-2 text-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    wrapperClassName="flex-1"
                />
                <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="glass-input rounded-xl text-xs px-3 py-2 bg-[#1e293b] appearance-none cursor-pointer"
                >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
        </div>

        {/* Catalog Grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {filteredItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
                    <Search size={32} className="mb-2" />
                    <p className="text-xs">Barang tidak ditemukan</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filteredItems.map(product => {
                        const inCart = poItems.find(i => i.ingredientName === product.name);
                        const currentStock = product.stock || 0;
                        const qty = inCart ? inCart.quantity : 0;
                        
                        // Limit input to available stock
                        const handleUpdateQty = (prod: Product, newQty: number) => {
                            if (newQty > currentStock) {
                                alert(`Stok Supplier Terbatas! Hanya tersedia ${currentStock} ${prod.unit}`);
                                return;
                            }
                            onItemSelect(prod, newQty);
                        };

                        return (
                            <CatalogItemCard 
                                key={product.id} 
                                product={product}
                                qtyInCart={qty}
                                onUpdateQty={handleUpdateQty}
                                // @ts-ignore - passing extra prop safely
                                comparisonPrice={product.localAvgCost}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    </div>
  );
};

export default SupplierCatalog;
