
import React from 'react';
import { Calendar, Clock, UserCheck, AlertCircle, History } from 'lucide-react';
import { useAttendanceLogic } from '../../hooks/useAttendanceLogic';
import GlassPanel from '../../../../components/common/GlassPanel';
import { useGlobalContext } from '../../../../context/GlobalContext';

const AttendanceView: React.FC = () => {
  const { todaysAttendance, stats } = useAttendanceLogic();
  const { employees } = useGlobalContext();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in zoom-in-95">
        
        {/* LEFT (9/12): MAIN LIST */}
        <div className="lg:col-span-9 space-y-6">
             {/* Today's Log */}
             <GlassPanel className="p-6 rounded-3xl h-full border border-white/5">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Clock size={18} className="text-blue-400"/> Kehadiran Hari Ini
                    </h3>
                    <span className="text-xs text-gray-500">{new Date().toLocaleDateString()}</span>
                </div>
                
                <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {todaysAttendance.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                             Belum ada yang absen hari ini.
                        </div>
                    ) : (
                        todaysAttendance.map(att => {
                            const emp = employees.find(e => e.id === att.employeeId);
                            return (
                                <div key={att.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                                            {emp?.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{emp?.name}</p>
                                            <p className="text-[10px] text-gray-400">{emp?.role}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-2">
                                                 <span className="text-[10px] text-gray-400 uppercase">IN:</span>
                                                 <span className="text-sm font-mono text-green-400 font-bold">{new Date(att.clockIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                            {att.clockOut ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-gray-400 uppercase">OUT:</span>
                                                    <span className="text-sm font-mono text-red-400 font-bold">{new Date(att.clockOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-blue-400 animate-pulse bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">Sedang Bekerja...</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </GlassPanel>
        </div>

        {/* RIGHT (3/12): WIDGETS */}
        <div className="lg:col-span-3 flex flex-col gap-6">
             
             {/* Stats Widget */}
             <GlassPanel className="p-5 rounded-2xl border border-white/5">
                 <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Rekap Harian</h4>
                 <div className="space-y-4">
                     <div className="flex items-center gap-4">
                         <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
                             <UserCheck size={20} />
                         </div>
                         <div>
                             <p className="text-xs text-gray-400">Hadir</p>
                             <p className="text-xl font-bold text-white">{stats.present}</p>
                         </div>
                     </div>
                     <div className="w-full h-px bg-white/10"></div>
                     <div className="flex items-center gap-4">
                         <div className="p-3 bg-yellow-500/20 rounded-xl text-yellow-400">
                             <Clock size={20} />
                         </div>
                         <div>
                             <p className="text-xs text-gray-400">Terlambat</p>
                             <p className="text-xl font-bold text-white">{stats.late}</p>
                         </div>
                     </div>
                 </div>
             </GlassPanel>

            {/* Absent List (Belum Hadir) */}
            <GlassPanel className="p-5 rounded-2xl h-full border border-red-500/20 bg-red-900/10">
                 <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <AlertCircle size={16} className="text-red-400"/> Belum Hadir
                </h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {employees.filter(e => !todaysAttendance.some(a => a.employeeId === e.id)).map(emp => (
                        <div key={emp.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-gray-400">
                                    {emp.name.charAt(0)}
                                </div>
                                <span className="text-sm text-gray-300">{emp.name}</span>
                            </div>
                            <span className="text-[9px] font-bold text-gray-500 uppercase border border-white/10 px-1.5 py-0.5 rounded">
                                {emp.status === 'On Leave' ? 'Cuti' : 'Alpha'}
                            </span>
                        </div>
                    ))}
                    {employees.filter(e => !todaysAttendance.some(a => a.employeeId === e.id)).length === 0 && (
                        <p className="text-xs text-gray-500 text-center py-4">Semua pegawai sudah hadir.</p>
                    )}
                </div>
            </GlassPanel>
        </div>
    </div>
  );
};

export default AttendanceView;
