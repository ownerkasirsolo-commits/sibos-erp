
import React from 'react';
import { Search, Plus, ArrowLeft, Filter, Users, Briefcase } from 'lucide-react';
import { useEmployeeLogic } from '../../hooks/useEmployeeLogic';
import { useAttendanceLogic } from '../../hooks/useAttendanceLogic';
import { usePayrollLogic } from '../../hooks/usePayrollLogic';
import EmployeeList from '../EmployeeList';
import GlassInput from '../../../../components/common/GlassInput';
import GlassPanel from '../../../../components/common/GlassPanel';
import PayrollSlip from '../PayrollSlip';
import AttendanceHeatmap from '../AttendanceHeatmap';
import StatWidget from '../../../../components/common/StatWidget';
import { Employee } from '../../types';

interface EmployeeViewProps {
    onChat?: (emp: Employee) => void;
}

const EmployeeView: React.FC<EmployeeViewProps> = ({ onChat }) => {
  const { 
    employees, searchTerm, setSearchTerm, 
    selectedEmployee, setSelectedEmployee,
    stats 
  } = useEmployeeLogic();
  
  // We need logic from other hooks for the Detail View
  const { getAttendanceMap, todaysAttendance, clockIn, clockOut } = useAttendanceLogic();
  const { calculatePayroll } = usePayrollLogic();

  // DETAIL VIEW MODE
  if (selectedEmployee) {
      const attendanceData = getAttendanceMap(selectedEmployee.id);
      const payrollData = calculatePayroll(selectedEmployee);

      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <button onClick={() => setSelectedEmployee(null)} className="flex items-center gap-2 text-gray-400 hover:text-white font-bold text-sm transition-colors mb-2">
            <ArrowLeft size={18}/> Kembali ke Daftar
            </button>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Profile & Slip */}
                <div className="lg:col-span-1 space-y-6">
                    <GlassPanel className="p-6 rounded-3xl text-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 mx-auto flex items-center justify-center font-bold text-4xl text-white shadow-lg border-2 border-white/10">
                            {selectedEmployee.name.charAt(0)}
                        </div>
                        <h2 className="text-xl font-bold text-white mt-4">{selectedEmployee.name}</h2>
                        <p className="text-orange-400 font-semibold">{selectedEmployee.role}</p>
                        <div className="flex justify-center gap-2 mt-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${selectedEmployee.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                {selectedEmployee.status}
                            </span>
                        </div>
                        {onChat && (
                            <button 
                                onClick={() => onChat(selectedEmployee)}
                                className="mt-6 w-full py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl text-sm font-bold hover:bg-blue-600 hover:text-white transition-all"
                            >
                                Chat Personal
                            </button>
                        )}
                    </GlassPanel>
                    <PayrollSlip employee={selectedEmployee} payrollData={payrollData} />
                </div>

                {/* Right Column: Attendance Heatmap */}
                <div className="lg:col-span-2">
                    <AttendanceHeatmap 
                        employee={selectedEmployee} 
                        attendanceData={attendanceData} 
                        todaysAttendance={todaysAttendance}
                        onClockIn={clockIn}
                        onClockOut={clockOut}
                    />
                </div>
            </div>
        </div>
      );
  }

  // LIST VIEW MODE (9:3 Grid)
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in zoom-in-95">
        {/* LEFT (9/12): LIST */}
        <div className="lg:col-span-9 space-y-4">
             <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex gap-2 flex-1 w-full">
                    <GlassInput 
                        icon={Search} 
                        placeholder="Cari nama, posisi..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="py-2.5 text-sm"
                        wrapperClassName="flex-1"
                    />
                    <button className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-gray-400 hover:text-white">
                        <Filter size={18} />
                    </button>
                </div>
                <button className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg w-full sm:w-auto justify-center">
                    <Plus size={18} /> Pegawai Baru
                </button>
            </div>

            <GlassPanel className="p-0 rounded-2xl overflow-hidden bg-black/20 border border-white/5">
                <EmployeeList employees={employees} onSelect={setSelectedEmployee} onChat={onChat} />
            </GlassPanel>
        </div>

        {/* RIGHT (3/12): WIDGETS */}
        <div className="lg:col-span-3 flex flex-col gap-4">
            <GlassPanel className="p-5 rounded-2xl border border-white/5">
                <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                    <Users size={16} className="text-blue-400"/> Ringkasan Tim
                </h4>
                <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5">
                        <span className="text-gray-400 text-sm">Total Pegawai</span>
                        <span className="font-bold text-white">{stats.total}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5">
                        <span className="text-gray-400 text-sm">Aktif Bekerja</span>
                        <span className="font-bold text-green-400">{stats.active}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5">
                        <span className="text-gray-400 text-sm">Cuti / Sakit</span>
                        <span className="font-bold text-yellow-400">{stats.onLeave}</span>
                    </div>
                </div>
            </GlassPanel>

            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-xs text-blue-200/80 leading-relaxed">
               <div className="flex items-center gap-2 mb-2 text-blue-400 font-bold">
                   <Briefcase size={14} />
                   <span>Tips HR</span>
               </div>
               Pastikan data jabatan dan gaji selalu up-to-date untuk memudahkan perhitungan payroll bulanan.
            </div>
        </div>
    </div>
  );
};

export default EmployeeView;
