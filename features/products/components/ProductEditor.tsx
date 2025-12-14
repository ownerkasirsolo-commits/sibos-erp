
import React, { useState } from 'react';
import { Product, ProductVariant } from '../types';
import { Ingredient } from '../../irm/types';
import { 
    ArrowLeft, Layers, DollarSign, Tags, ChefHat, Store, Save, 
    Plus, Trash2, Package, Calculator, ChevronDown, ListPlus, 
    ToggleLeft, ToggleRight, Box, CheckSquare, X, Search, Info, Link, Globe, Edit3, FlaskConical, Upload, Camera, Copy, Gift, TrendingDown, CalendarClock
} from 'lucide-react';
import CompactNumber from '../../../components/common/CompactNumber';
import GlassPanel from '../../../components/common/GlassPanel';
import GlassInput from '../../../components/common/GlassInput';
import Combobox from '../../../components/common/Combobox';
import Modal from '../../../components/common/Modal'; // Import Generic Modal
import AddIngredientModal from '../../irm/components/modals/AddIngredientModal';
import { getCompatibleUnits, convertUnit } from '../../../utils/unitConversion';
import { useProductEditorLogic } from '../hooks/useProductEditorLogic';

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

const DAYS_OF_WEEK = [
    { id: 'Mon', label: 'Sen' },
    { id: 'Tue', label: 'Sel' },
    { id: 'Wed', label: 'Rab' },
    { id: 'Thu', label: 'Kam' },
    { id: 'Fri', label: 'Jum' },
    { id: 'Sat', label: 'Sab' },
    { id: 'Sun', label: 'Min' },
];

const ProductEditor: React.FC<ProductEditorProps> = ({ 
  product, onUpdate, onBack, ingredients, addIngredient, activeOutletId, isRetail 
}) => {
  const {
    activeTab, setActiveTab,
    editedProduct,
    currentBusinessOutlets,
    products, // List of products for bundle selection
    
    // UI
    isAddIngredientModalOpen, setIsAddIngredientModalOpen,
    handleSaveNewIngredient,
    handleImageUpload,
    
    // Outlet Logic
    toggleOutletAvailability,
    handleOutletPriceChange,
    handleVariantOutletPriceChange,
    handleApplyBasePriceToAll,

    // Scheduling
    handleToggleSchedule,
    handleDayToggle,
    handleTimeChange,

    // Matrix
    newAttrName, setNewAttrName,
    handleAddAttribute,
    handleRemoveAttribute,
    handleAddAttrValue,
    handleRemoveAttrValue,
    handleUpdateVariantMatrix,
    
    // Variant Recipe Modal
    isVariantRecipeModalOpen,
    activeVariantId,
    tempVariantRecipe,
    handleOpenVariantRecipe,
    handleCloseVariantRecipe,
    handleAddIngredientToVariant,
    handleUpdateVariantRecipeItem,
    handleRemoveVariantIngredient,
    handleSaveVariantRecipe,
    
    // Base Recipe
    handleAddIngredientToBaseRecipe,
    handleUpdateBaseRecipeItem,
    handleRemoveBaseIngredient,

    // Bundle Logic
    selectedBundleProduct, setSelectedBundleProduct,
    handleAddBundleItem,
    handleRemoveBundleItem,
    handleUpdateBundleItemQty,
    calculateBundleCost,
    calculateBundleNormalPrice,

    // Modifiers
    handleAddModifierGroup,
    handleUpdateModifierGroup,
    handleRemoveModifierGroup,
    handleAddModifierOption,
    handleUpdateModifierOption,
    handleRemoveModifierOption,
    
    // Wholesale Logic
    wholesaleMinQty, setWholesaleMinQty,
    wholesalePrice, setWholesalePrice,
    handleAddWholesaleTier,
    handleRemoveWholesaleTier,

    // Calculations
    getProductStock,
    getProductCost,
    calculateCostFromRecipe,

    handleSaveChanges,
    handleFieldChange,
    handleChannelChange,
  } = useProductEditorLogic({ product, onUpdate, ingredients, addIngredient, activeOutletId });
  
  // Helpers for Matrix UI
  const [addingValueForIndex, setAddingValueForIndex] = useState<number | null>(null);
  const [tempValueInput, setTempValueInput] = useState('');
  // State for expanded outlet in pricing accordion
  const [expandedOutletPricingId, setExpandedOutletPricingId] = useState<string | null>(null);

  const confirmAddValue = (index: number) => {
      handleAddAttrValue(index, tempValueInput);
      setTempValueInput('');
      setAddingValueForIndex(null);
  };

  const ingredientOptions = ingredients.map(ing => ({
      value: ing.id,
      label: ing.name,
      group: ing.category
  }));

  const productOptions = products.filter(p => !p.isBundle && p.id !== editedProduct.id).map(p => ({
      value: p.id,
      label: p.name,
      group: p.category
  }));

  const activeVariantName = editedProduct.variants.find(v => v.id === activeVariantId)?.name || 'Varian';

  // --- LOGIC: CENTRAL OUTLET & PRICING VISIBILITY ---
  const currentOutletObj = currentBusinessOutlets.find(o => o.id === activeOutletId);
  const isCentralOutlet = currentOutletObj?.id === '101' || currentOutletObj?.name.toLowerCase().includes('pusat') || currentOutletObj?.name.toLowerCase().includes('gudang');
  
  const enabledOutletIds = editedProduct.outletAvailability === 'all'
      ? currentBusinessOutlets.map(o => o.id)
      : (editedProduct.outletAvailability || []);

  const otherOutlets = currentBusinessOutlets.filter(o => o.id !== activeOutletId);
  const showOutletPricingConfig = isCentralOutlet && enabledOutletIds.length > 1;

  // Bundle Calculations
  const bundleNormalPrice = calculateBundleNormalPrice();
  const savings = bundleNormalPrice - editedProduct.price;
  const savingsPercent = bundleNormalPrice > 0 ? (savings / bundleNormalPrice) * 100 : 0;
  
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
    <div className={`h-full overflow-y-auto custom-scrollbar glass-panel rounded-3xl p-1 bg-black/20 transition-all duration-300 flex flex-col`}>
       
       <div className="lg:hidden p-4 border-b border-white/5 flex items-center gap-3 text-gray-400 hover:text-white cursor-pointer bg-white/5 mb-2" onClick={onBack}>
          <ArrowLeft size={18} />
          <span className="text-sm font-bold">Kembali ke Daftar</span>
       </div>

       <div className="h-full flex flex-col">
           {/* HEADER PREVIEW */}
           <div className="p-4 md:p-6 border-b border-white/5 bg-white/[0.02]">
               <div className="flex items-start gap-4 mb-6">
                  {/* Interactive Image Upload */}
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border border-white/10 shrink-0 relative group bg-black/40">
                      <img src={editedProduct.image} alt="Preview" className="w-full h-full object-cover" />
                      <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <Camera size={20} className="text-white mb-1" />
                          <span className="text-[10px] text-gray-300 font-bold">Ubah Foto</span>
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                  </div>

                  <div className="flex-1 pt-1">
                      <div className="flex justify-between items-start">
                          <div>
                            <h2 className="text-xl font-bold text-white leading-tight">{editedProduct.name}</h2>
                            <p className="text-sm text-gray-400 mt-1">{editedProduct.category} • {editedProduct.sku}</p>
                          </div>
                      </div>
                      
                      <div className="mt-3 flex gap-2">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold border flex items-center gap-1 ${editedProduct.isBundle ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' : (editedProduct.hasVariants ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20')}`}>
                              {editedProduct.isBundle ? <Gift size={10} /> : (editedProduct.hasVariants ? <Layers size={10} /> : <Box size={10} />)}
                              {editedProduct.isBundle ? 'Paket Bundling' : (editedProduct.hasVariants ? 'Produk Varian' : 'Produk Tunggal')}
                          </span>
                          {editedProduct.isOmnichannel && (
                              <span className="px-2 py-1 rounded text-[10px] font-bold border bg-green-500/10 text-green-400 border-green-500/20 flex items-center gap-1">
                                  <Globe size={10} /> Omnichannel
                              </span>
                          )}
                          {editedProduct.availabilitySchedule?.enabled && (
                              <span className="px-2 py-1 rounded text-[10px] font-bold border bg-yellow-500/10 text-yellow-400 border-yellow-500/20 flex items-center gap-1">
                                  <CalendarClock size={10} /> Terjadwal
                              </span>
                          )}
                      </div>
                  </div>
               </div>

               {/* TAB NAVIGATION */}
               <div className="flex gap-2 overflow-x-auto no-scrollbar w-full pb-1">
                  <button onClick={() => setActiveTab('info')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${activeTab === 'info' ? 'bg-orange-600 text-white border-orange-500' : 'bg-white/5 border-transparent text-gray-400'}`}>
                      <Box size={14} /> <span>Info</span>
                  </button>
                  
                  {editedProduct.isBundle ? (
                      <button onClick={() => setActiveTab('bundle')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${activeTab === 'bundle' ? 'bg-orange-600 text-white border-orange-500' : 'bg-white/5 border-transparent text-gray-400'}`}>
                          <Gift size={14} /> <span>Isi Paket</span>
                      </button>
                  ) : (
                      <>
                        {!isRetail && (
                            <button onClick={() => setActiveTab('recipe')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${activeTab === 'recipe' ? 'bg-orange-600 text-white border-orange-500' : 'bg-white/5 border-transparent text-gray-400'}`}>
                                <ChefHat size={14} /> <span>{editedProduct.hasVariants ? 'Resep Dasar' : 'Resep (HPP)'}</span>
                            </button>
                        )}
                        {editedProduct.hasVariants && (
                            <button onClick={() => setActiveTab('variants')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${activeTab === 'variants' ? 'bg-orange-600 text-white border-orange-500' : 'bg-white/5 border-transparent text-gray-400'}`}>
                                <Layers size={14} /> <span>Varian</span>
                            </button>
                        )}
                      </>
                  )}
                  
                  <button onClick={() => setActiveTab('pricing')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${activeTab === 'pricing' ? 'bg-orange-600 text-white border-orange-500' : 'bg-white/5 border-transparent text-gray-400'}`}>
                      <DollarSign size={14} /> <span>Harga & Stok</span>
                  </button>

                  {/* WHOLESALE TAB (RETAIL ONLY) */}
                  {isRetail && !editedProduct.hasVariants && (
                      <button onClick={() => setActiveTab('wholesale')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${activeTab === 'wholesale' ? 'bg-orange-600 text-white border-orange-500' : 'bg-white/5 border-transparent text-gray-400'}`}>
                          <Tags size={14} /> <span>Grosir</span>
                      </button>
                  )}
                  
                  <button onClick={() => setActiveTab('schedule')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${activeTab === 'schedule' ? 'bg-orange-600 text-white border-orange-500' : 'bg-white/5 border-transparent text-gray-400'}`}>
                      <CalendarClock size={14} /> <span>Jadwal</span>
                  </button>

                  {!editedProduct.isBundle && (
                      <button onClick={() => setActiveTab('modifiers')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${activeTab === 'modifiers' ? 'bg-orange-600 text-white border-orange-500' : 'bg-white/5 border-transparent text-gray-400'}`}>
                          <ListPlus size={14} /> <span>Topping</span>
                      </button>
                  )}
               </div>
           </div>

           <div className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar">
              
              {/* TAB 1: INFO UMUM */}
              {activeTab === 'info' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-400 uppercase">Nama Produk</label>
                              <GlassInput value={editedProduct.name} onChange={(e) => handleFieldChange('name', e.target.value)} />
                          </div>
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-400 uppercase">Kategori</label>
                              <GlassInput value={editedProduct.category} onChange={(e) => handleFieldChange('category', e.target.value)} />
                          </div>
                          <div className="col-span-1 md:col-span-2 space-y-2">
                              <label className="text-xs font-bold text-gray-400 uppercase">Deskripsi</label>
                              <textarea 
                                className="w-full glass-input rounded-xl p-3 text-sm h-24 resize-none text-white"
                                placeholder="Deskripsi produk untuk ditampilkan di menu..."
                                value={editedProduct.description || ''}
                                onChange={(e) => handleFieldChange('description', e.target.value)}
                              ></textarea>
                          </div>

                           {/* PRODUCT TYPE TOGGLE - Simplified Logic */}
                            <div className="col-span-1 md:col-span-2 p-4 bg-white/5 rounded-xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h4 className="font-bold text-white text-sm">Tipe Produk</h4>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Pilih jenis produk ini.
                                    </p>
                                </div>
                                <div className="flex bg-black/20 p-1 rounded-lg">
                                    <button 
                                        onClick={() => { handleFieldChange('hasVariants', false); handleFieldChange('isBundle', false); }}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${!editedProduct.hasVariants && !editedProduct.isBundle ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Tunggal
                                    </button>
                                    <button 
                                        onClick={() => { handleFieldChange('hasVariants', true); handleFieldChange('isBundle', false); }}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${editedProduct.hasVariants && !editedProduct.isBundle ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Varian
                                    </button>
                                    <button 
                                        onClick={() => { handleFieldChange('isBundle', true); handleFieldChange('hasVariants', false); }}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${editedProduct.isBundle ? 'bg-pink-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Paket Bundle
                                    </button>
                                </div>
                            </div>
                          
                          {/* OUTLET AVAILABILITY */}
                          <div className="col-span-1 md:col-span-2 p-4 bg-white/5 rounded-xl border border-white/5">
                              <h4 className="font-bold text-white text-sm mb-3">Ketersediaan Outlet</h4>
                              <div className="flex flex-wrap gap-2">
                                  <button 
                                    onClick={() => handleFieldChange('outletAvailability', 'all')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${editedProduct.outletAvailability === 'all' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-transparent text-gray-400'}`}
                                  >
                                      Semua Outlet
                                  </button>
                                  {currentBusinessOutlets.map(outlet => {
                                      const isSelected = editedProduct.outletAvailability === 'all' || (Array.isArray(editedProduct.outletAvailability) && editedProduct.outletAvailability.includes(outlet.id));
                                      return (
                                        <button 
                                            key={outlet.id}
                                            onClick={() => toggleOutletAvailability(outlet.id)}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors flex items-center gap-2 ${isSelected ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-transparent text-gray-500'}`}
                                        >
                                            {isSelected && <CheckSquare size={14} />} {outlet.name}
                                        </button>
                                      );
                                  })}
                              </div>
                          </div>

                          {/* OMNICHANNEL TOGGLE */}
                          <div className={`col-span-1 md:col-span-2 p-4 rounded-xl border flex items-center justify-between transition-colors ${editedProduct.isOmnichannel ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/5'}`}>
                              <div>
                                  <h4 className={`font-bold text-sm ${editedProduct.isOmnichannel ? 'text-green-400' : 'text-white'}`}>Jual di Omnichannel</h4>
                                  <p className="text-xs text-gray-400 mt-1">
                                      Tampilkan menu ini di aplikasi Food Delivery (GoFood/Grab/dll).
                                  </p>
                              </div>
                              <button 
                                onClick={() => handleFieldChange('isOmnichannel', !editedProduct.isOmnichannel)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${editedProduct.isOmnichannel ? 'bg-green-600 text-white shadow-lg shadow-green-500/20' : 'bg-white/10 text-gray-400'}`}
                              >
                                  {editedProduct.isOmnichannel ? <CheckSquare size={18} /> : <X size={18} />}
                                  {editedProduct.isOmnichannel ? "Aktif" : "Tidak"}
                              </button>
                          </div>
                       </div>
                  </div>
              )}

              {/* WHOLESALE TAB (RETAIL ONLY) */}
              {activeTab === 'wholesale' && isRetail && !editedProduct.hasVariants && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                          <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                              <Tags size={16} className="text-orange-400" /> Aturan Harga Grosir
                          </h4>
                          <p className="text-xs text-gray-300">
                              Sistem akan otomatis menggunakan harga ini jika jumlah pembelian di POS mencapai minimal Qty.
                          </p>
                      </div>

                      {/* ADD TIER FORM */}
                      <div className="flex gap-3 items-end p-4 bg-white/5 rounded-xl border border-white/5">
                          <div className="flex-1">
                              <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Minimal Qty</label>
                              <GlassInput 
                                  type="number" 
                                  placeholder="Contoh: 10" 
                                  value={wholesaleMinQty}
                                  onChange={e => setWholesaleMinQty(e.target.value)}
                              />
                          </div>
                          <div className="flex-1">
                              <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Harga Satuan (Grosir)</label>
                              <div className="relative">
                                  <span className="absolute left-3 top-2.5 text-gray-400 text-xs">Rp</span>
                                  <GlassInput 
                                      type="number" 
                                      placeholder="0" 
                                      className="pl-8"
                                      value={wholesalePrice}
                                      onChange={e => setWholesalePrice(e.target.value)}
                                  />
                              </div>
                          </div>
                          <button 
                              onClick={handleAddWholesaleTier}
                              disabled={!wholesaleMinQty || !wholesalePrice}
                              className="h-[42px] px-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              <Plus size={18} />
                          </button>
                      </div>

                      {/* TIER LIST */}
                      <div className="space-y-2">
                          {(editedProduct.wholesalePrices || []).length === 0 ? (
                              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-white/10 rounded-xl">
                                  <p className="text-xs">Belum ada aturan grosir.</p>
                              </div>
                          ) : (
                              (editedProduct.wholesalePrices || []).map((tier, idx) => (
                                  <div key={idx} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                      <div className="flex items-center gap-4">
                                          <span className="text-xs font-bold text-white bg-blue-600 px-2 py-1 rounded">
                                              ≥ {tier.minQty} {editedProduct.unit}
                                          </span>
                                          <span className="text-gray-400 text-xs">→</span>
                                          <span className="text-sm font-bold text-orange-400">
                                              <CompactNumber value={tier.price} /> /pcs
                                          </span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                          <span className="text-[10px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                                              Hemat {((1 - (tier.price / editedProduct.price)) * 100).toFixed(0)}%
                                          </span>
                                          <button onClick={() => handleRemoveWholesaleTier(tier.minQty)} className="text-gray-500 hover:text-red-400 transition-colors">
                                              <Trash2 size={16} />
                                          </button>
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
              )}

              {/* NEW TAB: SCHEDULING / DAYPARTING */}
              {activeTab === 'schedule' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      
                      {/* 1. Master Toggle */}
                      <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                          <div>
                              <h4 className="text-sm font-bold text-white mb-1">Batasi Jam Penjualan (Dayparting)</h4>
                              <p className="text-xs text-gray-400">Atur kapan menu ini muncul di POS (misal: Menu Sarapan).</p>
                          </div>
                          <button 
                              onClick={() => handleToggleSchedule(!editedProduct.availabilitySchedule?.enabled)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${editedProduct.availabilitySchedule?.enabled ? 'bg-yellow-600 text-white shadow-lg' : 'bg-white/10 text-gray-400'}`}
                          >
                              {editedProduct.availabilitySchedule?.enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                              {editedProduct.availabilitySchedule?.enabled ? "Aktif" : "Tidak Aktif"}
                          </button>
                      </div>

                      {/* 2. Schedule Config */}
                      {editedProduct.availabilitySchedule?.enabled && (
                          <div className="glass-panel p-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 animate-in slide-in-from-top-2">
                              
                              {/* Days Selection */}
                              <div className="mb-6">
                                  <label className="text-xs font-bold text-yellow-400 uppercase mb-3 block">Hari Aktif</label>
                                  <div className="flex gap-2 flex-wrap">
                                      {DAYS_OF_WEEK.map(day => {
                                          const isActive = editedProduct.availabilitySchedule?.days.includes(day.id);
                                          return (
                                              <button 
                                                  key={day.id}
                                                  onClick={() => handleDayToggle(day.id)}
                                                  className={`w-12 h-10 rounded-lg text-xs font-bold border transition-all ${isActive ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-black/20 text-gray-400 border-white/10 hover:border-white/20'}`}
                                              >
                                                  {day.label}
                                              </button>
                                          );
                                      })}
                                  </div>
                              </div>

                              {/* Time Selection */}
                              <div>
                                  <label className="text-xs font-bold text-yellow-400 uppercase mb-3 block">Jam Aktif</label>
                                  <div className="flex items-center gap-4">
                                      <div className="relative">
                                          <input 
                                              type="time" 
                                              className="bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-bold focus:border-yellow-500 outline-none"
                                              value={editedProduct.availabilitySchedule.timeStart}
                                              onChange={(e) => handleTimeChange('timeStart', e.target.value)}
                                          />
                                      </div>
                                      <span className="text-gray-400 font-bold">-</span>
                                      <div className="relative">
                                          <input 
                                              type="time" 
                                              className="bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-bold focus:border-yellow-500 outline-none"
                                              value={editedProduct.availabilitySchedule.timeEnd}
                                              onChange={(e) => handleTimeChange('timeEnd', e.target.value)}
                                          />
                                      </div>
                                  </div>
                                  <p className="text-[10px] text-gray-400 mt-2 italic">
                                      * Produk akan otomatis disembunyikan dari POS di luar jam ini.
                                  </p>
                              </div>

                          </div>
                      )}
                  </div>
              )}

              {/* TAB: BUNDLE CONFIGURATION */}
              {activeTab === 'bundle' && editedProduct.isBundle && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                       <div className="glass-panel p-4 rounded-xl border border-white/5 bg-black/20">
                            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <Gift size={16} className="text-pink-500" /> Isi Paket Bundling
                            </h4>
                            <p className="text-xs text-gray-400 mb-6">
                                Pilih produk-produk yang termasuk dalam paket ini. Stok akan otomatis terpotong dari masing-masing produk saat paket terjual.
                            </p>

                            {/* Add Bundle Item */}
                            <div className="mb-6 flex gap-2">
                                <div className="flex-1">
                                    <Combobox 
                                        options={productOptions} 
                                        value={selectedBundleProduct} 
                                        onChange={setSelectedBundleProduct}
                                        placeholder="Cari produk..."
                                    />
                                </div>
                                <button 
                                    onClick={handleAddBundleItem}
                                    disabled={!selectedBundleProduct}
                                    className="bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg"
                                >
                                    <Plus size={18} /> Tambah
                                </button>
                            </div>

                            {/* Bundle List */}
                            <div className="space-y-2">
                                {(editedProduct.bundleItems || []).length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-white/10 rounded-xl bg-white/5">
                                        <p className="text-xs">Belum ada isi paket.</p>
                                    </div>
                                ) : (
                                    editedProduct.bundleItems?.map((item, i) => {
                                        const prod = products.find(p => p.id === item.productId);
                                        if (!prod) return null;
                                        return (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-800 overflow-hidden">
                                                        <img src={prod.image} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{prod.name}</p>
                                                        <p className="text-xs text-gray-500">Harga Satuan: <CompactNumber value={prod.price}/></p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center bg-black/40 rounded-lg border border-white/10 h-8">
                                                        <input 
                                                            type="number" 
                                                            value={item.quantity} 
                                                            onChange={(e) => handleUpdateBundleItemQty(i, parseInt(e.target.value))}
                                                            className="w-12 h-full bg-transparent text-center text-sm font-bold text-white outline-none"
                                                        />
                                                        <span className="text-xs text-gray-500 pr-2">x</span>
                                                    </div>
                                                    <button onClick={() => handleRemoveBundleItem(i)} className="text-red-400 hover:text-white p-2 rounded hover:bg-red-500/20">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>

                            {/* Pricing Summary */}
                            {(editedProduct.bundleItems || []).length > 0 && (
                                <div className="mt-6 p-4 bg-pink-500/10 border border-pink-500/20 rounded-xl">
                                    <div className="flex justify-between items-center text-sm mb-2">
                                        <span className="text-gray-400">Total Harga Normal</span>
                                        <span className="text-white font-bold line-through decoration-red-500"><CompactNumber value={bundleNormalPrice} /></span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm mb-2">
                                        <span className="text-gray-400">Harga Jual Paket</span>
                                        <span className="text-pink-400 font-bold text-lg"><CompactNumber value={editedProduct.price} /></span>
                                    </div>
                                    <div className="w-full h-px bg-pink-500/20 my-2"></div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-green-400 font-bold flex items-center gap-1">
                                            <TrendingDown size={14} /> Hemat
                                        </span>
                                        <span className="text-green-400 font-bold">
                                            <CompactNumber value={savings} /> ({savingsPercent.toFixed(0)}%)
                                        </span>
                                    </div>
                                </div>
                            )}
                       </div>
                  </div>
              )}

              {/* TAB 2: RESEP DASAR (ALWAYS BASE) - Hidden for Retail */}
              {activeTab === 'recipe' && !isRetail && !editedProduct.isBundle && (
                   <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                       <div className="glass-panel p-4 rounded-xl border border-white/5 bg-black/20">
                            <h4 className="text-sm font-bold text-white mb-4">
                                {editedProduct.hasVariants ? "Bahan Baku Utama (Base Recipe)" : "Bahan Baku & HPP"}
                            </h4>
                            {editedProduct.hasVariants && (
                                <p className="text-xs text-gray-400 mb-6">
                                    Resep ini berlaku untuk <b>Semua Varian</b> secara default. Jika ada varian yang membutuhkan bahan tambahan (misal: Extra Rice untuk Jumbo), atur di tab <b>Varian</b>.
                                </p>
                            )}

                            {/* Combobox Search & Add */}
                            <div className="mb-6">
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                                    Tambah Bahan Dasar
                                </label>
                                <Combobox 
                                    options={ingredientOptions} 
                                    value={""} 
                                    onChange={(val) => handleAddIngredientToBaseRecipe(val)}
                                    onAddNew={() => setIsAddIngredientModalOpen(true)}
                                    placeholder="Ketik nama bahan baku..."
                                />
                            </div>

                            {/* Base Recipe List */}
                            <div className="mb-6">
                                <div className="space-y-2">
                                    {(editedProduct.recipe || []).length === 0 ? (
                                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-white/10 rounded-xl bg-white/5">
                                            <p className="text-xs">Belum ada bahan dasar.</p>
                                        </div>
                                    ) : (
                                        (editedProduct.recipe || []).map((item, i) => {
                                        const ing = ingredients.find(ing => ing.id === item.ingredientId);
                                        if (!ing) return null;
                                        const cost = convertUnit(item.quantity, item.unit, ing.unit) * ing.avgCost;
                                        
                                        return (
                                            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-orange-500/30 transition-colors gap-3">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 bg-blue-500/20 text-blue-400`}>
                                                        <ChefHat size={18} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-gray-200 truncate">{ing.name}</p>
                                                        <p className="text-[10px] text-gray-500">{ing.category}</p>
                                                    </div>
                                                </div>
                                                
                                                {/* Inline Input Group */}
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20">
                                                        <GlassInput 
                                                            type="number" 
                                                            value={item.quantity} 
                                                            onChange={(e) => handleUpdateBaseRecipeItem(i, 'quantity', parseFloat(e.target.value))}
                                                            className="py-1.5 px-2 text-center text-sm font-bold h-9"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    <div className="w-24">
                                                        <select 
                                                            value={item.unit} 
                                                            onChange={(e) => handleUpdateBaseRecipeItem(i, 'unit', e.target.value)} 
                                                            className="w-full h-9 bg-black/40 border border-white/10 rounded-xl px-2 text-xs text-white outline-none focus:border-orange-500 appearance-none cursor-pointer"
                                                        >
                                                            {getCompatibleUnits(ing.unit).map(u => <option key={u} value={u} className="bg-gray-900">{u}</option>)}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 justify-end min-w-[100px]">
                                                    <p className="text-sm font-mono text-gray-300 font-bold">Rp {cost.toLocaleString()}</p>
                                                    <button onClick={() => handleRemoveBaseIngredient(item.ingredientId)} className="p-2 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                        )
                                        })
                                    )}
                                </div>
                            </div>
                       </div>
                   </div>
              )}

              {/* TAB 3: VARIANTS CONFIGURATION */}
              {activeTab === 'variants' && editedProduct.hasVariants && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      
                      {/* 1. ATTRIBUTE DEFINITION */}
                      <div className="space-y-3">
                            <h4 className="text-sm font-bold text-white uppercase mb-2">1. Definisi Varian</h4>
                            {editedProduct.attributes?.map((attr, idx) => (
                                <div key={attr.id} className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm font-bold text-white uppercase">{attr.name}</span>
                                        <button onClick={() => handleRemoveAttribute(idx)} className="text-red-400 hover:text-white p-1 rounded hover:bg-red-500/20"><Trash2 size={14}/></button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {attr.values.map((val, valIdx) => (
                                            <div key={valIdx} className="bg-black/40 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm text-gray-200 border border-white/10">
                                                {val}
                                                <button onClick={() => handleRemoveAttrValue(idx, valIdx)} className="text-gray-500 hover:text-red-400"><X size={12}/></button>
                                            </div>
                                        ))}
                                        {addingValueForIndex === idx ? (
                                            <div className="flex items-center gap-1">
                                                <input 
                                                type="text" 
                                                className="w-24 bg-black/40 border border-orange-500/50 rounded-lg px-2 py-1 text-sm text-white focus:outline-none"
                                                value={tempValueInput}
                                                onChange={(e) => setTempValueInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && confirmAddValue(idx)}
                                                autoFocus
                                                />
                                                <button onClick={() => confirmAddValue(idx)} className="bg-green-600 text-white p-1 rounded hover:bg-green-500"><Plus size={14}/></button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setAddingValueForIndex(idx)} className="px-3 py-1.5 rounded-lg border border-dashed border-gray-600 text-gray-500 hover:text-white hover:border-white/30 text-xs font-bold flex items-center gap-1">
                                                <Plus size={12} /> Tambah {attr.name}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            
                            <div className="flex gap-2">
                                <input 
                                type="text" 
                                placeholder="Nama Atribut Baru (e.g. Rasa, Ukuran)" 
                                className="glass-input rounded-xl px-4 py-2 text-sm flex-1"
                                value={newAttrName}
                                onChange={(e) => setNewAttrName(e.target.value)}
                                />
                                <button onClick={handleAddAttribute} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold">
                                    Tambah Atribut
                                </button>
                            </div>
                      </div>

                      <div className="w-full h-px bg-white/10 my-4"></div>

                      {/* 2. VARIANT MATRIX TABLE (Simplified) */}
                      <div>
                           <h4 className="text-sm font-bold text-white uppercase mb-4">2. Daftar Varian & Resep Khusus</h4>
                           
                           {editedProduct.variants.length > 0 ? (
                               <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20">
                                   <table className="w-full text-left text-sm">
                                       <thead className="bg-white/5 text-gray-400 font-bold uppercase text-xs">
                                           <tr>
                                               <th className="p-3">Nama Varian</th>
                                               <th className="p-3 text-center">Resep Tambahan</th>
                                               <th className="p-3 text-right">Aksi</th>
                                           </tr>
                                       </thead>
                                       <tbody className="divide-y divide-white/5">
                                           {editedProduct.variants.map((v, i) => {
                                               const hasSpecificRecipe = v.recipe && v.recipe.length > 0;
                                               return (
                                                   <tr key={v.id} className="hover:bg-white/5">
                                                       <td className="p-3 font-bold text-white">
                                                           {v.name}
                                                       </td>
                                                       <td className="p-3 text-center">
                                                           {hasSpecificRecipe ? (
                                                               <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                                                                   <FlaskConical size={10} /> Ada (+{v.recipe?.length} Bahan)
                                                               </span>
                                                           ) : (
                                                               <span className="text-[10px] text-gray-500">-</span>
                                                           )}
                                                       </td>
                                                       <td className="p-3 text-right">
                                                           <button 
                                                                onClick={() => handleOpenVariantRecipe(v)}
                                                                className="px-3 py-1.5 bg-white/5 hover:bg-orange-600 hover:text-white text-gray-400 rounded-lg text-xs font-bold transition-all border border-white/10"
                                                           >
                                                               {hasSpecificRecipe ? 'Edit Komposisi' : 'Atur Komposisi'}
                                                           </button>
                                                       </td>
                                                   </tr>
                                               );
                                           })}
                                       </tbody>
                                   </table>
                               </div>
                           ) : (
                               <div className="text-center py-8 text-gray-500 border-2 border-dashed border-white/10 rounded-xl bg-white/5">
                                   <p className="text-xs">Belum ada varian terbentuk. Tambahkan atribut di atas.</p>
                                </div>
                           )}
                      </div>
                  </div>
              )}

              {/* TAB 4: PRICING (Unified Logic) */}
              {activeTab === 'pricing' && (
                  <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4">
                      
                        <h4 className="text-sm font-bold text-white mb-2 ml-1">
                            {editedProduct.hasVariants ? "Matriks Harga & Stok" : "Harga & Stok Tunggal"}
                        </h4>

                        {!editedProduct.hasVariants ? (
                            <div className="space-y-6">
                                {/* SIMPLE PRODUCT INPUTS */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Harga Jual Dasar (IDR)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3 text-gray-500 font-bold">Rp</span>
                                            <GlassInput className="pl-10 font-bold text-lg" type="number" value={editedProduct.price} onChange={(e) => handleFieldChange('price', parseFloat(e.target.value))} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">SKU / Barcode</label>
                                        <GlassInput value={editedProduct.sku || ''} onChange={(e) => handleFieldChange('sku', e.target.value)} placeholder="Scan Barcode..." />
                                    </div>
                                    
                                    {/* STOK FIELD */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Stok Tersedia</label>
                                        <div className="flex gap-2">
                                            {editedProduct.hasRecipe || editedProduct.isBundle ? (
                                                <div className="relative w-full">
                                                    <div className="w-full glass-input rounded-xl py-3 px-4 font-bold text-gray-400 bg-white/5 border-white/5 cursor-not-allowed flex items-center justify-between">
                                                        <span>{getProductStock()}</span>
                                                        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded flex items-center gap-1 font-normal border border-blue-500/30">
                                                            <Link size={10} /> Auto ({editedProduct.isBundle ? 'Bundle' : 'Resep'})
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <GlassInput 
                                                    type="number" 
                                                    value={editedProduct.stock || 0} 
                                                    onChange={(e) => handleFieldChange('stock', parseFloat(e.target.value))} 
                                                    className="font-bold" 
                                                />
                                            )}
                                            <div className="w-24 flex items-center justify-center bg-white/5 rounded-xl text-sm font-bold text-gray-400 border border-white/5">
                                                {editedProduct.unit}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* OMNICHANNEL PRICING OVERRIDE (For Simple Product) */}
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                     <h4 className="text-sm font-bold text-white mb-2">Harga Channel Online</h4>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         {renderChannelInput('dinein', isRetail ? 'Harga Toko' : 'Dine In', 'bg-orange-500 text-orange-400', <Store size={20} />)}
                                         {renderChannelInput('gofood', 'GoFood', 'bg-green-500 text-green-400', <Box size={20} />)}
                                         {renderChannelInput('google_shopping', 'Google Shopping', 'bg-blue-600 text-blue-100', <Box size={20} />)}
                                     </div>
                                </div>
                            </div>
                        ) : (
                            // MATRIX PRICING TABLE (Simplified)
                            <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20">
                                  <table className="w-full text-left text-sm">
                                      <thead className="bg-white/5 text-gray-400 font-bold uppercase text-xs">
                                          <tr>
                                              <th className="p-3">Kombinasi</th>
                                              <th className="p-3 text-right">HPP (Est)</th>
                                              <th className="p-3 w-32">Harga Jual</th>
                                              <th className="p-3 w-20 text-center">Margin</th>
                                              <th className="p-3 w-24 text-center">Stok</th>
                                              <th className="p-3 w-16 text-center">Aktif</th>
                                          </tr>
                                      </thead>
                                      <tbody className="divide-y divide-white/5">
                                          {editedProduct.variants.map((variant, idx) => {
                                              const variantCost = getProductCost(variant.id);
                                              const margin = variant.price > 0 ? ((variant.price - variantCost) / variant.price) * 100 : 0;
                                              const stock = getProductStock(variant.id);

                                              return (
                                              <tr key={variant.id} className={`hover:bg-white/5 ${!variant.active ? 'opacity-50' : ''}`}>
                                                  <td className="p-3">
                                                      <span className="font-bold text-white">{variant.name}</span>
                                                      <div className="text-[10px] text-gray-500 font-mono mt-0.5">{variant.sku}</div>
                                                  </td>
                                                  <td className="p-3 text-right">
                                                      <span className="text-xs font-mono text-gray-400">
                                                          <CompactNumber value={variantCost} />
                                                      </span>
                                                  </td>
                                                  <td className="p-3">
                                                      <input 
                                                          type="number" 
                                                          className="w-full bg-black/20 rounded p-1.5 text-white font-bold outline-none border border-white/5 focus:border-orange-500/50 text-right" 
                                                          value={variant.price} 
                                                          onChange={(e) => handleUpdateVariantMatrix(idx, 'price', parseFloat(e.target.value))} 
                                                          disabled={!variant.active}
                                                      />
                                                  </td>
                                                  <td className="p-3 text-center">
                                                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${margin < 30 ? 'text-red-400 bg-red-500/10' : 'text-green-400 bg-green-500/10'}`}>
                                                          {margin.toFixed(0)}%
                                                      </span>
                                                  </td>
                                                  <td className="p-3 text-center">
                                                      {editedProduct.hasRecipe ? (
                                                          <span className="text-xs font-bold text-blue-400 flex items-center justify-center gap-1 cursor-help" title="Dihitung dari stok bahan">
                                                              {stock} <Link size={10}/>
                                                          </span>
                                                      ) : (
                                                          <input 
                                                              type="number" 
                                                              className="w-full bg-black/20 rounded p-1.5 text-center text-white outline-none border border-white/5 focus:border-orange-500/50" 
                                                              value={variant.stock || 0} 
                                                              onChange={(e) => handleUpdateVariantMatrix(idx, 'stock', parseFloat(e.target.value))} 
                                                              disabled={!variant.active}
                                                          />
                                                      )}
                                                  </td>
                                                  <td className="p-3 text-center">
                                                      <input 
                                                        type="checkbox" 
                                                        checked={variant.active} 
                                                        onChange={(e) => handleUpdateVariantMatrix(idx, 'active', e.target.checked)} 
                                                        className="accent-green-500 w-4 h-4 cursor-pointer"
                                                      />
                                                  </td>
                                              </tr>
                                          )})}
                                      </tbody>
                                  </table>
                            </div>
                        )}
                        
                        {/* OUTLET SPECIFIC PRICING */}
                        {showOutletPricingConfig && (
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5 transition-all">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h4 className="font-bold text-white text-sm">Pengaturan Harga Outlet</h4>
                                        <p className="text-xs text-gray-400">Atur harga khusus untuk cabang lain.</p>
                                    </div>
                                    <button 
                                        onClick={() => handleFieldChange('isGlobalPrice', !editedProduct.isGlobalPrice)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${editedProduct.isGlobalPrice ? 'bg-green-600 text-white shadow-lg' : 'bg-white/10 text-gray-400'}`}
                                    >
                                        {editedProduct.isGlobalPrice ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                        {editedProduct.isGlobalPrice ? "Harga Sama" : "Harga Beda"}
                                    </button>
                                </div>
                                
                                {!editedProduct.isGlobalPrice ? (
                                    <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-top-2">
                                        {/* Only show other outlets, exclude current central one */}
                                        {otherOutlets.map(outlet => {
                                            const isAvailable = editedProduct.outletAvailability === 'all' || (editedProduct.outletAvailability || []).includes(outlet.id);
                                            if (!isAvailable) return null;

                                            const isExpanded = expandedOutletPricingId === outlet.id;

                                            if (!editedProduct.hasVariants) {
                                                // Simple Product: Single Price Override
                                                const outletPrice = editedProduct.outletPricing?.[outlet.id] ?? editedProduct.price;
                                                return (
                                                    <div key={outlet.id} className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-white/5">
                                                        <Store size={16} className="text-gray-500"/>
                                                        <span className="text-xs text-gray-300 flex-1">{outlet.name}</span>
                                                        <div className="relative w-32">
                                                            <span className="absolute left-2 top-1.5 text-xs text-gray-500">Rp</span>
                                                            <input 
                                                                type="number" 
                                                                className="w-full bg-white/5 rounded-lg py-1.5 pl-7 pr-2 text-right text-sm font-bold text-white outline-none focus:bg-black/40"
                                                                value={outletPrice}
                                                                onChange={(e) => handleOutletPriceChange(outlet.id, parseFloat(e.target.value))}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            } else {
                                                // Variant Product: Accordion for granular pricing
                                                return (
                                                    <div key={outlet.id} className="rounded-xl bg-black/20 border border-white/5 overflow-hidden">
                                                        <div 
                                                            className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5"
                                                            onClick={() => setExpandedOutletPricingId(isExpanded ? null : outlet.id)}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <Store size={16} className="text-orange-500"/>
                                                                <span className="text-xs font-bold text-white">{outlet.name}</span>
                                                            </div>
                                                            <ChevronDown size={16} className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                        </div>
                                                        
                                                        {isExpanded && (
                                                            <div className="p-3 border-t border-white/5 space-y-2 bg-black/30">
                                                                <div className="grid grid-cols-12 text-[10px] text-gray-500 font-bold uppercase mb-2 px-2">
                                                                    <div className="col-span-8">Nama Varian</div>
                                                                    <div className="col-span-4 text-right">Harga Outlet</div>
                                                                </div>
                                                                {editedProduct.variants.map(variant => {
                                                                    const vPrice = variant.outletPricing?.[outlet.id] ?? variant.price;
                                                                    return (
                                                                        <div key={variant.id} className="grid grid-cols-12 items-center gap-2 p-2 rounded hover:bg-white/5">
                                                                            <div className="col-span-8 text-xs text-gray-300 truncate">{variant.name}</div>
                                                                            <div className="col-span-4 relative">
                                                                                <span className="absolute left-2 top-1.5 text-[10px] text-gray-500">Rp</span>
                                                                                <input 
                                                                                    type="number" 
                                                                                    className="w-full bg-black/40 rounded py-1 pl-6 pr-2 text-right text-xs font-bold text-white outline-none border border-white/5 focus:border-orange-500"
                                                                                    value={vPrice}
                                                                                    onChange={(e) => handleVariantOutletPriceChange(variant.id, outlet.id, parseFloat(e.target.value))}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            }
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                                        <p className="text-xs text-green-300 flex items-center justify-center gap-2">
                                            <CheckSquare size={14} /> Harga berlaku seragam untuk semua outlet aktif.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                  </div>
              )}

              {/* TAB 4: MODIFIERS */}
              {activeTab === 'modifiers' && !editedProduct.isBundle && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      <div className="flex justify-between items-center mb-4">
                          <div>
                              <h4 className="font-bold text-white text-sm">Grup Opsi Tambahan</h4>
                              <p className="text-xs text-gray-400">Atur topping, level gula, atau opsi lainnya.</p>
                          </div>
                          <button onClick={handleAddModifierGroup} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg">
                              <ListPlus size={16} /> Grup Baru
                          </button>
                      </div>

                      <div className="space-y-4">
                          {editedProduct.modifierGroups.map((group, grpIdx) => (
                              <div key={group.id} className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                                  {/* Group Header */}
                                  <div className="p-3 bg-black/20 border-b border-white/5 flex flex-wrap gap-3 items-center">
                                      <input 
                                        type="text" 
                                        className="bg-transparent text-white font-bold text-sm outline-none placeholder-gray-500 min-w-[150px] flex-1" 
                                        value={group.name} 
                                        onChange={(e) => handleUpdateModifierGroup(grpIdx, 'name', e.target.value)} 
                                        placeholder="Nama Grup (e.g. Topping)"
                                      />
                                      
                                      <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg">
                                          <label className="text-[10px] text-gray-400 uppercase font-bold">Wajib?</label>
                                          <input type="checkbox" checked={group.required} onChange={(e) => handleUpdateModifierGroup(grpIdx, 'required', e.target.checked)} className="accent-orange-500 w-4 h-4"/>
                                      </div>

                                      <select 
                                        className="bg-black/30 text-xs text-white p-1.5 rounded border border-white/10 outline-none"
                                        value={group.selectionType}
                                        onChange={(e) => handleUpdateModifierGroup(grpIdx, 'selectionType', e.target.value)}
                                      >
                                          <option value="single">Pilih Satu (Radio)</option>
                                          <option value="multiple">Pilih Banyak (Checkbox)</option>
                                      </select>

                                      <button onClick={() => handleRemoveModifierGroup(grpIdx)} className="text-red-400 hover:text-white p-1 rounded hover:bg-red-500/20"><Trash2 size={16}/></button>
                                  </div>

                                  {/* Options List */}
                                  <div className="p-3 space-y-2">
                                      {group.options.map((opt, optIdx) => (
                                          <div key={opt.id} className="flex items-center gap-3">
                                              <div className="w-6 flex justify-center text-gray-600">
                                                  {group.selectionType === 'single' ? <div className="w-3 h-3 rounded-full border border-gray-500"></div> : <div className="w-3 h-3 rounded border border-gray-500"></div>}
                                              </div>
                                              <input 
                                                type="text" 
                                                className="flex-1 bg-white/5 rounded p-2 text-xs text-white outline-none placeholder-gray-600 focus:bg-black/40" 
                                                value={opt.name} 
                                                onChange={(e) => handleUpdateModifierOption(grpIdx, optIdx, 'name', e.target.value)} 
                                                placeholder="Nama Opsi (e.g. Keju)"
                                              />
                                              <div className="relative w-24">
                                                  <span className="absolute left-2 top-1.5 text-xs text-gray-500">+Rp</span>
                                                  <input 
                                                    type="number" 
                                                    className="w-full bg-white/5 rounded p-2 pl-8 text-xs text-white outline-none focus:bg-black/40 text-right" 
                                                    value={opt.price} 
                                                    onChange={(e) => handleUpdateModifierOption(grpIdx, optIdx, 'price', parseFloat(e.target.value))} 
                                                  />
                                              </div>
                                              <button onClick={() => handleRemoveModifierOption(grpIdx, optIdx)} className="text-gray-600 hover:text-red-400"><X size={14}/></button>
                                          </div>
                                      ))}
                                      <button onClick={() => handleAddModifierOption(grpIdx)} className="w-full py-2 border border-dashed border-white/10 rounded-lg text-xs text-gray-500 hover:text-white hover:border-white/30 transition-colors flex items-center justify-center gap-1 mt-2">
                                          <Plus size={12} /> Tambah Opsi
                                      </button>
                                  </div>
                              </div>
                          ))}
                          
                          {editedProduct.modifierGroups.length === 0 && (
                              <div className="text-center py-10 border-2 border-dashed border-white/10 rounded-2xl text-gray-500">
                                  <ListPlus size={32} className="mx-auto mb-2 opacity-30"/>
                                  <p className="text-xs">Belum ada grup modifier.</p>
                              </div>
                          )}
                      </div>
                  </div>
              )}
           </div>

           <div className="p-4 border-t border-white/5 bg-black/20 backdrop-blur-md flex justify-end gap-3 z-10">
              <button onClick={onBack} className="px-6 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 font-bold text-sm">Batal</button>
              <button onClick={handleSaveChanges} className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 text-sm hover:scale-105 transition-transform"><Save size={18} /> Simpan Perubahan</button>
           </div>
       </div>

       {/* ADD INGREDIENT MODAL (Integration) */}
       <AddIngredientModal 
          isOpen={isAddIngredientModalOpen} 
          onClose={() => setIsAddIngredientModalOpen(false)} 
          onSave={handleSaveNewIngredient}
          activeOutletId={activeOutletId}
      />

      {/* VARIANT RECIPE MODAL (Specific Variant Logic) */}
      <Modal isOpen={isVariantRecipeModalOpen} onClose={handleCloseVariantRecipe} title={`Komposisi Tambahan: ${activeVariantName}`} size="lg">
           <div className="space-y-6">
               <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl">
                   <h4 className="text-sm font-bold text-orange-400 mb-2 flex items-center gap-2"><Info size={14} /> Cara Kerja</h4>
                   <p className="text-xs text-orange-200/80 leading-relaxed">
                       Bahan yang Anda tambahkan di sini akan <b>dijumlahkan</b> dengan Resep Dasar saat stok dipotong. 
                       <br/>Contoh: Jika Resep Dasar pakai 200gr Nasi, dan di sini Anda tambah 100gr Nasi, maka total yang terpotong saat varian ini terjual adalah <b>300gr</b>.
                   </p>
               </div>

               {/* Base Recipe Preview */}
               <div className="opacity-60">
                   <p className="text-xs font-bold text-gray-500 uppercase mb-2">Resep Dasar (Read-Only)</p>
                   <div className="space-y-2 bg-black/20 p-3 rounded-xl border border-white/5">
                       {editedProduct.recipe && editedProduct.recipe.length > 0 ? (
                           editedProduct.recipe.map((item, i) => {
                                const ing = ingredients.find(ing => ing.id === item.ingredientId);
                                return (
                                   <div key={`base-${i}`} className="flex justify-between items-center text-xs">
                                       <span className="text-gray-300">{ing?.name}</span>
                                       <span className="font-mono text-gray-400">{item.quantity} {item.unit}</span>
                                   </div>
                                )
                           })
                       ) : (
                           <p className="text-xs text-gray-500 italic">Belum ada bahan dasar.</p>
                       )}
                   </div>
               </div>
               
               <div className="w-full h-px bg-white/10"></div>

               {/* Specific Ingredients */}
               <div>
                   <p className="text-xs font-bold text-white uppercase mb-3 flex items-center gap-2">
                       <FlaskConical size={14} className="text-purple-400"/> Bahan Tambahan (Override)
                   </p>
                   
                   {/* Add Form */}
                   <div className="mb-4">
                        <Combobox 
                            options={ingredientOptions} 
                            value={""} 
                            onChange={(val) => handleAddIngredientToVariant(val)}
                            placeholder="Cari bahan tambahan..."
                        />
                   </div>

                   {/* List */}
                   <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                       {tempVariantRecipe.length === 0 && (
                           <div className="text-center py-6 border-2 border-dashed border-white/10 rounded-xl">
                               <p className="text-xs text-gray-500">Belum ada bahan tambahan khusus.</p>
                           </div>
                       )}
                       {tempVariantRecipe.map((item, i) => {
                           const ing = ingredients.find(ing => ing.id === item.ingredientId);
                           if (!ing) return null;
                           const cost = convertUnit(item.quantity, item.unit, ing.unit) * ing.avgCost;
                           return (
                               <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 gap-3">
                                   <div className="flex items-center gap-3 flex-1 min-w-0">
                                       <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                                           <Plus size={14} strokeWidth={3} />
                                       </div>
                                       <div>
                                           <p className="text-sm font-bold text-white">{ing.name}</p>
                                           <p className="text-[10px] text-gray-400">Extra Cost: Rp {cost.toLocaleString()}</p>
                                       </div>
                                   </div>
                                   
                                   <div className="flex items-center gap-2">
                                       <div className="w-20">
                                            <GlassInput 
                                                type="number" 
                                                value={item.quantity} 
                                                onChange={(e) => handleUpdateVariantRecipeItem(i, 'quantity', parseFloat(e.target.value))}
                                                className="py-1.5 px-2 text-center text-sm font-bold h-9 bg-black/40"
                                                placeholder="0"
                                            />
                                       </div>
                                       <div className="w-24">
                                            <select 
                                                value={item.unit} 
                                                onChange={(e) => handleUpdateVariantRecipeItem(i, 'unit', e.target.value)} 
                                                className="w-full h-9 bg-black/40 border border-white/10 rounded-xl px-2 text-xs text-white outline-none focus:border-purple-500 appearance-none cursor-pointer"
                                            >
                                                {getCompatibleUnits(ing.unit).map(u => <option key={u} value={u} className="bg-gray-900">{u}</option>)}
                                            </select>
                                       </div>
                                       <button onClick={() => handleRemoveVariantIngredient(i)} className="p-2 text-red-400 hover:text-white bg-white/5 hover:bg-red-500 rounded-lg transition-colors">
                                           <Trash2 size={16} />
                                       </button>
                                   </div>
                               </div>
                           )
                       })}
                   </div>
               </div>

               <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                   <button onClick={handleCloseVariantRecipe} className="px-6 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white font-bold text-sm transition-colors">Batal</button>
                   <button onClick={handleSaveVariantRecipe} className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105">Simpan Komposisi</button>
               </div>
           </div>
      </Modal>
    </div>
  );
};

export default ProductEditor;
