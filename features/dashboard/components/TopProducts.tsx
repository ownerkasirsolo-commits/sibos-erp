
import React from 'react';
import { ArrowRight } from 'lucide-react';
import GlassPanel from '../../../components/common/GlassPanel';
import CompactNumber from '../../../components/common/CompactNumber';
import { Product } from '../../products/types';

interface TopProductsProps {
  products: Product[];
  topProductName: string;
  title?: string;
}

const TopProducts: React.FC<TopProductsProps> = ({ products, topProductName, title = "Top Produk" }) => {
  return (
    <GlassPanel className="rounded-3xl p-8 flex flex-col flex-1">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <button className="text-xs font-bold text-orange-400 hover:text-orange-300 uppercase tracking-wider">Lihat Semua</button>
        </div>
        
        <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {topProductName !== '-' ? (
                <div className="text-center py-4 bg-white/5 rounded-2xl">
                    <p className="text-sm text-gray-400">Terlaris Hari Ini</p>
                    <p className="text-xl font-bold text-white mt-1">{topProductName}</p>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">Belum ada transaksi hari ini</div>
            )}
            
            {products.slice(0, 4).map((prod, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group border border-transparent hover:border-white/5">
                <div className="w-14 h-14 rounded-xl overflow-hidden shadow-lg relative bg-gray-800">
                <img src={prod.image} alt="Product" className="w-full h-full object-cover transition-transform duration-500" />
                </div>
                <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-100 text-sm truncate group-hover:text-orange-400 transition-colors">{prod.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                    <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                    <span className="text-xs text-green-400 font-medium">Available</span>
                </div>
                </div>
                <div className="text-right">
                    <CompactNumber value={prod.price} currency={true} className="text-xs font-bold text-white bg-white/5 px-2 py-1 rounded-lg border border-white/5" />
                </div>
            </div>
            ))}
        </div>
        
        <button className="w-full mt-6 py-4 rounded-xl border border-dashed border-gray-700 text-gray-400 hover:text-white hover:border-orange-500/50 hover:bg-orange-500/5 transition-all text-sm font-medium flex items-center justify-center gap-2 group">
            <span>Tambah Item Baru</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
    </GlassPanel>
  );
};

export default TopProducts;
