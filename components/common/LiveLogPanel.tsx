import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Activity, FileText } from 'lucide-react';
import CompactNumber from './CompactNumber';

export interface ActivityLog {
    id: string;
    type: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
    message: string;
    user: string;
    timestamp: string;
    value?: number; // Optional monetary value
    category?: string; // Optional for filtering
}

interface LiveLogPanelProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    logs: ActivityLog[];
    onDownload?: () => void;
}

const LiveLogPanel: React.FC<LiveLogPanelProps> = ({ 
    isOpen, 
    onClose, 
    title = "Live Activity Log", 
    logs,
    onDownload 
}) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Prevent rendering on server or before mount
    if (!mounted || !isOpen) return null;

    // Use Portal to render outside the parent hierarchy, directly into body
    // This ignores all parent z-indexes and overflow:hidden constraints from Layout/Sidebar
    return createPortal(
        <>
            {/* Backdrop with extreme z-index */}
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]" 
                onClick={onClose}
                aria-hidden="true"
            ></div>
            
            {/* Panel with highest priority z-index */}
            <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-[#0f172a] shadow-2xl z-[9999] border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-300 font-sans">
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#1e293b] shrink-0">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Activity size={18} className="text-orange-500"/> {title}
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                        <X className="text-gray-400 hover:text-white" size={20}/>
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                    {logs.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
                            <Activity size={48} className="mb-2" />
                            <p className="text-sm">Belum ada aktivitas tercatat.</p>
                        </div>
                    ) : (
                        logs.map(log => (
                            <div key={log.id} className="relative pl-4 border-l-2 border-white/10 pb-4 last:pb-0 last:border-0 group">
                                <div className={`absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full ${
                                    log.type === 'success' ? 'bg-green-500' :
                                    log.type === 'warning' ? 'bg-orange-500' :
                                    log.type === 'danger' ? 'bg-red-500' :
                                    log.type === 'info' ? 'bg-blue-500' :
                                    'bg-gray-500'
                                } shadow-[0_0_8px_currentColor] opacity-80`}></div>
                                
                                <p className="text-[10px] text-gray-400 mb-1 font-mono">
                                    {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                                </p>
                                <p className="text-sm text-white font-medium leading-snug">{log.message}</p>
                                
                                <div className="flex justify-between items-center mt-1.5">
                                    <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/5 flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
                                        {log.user}
                                    </span>
                                    {log.value !== undefined && (
                                        <span className="text-[10px] font-bold text-gray-300">
                                            <CompactNumber value={log.value} />
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-white/10 bg-[#1e293b] shrink-0">
                    <button 
                        onClick={onDownload}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all border border-white/5 hover:border-white/10"
                    >
                        <FileText size={14} /> Download Laporan Log
                    </button>
                </div>
            </div>
        </>,
        document.body
    );
};

export default LiveLogPanel;