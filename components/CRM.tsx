import React from 'react';
import { 
  Users, Crown, Star, Gift, UserPlus, Trophy
} from 'lucide-react';
import { useCRMLogic } from '../hooks/useCRMLogic';
import GlassPanel from './common/GlassPanel';
import CustomerList from './crm/CustomerList';
import LoyaltyProgram from './crm/LoyaltyProgram';

interface CRMProps {
  initialSearchTerm?: string;
}

const CRM: React.FC<CRMProps> = ({ initialSearchTerm }) => {
  const { 
      customers, 
      filteredCustomers, 
      activeTab, setActiveTab,
      filterQuery, setFilterQuery,
      getTierColor,
      handleSelectCustomer,
      selectedCustomer,
      isMemberCardOpen,
      handleCloseMemberCard,
      stats
  } = useCRMLogic({ initialSearchTerm });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassPanel className="p-6 rounded-3xl flex items-center gap-4 bg-gradient-to-br from-purple-600/10 to-purple-400/5 border-purple-500/20">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Member</p>
            <h3 className="text-2xl font-bold text-white">{stats.totalMembers}</h3>
          </div>
        </GlassPanel>
        
        <GlassPanel className="p-6 rounded-3xl flex items-center gap-4 bg-gradient-to-br from-yellow-600/10 to-yellow-400/5 border-yellow-500/20">
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-yellow-400">
            <Crown size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Member Gold+</p>
            <h3 className="text-2xl font-bold text-white">{stats.goldMembers}</h3>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6 rounded-3xl flex items-center gap-4 bg-gradient-to-br from-pink-600/10 to-pink-400/5 border-pink-500/20">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/20 flex items-center justify-center text-pink-400">
            <Star size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Poin Beredar</p>
            <h3 className="text-2xl font-bold text-white">{stats.totalPoints.toLocaleString()}</h3>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6 rounded-3xl flex items-center justify-center border-dashed border-gray-700 hover:border-orange-500/50 hover:bg-orange-500/5 cursor-pointer transition-all group">
             <div className="flex flex-col items-center gap-2">
                 <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                     <UserPlus size={20} />
                 </div>
                 <span className="text-sm font-bold text-gray-400 group-hover:text-white">Member +</span>
             </div>
        </GlassPanel>
      </div>

      {/* Main Content Area */}
      <GlassPanel className="rounded-3xl p-1 min-h-[600px] flex flex-col md:flex-row bg-black/20">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 p-4 space-y-2 border-b md:border-b-0 md:border-r border-white/5">
           <button 
              onClick={() => setActiveTab('database')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'database' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
           >
              <Users size={18} />
              <span className="font-bold text-sm">Database</span>
           </button>
           <button 
              onClick={() => setActiveTab('loyalty')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'loyalty' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
           >
              <Trophy size={18} />
              <span className="font-bold text-sm">Loyalty</span>
           </button>
           <button 
              onClick={() => setActiveTab('campaign')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'campaign' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
           >
              <Gift size={18} />
              <span className="font-bold text-sm">Promo</span>
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'database' && (
              <CustomerList 
                  customers={filteredCustomers} 
                  filterQuery={filterQuery} 
                  setFilterQuery={setFilterQuery} 
                  getTierColor={getTierColor}
                  onSelect={handleSelectCustomer}
                  selectedCustomer={selectedCustomer}
                  isMemberCardOpen={isMemberCardOpen}
                  onCloseMemberCard={handleCloseMemberCard}
              />
          )}

          {activeTab === 'loyalty' && <LoyaltyProgram />}

          {activeTab === 'campaign' && (
             <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in-95">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center relative">
                   <Gift size={40} className="text-gray-600" />
                   <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">Soon</div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Promo Blast</h3>
                  <p className="text-gray-400 max-w-md mt-2">
                    Kirim voucher diskon otomatis ke WhatsApp pelanggan.
                  </p>
                </div>
                <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors">
                  Test Blast
                </button>
             </div>
          )}
        </div>
      </GlassPanel>
    </div>
  );
};

export default CRM;