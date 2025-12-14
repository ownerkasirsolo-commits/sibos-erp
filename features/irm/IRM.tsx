
import React, { useState, useEffect } from 'react';
import { 
  Warehouse, TrendingDown, AlertTriangle, Package, 
  History, Truck, ShoppingCart, DollarSign, Activity
} from 'lucide-react';
import { useGlobalContext } from '../../context/GlobalContext'; 
import { BusinessType } from '../../types';
import { Ingredient } from './types';
import StatWidget from '../../components/common/StatWidget';

// Import Modular Components
import StockList from './components/StockList';
import Procurement from './components/Procurement';
import Distribution from './components/Distribution';
import SupplierList from './components/SupplierList';
import SalesOrders from './components/SalesOrders';
import IRMLogs from './components/IRMLogs';

interface IRMProps {
  initialSearchTerm?: string;
}

const IRM: React.FC<IRMProps> = ({ initialSearchTerm }) => {
  const { ingredients, activeBusiness, purchaseOrders } = useGlobalContext();
  const [activeTab, setActiveTab] = useState<'stock' | 'suppliers' | 'procurement' | 'distribution' | 'sales' | 'logs'>('stock');
  
  // State to hold item data when switching from Stock -> Procurement (Restock)
  const [restockItem, setRestockItem] = useState<Ingredient | null>(null);

  const isRetail = activeBusiness?.type === BusinessType.RETAIL;

  useEffect(() => {
      if (initialSearchTerm) {
          if (initialSearchTerm.startsWith('REQ-') && isRetail) {
              setActiveTab('sales');
          } else if (initialSearchTerm.startsWith('PO-')) {
              setActiveTab('procurement');
          } else {
              // Default if searched generic term
              setActiveTab('stock');
          }
      }
  }, [initialSearchTerm, isRetail]);

  const handleRestockRequest = (item: Ingredient) => {
      setRestockItem(item);
      setActiveTab('procurement');
  };

  // Derived Stats (Global for Header)
  const totalItems = ingredients.length;
  const lowStockItems = ingredients.filter(i => i.stock <= i.minStock).length;
  const totalAssetValue = ingredients.reduce((acc, curr) => acc + (curr.stock * curr.avgCost), 0);
  
  // New KPI: Total Hutang (Unpaid POs)
  const totalUnpaid = purchaseOrders
    .filter(po => po.status === 'received' && po.paymentStatus === 'unpaid')
    .reduce((acc, curr) => acc + curr.totalEstimated, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 max-w-[1600px] mx-auto w-full">
      
      {/* 1. Header Stats (Standardized with CRM Concept) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
          <StatWidget 
            label="Total SKU" 
            value={totalItems} 
            icon={Package} 
            colorClass="text-blue-400" 
            bgClass="bg-blue-500/10 border-blue-500/20"
          />
          <StatWidget 
            label="Stok Kritis" 
            value={lowStockItems} 
            icon={AlertTriangle} 
            colorClass="text-red-400" 
            bgClass="bg-red-500/10 border-red-500/20"
            subtext="Perlu Restock"
          />
          <StatWidget 
            label="Nilai Aset" 
            value={totalAssetValue} 
            icon={TrendingDown} 
            colorClass="text-green-400" 
            bgClass="bg-green-500/10 border-green-500/20"
          />
          <StatWidget 
            label="Total Hutang" 
            value={totalUnpaid} 
            icon={DollarSign} 
            colorClass="text-orange-400" 
            bgClass="bg-orange-500/10 border-orange-500/20"
            subtext="Unpaid PO"
          />
      </div>

      {/* 2. Navigation Tabs (Centered) */}
      <div className="flex bg-black/20 p-1 rounded-xl w-full md:w-fit md:mx-auto overflow-x-auto no-scrollbar sticky top-0 z-30 backdrop-blur-md">
           {['stock', 'procurement', 'distribution', 'suppliers', 'logs'].map(t => (
               <button 
                  key={t}
                  onClick={(e) => {
                      setActiveTab(t as any);
                      e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                  }}
                  className={`flex-1 md:flex-none py-2.5 px-6 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                      activeTab === t 
                      ? 'bg-orange-600 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
               >
                  {t === 'stock' ? <Warehouse size={14} /> : 
                   t === 'procurement' ? <ShoppingCart size={14} /> : 
                   t === 'distribution' ? <Truck size={14} /> :
                   t === 'suppliers' ? <History size={14} /> :
                   <Activity size={14} />}
                  <span className="capitalize">
                      {t === 'stock' ? 'Stok Bahan' : 
                       t === 'procurement' ? 'Belanja / PO' : 
                       t === 'distribution' ? 'Distribusi' : 
                       t === 'suppliers' ? 'Supplier' :
                       'Aktivitas'}
                  </span>
               </button>
           ))}
           
           {/* Special Tab for Retail/Wholesale Business */}
           {isRetail && (
               <button 
                  onClick={(e) => {
                      setActiveTab('sales');
                      e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                  }}
                  className={`flex-1 md:flex-none py-2.5 px-6 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                      activeTab === 'sales' 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
               >
                  <DollarSign size={14} />
                  <span>Penjualan B2B</span>
               </button>
           )}
      </div>

      {/* 3. Main Content Area (Dynamic) */}
      <div className="animate-in fade-in zoom-in-95 duration-300 w-full">
          {activeTab === 'stock' && <StockList initialSearchTerm={initialSearchTerm} onRestock={handleRestockRequest} />}
          {activeTab === 'procurement' && <Procurement initialRestockItem={restockItem} onRestockComplete={() => setRestockItem(null)} />}
          {activeTab === 'distribution' && <Distribution />}
          {activeTab === 'suppliers' && <SupplierList />}
          {activeTab === 'sales' && <SalesOrders initialSearchTerm={initialSearchTerm} />}
          {activeTab === 'logs' && <IRMLogs />}
      </div>
    </div>
  );
};

export default IRM;
