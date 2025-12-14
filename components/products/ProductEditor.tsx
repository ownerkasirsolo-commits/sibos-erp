
import React from 'react';
// @FIX: Import Ingredient from its new location in features/irm/types.
import { UnitType } from '../../types';
// @FIX: Product-related types moved to features/products/types.ts
import { Product, RecipeItem, WholesaleTier } from '../../features/products/types';
import { Ingredient } from '../../features/irm/types';
import { ArrowLeft, Layers, DollarSign, Tags, ChefHat, Store, Save, UtensilsCrossed, ShoppingBag, Plus, Trash2, Package, Calculator, ChevronDown } from 'lucide-react';
import CompactNumber from '../common/CompactNumber';
import GlassPanel from '../common/GlassPanel';
import GlassInput from '../common/GlassInput';
import { getCompatibleUnits, convertUnit } from '../../utils/unitConversion';
import { useProductEditorLogic } from '../../hooks/useProductEditorLogic';

interface ProductEditorProps {
  product: Product;
  onUpdate: (p: Product) => void;
  onBack: () => void;
  mobileView: 'list' | 'editor';
  ingredients: Ingredient[];
  addIngredient: (i: Ingredient) => void;
  activeOutletId: string;
  isRetail: boolean;
}

const ProductEditor: React.FC<ProductEditorProps> = ({ 
  product, onUpdate, onBack, mobileView, ingredients, addIngredient, activeOutletId, isRetail 
}) => {
  const {
    activeTab, setActiveTab,
    editedProduct,
    
    newIngredientId, setNewIngredientId,
    newIngredientQty, setNewIngredientQty,
    newIngredientUnit, setNewIngredientUnit,
    handleAddIngredient,
    handleRemoveIngredient,
    
    wholesaleMinQty, setWholesaleMinQty,
    wholesalePrice, setWholesalePrice,
    handleAddWholesaleTier,
    
    handleSaveChanges,
    handleFieldChange,
    handleChannelChange,
  } = useProductEditorLogic({ product, onUpdate, ingredients, addIngredient, activeOutletId });
  
  const renderChannelInput = (channelKey: string, label: string, colorClass: string, icon: React.ReactNode) => {
      // @ts-ignore
      const channelData = editedProduct.channels ? editedProduct.channels[channelKey] : { active: false, price: 0, commission: 0 };
      const isActive = channelData?.active || false;
      const price = channelData?.price || 0;
      const commission = channelData?.commission || 0;
      const cogs = editedProduct.cogs || 0;
      const netRevenue = price - (price * (commission / 100));
      const margin = netRevenue > 0 ? ((netRevenue - cogs) / netRevenue) * 100 : 0;

      return (
        <div className={`p-4 rounded-2xl border transition-all duration-300 ${isActive ? 'bg-black/20 border-white/10' : 'bg-black/10 border-white/5 opacity-60 grayscale'}`}>
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                <div className="flex items-center gap-4 min-w-[180px]">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass} bg-opacity-20`}>{icon}</div>
                    <div>
                        <h4 className="font-bold text-gray-200 text-sm">{label}</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <input type="checkbox" checked={isActive} onChange={(e) => handleChannelChange(channelKey, 'active', e.target.checked)} className="accent-green-500 w-4 h-4" />
                            <span className="text-[10px] text-gray-500">{isActive ? 'Aktif' : 'Non-aktif'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Harga Jual (IDR)</label>
                    <GlassInput type="number" value={price} onChange={(e) => handleChannelChange(channelKey, 'price', parseFloat(e.target.value))} step="any" />
                </div>
                {channelKey !== 'dinein' && (
                    <div className="text-right">
                         <p className="text-[10px] text-gray-500">Net Revenue</p>
                         <p className="text-sm font-bold text-green-400"><CompactNumber value={netRevenue} /></p>
                    </div>
                )}
            </div>
             {isActive && channelKey !== 'dinein' && (
                 <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                     <span className="text-[10px] text-gray-500">Margin: <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${margin < 20 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>{margin.toFixed(1)}%</span></span>
                 </div>
             )}
        </div>
      )
  };

  return (
    <div className={`col-span-12 lg:col-span-8 overflow-y-auto custom-scrollbar glass-panel rounded-3xl p-1 bg-black/20 transition-all duration-300
        ${mobileView === 'list' ? 'hidden lg:block' : 'block'}
        lg:h-[calc(100vh-140px)]
    `}>
       
       <div className="lg:hidden p-4 border-b border-white/5 flex items-center gap-3 text-gray-400 hover:text-white cursor-pointer bg-white/5 mb-2" onClick={onBack}>
          <ArrowLeft size={18} />
          <span className="text-sm font-bold">Kembali ke Daftar</span>
       </div>

       <div className="h-full flex flex-col">
           <div className="p-4 md:p-6 border-b border-white/5 bg-white/[0.02]">
               <div className="flex items-start gap-4 mb-6">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg border border-white/10 shrink-0">
                      <img src={editedProduct.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 pt-1">
                      <h2 className="text-xl font-bold text-white leading-tight">{editedProduct.name}</h2>
                      <p className="text-sm text-gray-400 mt-1">{editedProduct.category} • {editedProduct.sku}</p>
                  </div>
               </div>

               <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {[
                      { id: 'info', label: 'Info', icon: UtensilsCrossed },
                      { id: 'variants', label: 'Varian', icon: Layers },
                      { id: 'pricing', label: 'Harga', icon: DollarSign },
                      isRetail ? { id: 'wholesale', label: 'Grosir', icon: Tags } : { id: 'recipe', label: 'Resep', icon: ChefHat },
                      { id: 'availability', label: 'Stok', icon: Store },
                  ].map(tab => (
                       <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${activeTab === tab.id ? 'bg-orange-600 text-white border-orange-500' : 'bg-white/5 border-transparent text-gray-400'}`}
                       >
                          <tab.icon size={14} /> <span>{tab.label}</span>
                       </button>
                  ))}
               </div>
           </div>

           <div className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar">
              
              {activeTab === 'info' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-400 uppercase">Nama Produk</label>
                              <GlassInput value={editedProduct.name} onChange={(e) => handleFieldChange('name', e.target.value)} />
                          </div>
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-400 uppercase">SKU</label>
                              <GlassInput value={editedProduct.sku} onChange={(e) => handleFieldChange('sku', e.target.value)} />
                          </div>
                       </div>
                  </div>
              )}

              {activeTab === 'pricing' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      {renderChannelInput('dinein', isRetail ? 'Harga Toko' : 'Dine In', 'bg-orange-500 text-orange-400', <Store size={20} />)}
                      {renderChannelInput('gofood', 'GoFood', 'bg-green-500 text-green-400', <ShoppingBag size={20} />)}
                  </div>
              )}

              {activeTab === 'recipe' && !isRetail && (
                   <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div className="md:col-span-2 space-y-4">
                               <GlassPanel className="p-4 rounded-xl border border-white/5 bg-black/20">
                                   <div className="flex flex-col gap-2 mb-4">
                                      <div className="flex gap-2">
                                          <div className="relative flex-1">
                                              <select value={newIngredientId} onChange={(e) => { setNewIngredientId(e.target.value); setNewIngredientUnit(''); }} className="w-full glass-input rounded-lg py-2 pl-3 pr-8 text-sm appearance-none cursor-pointer">
                                                  <option value="">Pilih Bahan...</option>
                                                  {ingredients.map(ing => <option key={ing.id} value={ing.id} className="bg-gray-900">{ing.name}</option>)}
                                              </select>
                                              <ChevronDown className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" size={14} />
                                          </div>
                                          <input type="number" placeholder="Jml" value={newIngredientQty} onChange={(e) => setNewIngredientQty(e.target.value)} className="w-20 glass-input rounded-lg py-2 px-3 text-sm text-center" />
                                          <div className="relative flex-1">
                                              <select value={newIngredientUnit} onChange={(e) => setNewIngredientUnit(e.target.value as UnitType)} disabled={!newIngredientId} className="w-full glass-input rounded-lg py-2 pl-3 pr-8 text-sm appearance-none cursor-pointer">
                                                  <option value="">Satuan...</option>
                                                  {newIngredientId && getCompatibleUnits(ingredients.find(i => i.id === newIngredientId)?.unit || UnitType.KG).map(u => <option key={u} value={u} className="bg-gray-900">{u}</option>)}
                                              </select>
                                              <ChevronDown className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" size={14} />
                                          </div>
                                          <button onClick={handleAddIngredient} className="bg-green-600 hover:bg-green-500 text-white rounded-lg px-4 py-2"><Plus size={18} /></button>
                                      </div>
                                   </div>
                                   <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                       {editedProduct.recipe?.map((item, i) => {
                                           const ing = ingredients.find(ing => ing.id === item.ingredientId);
                                           if (!ing) return null;
                                           const cost = convertUnit(item.quantity, item.unit, ing.unit) * ing.avgCost;
                                           return (
                                              <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                                                  <div className="flex items-center gap-3">
                                                      <Package size={16} className="text-blue-400" />
                                                      <div>
                                                          <p className="text-sm font-semibold text-gray-200">{ing.name}</p>
                                                          <p className="text-xs text-gray-500">{item.quantity} {item.unit}</p>
                                                      </div>
                                                  </div>
                                                  <div className="flex items-center gap-4">
                                                      <p className="text-sm font-mono text-gray-300 font-bold">Rp {cost.toLocaleString()}</p>
                                                      <button onClick={() => handleRemoveIngredient(item.ingredientId)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                                                  </div>
                                              </div>
                                           )
                                       })}
                                   </div>
                               </GlassPanel>
                           </div>
                           <div className="md:col-span-1">
                               <GlassPanel className="p-5 rounded-2xl bg-gradient-to-br from-green-600/10 to-green-900/10 border-green-500/20">
                                   <h3 className="text-sm font-bold text-green-400 mb-4 flex items-center gap-2"><Calculator size={16} /> Margin</h3>
                                   <div className="space-y-3 text-sm">
                                       <div className="flex justify-between text-gray-400"><span>Jual</span><span className="font-bold text-white"><CompactNumber value={editedProduct.price} /></span></div>
                                       <div className="flex justify-between text-gray-400"><span>HPP</span><span className="font-bold text-red-400">- <CompactNumber value={editedProduct.cogs || 0} /></span></div>
                                       <div className="w-full h-px bg-white/10 my-2"></div>
                                       <div className="flex justify-between items-center"><span className="font-bold text-gray-200">Profit</span><span className="font-bold text-green-400 text-lg"><CompactNumber value={editedProduct.price - (editedProduct.cogs || 0)} /></span></div>
                                   </div>
                               </GlassPanel>
                           </div>
                       </div>
                   </div>
              )}
           </div>

           <div className="p-4 border-t border-white/5 bg-black/20 backdrop-blur-md flex justify-end gap-3 z-10">
              <button onClick={onBack} className="px-6 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5">Batal</button>
              <button onClick={handleSaveChanges} className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl shadow-lg flex items-center gap-2"><Save size={18} /> Simpan</button>
           </div>
       </div>
    </div>
  );
};

export default ProductEditor;
