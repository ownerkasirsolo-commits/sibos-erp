
import React from 'react';
import GlassPanel from '../../../../components/common/GlassPanel';
import { TrendingUp, Calendar } from 'lucide-react';
import CompactNumber from '../../../../components/common/CompactNumber';

const ForecastChart: React.FC = () => {
    // Mock Forecast Data
    const data = [
        { day: 'Sen', value: 4500000, type: 'real' },
        { day: 'Sel', value: 5200000, type: 'real' },
        { day: 'Rab', value: 4800000, type: 'real' },
        { day: 'Kam', value: 5500000, type: 'real' }, // Today
        { day: 'Jum', value: 7500000, type: 'forecast' },
        { day: 'Sab', value: 9200000, type: 'forecast' },
        { day: 'Min', value: 8800000, type: 'forecast' },
    ];

    const maxValue = Math.max(...data.map(d => d.value));

    return (
        <GlassPanel className="p-6 rounded-3xl border border-white/5">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <TrendingUp className="text-purple-400" /> Forecast Penjualan
                    </h3>
                    <p className="text-xs text-gray-400">Prediksi AI untuk 3 hari ke depan.</p>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                    <span className="flex items-center gap-1 text-gray-400"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Real</span>
                    <span className="flex items-center gap-1 text-gray-400"><div className="w-2 h-2 bg-purple-500 rounded-full border border-purple-300 dashed"></div> Prediksi</span>
                </div>
            </div>

            <div className="h-40 flex items-end justify-between gap-2">
                {data.map((d, i) => {
                    const height = (d.value / maxValue) * 100;
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                            <div className="relative w-full flex items-end justify-center h-full">
                                <div 
                                    className={`w-full max-w-[30px] rounded-t-lg transition-all duration-500 ${
                                        d.type === 'forecast' 
                                        ? 'bg-purple-500/20 border-t-2 border-dashed border-purple-500' 
                                        : 'bg-gradient-to-t from-blue-600/50 to-blue-400'
                                    }`}
                                    style={{ height: `${height}%` }}
                                ></div>
                                {/* Tooltip */}
                                <div className="absolute -top-8 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                    <CompactNumber value={d.value} />
                                </div>
                            </div>
                            <span className={`text-xs font-bold ${d.type === 'forecast' ? 'text-purple-300' : 'text-gray-400'}`}>{d.day}</span>
                        </div>
                    )
                })}
            </div>
            
            <div className="mt-4 p-3 bg-purple-900/20 border border-purple-500/20 rounded-xl flex gap-3 items-start">
                 <Calendar size={18} className="text-purple-400 shrink-0 mt-0.5" />
                 <p className="text-xs text-purple-200 leading-relaxed">
                     <b className="text-white">Insight:</b> Weekend ini diprediksi naik <b className="text-green-400">25%</b> karena ada tanggal merah di hari Senin. Persiapkan stok bahan baku lebih banyak.
                 </p>
            </div>
        </GlassPanel>
    );
};

export default ForecastChart;
