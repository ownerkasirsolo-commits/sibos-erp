
import React from 'react';
import { User } from '../../types';
import { useLayoutManager } from './hooks/useLayoutManager';
import { useGlobalSearch } from './hooks/useGlobalSearch';
import { useAICompanion, AICompanionPanel } from '../ai';
import { useGlobalContext } from '../../context/GlobalContext';

import Header from './components/Header';
import AppSidebar from './components/AppSidebar';
import GlobalSearchModal from './components/GlobalSearchModal';

// Define menu structure again for label lookup
import { PieChart, ShoppingCart, CalendarDays, Ticket, ChefHat, MonitorPlay, Tv, Box, Warehouse, Calculator, Users, Globe, UserCog, Laptop, Megaphone, MapPin, Store } from 'lucide-react';
const allMenuItems = [
    { id: 'dashboard', label: 'Analitik', icon: PieChart },
    { id: 'pos', label: 'Point of Sales', icon: ShoppingCart },
    { id: 'reservations', label: 'Reservasi Meja', icon: CalendarDays },
    { id: 'queue', label: 'Antrian (Queue)', icon: Ticket },
    { id: 'kds', label: 'Kitchen Display', icon: ChefHat },
    { id: 'cds', label: 'Customer Display', icon: MonitorPlay },
    { id: 'signage', label: 'Digital Signage', icon: Tv },
    { id: 'products', label: 'Menu & Produk', icon: Box },
    { id: 'irm', label: 'Stok & Bahan (IRM)', icon: Warehouse },
    { id: 'accounting', label: 'Akuntansi', icon: Calculator },
    { id: 'crm', label: 'Pelanggan (CRM)', icon: Users },
    { id: 'omnichannel', label: 'Omnichannel', icon: Globe },
    { id: 'marketing', label: 'Pusat Pemasaran', icon: Megaphone },
    { id: 'hrm', label: 'Pegawai (HRM)', icon: UserCog },
    { id: 'website', label: 'Website Usaha', icon: Laptop },
    { id: 'google', label: 'Google Business', icon: MapPin },
];

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  currentView: string;
  onSmartNavigate: (view: string, searchTerm?: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, currentView, onSmartNavigate }) => {
  const layoutManager = useLayoutManager({ onNavigate: onSmartNavigate, currentView });
  const globalSearch = useGlobalSearch(onSmartNavigate);
  const aiCompanion = useAICompanion();
  const { isLoadingContext } = useGlobalContext(); // Access Global Loading State

  const currentViewLabel = allMenuItems.find(item => item.id === currentView)?.label || 'Analitik';
  const isFullScreen = ['pos', 'kds', 'cds'].includes(currentView);

  return (
    <div className="h-screen w-screen text-gray-200 flex overflow-hidden font-sans relative">
        
      {/* GLOBAL LOADING OVERLAY */}
      {isLoadingContext && (
          <div className="absolute inset-0 z-[9999] bg-[#0f172a]/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
              <div className="relative">
                  <div className="w-20 h-20 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                      <Store size={24} className="text-white opacity-80" />
                  </div>
              </div>
              <h2 className="mt-6 text-xl font-bold text-white tracking-wide">Memuat Outlet...</h2>
              <p className="text-sm text-gray-400 mt-2">Menyiapkan data dan konfigurasi bisnis</p>
          </div>
      )}

      <main className="flex-1 flex flex-col relative overflow-hidden h-full">
        <Header 
          user={user}
          currentViewLabel={currentViewLabel}
          isFullScreen={isFullScreen}
          onOpenSearch={() => globalSearch.setIsSearchOpen(true)}
          onOpenAI={() => aiCompanion.setIsAIChatOpen(true)}
          onOpenMobileMenu={() => layoutManager.setIsMobileMenuOpen(true)}
          isNotificationOpen={layoutManager.isNotificationOpen}
          onToggleNotification={() => layoutManager.setIsNotificationOpen(!layoutManager.isNotificationOpen)}
        />
        <div className={`flex-1 overflow-y-auto overflow-x-hidden ${isFullScreen ? 'p-0' : 'px-4 md:px-8 pb-8 pt-28'} custom-scrollbar relative z-10 w-full`}>
           {children}
        </div>
      </main>

      {!isFullScreen && (
        <aside className={`hidden lg:flex flex-col border-l border-white/5 bg-black/20 backdrop-blur-xl transition-all duration-300 relative z-30 ${layoutManager.isSidebarOpen ? 'w-72' : 'w-24'}`}>
          <AppSidebar 
            isExpanded={layoutManager.isSidebarOpen}
            onToggle={layoutManager.setIsSidebarOpen}
            onLogout={onLogout}
            currentView={currentView}
            {...layoutManager}
          />
        </aside>
      )}

      {layoutManager.isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => layoutManager.setIsMobileMenuOpen(false)}></div>
           <div className="absolute right-0 top-0 bottom-0 w-72 bg-[#0f172a] border-l border-white/10 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
              <AppSidebar isExpanded={true} onToggle={() => {}} onLogout={onLogout} currentView={currentView} {...layoutManager} />
           </div>
        </div>
      )}

      <GlobalSearchModal 
        isSearchOpen={globalSearch.isSearchOpen}
        setIsSearchOpen={globalSearch.setIsSearchOpen}
        searchQuery={globalSearch.searchQuery}
        setSearchQuery={globalSearch.setSearchQuery}
        searchInputRef={globalSearch.searchInputRef}
        searchResults={globalSearch.searchResults}
        hasResults={globalSearch.hasResults}
        handleSearchResultClick={globalSearch.handleResultClick}
      />
      <AICompanionPanel {...aiCompanion} />
    </div>
  );
};

export default Layout;
