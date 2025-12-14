
import { useState, useMemo } from 'react';
import { useGlobalContext } from '../../../context/GlobalContext';
import { Employee } from '../types';

export const useEmployeeLogic = () => {
  const { employees } = useGlobalContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Filtered List
  const filteredEmployees = useMemo(() => {
      if(!searchTerm) return employees;
      return employees.filter(e => 
          e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          e.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [employees, searchTerm]);

  // Stats specific to Employees
  const stats = {
      total: employees.length,
      active: employees.filter(e => e.status === 'Active').length,
      onLeave: employees.filter(e => e.status === 'On Leave').length
  };

  return {
    employees: filteredEmployees,
    searchTerm,
    setSearchTerm,
    selectedEmployee,
    setSelectedEmployee,
    stats
  };
};
