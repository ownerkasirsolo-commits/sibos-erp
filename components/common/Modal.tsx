
import React from 'react';
import { X } from 'lucide-react';
import GlassPanel from './GlassPanel';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full m-4'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <GlassPanel className={`w-full ${sizeClasses[size]} p-6 rounded-3xl relative z-10 animate-in zoom-in-95 flex flex-col max-h-[90vh]`}>
        {(title || onClose) && (
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4 shrink-0">
            {title && <h3 className="text-xl font-bold text-white">{title}</h3>}
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </GlassPanel>
    </div>
  );
};

export default Modal;
