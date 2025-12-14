
import { useState, useEffect, useMemo } from 'react';
import { useGlobalContext } from '../../../context/GlobalContext';
import { CustomerDetail } from '../types';
import { ActivityLog } from '../../../components/common/LiveLogPanel';

interface CRMLogicProps {
  initialSearchTerm?: string;
}

export const useCRMLogic = ({ initialSearchTerm }: CRMLogicProps = {}) => {
  const { customers, addCustomer, transactions } = useGlobalContext();
  
  // -- STATE --
  const [activeTab, setActiveTab] = useState<'database' | 'loyalty' | 'campaign' | 'logs'>('database');
  const [filterQuery, setFilterQuery] = useState(initialSearchTerm || '');
  const [filterTier, setFilterTier] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);
  
  // Modals & Panels
  const [isMemberCardOpen, setIsMemberCardOpen] = useState(false);
  const [isLiveLogOpen, setIsLiveLogOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  // -- ADD MEMBER STATE --
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');

  useEffect(() => {
    if (initialSearchTerm) {
      setFilterQuery(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  // -- FILTERING --
  const filteredCustomers = useMemo(() => {
      return customers.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(filterQuery.toLowerCase()) || c.phone.includes(filterQuery);
        const matchTier = filterTier === 'All' || c.tier === filterTier;
        return matchSearch && matchTier;
      });
  }, [customers, filterQuery, filterTier]);

  // -- STATS (Mirip Modul Produk) --
  const stats = useMemo(() => {
      const totalMembers = customers.length;
      const goldMembers = customers.filter(c => c.tier === 'Gold' || c.tier === 'Platinum').length;
      
      // Member baru bulan ini (Mock logic based on joinDate string usually, here simplified)
      // Asumsi format joinDate 'DD Mon YYYY' atau ISO
      const newMembersThisMonth = customers.filter(c => {
          // Mock detection for demo purposes
          return c.joinDate.includes(new Date().getFullYear().toString()); 
      }).length;

      const totalPoints = customers.reduce((acc, curr) => acc + curr.points, 0);

      return {
          totalMembers,
          goldMembers,
          newMembersThisMonth,
          totalPoints
      };
  }, [customers]);

  // -- LIVE LOGS GENERATOR (Mirip Modul Produk) --
  const liveLogs: ActivityLog[] = useMemo(() => {
      const logs: ActivityLog[] = [];
      
      // 1. New Member Logs (Mock from existing data)
      customers.slice(0, 8).forEach((c, idx) => {
          logs.push({
              id: `LOG-NEW-${c.id}`,
              type: 'success',
              message: `Member Baru: ${c.name} bergabung`,
              user: 'System',
              timestamp: new Date(Date.now() - (idx * 86400000)).toISOString(), 
              category: 'Database'
          });
      });

      // 2. Transaction Logs (Points Earned)
      transactions.slice(0, 10).forEach(t => {
          if (t.customerId) {
               const cust = customers.find(c => c.id === t.customerId);
               if (cust) {
                   logs.push({
                       id: `LOG-TX-${t.id}`,
                       type: 'info',
                       message: `${cust.name} belanja (+${Math.floor(t.total/1000)} pts)`,
                       user: 'Kasir',
                       timestamp: t.timestamp,
                       value: t.total,
                       category: 'Transaction'
                   });
               }
          }
      });

      return logs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [customers, transactions]);

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
  
  const handleSaveNewMember = () => {
      if (!newMemberName || !newMemberPhone) return;
      
      const newCustomer: CustomerDetail = {
          id: `CUST-${Date.now()}`,
          name: newMemberName,
          phone: newMemberPhone,
          tier: 'Bronze',
          points: 0,
          totalSpend: 0,
          joinDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          lastVisit: 'Hari ini',
          favoriteMenu: '-'
      };
      
      addCustomer(newCustomer);
      setIsAddMemberModalOpen(false);
      setNewMemberName('');
      setNewMemberPhone('');
      alert(`Member ${newMemberName} berhasil ditambahkan!`);
  };

  // Export CSV
  const handleExportCSV = () => {
      const headers = ['ID', 'Nama', 'Telepon', 'Tier', 'Poin', 'Total Belanja'];
      const rows = customers.map(c => [c.id, `"${c.name}"`, `"${c.phone}"`, c.tier, c.points, c.totalSpend]);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `SIBOS_Customers_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return {
      customers,
      filteredCustomers,
      activeTab, setActiveTab,
      filterQuery, setFilterQuery,
      filterTier, setFilterTier,
      selectedCustomer,
      isMemberCardOpen, setIsMemberCardOpen,
      isLiveLogOpen, setIsLiveLogOpen,
      isReportModalOpen, setIsReportModalOpen,
      
      // Add Member Logic
      isAddMemberModalOpen, setIsAddMemberModalOpen,
      newMemberName, setNewMemberName,
      newMemberPhone, setNewMemberPhone,
      handleSaveNewMember,
      
      handleSelectCustomer,
      handleCloseMemberCard,
      handleExportCSV,
      getTierColor,
      stats,
      liveLogs
  };
};
