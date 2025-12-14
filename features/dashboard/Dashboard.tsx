
import React from 'react';
import { DollarSign, ShoppingBag, Users, AlertTriangle, ChefHat, ArrowRightCircle, MapPin, Store, Building2, TrendingDown, Percent, Box } from 'lucide-react';
import { useDashboardLogic } from './hooks/useDashboardLogic';
import StatsCard from '../../components/common/StatsCard';
import SalesChart from './components/SalesChart';
import TopProducts from './components/TopProducts';
import GlassPanel from '../../components/common/GlassPanel';
import { Product } from '../products/types';

const Dashboard: React.FC = () => {
  const { 
    products, 
    customers, 
    activeOutlet, 
    activeBusiness,
    statsData, 
    productsMissingRecipe,
    isRetail,
    isCulinary
  } = useDashboardLogic();
  
  // Diction Mapping
  const labels = {
      sales: 'Penjualan Hari Ini',
      orders: isRetail ? 'Transaksi Hari Ini' : 'Order Hari Ini',
      customers: 'Total Pelanggan',
      alert: isRetail ? 'Stok Menipis' : 'Bahan Kritis',
      topProductTitle: isRetail ? 'Produk Terlaris' : 'Menu Favorit'
  };

  const stats = [
    { label: labels.sales, value: statsData.todaySales, type: 'currency' as const, change: 'Live', icon: DollarSign, from: 'from-emerald-500', to: 'to-teal-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: labels.orders, value: statsData.totalOrders, type: 'number' as const, change: 'Live', icon: ShoppingBag, from: 'from-blue-500', to: 'to-indigo-500', text: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: labels.customers, value: customers.length, type: 'number' as const, change: '+2.4%', icon: Users, from: 'from-purple-500', to: 'to-pink-500', text: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: labels.alert, value: statsData.lowStockCount, type: 'number' as const, change: 'Alert', icon: AlertTriangle, from: 'from-orange-500', to: 'to-red-500', text: 'text-orange-400', bg: 'bg-orange-500/10' },
  ];

  // Logic tampilan Header: Outlet Spesifik vs HQ View
  const displayTitle = activeOutlet ? activeOutlet.name : (activeBusiness ? `${activeBusiness.name} (HQ)` : 'Global Dashboard');
  const displayAddress = activeOutlet ? activeOutlet.address : (activeBusiness ? 'Ringkasan Seluruh Cabang' : 'Semua Bisnis');
  const activeOutletCount = activeBusiness ? activeBusiness.outlets.filter(o => o.active).length : 0;
  const businessIcon = isRetail ? <Store size={12} /> : <Building2 size={12} />;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ACTIVE OUTLET / HQ INDICATOR BANNER */}
      <GlassPanel className="p-6 rounded-3xl relative overflow-hidden bg-gradient-to-br from-orange-600/10 to-orange-700/10 backdrop-blur-md border border-orange-500/20 shadow-xl shadow-orange-900/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                  <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm border ${activeOutlet ? 'bg-orange-500/10 border-orange-500/20 text-orange-300' : 'bg-blue-500/10 border-blue-500/20 text-blue-300'}`}>
                          {activeOutlet ? 'Active Outlet' : 'Headquarters View'}
                      </span>
                      {activeBusiness && (
                          <span className="text-gray-400 text-xs flex items-center gap-1 font-medium">
                              {businessIcon} {activeBusiness.name}
                          </span>
                      )}
                      {/* Business Type Badge */}
                      <span className="text-[9px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-gray-400 uppercase font-bold">
                          {isRetail ? 'Mode Ritel' : 'Mode F&B'}
                      </span>
                  </div>
                  <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">{displayTitle}</h1>
                  <p className="text-gray-400 text-sm mt-1 flex items-center gap-2 font-medium">
                      <MapPin size={14} className={activeOutlet ? "text-orange-500" : "text-blue-500"}/> 
                      {displayAddress}
                  </p>
              </div>
              <div className="text-right hidden md:block">
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Status Operasional</p>
                  {activeOutlet ? (
                      <p className="text-white font-bold flex items-center justify-end gap-2 text-lg drop-shadow-sm">
                          <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></span> 
                          BUKA
                      </p>
                  ) : (
                      <p className="text-white font-bold flex items-center justify-end gap-2 text-lg drop-shadow-sm">
                          <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]"></span> 
                          {activeOutletCount} OUTLET AKTIF
                      </p>
                  )}
              </div>
          </div>
      </GlassPanel>

      {/* Stats Grid */}
      <div className="flex overflow-x-auto pb-4 gap-4 snap-x no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 md:pb-0 md:gap-6">
        {stats.map((stat, idx) => (
          <StatsCard 
            key={idx}
            label={stat.label}
            value={stat.value}
            type={stat.type}
            change={stat.change}
            icon={stat.icon}
            colorFrom={stat.from}
            colorTo={stat.to}
            textColor={stat.text}
            bgColor={stat.bg}
          />
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <SalesChart />

        {/* Right Column: Stacked Alerts & Top Products */}
        <div className="flex flex-col gap-6">
            
            {/* === KULINER (F&B) SPECIFIC ALERT === */}
            {isCulinary && productsMissingRecipe.length > 0 && (
                <GlassPanel className="p-5 rounded-3xl bg-gradient-to-br from-orange-900/50 to-red-900/50 border-orange-500/30 relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl -mr-12 -mt-12"></div>
                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400 border border-orange-500/20">
                                <ChefHat size={20} />
                            </div>
                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg animate-pulse shadow-lg shadow-red-500/20">
                                ACTION NEEDED
                            </span>
                        </div>
                        <h4 className="text-white font-bold text-lg leading-tight">
                            {productsMissingRecipe.length} Menu Tanpa Resep
                        </h4>
                        <p className="text-xs text-gray-300 mt-1 mb-4 leading-relaxed">
                            Stok bahan baku tidak akan berkurang otomatis. HPP tidak akurat.
                        </p>
                        <button className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-900/20 transition-all group">
                            Lengkapi Resep <ArrowRightCircle size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </GlassPanel>
            )}

            {/* === RETAIL SPECIFIC ALERT === */}
            {isRetail && statsData.lowMarginCount > 0 && (
                <GlassPanel className="p-5 rounded-3xl bg-gradient-to-br from-red-900/30 to-pink-900/30 border-red-500/30 relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl -mr-12 -mt-12"></div>
                    <div className="relative z-10">
                         <div className="flex items-start justify-between mb-3">
                            <div className="p-2 bg-red-500/20 rounded-lg text-red-400 border border-red-500/20">
                                <TrendingDown size={20} />
                            </div>
                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg shadow-red-500/20">
                                PROFIT ALERT
                            </span>
                        </div>
                         <h4 className="text-white font-bold text-lg leading-tight">
                            {statsData.lowMarginCount} Produk Margin Tipis
                        </h4>
                        <p className="text-xs text-gray-300 mt-1 mb-4 leading-relaxed">
                            Produk ini memiliki keuntungan dibawah 15%. Pertimbangkan menaikkan harga atau negosiasi supplier.
                        </p>
                         <button className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 transition-all group">
                            Cek Analisa Harga <Percent size={14} />
                        </button>
                    </div>
                </GlassPanel>
            )}

            {/* === RETAIL SHORTCUT === */}
            {isRetail && (
                 <GlassPanel className="p-4 rounded-3xl border border-white/5 bg-blue-900/10 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                         <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><Box size={18}/></div>
                         <div>
                             <p className="text-xs text-gray-400 font-bold uppercase">Produk Pabrikan</p>
                             <p className="text-white font-bold text-sm">Database Global</p>
                         </div>
                     </div>
                     <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-lg">Import</button>
                 </GlassPanel>
            )}

            <TopProducts 
                products={products as Product[]} 
                topProductName={statsData.topProduct}
                title={labels.topProductTitle} 
            />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
