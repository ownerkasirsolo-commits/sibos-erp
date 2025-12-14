
import { useGlobalContext } from '../context/GlobalContext';

export const useAccountingLogic = () => {
  const { cashFlow } = useGlobalContext();

  // Calculate stats from real cashFlow
  const totalIncome = cashFlow
    .filter(t => t.type === 'in')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = cashFlow
    .filter(t => t.type === 'out')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netProfit = totalIncome - totalExpense;

  // Get recent transactions (sorted by date desc)
  const recentTransactions = [...cashFlow].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

  return {
    totalIncome,
    totalExpense,
    netProfit,
    recentTransactions
  };
};
