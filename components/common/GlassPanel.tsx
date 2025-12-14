
import React from 'react';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const GlassPanel: React.FC<GlassPanelProps> = ({ children, className = "", onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`glass-panel border border-white/10 backdrop-blur-xl bg-[#0f172a]/60 shadow-xl ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassPanel;
