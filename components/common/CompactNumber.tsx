
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { formatCompactNumber, formatCurrency } from '../../utils/formatters';

interface CompactNumberProps {
  value: number;
  currency?: boolean;
  className?: string;
  textClassName?: string;
  forceFull?: boolean; // Prop baru untuk mematikan fitur singkatan (1.5jt -> Rp 1.500.000)
}

const CompactNumber: React.FC<CompactNumberProps> = ({ 
  value, 
  currency = true, 
  className = "",
  textClassName = "text-white",
  forceFull = false 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCompact, setIsCompact] = useState(false);
  
  // Format Values
  const compactText = currency ? formatCompactNumber(value) : formatCompactNumber(value).replace('Rp ', '');
  const fullText = currency ? formatCurrency(value) : value.toLocaleString('id-ID');

  // Robust Size Detection
  useLayoutEffect(() => {
    if (forceFull) {
        setIsCompact(false);
        return;
    }
    
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Jika lebar container kurang dari 110px, gunakan mode compact
        // Kita beri sedikit buffer agar tidak flickering
        setIsCompact(entry.contentRect.width < 115); 
      }
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [forceFull]); // Re-run if forceFull changes

  return (
    <div 
      ref={containerRef}
      className={`relative inline-flex items-center min-w-0 max-w-full cursor-pointer group align-bottom ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={(e) => { e.stopPropagation(); setShowTooltip(!showTooltip); }}
    >
      <span className={`${textClassName} whitespace-nowrap overflow-hidden text-ellipsis border-b border-dashed border-transparent hover:border-orange-500/50 transition-colors`}>
        {(forceFull || !isCompact) ? fullText : compactText}
      </span>

      {/* Tooltip / Modal Popover only if compacted or user wants detail */}
      {showTooltip && isCompact && !forceFull && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-[#1e293b] border border-white/10 shadow-2xl rounded-xl px-4 py-2 text-center min-w-[120px] backdrop-blur-xl">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Nominal Detail</p>
            <p className="text-sm font-mono font-bold text-orange-400 whitespace-nowrap">
              {fullText}
            </p>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-3 h-3 bg-[#1e293b] border-r border-b border-white/10 rotate-45 transform"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompactNumber;
