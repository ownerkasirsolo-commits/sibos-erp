import React, { useState } from 'react';
import { 
  Warehouse, TrendingDown, AlertTriangle, Package, 
  History, Truck, ShoppingCart
} from 'lucide-react';
import { useGlobalContext } from '../context/GlobalContext'; 
import CompactNumber from './common/CompactNumber';

// Import Modular Components
import StockList from './irm/StockList';
import Procurement from './irm/Procurement';
import Distribution from './irm/Distribution';
import SupplierList from './irm/SupplierList';

interface IRMProps {
  initialSearchTerm?: string;
}

const IRM: React.FC<IRMProps> = ({ initialSearchTerm }) => {
  const { ingredients } = useGlobalContext();
  const [activeTab, setActiveTab] = useState<'stock' | 'suppliers' | 'procurement' | 'distribution'>('stock');

  // Derived Stats (Global for Header)
  const totalItems = ingredients.length;
  const lowStockItems = ingredients.filter(i => i.stock <= i.minStock).length;
  const totalAssetValue = ingredients.reduce((acc, curr) => acc + (curr.stock * curr.avgCost), 0);

  const handleTabClick = (e: React.MouseEvent<HTMLButtonElement>, tab: typeof activeTab) => {
      setActiveTab(tab);
      e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Stats */}
      <div className="flex overflow-x-auto pb-4 gap-4 snap-x no-scrollbar md:grid md:grid-cols-3 md:pb-0">
        <div className="glass-panel p-6 rounded-3xl flex items-center gap-4 bg-gradient-to-br from-blue-600/10 to-blue-400/5 border-blue-500/20 min-w-[85vw] md:min-w-0 snap-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Item</p>
            <h3 className="text-2xl font-bold text-white">{totalItems} <span className="text-sm font-normal text-gray-500">SKU</span></h3>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-3xl flex items-center gap-4 bg-gradient-to-br from-red-600/10 to-red-400/5 border-red-500/20 min-w-[85vw] md:min-w-0 snap-center">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-400 shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Stok Kritis</p>
            <h3 className="text-2xl font-bold text-white">{lowStockItems} <span className="text-sm font-normal text-gray-500">Item</span></h3>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-3xl flex items-center gap-4 bg-gradient-to-br from-green-600/10 to-green-400/5 border-green-500/20 min-w-[85vw] md:min-w-0 snap-center">
          <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-400 shrink-0">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Nilai Aset</p>
            <h3 className="text-2xl font-bold text-white"><CompactNumber value={totalAssetValue} /></h3>
          </div>
        </div>
      </div>

      {/* Main Content Shell */}
      <div className="glass-panel rounded-3xl p-1 min-h-[600px] flex flex-col md:flex-row bg-black/20">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 p-2 md:p-4 border-b md:border-b-0 md:border-r border-white/5">
           <div className="flex md:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
               {['stock', 'procurement', 'distribution', 'suppliers'].map(t => (
                   <button 
                      key={t}
                      onClick={(e) => handleTabClick(e, t as any)}
                      className={`flex-shrink-0 w-auto md:w-full flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap capitalize ${activeTab === t ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                   >
                      {t === 'stock' ? <Warehouse size={18} /> : 
                       t === 'procurement' ? <ShoppingCart size={18} /> : 
                       t === 'distribution' ? <Truck size={18} /> :
                       <History size={18} />}
                      <span className="font-bold text-sm">
                          {t === 'stock' ? 'Stok Bahan' : 
                           t === 'procurement' ? 'Belanja / PO' : 
                           t === 'distribution' ? 'Distribusi' : 
                           'Data Supplier'}
                      </span>
                   </button>
               ))}
           </div>
        </div>

        {/* Content Area - Render Sub-Components */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          {activeTab === 'stock' && <StockList initialSearchTerm={initialSearchTerm} />}
          {activeTab === 'procurement' && <Procurement />}
          {activeTab === 'distribution' && <Distribution />}
          {activeTab === 'suppliers' && <SupplierList />}
        </div>
      </div>
    </div>
  );
};

export default IRM;