
import { useMemo } from 'react';
import { useGlobalContext } from '../../../context/GlobalContext';

export const useAttendanceLogic = () => {
  const { attendance, clockIn, clockOut, employees } = useGlobalContext();

  const today = new Date().toLocaleDateString();
  
  // Get records for today
  const todaysAttendance = useMemo(() => {
     return attendance.filter(a => new Date(a.clockIn).toLocaleDateString() === today);
  }, [attendance, today]);

  // Stats
  const stats = {
    present: todaysAttendance.length,
    late: todaysAttendance.filter(a => a.status === 'Late').length,
    missing: employees.length - todaysAttendance.length // Simplified logic
  };

  // Helper for Heatmap Data
  const getAttendanceMap = (employeeId: string) => {
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

  return {
    attendance,
    todaysAttendance,
    stats,
    clockIn,
    clockOut,
    getAttendanceMap
  };
};
