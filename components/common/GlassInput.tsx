
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  wrapperClassName?: string;
}

const GlassInput: React.FC<GlassInputProps> = ({ icon: Icon, wrapperClassName = "", className = "", ...props }) => {
  return (
    <div className={`relative ${wrapperClassName}`}>
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
      )}
      <input 
        className={`w-full glass-input rounded-xl py-3 text-white placeholder-gray-500 outline-none focus:border-orange-500/50 transition-colors ${Icon ? 'pl-10 pr-4' : 'px-4'} ${className}`}
        {...props}
      />
    </div>
  );
};

export default GlassInput;
