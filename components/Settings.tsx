import React, { useState } from 'react';
// @FIX: Import BusinessConfig from its new location in features/irm/types.
import { User } from '../types';
import { BusinessConfig } from '../features/irm/types';
import { User as UserIcon, CreditCard, LayoutGrid } from 'lucide-react';
import ProfileSettings from './settings/ProfileSettings';
import BusinessPortfolio from './settings/BusinessPortfolio';
import SubscriptionSettings from './settings/SubscriptionSettings';

interface SettingsProps {
  user: User;
  businessConfig: BusinessConfig;
}

type ActiveTab = 'portfolio' | 'profile' | 'subscription';

const Settings: React.FC<SettingsProps> = ({ user, businessConfig }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('portfolio');

  const tabs = [
    { id: 'portfolio', label: 'Manajemen Bisnis', icon: LayoutGrid },
    { id: 'profile', label: 'Profil Saya', icon: UserIcon },
    { id: 'subscription', label: 'Langganan', icon: CreditCard },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'portfolio':
        // BusinessPortfolio now handles the logic for Business Info & Outlets internally
        return <BusinessPortfolio />;
      case 'profile':
        return <ProfileSettings user={user} />;
      case 'subscription':
        return <SubscriptionSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Context */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Pengaturan Global</h2>
          <p className="text-gray-400 text-sm">Kelola seluruh ekosistem bisnis Anda dari satu tempat.</p>
        </div>
      </div>

      {/* Horizontal Tab Bar - Simplified & Centered */}
      <div className="glass-panel rounded-2xl p-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar w-fit mx-auto max-w-full">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={(e) => {
              setActiveTab(tab.id as ActiveTab);
              e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }}
            className={`flex-shrink-0 flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white/10 text-orange-400 shadow-sm border border-white/5'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <tab.icon size={18} className={activeTab === tab.id ? 'text-orange-500' : ''} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in duration-300">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Settings;