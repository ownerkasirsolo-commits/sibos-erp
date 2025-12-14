import { useState, useEffect } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
// @FIX: 'CustomerDetail' type has been moved to its own feature module.
import { CustomerDetail } from '../features/crm/types';

interface CRMLogicProps {
  initialSearchTerm?: string;
}

export const useCRMLogic = ({ initialSearchTerm }: CRMLogicProps = {}) => {
  const { customers, addCustomer } = useGlobalContext();
  const [activeTab, setActiveTab] = useState<'database' | 'loyalty' | 'campaign'>('database');
  const [filterQuery, setFilterQuery] = useState(initialSearchTerm || '');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);
  const [isMemberCardOpen, setIsMemberCardOpen] = useState(false);

  useEffect(() => {
    if (initialSearchTerm) {
      setFilterQuery(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(filterQuery.toLowerCase()) || 
    c.phone.includes(filterQuery)
  );

  const stats = {
      totalMembers: customers.length,
      goldMembers: customers.filter(c => c.tier === 'Gold' || c.tier === 'Platinum').length,
      totalPoints: customers.reduce((acc, curr) => acc + curr.points, 0)
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'from-slate-300 via-white to-slate-300 text-slate-900';
      case 'Gold': return 'from-yellow-400 via-yellow-200 to-yellow-500 text-yellow-900';
      case 'Silver': return 'from-gray-400 via-gray-200 to-gray-400 text-gray-900';
      default: return 'from-orange-700 via-orange-500 to-orange-700 text-white'; // Bronze
    }
  };

  const handleSelectCustomer = (customer: CustomerDetail) => {
      setSelectedCustomer(customer);
      setIsMemberCardOpen(true);
  };

  const handleCloseMemberCard = () => {
      setIsMemberCardOpen(false);
      setSelectedCustomer(null);
  };

  return {
      customers,
      filteredCustomers,
      activeTab, setActiveTab,
      filterQuery, setFilterQuery,
      selectedCustomer,
      isMemberCardOpen,
      handleSelectCustomer,
      handleCloseMemberCard,
      getTierColor,
      stats
  };
};