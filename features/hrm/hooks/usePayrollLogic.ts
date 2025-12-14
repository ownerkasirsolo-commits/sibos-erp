
import { useMemo } from 'react';
import { useGlobalContext } from '../../../context/GlobalContext';
import { Employee, Payroll } from '../types';

export const usePayrollLogic = () => {
  const { employees, attendance, transactions, processPayroll, payrolls } = useGlobalContext();

  // Calculate Payroll for a specific employee
  const calculatePayroll = (employee: Employee): Payroll => {
    const baseSalary = parseInt(employee.salary.replace(/[^0-9]/g, '')) || 0;
    
    // Calculate attendance for the current month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const periodString = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}`;
    
    // Check if payroll record exists in DB
    const existingPayroll = payrolls.find(p => p.employeeId === employee.id && p.period === periodString);
    
    if (existingPayroll) {
        return existingPayroll;
    }

    // Dynamic Calculation (Unpaid)
    const totalAttendance = attendance.filter(a => 
        a.employeeId === employee.id && 
        new Date(a.clockIn).getMonth() === currentMonth
    ).length;

    // Simple bonus based on sales performance (0.1% of sales handled by this staff)
    const bonus = transactions
        .filter(t => t.staffId === employee.id)
        .reduce((sum, t) => sum + (t.total * 0.001), 0); 
    
    const lateCount = attendance.filter(a => 
        a.employeeId === employee.id && 
        new Date(a.clockIn).getMonth() === currentMonth && 
        a.status === 'Late'
    ).length;
    const deduction = lateCount * 50000;

    const netSalary = baseSalary + bonus - deduction;

    return {
        id: `PAY-${employee.id}-${periodString}`,
        employeeId: employee.id,
        period: periodString,
        baseSalary,
        totalAttendance,
        allowance: 0,
        bonus,
        deduction,
        netSalary,
        status: 'unpaid'
    };
  };

  // Generate All Payrolls
  const allPayrolls = useMemo(() => {
      return employees.map(emp => ({
          employee: emp,
          data: calculatePayroll(emp)
      }));
  }, [employees, attendance, transactions, payrolls]);

  const totalPayrollEst = allPayrolls.reduce((acc, p) => acc + p.data.netSalary, 0);

  const handlePaySalary = async (payroll: Payroll, method: 'cash' | 'transfer') => {
      if (payroll.status === 'paid') return;
      try {
          await processPayroll(payroll, method);
          alert(`Gaji periode ${payroll.period} berhasil dibayarkan!`);
      } catch (error) {
          alert('Gagal memproses pembayaran gaji.');
      }
  };

  return {
    calculatePayroll,
    allPayrolls,
    totalPayrollEst,
    handlePaySalary
  };
};
