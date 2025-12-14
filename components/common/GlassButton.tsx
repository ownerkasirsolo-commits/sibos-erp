
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  icon?: LucideIcon;
  label?: string;
  className?: string;
}

const GlassButton: React.FC<GlassButtonProps> = ({ 
  variant = 'secondary', 
  icon: Icon, 
  label, 
  className = "", 
  children,
  ...props 
}) => {
  const baseStyles = "rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/20",
    secondary: "bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5",
    danger: "bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/30",
    success: "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/20",
    ghost: "hover:bg-white/5 text-gray-400 hover:text-white"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      {...props}
    >
      {Icon && <Icon size={18} />}
      {label && <span>{label}</span>}
      {children}
    </button>
  );
};

export default GlassButton;
