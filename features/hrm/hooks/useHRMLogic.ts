
import { useState, useMemo } from 'react';
import { useGlobalContext } from '../../../context/GlobalContext';
import { Employee, Attendance, Payroll } from '../types';
import { ActivityLog } from '../../../components/common/LiveLogPanel';
import { useChatSystem } from '../../communication/hooks/useChatSystem';
import { ChatContact } from '../../communication/types';

export const useHRMLogic = () => {
  const { employees, attendance, clockIn, clockOut, transactions } = useGlobalContext();

  // Changed default tab to 'recruitment'
  const [activeTab, setActiveTab] = useState<'list' | 'recruitment' | 'attendance' | 'payroll' | 'logs'>('recruitment');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // --- STATS ---
  const today = new Date().toLocaleDateString();
  const todaysAttendance = attendance.filter(a => new Date(a.clockIn).toLocaleDateString() === today);
  const onLeaveCount = employees.filter(e => e.status === 'On Leave').length;

  const stats = {
    total: employees.length,
    present: todaysAttendance.filter(a => !a.clockOut).length, // Only count those currently clocked in
    onLeave: onLeaveCount,
    payrollEst: employees.reduce((acc, e) => acc + (parseInt(e.salary.replace(/[^0-9]/g, '')) || 0), 0)
  };

  // --- CHAT SYSTEM INTEGRATION ---
  const chatContacts: ChatContact[] = useMemo(() => employees.map(e => ({
      id: e.id,
      name: e.name,
      role: e.role,
      type: 'internal',
      isOnline: true, // Mock online status
      category: e.outletName
  })), [employees]);

  const chatSystem = useChatSystem(chatContacts);

  // --- ATTENDANCE ---
  const getAttendanceForEmployee = (employeeId: string) => {
    // For heatmap, we need a map of date -> status
    const attendanceMap = new Map<string, { status: string; hours: number }>();
    attendance
      .filter(a => a.employeeId === employeeId)
      .forEach(a => {
        const dateKey = new Date(a.clockIn).toISOString().split('T')[0];
        let hours = 0;
        if(a.clockOut) {
            const diff = new Date(a.clockOut).getTime() - new Date(a.clockIn).getTime();
            hours = diff / (1000 * 60 * 60);
        }
        attendanceMap.set(dateKey, { status: a.status, hours });
      });
    return attendanceMap;
  };
  
  // --- PAYROLL ---
  const calculatePayroll = (employee: Employee): Payroll => {
    // In a real app, this would be complex. Here is a simplified version.
    const baseSalary = parseInt(employee.salary.replace(/[^0-9]/g, '')) || 0;
    
    // Calculate attendance for the current month
    const currentMonth = new Date().getMonth();
    const totalAttendance = attendance.filter(a => 
        a.employeeId === employee.id && 
        new Date(a.clockIn).getMonth() === currentMonth
    ).length;

    // Simple bonus based on performance
    const bonus = transactions.filter(t => t.staffId === employee.id).reduce((sum, t) => sum + (t.total * 0.001), 0); 
    const deduction = 0;
    const netSalary = baseSalary + bonus - deduction;

    return {
        id: `PAY-${employee.id}-${new Date().getFullYear()}-${currentMonth+1}`,
        employeeId: employee.id,
        period: `${new Date().getFullYear()}-${String(currentMonth+1).padStart(2,'0')}`,
        baseSalary,
        totalAttendance,
        allowance: 0,
        bonus,
        deduction,
        netSalary,
        status: 'unpaid'
    };
  };

  // --- LOGS ---
  const liveLogs: ActivityLog[] = useMemo(() => {
      const logs: ActivityLog[] = [];
      // Attendance Logs
      attendance.slice(0, 20).forEach(att => {
          // Find employee name
          const empName = employees.find(e => e.id === att.employeeId)?.name || 'Unknown';
          logs.push({
              id: `LOG-ATT-${att.id}`,
              type: 'info',
              message: `${empName} melakukan Clock-In`,
              user: empName,
              timestamp: att.clockIn,
              category: 'Attendance'
          });
      });
      return logs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [attendance, employees]);

  // Filtered List
  const filteredEmployees = useMemo(() => {
      if(!searchTerm) return employees;
      return employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.role.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [employees, searchTerm]);

  return {
    employees: filteredEmployees,
    attendance,
    activeTab, setActiveTab,
    selectedEmployee, setSelectedEmployee,
    stats,
    todaysAttendance,
    getAttendanceForEmployee,
    calculatePayroll,
    clockIn,
    clockOut,
    liveLogs,
    searchTerm, setSearchTerm,
    chatSystem // Export chat system
  };
};
