
import React, { useMemo, useRef } from 'react';
import { BusinessType, UnitType } from '../../types'; 
import { useGlobalContext } from '../../context/GlobalContext';
import ProductList from './components/ProductList';
import ProductEditor from './components/ProductEditor';
import { useProductListLogic } from './hooks/useProductListLogic';
import { Package, Layers, AlertTriangle, TrendingDown, FileBarChart, Printer, Upload, Download, AlertCircle, ImageOff, DollarSign, CheckCircle2, Activity, Globe } from 'lucide-react';
import GlassPanel from '../../components/common/GlassPanel';
import StatWidget from '../../components/common/StatWidget'; 
import CompactNumber from '../../components/common/CompactNumber';
import LiveLogPanel from '../../components/common/LiveLogPanel';
import ImportGlobalProductModal from './components/modals/ImportGlobalProductModal';
import { Product } from './types';

interface ProductsProps {
  initialSearchTerm?: string;
}

const Products: React.FC<ProductsProps> = ({ initialSearchTerm }) => {
  const { products, updateProduct, ingredients, addIngredient, activeBusiness, activeOutlet } = useGlobalContext();

  const {
    visibleProducts,
    isRetail,
    filterMode, setFilterMode,
    searchTerm, setSearchTerm,
    selectedProductId, setSelectedProductId,
    mobileView, setMobileView,
    isLiveLogOpen, setIsLiveLogOpen,
    liveLogs,
    isImportModalOpen, setIsImportModalOpen,
    handleImportProduct
  } = useProductListLogic({ 
      products, 
      ingredients, 
      initialSearchTerm, 
      businessType: activeBusiness?.type 
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default Template for New Product
  const newProductTemplate: Product = {
      id: 'NEW',
      name: '',
      category: 'Umum',
      price: 0,
      unit: UnitType.PORTION,
      businessType: activeBusiness?.type || BusinessType.CULINARY,
      hasVariants: false,
      variants: [],
      modifierGroups: [],
      hasRecipe: false,
      recipe: [],
      description: '',
      image: 'https://via.placeholder.com/150',
      stock: 0,
      cogs: 0,
      outletAvailability: 'all',
      isGlobalPrice: true,
      outletPricing: {}
  };

  const selectedProduct = selectedProductId === 'NEW' 
      ? newProductTemplate 
      : products.find(p => p.id === selectedProductId);

  // Check if Active Outlet is Central (Pusat)
  // Logic: ID '101' (Mock Central) or name contains 'Pusat' or 'Gudang'
  const isCentralOutlet = activeOutlet?.id === '101' || activeOutlet?.name.toLowerCase().includes('pusat') || activeOutlet?.name.toLowerCase().includes('gudang');

  // --- ANALYTICS CALCULATION ---
  const stats = useMemo(() => {
      const totalMenu = products.length;
      const categories = new Set(products.map(p => p.category)).size;
      
      // Anomaly Detection
      const noRecipeCount = products.filter(p => p.businessType === BusinessType.CULINARY && !p.hasRecipe).length;
      const noImageCount = products.filter(p => !p.image).length;
      
      // Margin Warning (< 30%)
      const lowMarginCount = products.filter(p => {
          const profit = p.price - (p.cogs || 0);
          const margin = p.price > 0 ? (profit / p.price) * 100 : 0;
          return margin < 30;
      }).length;

      return { totalMenu, categories, noRecipeCount, noImageCount, lowMarginCount };
  }, [products]);

  // Handlers
  const handleProductClick = (id: string) => {
    setSelectedProductId(id);
    setMobileView('editor');
  };

  const handleAddNewProduct = () => {
      setSelectedProductId('NEW');
      setMobileView('editor');
  };

  const handleSaveProduct = (product: Product) => {
      if (product.id === 'NEW') {
          // Generate real ID
          const newProduct = {
              ...product,
              id: `prod-${Date.now()}`
          };
          updateProduct(newProduct); 
      } else {
          updateProduct(product);
      }
      setSelectedProductId(null); // Return to list view
      setMobileView('list');
  };

  const handleBackToList = () => {
    setSelectedProductId(null);
    setMobileView('list');
  };

  const handleLocalFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        alert("Simulasi: File " + file.name + " berhasil di-upload. Data menu akan diproses.");
        // In real app, parse CSV/Excel here
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      
      {/* 1. TOP: ANALYTICS CARDS WITH LIVE LOG TRIGGER */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
          <StatWidget 
            label="Total Menu" 
            value={stats.totalMenu} 
            icon={Package} 
            colorClass="text-blue-400" 
          />
          <StatWidget 
            label="Kategori" 
            value={stats.categories} 
            icon={Layers} 
            colorClass="text-purple-400" 
            bgClass="bg-purple-500/10 border-purple-500/20"
          />
          <StatWidget 
            label="Tanpa Resep" 
            value={stats.noRecipeCount} 
            icon={AlertCircle} 
            colorClass="text-orange-400" 
            bgClass="bg-orange-500/10 border-orange-500/20"
            subtext={stats.noRecipeCount > 0 ? "Perlu Diperbaiki" : "Semua Oke"}
          />
          <StatWidget 
            label="Margin Rendah" 
            value={stats.lowMarginCount} 
            icon={TrendingDown} 
            colorClass="text-red-400" 
            bgClass="bg-red-500/10 border-red-500/20"
            subtext="< 30% Profit"
          />
          
          {/* Floating Log Button (Mobile/Desktop) */}
          <button 
              onClick={() => setIsLiveLogOpen(true)}
              className="absolute -top-3 -right-2 md:-right-0 bg-white/10 hover:bg-orange-500 hover:text-white text-gray-400 p-2 rounded-full backdrop-blur-md shadow-lg transition-all z-10"
              title="Aktivitas Global"
          >
              <Activity size={16} />
          </button>
      </div>

      {/* 2. MAIN LAYOUT: 3 COLUMNS (3 : 6 : 3) */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 h-[calc(100vh-220px)]">
          
          {/* LEFT COLUMN (3/12): LIST & PRIMARY ACTIONS */}
          <div className={`lg:col-span-3 flex flex-col h-full ${mobileView === 'editor' ? 'hidden lg:flex' : 'flex'}`}>
              <ProductList 
                products={visibleProducts}
                selectedProductId={selectedProductId}
                onSelectProduct={handleProductClick}
                onAddProduct={handleAddNewProduct}
                filterMode={filterMode}
                setFilterMode={setFilterMode}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                mobileView={mobileView}
              />
          </div>

          {/* CENTER COLUMN (6/12): EDITOR / DETAIL */}
          <div className={`lg:col-span-6 h-full overflow-hidden ${mobileView === 'list' ? 'hidden lg:block' : 'block'}`}>
              {selectedProduct ? (
                <ProductEditor 
                  product={selectedProduct}
                  onUpdate={handleSaveProduct}
                  onBack={handleBackToList}
                  mobileView={mobileView}
                  ingredients={ingredients}
                  addIngredient={addIngredient}
                  activeOutletId={activeOutlet?.id || ''}
                  isRetail={isRetail || false}
                />
              ) : (
                 <div className="h-full flex flex-col items-center justify-center text-gray-500 glass-panel rounded-3xl bg-black/20 border-dashed border-white/10">
                     <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-4 animate-pulse">
                        <Package size={40} className="opacity-50" />
                     </div>
                     <h3 className="text-lg font-bold text-gray-300">Pilih Menu</h3>
                     <p className="text-sm">Klik menu di sebelah kiri untuk melihat detail atau tambah baru.</p>
                 </div>
              )}
          </div>

          {/* RIGHT COLUMN (3/12): SECONDARY ACTIONS & ANOMALY WIDGETS */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 h-full overflow-y-auto custom-scrollbar">
              
              {/* Secondary Actions Card */}
              <GlassPanel className="p-4 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Aksi Cepat</h4>
                  
                  {/* PABRIKAN BUTTON - Only for Central Outlet */}
                  {isCentralOutlet && (
                      <button 
                          onClick={() => setIsImportModalOpen(true)}
                          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white rounded-xl flex items-center justify-center gap-2 font-bold text-xs shadow-lg shadow-blue-500/20 transition-transform active:scale-95 mb-2"
                      >
                          <Globe size={18} /> Produk Pabrikan
                      </button>
                  )}

                  {/* Icon Action Row */}
                  <div className="grid grid-cols-4 gap-2">
                      <button className="py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 hover:text-white flex items-center justify-center transition-all" title="Laporan HPP">
                          <FileBarChart size={18} />
                      </button>
                      
                      {/* EXPORT: Upload Icon (Arrow Up - Kirim ke Luar/Awan) */}
                      <button className="py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 hover:text-white flex items-center justify-center transition-all" title="Export Excel (Upload)">
                          <Upload size={18} />
                      </button>
                      
                      {/* IMPORT: Download Icon (Arrow Down - Ambil dari File) */}
                      <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 hover:text-white flex items-center justify-center transition-all" 
                          title="Import File (Download)"
                      >
                          <Download size={18} />
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".csv, .xlsx" 
                        onChange={handleLocalFileImport} 
                      />

                      <button className="py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 hover:text-white flex items-center justify-center transition-all" title="Cetak Katalog">
                          <Printer size={18} />
                      </button>
                  </div>
              </GlassPanel>

              {/* Anomaly Widgets */}
              <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2 mb-2 px-1">
                      <AlertTriangle size={16} className="text-orange-500" />
                      <span className="font-bold text-white text-sm">Deteksi Anomali</span>
                  </div>

                  {/* Widget 1: Low Margin */}
                  {stats.lowMarginCount > 0 && (
                      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                          <div className="flex justify-between items-start mb-2">
                              <h5 className="font-bold text-red-200 text-xs">Margin Kritis</h5>
                              <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">{stats.lowMarginCount}</span>
                          </div>
                          <p className="text-[10px] text-red-300/80 mb-3">Produk berikut memiliki margin keuntungan di bawah 30%.</p>
                          <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                              {products.filter(p => ((p.price - (p.cogs || 0))/p.price) < 0.3).slice(0, 5).map(p => (
                                  <div key={p.id} className="flex justify-between items-center text-[10px] p-1.5 bg-black/20 rounded">
                                      <span className="text-gray-300 truncate w-24">{p.name}</span>
                                      <span className="text-red-400 font-bold">{(((p.price - (p.cogs || 0))/p.price)*100).toFixed(0)}%</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  {/* Widget 2: Missing Data */}
                  {(stats.noRecipeCount > 0 || stats.noImageCount > 0) && (
                      <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                          <h5 className="font-bold text-orange-200 text-xs mb-3">Kelengkapan Data</h5>
                          <div className="space-y-2">
                              {stats.noRecipeCount > 0 && (
                                  <div className="flex items-center justify-between text-xs p-2 bg-black/20 rounded-lg">
                                      <div className="flex items-center gap-2 text-orange-300">
                                          <DollarSign size={14} /> <span>Tanpa Resep (HPP Error)</span>
                                      </div>
                                      <span className="font-bold text-white">{stats.noRecipeCount}</span>
                                  </div>
                              )}
                              {stats.noImageCount > 0 && (
                                  <div className="flex items-center justify-between text-xs p-2 bg-black/20 rounded-lg">
                                      <div className="flex items-center gap-2 text-orange-300">
                                          <ImageOff size={14} /> <span>Tanpa Foto</span>
                                      </div>
                                      <span className="font-bold text-white">{stats.noImageCount}</span>
                                  </div>
                              )}
                          </div>
                          <button className="w-full mt-3 text-[10px] text-orange-400 font-bold hover:underline text-right">
                              Perbaiki Sekarang &rarr;
                          </button>
                      </div>
                  )}

                  {/* Empty State for Anomalies */}
                  {stats.lowMarginCount === 0 && stats.noRecipeCount === 0 && stats.noImageCount === 0 && (
                      <div className="p-6 rounded-2xl bg-green-500/5 border border-green-500/10 text-center">
                          <CheckCircle2 size={32} className="text-green-500 mx-auto mb-2 opacity-50" />
                          <p className="text-xs text-green-300">Database Menu Sehat!</p>
                      </div>
                  )}
              </div>
          </div>
      </div>

      {/* MODAL: IMPORT PABRIKAN */}
      <ImportGlobalProductModal 
          isOpen={isImportModalOpen} 
          onClose={() => setIsImportModalOpen(false)} 
          onImport={handleImportProduct}
          activeBusinessType={activeBusiness?.type || BusinessType.CULINARY}
      />

      {/* LIVE LOG PANEL */}
      <LiveLogPanel
          isOpen={isLiveLogOpen}
          onClose={() => setIsLiveLogOpen(false)}
          title="Aktivitas Menu & Produk"
          logs={liveLogs}
      />
    </div>
  );
};

export default Products;
