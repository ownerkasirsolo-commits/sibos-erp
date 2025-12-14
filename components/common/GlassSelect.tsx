
import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string | number;
  label: string;
}

interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: Option[];
  children?: React.ReactNode; // Allow manual <option> children if needed
  label?: string; // Optional top label
  wrapperClassName?: string;
  icon?: React.ElementType;
}

const GlassSelect: React.FC<GlassSelectProps> = ({ 
  options, 
  children, 
  label, 
  wrapperClassName = "", 
  className = "", 
  icon: Icon,
  ...props 
}) => {
  return (
    <div className={wrapperClassName}>
      {label && (
        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            <Icon size={16} />
          </div>
        )}
        
        <select
          className={`w-full glass-input rounded-xl py-2.5 bg-[#1e293b] text-sm text-white appearance-none cursor-pointer outline-none focus:border-orange-500/50 transition-all ${Icon ? 'pl-10 pr-10' : 'pl-4 pr-10'} ${className}`}
          {...props}
        >
          {options 
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-gray-900 text-gray-200">
                  {opt.label}
                </option>
              ))
            : children
          }
        </select>
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
          <ChevronDown size={16} />
        </div>
      </div>
    </div>
  );
};

export default GlassSelect;
