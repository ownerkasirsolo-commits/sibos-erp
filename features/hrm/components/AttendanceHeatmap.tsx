
import React from 'react';
import { Employee } from '../types';
import { Calendar, Clock, LogIn, LogOut } from 'lucide-react';

interface AttendanceHeatmapProps {
    employee: Employee;
    attendanceData: Map<string, { status: string; hours: number }>;
    todaysAttendance: any[];
    onClockIn: (id: string) => void;
    onClockOut: (id: string) => void;
}

const AttendanceHeatmap: React.FC<AttendanceHeatmapProps> = ({ employee, attendanceData, todaysAttendance, onClockIn, onClockOut }) => {
  const todayRecord = todaysAttendance.find(a => a.employeeId === employee.id);
  
  // Generate days for the heatmap (last 30 days)
  const days = Array.from({ length: 30 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const getDayColor = (dateKey: string) => {
    const data = attendanceData.get(dateKey);
    if (!data) return 'bg-white/5'; // No record
    if (data.status === 'Late') return 'bg-yellow-500';
    if (data.status === 'Absent') return 'bg-red-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
        <div className="glass-panel p-6 rounded-3xl">
            <h4 className="font-bold text-white mb-4">Aktivitas Hari Ini</h4>
            {todayRecord ? (
                <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-xl">
                        <span className="text-sm text-green-300 flex items-center gap-2"><LogIn size={14}/> Jam Masuk</span>
                        <span className="font-bold text-white">{new Date(todayRecord.clockIn).toLocaleTimeString()}</span>
                    </div>
                    {todayRecord.clockOut ? (
                        <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-xl">
                           <span className="text-sm text-red-300 flex items-center gap-2"><LogOut size={14}/> Jam Pulang</span>
                           <span className="font-bold text-white">{new Date(todayRecord.clockOut).toLocaleTimeString()}</span>
                        </div>
                    ) : (
                        <button onClick={() => onClockOut(employee.id)} className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors">
                            Clock-Out Sekarang
                        </button>
                    )}
                </div>
            ) : (
                <button onClick={() => onClockIn(employee.id)} className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors">
                    Clock-In Sekarang
                </button>
            )}
        </div>
        
        <div className="glass-panel p-6 rounded-3xl">
            <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                <Calendar size={16} className="text-orange-500"/> Heatmap Kehadiran (30 Hari)
            </h4>
            <div className="grid grid-cols-10 gap-1.5">
                {days.map(day => (
                    <div 
                        key={day} 
                        className={`w-full aspect-square rounded ${getDayColor(day)}`} 
                        title={`${day}: ${attendanceData.get(day)?.status || 'No Data'}`}
                    />
                ))}
            </div>
             <div className="flex justify-end gap-3 mt-3 text-xs">
                <span className="flex items-center gap-1 text-gray-400"><div className="w-2 h-2 rounded-sm bg-green-500"></div> Hadir</span>
                <span className="flex items-center gap-1 text-gray-400"><div className="w-2 h-2 rounded-sm bg-yellow-500"></div> Telat</span>
                <span className="flex items-center gap-1 text-gray-400"><div className="w-2 h-2 rounded-sm bg-red-500"></div> Absen</span>
             </div>
        </div>
    </div>
  );
};

export default AttendanceHeatmap;