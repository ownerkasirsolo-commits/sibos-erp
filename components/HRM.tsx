
import React from 'react';
import { Briefcase, Calendar, DollarSign, Plus, ArrowLeft } from 'lucide-react';
import { useHRMLogic } from '../hooks/useHRMLogic';
import GlassPanel from './common/GlassPanel';
import EmployeeList from './hrm/EmployeeList';
import AttendanceHeatmap from './hrm/AttendanceHeatmap';
import PayrollSlip from './hrm/PayrollSlip';

const HRM: React.FC = () => {
  const {
    employees,
    activeTab, setActiveTab,
    selectedEmployee, setSelectedEmployee,
    stats,
    todaysAttendance,
    getAttendanceForEmployee,
    calculatePayroll,
    clockIn,
    clockOut
  } = useHRMLogic();

  const handleBack = () => {
    setSelectedEmployee(null);
    setActiveTab('list');
  };

  if (selectedEmployee) {
    const attendanceData = getAttendanceForEmployee(selectedEmployee.id);
    const payrollData = calculatePayroll(selectedEmployee);

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <button onClick={handleBack} className="flex items-center gap-2 text-gray-400 hover:text-white font-bold text-sm transition-colors">
          <ArrowLeft size={18}/> Kembali ke Daftar
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details */}
          <div className="lg:col-span-1 space-y-6">
             <GlassPanel className="p-6 rounded-3xl text-center">
                 <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 mx-auto flex items-center justify-center font-bold text-4xl text-white shadow-lg border-2 border-white/10">
                    {selectedEmployee.name.charAt(0)}
                 </div>
                 <h2 className="text-xl font-bold text-white mt-4">{selectedEmployee.name}</h2>
                 <p className="text-orange-400 font-semibold">{selectedEmployee.role}</p>
                 <span className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold border ${selectedEmployee.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                    {selectedEmployee.status}
                 </span>
             </GlassPanel>
             <PayrollSlip employee={selectedEmployee} payrollData={payrollData} />
          </div>

          {/* Right Column: Activity */}
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Briefcase className="text-orange-500" /> Manajemen Pegawai
          </h2>
          <p className="text-sm text-gray-400">Kelola absensi, shift, dan gaji.</p>
        </div>
        <button className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-orange-600/20">
            <Plus size={20} /> Rekrut
        </button>
      </div>

       {/* Tabs */}
       <div className="flex bg-black/20 p-1 rounded-xl w-full md:w-fit overflow-x-auto no-scrollbar">
            <button 
                onClick={() => setActiveTab('list')}
                className={`flex-1 md:flex-none py-2.5 px-6 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'list' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
            >
                <Briefcase size={14} /> <span>Daftar Pegawai ({stats.total})</span>
            </button>
            <button 
                onClick={() => setActiveTab('attendance')}
                className={`flex-1 md:flex-none py-2.5 px-6 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'attendance' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
            >
                <Calendar size={14} /> <span>Absensi ({stats.present})</span>
            </button>
            <button 
                onClick={() => setActiveTab('payroll')}
                className={`flex-1 md:flex-none py-2.5 px-6 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'payroll' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
            >
                <DollarSign size={14} /> <span>Payroll</span>
            </button>
       </div>

      {/* Main Content */}
      <GlassPanel className="rounded-3xl p-6 min-h-[500px]">
          {activeTab === 'list' && (
             <EmployeeList employees={employees} onSelect={setSelectedEmployee} />
          )}
          {activeTab === 'attendance' && (
             <div className="text-center text-gray-500 py-20">Pilih pegawai dari daftar untuk melihat detail absensi.</div>
          )}
          {activeTab === 'payroll' && (
             <div className="text-center text-gray-500 py-20">Pilih pegawai dari daftar untuk melihat detail gaji.</div>
          )}
      </GlassPanel>
    </div>
  );
};

export default HRM;
