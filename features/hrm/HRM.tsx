
import React, { useState } from 'react';
import { Briefcase, Calendar, DollarSign, Activity, Users, UserCheck, UserMinus, MessageCircle, UserPlus } from 'lucide-react';
import StatWidget from '../../components/common/StatWidget';
// Atomic Views
import EmployeeView from './components/views/EmployeeView';
import AttendanceView from './components/views/AttendanceView';
import PayrollView from './components/views/PayrollView';
import ActivityView from './components/views/ActivityView';
import RecruitmentView from './components/views/RecruitmentView'; // New Import

// Independent Hooks for Stats
import { useEmployeeLogic } from './hooks/useEmployeeLogic';
import { useAttendanceLogic } from './hooks/useAttendanceLogic';
import { usePayrollLogic } from './hooks/usePayrollLogic';
import { useHRMLogic } from './hooks/useHRMLogic';
import UniversalChatWidget from '../communication/components/UniversalChatWidget';
import { Employee } from './types';

const HRM: React.FC = () => {
  // Use unified logic hook to get access to ChatSystem
  const { 
    chatSystem,
    activeTab, setActiveTab 
  } = useHRMLogic();

  // Load hooks just to get high-level stats for the header
  const { stats: empStats } = useEmployeeLogic();
  const { stats: attStats } = useAttendanceLogic();
  const { totalPayrollEst } = usePayrollLogic();

  // Handler to open chat from sub-views
  const handleChatWithEmployee = (emp: Employee) => {
    const contact = chatSystem.filteredContacts.find(c => c.id === emp.id);
    if(contact) {
        chatSystem.handleOpen();
        chatSystem.handleSelectContact(contact);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* 1. HEADER STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
         <StatWidget 
            label="Total Pegawai" 
            value={empStats.total} 
            icon={Users} 
            colorClass="text-blue-400" 
            bgClass="bg-blue-500/10 border-blue-500/20"
         />
         <StatWidget 
            label="Hadir Hari Ini" 
            value={attStats.present} 
            icon={UserCheck} 
            colorClass="text-green-400" 
            bgClass="bg-green-500/10 border-green-500/20"
         />
         <StatWidget 
            label="Cuti / Absen" 
            value={empStats.onLeave} 
            icon={UserMinus} 
            colorClass="text-yellow-400" 
            bgClass="bg-yellow-500/10 border-yellow-500/20"
         />
         <StatWidget 
            label="Estimasi Payroll" 
            value={totalPayrollEst} 
            icon={DollarSign} 
            colorClass="text-orange-400" 
            bgClass="bg-orange-500/10 border-orange-500/20"
         />
      </div>

       {/* 2. STICKY NAVIGATION TABS & ACTIONS */}
       <div className="sticky top-0 z-30 backdrop-blur-md flex flex-col md:flex-row gap-4 items-center justify-between bg-black/20 p-2 rounded-xl">
           <div className="flex w-full md:w-fit overflow-x-auto no-scrollbar gap-1">
                {/* RECRUITMENT MOVED TO FIRST POSITION */}
                <button 
                    onClick={() => setActiveTab('recruitment')}
                    className={`flex-1 md:flex-none py-2.5 px-6 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'recruitment' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
                >
                    <UserPlus size={14} /> <span>Rekrutmen</span>
                </button>
                <button 
                    onClick={() => setActiveTab('list')}
                    className={`flex-1 md:flex-none py-2.5 px-6 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'list' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
                >
                    <Briefcase size={14} /> <span>Data Pegawai</span>
                </button>
                <button 
                    onClick={() => setActiveTab('attendance')}
                    className={`flex-1 md:flex-none py-2.5 px-6 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'attendance' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
                >
                    <Calendar size={14} /> <span>Absensi</span>
                </button>
                <button 
                    onClick={() => setActiveTab('payroll')}
                    className={`flex-1 md:flex-none py-2.5 px-6 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'payroll' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
                >
                    <DollarSign size={14} /> <span>Payroll</span>
                </button>
                 <button 
                    onClick={() => setActiveTab('logs')}
                    className={`flex-1 md:flex-none py-2.5 px-6 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'logs' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
                >
                    <Activity size={14} /> <span>Aktivitas</span>
                </button>
           </div>

           <button 
              onClick={chatSystem.handleOpen}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-xs font-bold shadow-lg whitespace-nowrap"
           >
               <MessageCircle size={16} /> Team Chat
           </button>
       </div>

      {/* 3. MAIN CONTENT (ATOMIC VIEWS) */}
      <div className="min-h-[500px]">
          {activeTab === 'recruitment' && <RecruitmentView />}
          {activeTab === 'list' && <EmployeeView onChat={handleChatWithEmployee} />}
          {activeTab === 'attendance' && <AttendanceView />}
          {activeTab === 'payroll' && <PayrollView />}
          {activeTab === 'logs' && <ActivityView />}
      </div>

      {/* GLOBAL CHAT WIDGET */}
      <UniversalChatWidget
            title="Team Chat SIBOS"
            isOpen={chatSystem.isOpen}
            onClose={chatSystem.handleClose}
            activeContact={chatSystem.activeContact}
            contacts={chatSystem.filteredContacts}
            searchQuery={chatSystem.searchQuery}
            onSearchChange={chatSystem.setSearchQuery}
            onSelectContact={chatSystem.handleSelectContact}
            onBackToContacts={chatSystem.handleBackToContacts}
            messages={chatSystem.currentMessages}
            inputValue={chatSystem.inputValue}
            onInputChange={chatSystem.setInputValue}
            onSendMessage={chatSystem.handleSendMessage}
        />
    </div>
  );
};

export default HRM;
