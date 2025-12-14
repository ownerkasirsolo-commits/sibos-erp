
import React from 'react';
import { LucideIcon, ArrowUpRight } from 'lucide-react';
import GlassPanel from './GlassPanel';
import CompactNumber from './CompactNumber';

interface StatsCardProps {
  label: string;
  value: number;
  type?: 'currency' | 'number';
  change?: string;
  icon: LucideIcon;
  colorFrom: string;
  colorTo: string;
  textColor: string;
  bgColor: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  label, value, type = 'number', change, icon: Icon, colorFrom, colorTo, textColor, bgColor 
}) => {
  return (
    <GlassPanel className="p-6 rounded-3xl transition-all group relative overflow-hidden hover:border-orange-500/20 duration-300 min-w-[85vw] md:min-w-0 snap-center">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorFrom} ${colorTo} opacity-[0.03] group-hover:opacity-5 transition-opacity duration-500 rounded-bl-full`} />
      
      <div className="flex justify-between items-start mb-6 relative">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorFrom} ${colorTo} p-[1px] shadow-lg group-hover:shadow-lg transition-shadow`}>
          <div className="w-full h-full bg-[#121a2c] rounded-[14px] flex items-center justify-center">
              <Icon size={20} className={`bg-clip-text text-transparent bg-gradient-to-br ${colorFrom} ${colorTo}`} />
          </div>
        </div>
        {change && (
          <span className={`flex items-center text-xs font-bold ${textColor} ${bgColor} px-2.5 py-1 rounded-full border border-white/5`}>
            {change} <ArrowUpRight size={12} className="ml-1" />
          </span>
        )}
      </div>
      
      <div className="relative">
          <h3 className="text-gray-400 text-sm font-medium tracking-wide">{label}</h3>
          <div className="text-3xl font-bold text-white mt-2 tracking-tight">
              <CompactNumber value={value} currency={type === 'currency'} />
          </div>
      </div>
    </GlassPanel>
  );
};

export default StatsCard;
