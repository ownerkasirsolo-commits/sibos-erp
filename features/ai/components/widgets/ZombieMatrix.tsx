
import React from 'react';
import { Product } from '../../../products/types';
import { Skull, TrendingDown, AlertTriangle, ArrowRight } from 'lucide-react';
import GlassPanel from '../../../../components/common/GlassPanel';
import CompactNumber from '../../../../components/common/CompactNumber';

interface ZombieMatrixProps {
    products: any[]; // Extended product type
}

const ZombieMatrix: React.FC<ZombieMatrixProps> = ({ products }) => {
    return (
        <GlassPanel className="p-6 rounded-3xl bg-red-900/10 border border-red-500/20 relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
                <Skull size={150} />
            </div>

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Skull className="text-red-500" /> Zombie Menu Detector
                    </h3>
                    <p className="text-xs text-red-200/70 mt-1">
                        Menu ini membebani cashflow. Stok ada, tapi penjualan mati.
                    </p>
                </div>
                <div className="bg-red-500/20 px-3 py-1 rounded-lg border border-red-500/30 text-red-400 text-xs font-bold animate-pulse">
                    {products.length} Terdeteksi
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {products.length === 0 ? (
                    <div className="col-span-2 text-center py-10 text-gray-400">
                        <p>Aman! Tidak ada menu zombie terdeteksi.</p>
                    </div>
                ) : (
                    products.map((prod, i) => (
                        <div key={i} className="flex gap-3 p-3 bg-black/40 rounded-xl border border-white/5 items-center">
                            <div className="w-12 h-12 bg-gray-800 rounded-lg shrink-0 overflow-hidden relative">
                                <img src={prod.image} className="w-full h-full object-cover opacity-60 grayscale" alt={prod.name} />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <TrendingDown size={16} className="text-red-500 drop-shadow-md" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-gray-300 truncate">{prod.name}</h4>
                                <div className="flex gap-3 text-[10px] text-gray-500 mt-1">
                                    <span>Stok: <b className="text-white">{prod.stock}</b></span>
                                    <span>Terjual: <b className="text-red-400">{prod.salesVolume}</b> (30hr)</span>
                                </div>
                            </div>
                            <button className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-colors" title="Lihat Solusi">
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>
            
            {products.length > 0 && (
                <div className="mt-6 pt-4 border-t border-red-500/20">
                    <p className="text-xs text-gray-400 mb-2 flex items-center gap-2">
                        <AlertTriangle size={12} className="text-yellow-500"/> Rekomendasi AI:
                    </p>
                    <div className="flex gap-2">
                        <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold rounded-lg border border-white/10">
                            Diskon Cuci Gudang
                        </button>
                        <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold rounded-lg border border-white/10">
                            Bundling Promo
                        </button>
                    </div>
                </div>
            )}
        </GlassPanel>
    );
};

export default ZombieMatrix;
