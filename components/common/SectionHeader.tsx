
import React from 'react';
import { Activity } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  onLiveLogClick?: () => void;
  isLiveLogActive?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  onLiveLogClick,
  isLiveLogActive = false 
}) => {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          {Icon && <Icon className="text-orange-500" size={24} />}
          {title}
          {onLiveLogClick && (
            <button 
                onClick={onLiveLogClick}
                className={`p-1.5 rounded-lg transition-colors animate-pulse ${isLiveLogActive ? 'bg-orange-500 text-white' : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white'}`}
                title="Live Activity Log"
            >
                <Activity size={16} />
            </button>
          )}
        </h2>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

export default SectionHeader;
