
import React from 'react';
import { Activity, Search, History } from 'lucide-react';
import GlassPanel from '../../../../components/common/GlassPanel';
import GlassInput from '../../../../components/common/GlassInput';
import SectionHeader from '../../../../components/common/SectionHeader';
import CompactNumber from '../../../../components/common/CompactNumber';
import { ActivityLog } from '../../../../components/common/LiveLogPanel';

interface ActivityLogViewProps {
    logs: ActivityLog[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

const ActivityLogView: React.FC<ActivityLogViewProps> = ({ logs, searchTerm, setSearchTerm }) => {
  const categories = ['All', 'Order', 'Sync', 'System', 'Error', 'Campaign'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in zoom-in-95">
        <div className="lg:col-span-9">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 mb-4">
                <SectionHeader 
                    title="Audit Trail & Aktivitas"
                    subtitle="Rekam jejak seluruh aktivitas otomatisasi dan interaksi user."
                />
                <div className="mt-4">
                    <GlassInput 
                    icon={Search}
                    placeholder="Cari log aktivitas..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="py-2.5 text-sm"
                    />
                </div>
            </div>

            <GlassPanel className="p-0 rounded-2xl overflow-hidden bg-black/20 border border-white/5">
                <div className="overflow-y-auto max-h-[600px] custom-scrollbar p-4 space-y-4">
                    {logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <Activity size={48} className="mb-4 opacity-20" />
                            <p>Tidak ada aktivitas ditemukan.</p>
                        </div>
                    ) : (
                        logs.map(log => (
                            <div key={log.id} className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group">
                                <div className="w-24 shrink-0 text-right">
                                    <p className="text-xs font-bold text-white">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                    <p className="text-[10px] text-gray-500">{new Date(log.timestamp).toLocaleDateString()}</p>
                                </div>
                                <div className="relative flex flex-col items-center">
                                    <div className={`w-3 h-3 rounded-full border-2 bg-[#0f172a] z-10 ${
                                        log.type === 'success' ? 'border-green-500' :
                                        log.type === 'warning' ? 'border-orange-500' :
                                        log.type === 'danger' ? 'border-red-500' :
                                        'border-blue-500'
                                    }`}></div>
                                    <div className="w-px h-full bg-white/10 absolute top-3"></div>
                                </div>
                                <div className="flex-1 pb-4 border-b border-white/5 group-last:border-0 group-last:pb-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-gray-200 text-sm">{log.message}</h4>
                                        {log.category && (
                                            <span className="text-[10px] uppercase font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded ml-2">{log.category}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-lg">
                                            <div className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center text-[8px] font-bold text-white">
                                                {log.user.charAt(0)}
                                            </div>
                                            <span>{log.user}</span>
                                        </div>
                                        {log.value !== undefined && (
                                            <span className="text-xs font-mono font-bold text-white">
                                                Nilai: <CompactNumber value={log.value} />
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </GlassPanel>
        </div>

        <div className="lg:col-span-3 flex flex-col gap-4">
            <GlassPanel className="p-5 rounded-2xl border border-white/5">
                <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Filter Kategori</h4>
                <div className="space-y-2">
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex justify-between items-center"
                        >
                            <span>{cat}</span>
                            {cat !== 'All' && <span className="bg-white/10 px-1.5 rounded text-[9px] opacity-70">
                                {logs.filter(l => l.category === cat).length}
                            </span>}
                        </button>
                    ))}
                </div>
            </GlassPanel>
             <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-xs text-blue-200/80 leading-relaxed">
                <div className="flex items-center gap-2 mb-2 text-blue-400 font-bold">
                    <History size={14} />
                    <span>Retensi Data</span>
                </div>
                Log aktivitas disimpan selama 30 hari untuk keperluan audit dan troubleshooting integrasi.
            </div>
        </div>
    </div>
  );
};

export default ActivityLogView;
