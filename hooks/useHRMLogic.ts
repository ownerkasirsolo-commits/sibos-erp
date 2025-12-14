
import { useState, useMemo } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
// @FIX: HRM types moved to their own feature module.
import { Employee, Attendance, Payroll } from '../features/hrm/types';

export const useHRMLogic = () => {
  const { employees, attendance, clockIn, clockOut, transactions } = useGlobalContext();

  const [activeTab, setActiveTab] = useState<'list' | 'attendance' | 'payroll'>('list');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // --- STATS ---
  const today = new Date().toLocaleDateString();
  const todaysAttendance = attendance.filter(a => new Date(a.clockIn).toLocaleDateString() === today);
  const onLeaveCount = employees.filter(e => e.status === 'On Leave').length;

  const stats = {
    total: employees.length,
    present: todaysAttendance.filter(a => !a.clockOut).length, // Only count those currently clocked in
    onLeave: onLeaveCount
  };

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

    // Simple bonus based on performance (e.g., total sales processed by this employee)
    const bonus = transactions.filter(t => t.staffId === employee.id).reduce((sum, t) => sum + (t.total * 0.001), 0); // 0.1% of sales
    
    // Simple deduction
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

  return {
    employees,
    attendance,
    activeTab, setActiveTab,
    selectedEmployee, setSelectedEmployee,
    stats,
    todaysAttendance,
    getAttendanceForEmployee,
    calculatePayroll,
    clockIn,
    clockOut
  };
};
