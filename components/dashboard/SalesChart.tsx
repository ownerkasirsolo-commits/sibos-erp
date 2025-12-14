
import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import GlassPanel from '../common/GlassPanel';
import { formatCompactNumber } from '../../utils/formatters';

const SalesChart: React.FC = () => {
  const data = [40000000, 65000000, 45000000, 80000000, 55000000, 90000000, 70000000, 85000000, 60000000, 75000000, 50000000, 95000000];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  return (
    <GlassPanel className="lg:col-span-2 rounded-3xl p-8 h-[450px] relative overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-8 z-10">
         <div>
            <h3 className="text-xl font-bold text-white">Analitik Penjualan</h3>
            <p className="text-sm text-gray-500">Performa penjualan tahun ini</p>
         </div>
         <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-gray-400 hover:text-white transition-colors">
            <MoreHorizontal size={20} />
         </button>
      </div>

      <div className="flex-1 w-full flex items-end justify-between gap-3 relative z-10 pb-4">
        {/* Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
            <div className="border-t border-white border-dashed w-full"></div>
            <div className="border-t border-white border-dashed w-full"></div>
            <div className="border-t border-white border-dashed w-full"></div>
            <div className="border-t border-white border-dashed w-full"></div>
        </div>

        {data.map((h, i) => (
          <div key={i} className="w-full relative group h-full flex items-end">
            <div 
                className="w-full bg-gradient-to-t from-orange-600/10 via-orange-500/40 to-orange-400/80 rounded-t-lg transition-colors duration-300 hover:to-orange-300" 
                style={{height: `${h / 1000000}%`}}
            ></div>
            
            {/* Tooltip */}
            <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 bg-gray-900 border border-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-20 pointer-events-none">
              {formatCompactNumber(h)}
              <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 border-r border-b border-white/10"></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between mt-2 text-xs font-medium text-gray-500 uppercase tracking-widest px-1">
        {months.map(m => <span key={m}>{m}</span>)}
      </div>
    </GlassPanel>
  );
};

export default SalesChart;
