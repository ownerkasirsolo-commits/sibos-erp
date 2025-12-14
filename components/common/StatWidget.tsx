
import React from 'react';
import { LucideIcon } from 'lucide-react';
import CompactNumber from './CompactNumber';

interface StatWidgetProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  colorClass?: string; // e.g. "text-blue-400"
  bgClass?: string;    // e.g. "bg-blue-500/10 border-blue-500/20"
  subtext?: string;
}

const StatWidget: React.FC<StatWidgetProps> = ({ 
  label, 
  value, 
  icon: Icon, 
  colorClass = "text-white", 
  bgClass = "bg-white/5 border-white/5",
  subtext
}) => {
  return (
    <div className={`flex justify-between items-center p-3 rounded-xl border ${bgClass} overflow-hidden`}>
        <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2 rounded-lg bg-black/20 ${colorClass} shrink-0`}>
                <Icon size={18} />
            </div>
            <div className="min-w-0">
                <span className="text-xs font-bold text-gray-400 block truncate">{label}</span>
                {subtext && <span className="text-[10px] text-gray-500 truncate block">{subtext}</span>}
            </div>
        </div>
        <span className="text-lg font-bold text-white truncate max-w-[50%] text-right" title={typeof value === 'number' ? value.toLocaleString() : value}>
            {typeof value === 'number' ? <CompactNumber value={value} currency={false} /> : value}
        </span>
    </div>
  );
};

export default StatWidget;
