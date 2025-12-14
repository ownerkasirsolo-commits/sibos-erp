
import React, { useMemo } from 'react';
import { Activity, Search, Filter, History } from 'lucide-react';
import { useGlobalContext } from '../../../../context/GlobalContext';
import GlassInput from '../../../../components/common/GlassInput';
import GlassPanel from '../../../../components/common/GlassPanel';
import SectionHeader from '../../../../components/common/SectionHeader';

const ActivityView: React.FC = () => {
    const { attendance, employees } = useGlobalContext();
    const [searchTerm, setSearchTerm] = React.useState('');

    const logs = useMemo(() => {
        const list: any[] = [];
        attendance.slice(0, 50).forEach(att => {
             const empName = employees.find(e => e.id === att.employeeId)?.name || 'Unknown';
             list.push({
                 id: att.id,
                 message: `${empName} melakukan Clock-In`,
                 timestamp: att.clockIn,
                 type: 'info'
             });
             if(att.clockOut) {
                 list.push({
                    id: att.id + '_out',
                    message: `${empName} melakukan Clock-Out`,
                    timestamp: att.clockOut,
                    type: 'success'
                });
             }
        });
        return list.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [attendance, employees]);

    const filteredLogs = logs.filter(l => l.message.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in zoom-in-95">
            
            {/* LEFT (9/12): ACTIVITY LIST */}
            <div className="lg:col-span-9 space-y-4">
                 <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <SectionHeader title="Log Aktivitas Pegawai" subtitle="Rekam jejak absensi dan perubahan data." />
                      <div className="mt-4">
                          <GlassInput 
                            icon={Search} 
                            placeholder="Cari log..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="py-2.5 text-sm"
                          />
                      </div>
                  </div>

                  <GlassPanel className="p-0 rounded-2xl overflow-hidden bg-black/20 border border-white/5">
                       <div className="overflow-y-auto max-h-[600px] custom-scrollbar p-4 space-y-4">
                           {filteredLogs.map(log => (
                               <div key={log.id} className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group">
                                   <div className="w-24 shrink-0 text-right">
                                       <p className="text-xs font-bold text-white">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                       <p className="text-[10px] text-gray-500">{new Date(log.timestamp).toLocaleDateString()}</p>
                                   </div>
                                   <div className="relative flex flex-col items-center">
                                       <div className={`w-3 h-3 rounded-full border-2 bg-[#0f172a] z-10 ${log.type === 'success' ? 'border-green-500' : 'border-blue-500'}`}></div>
                                       <div className="w-px h-full bg-white/10 absolute top-3"></div>
                                   </div>
                                   <div className="flex-1 pb-4 border-b border-white/5 group-last:border-0 group-last:pb-0">
                                       <h4 className="font-bold text-gray-200 text-sm">{log.message}</h4>
                                   </div>
                               </div>
                           ))}
                           {filteredLogs.length === 0 && <p className="text-center text-gray-500 py-10">Tidak ada aktivitas.</p>}
                       </div>
                  </GlassPanel>
            </div>

            {/* RIGHT (3/12): FILTERS */}
            <div className="lg:col-span-3 flex flex-col gap-4">
                 <GlassPanel className="p-5 rounded-2xl border border-white/5">
                    <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                        <Filter size={16} className="text-blue-400"/> Filter Kategori
                    </h4>
                    <div className="space-y-2">
                        <button className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold bg-orange-500 text-white shadow-lg">Semua Aktivitas</button>
                        <button className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Absensi</button>
                        <button className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Perubahan Data</button>
                        <button className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Payroll</button>
                    </div>
                 </GlassPanel>

                 <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-xs text-blue-200/80 leading-relaxed">
                    <div className="flex items-center gap-2 mb-2 text-blue-400 font-bold">
                        <History size={14} />
                        <span>Audit Log</span>
                    </div>
                    Log aktivitas disimpan secara permanen untuk keperluan audit keamanan dan kedisiplinan.
                 </div>
            </div>
        </div>
    );
};

export default ActivityView;
