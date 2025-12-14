
import React, { useState, Suspense, lazy, useEffect } from 'react';
import { User } from './types';
import Auth from './features/auth';
import Layout from './features/layout';
import { GlobalProvider, useGlobalContext } from './context/GlobalContext';
import { Store } from 'lucide-react';

// --- LAZY LOADING MODULES (Code Splitting) ---
const Dashboard = lazy(() => import('./features/dashboard'));
const POS = lazy(() => import('./features/pos'));
const KDS = lazy(() => import('./features/kds'));
const CDS = lazy(() => import('./features/cds'));
const Reservations = lazy(() => import('./features/reservations'));
const Queue = lazy(() => import('./features/queue'));
const Signage = lazy(() => import('./features/signage'));
const Settings = lazy(() => import('./features/settings')); 
const HRM = lazy(() => import('./features/hrm'));
const Products = lazy(() => import('./features/products'));
const Marketing = lazy(() => import('./features/marketing')); 
const WebsiteBuilder = lazy(() => import('./features/website'));
const GoogleBusiness = lazy(() => import('./features/google/GoogleBusiness'));
const Omnichannel = lazy(() => import('./features/omnichannel')); 
const IRM = lazy(() => import('./features/irm'));
const CRM = lazy(() => import('./features/crm'));
const Accounting = lazy(() => import('./features/accounting'));
const BossDashboard = lazy(() => import('./features/ai').then(module => ({ default: module.BossDashboard })));
const WalletDashboard = lazy(() => import('./features/wallet/WalletDashboard'));
const PartnerDashboard = lazy(() => import('./features/partner/PartnerDashboard')); // Added Partner

// Loading Spinner Component
const LoadingScreen = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center animate-bounce shadow-lg shadow-orange-500/30">
         <Store size={24} className="text-white" />
      </div>
      <p className="text-gray-400 text-sm font-medium animate-pulse">Memuat Modul...</p>
    </div>
  </div>
);

// Inner component to access Context
const AppContent: React.FC = () => {
  const { currentUser, businessConfig, logout } = useGlobalContext();
  const [currentView, setCurrentView] = useState('dashboard');
  const [initialSearch, setInitialSearch] = useState<{ view: string; term: string } | null>(null);

  useEffect(() => {
    if (initialSearch) {
      const timer = setTimeout(() => setInitialSearch(null), 50);
      return () => clearTimeout(timer);
    }
  }, [currentView, initialSearch]);


  // Map Employee to generic User type for Layout compatibility
  const layoutUser: User | null = currentUser ? {
      id: currentUser.id,
      name: currentUser.name,
      role: currentUser.role as any, 
      email: `${currentUser.name.toLowerCase().replace(' ', '.')}@sibos.com`
  } : null;

  const handleLogout = () => {
    logout();
    setCurrentView('dashboard');
  };

  const handleSmartNavigate = (view: string, searchTerm?: string) => {
    if (searchTerm) {
      setInitialSearch({ view, term: searchTerm });
    } else {
      setInitialSearch(null);
    }
    setCurrentView(view);
  };

  // Show Auth if not logged in
  if (!currentUser || !businessConfig || !layoutUser) {
    return <Auth />;
  }

  // Main App Logic
  const renderContent = () => {
    const searchTermForView = initialSearch?.view === currentView ? initialSearch.term : undefined;

    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'boss-mode': return <BossDashboard />; 
      case 'pos': return <POS businessType={businessConfig.type} onExit={() => setCurrentView('dashboard')} onNavigate={handleSmartNavigate} />;
      case 'kds': return <KDS onExit={() => setCurrentView('dashboard')} />;
      case 'cds': return <CDS onExit={() => setCurrentView('dashboard')} />;
      case 'reservations': return <Reservations />;
      case 'queue': return <Queue />;
      case 'signage': return <Signage />;
      case 'settings': return <Settings user={layoutUser} businessConfig={businessConfig} />;
      case 'hrm': return <HRM />;
      case 'products': return <Products initialSearchTerm={searchTermForView} />;
      case 'marketing': return <Marketing />; 
      case 'website': return <WebsiteBuilder />;
      case 'google': return <GoogleBusiness />;
      case 'omnichannel': return <Omnichannel />;
      case 'irm': return <IRM initialSearchTerm={searchTermForView} />;
      case 'crm': return <CRM initialSearchTerm={searchTermForView} />;
      case 'accounting': return <Accounting />;
      case 'wallet': return <WalletDashboard onNavigate={handleSmartNavigate} />;
      // Mock route for Partner (Owner only or specific role)
      // For demo, we allow access if manually navigated or added to menu
      // In real app, check role
      default: return <Dashboard />;
    }
  };

  return (
    <Layout 
      user={layoutUser} 
      onLogout={handleLogout}
      currentView={currentView}
      onSmartNavigate={handleSmartNavigate}
    >
      <Suspense fallback={<LoadingScreen />}>
        {renderContent()}
      </Suspense>
    </Layout>
  );
};

// Wrap App with GlobalProvider
const App: React.FC = () => {
  return (
    <GlobalProvider>
      <AppContent />
    </GlobalProvider>
  );
};

export default App;
