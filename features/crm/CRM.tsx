
import React from 'react';
import { 
  Users, Crown, Star, Gift, Activity, Trophy
} from 'lucide-react';
import { useCRMLogic } from './hooks/useCRMLogic';
import CustomerList from './components/CustomerList';
import LoyaltyProgram from './components/LoyaltyProgram';
import PromoManager from './components/PromoManager';
import CRMLogs from './components/CRMLogs';
import StatWidget from '../../components/common/StatWidget';
import LiveLogPanel from '../../components/common/LiveLogPanel';

interface CRMProps {
  initialSearchTerm?: string;
}

const CRM: React.FC<CRMProps> = ({ initialSearchTerm }) => {
  const { 
      customers, 
      activeTab, setActiveTab,
      filterQuery, setFilterQuery,
      filterTier, setFilterTier,
      getTierColor,
      handleSelectCustomer,
      selectedCustomer,
      isMemberCardOpen,
      handleCloseMemberCard,
      handleExportCSV,
      stats,
      isLiveLogOpen, setIsLiveLogOpen,
      liveLogs,
      
      // Add Member Hook Data
      isAddMemberModalOpen, setIsAddMemberModalOpen,
      newMemberName, setNewMemberName,
      newMemberPhone, setNewMemberPhone,
      handleSaveNewMember
  } = useCRMLogic({ initialSearchTerm });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* 1. HEADER STATS (HORIZONTAL WIDGETS) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
         <StatWidget 
            label="Total Member" 
            value={stats.totalMembers} 
            icon={Users} 
            colorClass="text-purple-400" 
            bgClass="bg-purple-500/10 border-purple-500/20"
         />
         <StatWidget 
            label="Member Gold+" 
            value={stats.goldMembers} 
            icon={Crown} 
            colorClass="text-yellow-400" 
            bgClass="bg-yellow-500/10 border-yellow-500/20"
         />
         <StatWidget 
            label="Poin Beredar" 
            value={stats.totalPoints} 
            icon={Star} 
            colorClass="text-pink-400" 
            bgClass="bg-pink-500/10 border-pink-500/20"
         />
         <StatWidget 
            label="Member Baru" 
            value={stats.newMembersThisMonth} 
            icon={Activity} 
            colorClass="text-green-400" 
            bgClass="bg-green-500/10 border-green-500/20"
            subtext="Bulan Ini"
         />
      </div>

      {/* 2. HORIZONTAL TAB BAR (STICKY) */}
      <div className="flex bg-black/20 p-1 rounded-xl w-full md:w-fit md:mx-auto overflow-x-auto no-scrollbar sticky top-0 z-30 backdrop-blur-md">
           <button 
              onClick={() => setActiveTab('database')}
              className={`flex-1 md:flex-none py-2.5 px-6 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'database' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
           >
              <Users size={14} /> Database
           </button>
           <button 
              onClick={() => setActiveTab('loyalty')}
              className={`flex-1 md:flex-none py-2.5 px-6 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'loyalty' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
           >
              <Trophy size={14} /> Loyalty Tier
           </button>
           <button 
              onClick={() => setActiveTab('campaign')}
              className={`flex-1 md:flex-none py-2.5 px-6 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'campaign' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
           >
              <Gift size={14} /> Promo & Campaign
           </button>
           <button 
              onClick={() => setActiveTab('logs')}
              className={`flex-1 md:flex-none py-2.5 px-6 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'logs' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
           >
              <Activity size={14} /> Aktivitas
           </button>
      </div>

      {/* 3. MAIN CONTENT */}
      <div className="animate-in fade-in zoom-in-95 duration-300">
          {activeTab === 'database' && (
              <CustomerList 
                  customers={customers} 
                  filterQuery={filterQuery} 
                  setFilterQuery={setFilterQuery}
                  filterTier={filterTier}
                  setFilterTier={setFilterTier} 
                  getTierColor={getTierColor}
                  onSelect={handleSelectCustomer}
                  selectedCustomer={selectedCustomer}
                  isMemberCardOpen={isMemberCardOpen}
                  onCloseMemberCard={handleCloseMemberCard}
                  onExport={handleExportCSV}
                  onLiveLogClick={() => setIsLiveLogOpen(true)}
                  isLiveLogActive={isLiveLogOpen}
                  
                  // Add Member Props
                  onAddMemberClick={() => setIsAddMemberModalOpen(true)}
                  isAddMemberModalOpen={isAddMemberModalOpen}
                  onCloseAddMember={() => setIsAddMemberModalOpen(false)}
                  newMemberName={newMemberName}
                  setNewMemberName={setNewMemberName}
                  newMemberPhone={newMemberPhone}
                  setNewMemberPhone={setNewMemberPhone}
                  onSaveNewMember={handleSaveNewMember}
              />
          )}

          {activeTab === 'loyalty' && <LoyaltyProgram />}
          
          {activeTab === 'campaign' && <PromoManager />}
          
          {activeTab === 'logs' && <CRMLogs />}
      </div>

      {/* GLOBAL LIVE LOG PANEL */}
      <LiveLogPanel
            isOpen={isLiveLogOpen}
            onClose={() => setIsLiveLogOpen(false)}
            title="Log Aktivitas CRM"
            logs={liveLogs}
      />
    </div>
  );
};

export default CRM;
