
import React from 'react';
import { 
  Settings, LogOut, PanelLeftClose, PanelRightClose, ChevronDown, Building2, Store, CheckCircle2
} from 'lucide-react';
import { useGlobalContext } from '../../../../../context/GlobalContext';

// Define menu structure again or import from a shared constants file
import { PieChart, ShoppingCart, CalendarDays, Ticket, ChefHat, MonitorPlay, Tv, Box, Warehouse, Calculator, Users, Globe, UserCog } from 'lucide-react';
const analyticsItem = { id: 'dashboard', label: 'Analitik', icon: PieChart };
const menuGroups = [
    { label: 'Front Office', items: [ { id: 'pos', label: 'Point of Sales', icon: ShoppingCart }, { id: 'reservations', label: 'Reservasi Meja', icon: CalendarDays }, { id: 'queue', label: 'Antrian (Queue)', icon: Ticket } ] },
    { label: 'Display & Dapur', items: [ { id: 'kds', label: 'Kitchen Display', icon: ChefHat }, { id: 'cds', label: 'Customer Display', icon: MonitorPlay }, { id: 'signage', label: 'Digital Signage', icon: Tv } ] },
    { label: 'Produk & Gudang', items: [ { id: 'products', label: 'Menu & Produk', icon: Box }, { id: 'irm', label: 'Stok & Bahan (IRM)', icon: Warehouse } ] },
    { label: 'Manajemen', items: [ { id: 'accounting', label: 'Akuntansi', icon: Calculator }, { id: 'crm', label: 'Pelanggan (CRM)', icon: Users }, { id: 'hrm', label: 'Pegawai (HRM)', icon: UserCog } ] }
];

interface SidebarProps {
    isExpanded: boolean;
    onToggle: (state: boolean) => void;
    onLogout: () => void;
    currentView: string;
    // Props from useLayoutManager
    isOutletSwitcherOpen: boolean;
    setIsOutletSwitcherOpen: (state: boolean) => void;
    expandedBizId: string | null;
    setExpandedBizId: (id: string | null) => void;
    openGroupLabel: string | null;
    toggleGroup: (label: string) => void;
    handleSwitchOutlet: (bizId: string, outletId: string) => void;
    handleNavigation: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    isExpanded, onToggle, onLogout, currentView,
    isOutletSwitcherOpen, setIsOutletSwitcherOpen,
    expandedBizId, setExpandedBizId,
    openGroupLabel, toggleGroup,
    handleSwitchOutlet, handleNavigation
}) => {
    const { availableBusinesses, activeBusiness, activeOutlet } = useGlobalContext();

    return (
        <>
            <div className="h-28 flex items-center p-4">
                {isExpanded ? (
                    <div className="flex items-center justify-between w-full animate-in fade-in duration-300">
                        <button onClick={() => onToggle(false)} className="w-11 h-11 flex items-center justify-center rounded-xl text-gray-400 bg-white/5 hover:bg-white/10 hover:text-white transition-colors"><PanelRightClose size={22} /></button>
                        <div className="flex items-center gap-3">
                            <button onClick={() => handleNavigation('settings')} className="w-11 h-11 flex items-center justify-center rounded-xl text-gray-400 bg-white/5 hover:bg-white/10 hover:text-white transition-colors" title="Settings"><Settings size={20} /></button>
                            <button onClick={onLogout} className="w-11 h-11 flex items-center justify-center rounded-xl bg-red-600 hover:bg-red-500 text-white transition-colors shadow-lg shadow-red-500/20" title="Logout"><LogOut size={20} /></button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full flex justify-center animate-in fade-in duration-300">
                        <button onClick={() => onToggle(true)} className="w-11 h-11 flex items-center justify-center rounded-xl text-gray-400 bg-white/5 hover:bg-white/10 hover:text-white transition-colors"><PanelLeftClose size={22} /></button>
                    </div>
                )}
            </div>

            {isExpanded && (
                <div className="px-4 mb-4 animate-in fade-in duration-300 relative">
                    <button onClick={() => setIsOutletSwitcherOpen(!isOutletSwitcherOpen)} className="w-full glass-panel p-3 rounded-2xl flex items-center justify-between text-left hover:border-orange-500/30 transition-colors group relative z-20 bg-[#0f172a]">
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-white truncate text-sm group-hover:text-orange-400 transition-colors">{activeBusiness?.name || 'Pilih Bisnis'}</p>
                            <p className="text-xs text-gray-400 truncate flex items-center gap-1"><Store size={10}/> {activeOutlet?.name || 'Pilih Outlet'}</p>
                        </div>
                        <ChevronDown size={18} className={`text-gray-500 ml-2 transition-transform ${isOutletSwitcherOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOutletSwitcherOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsOutletSwitcherOpen(false)}></div>
                            <div className="absolute top-full left-4 right-4 mt-2 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                {/* outlet switcher content placeholder */}
                            </div>
                        </>
                    )}
                </div>
            )}
            
            <nav className="flex-1 overflow-y-auto py-2 px-4 space-y-4 no-scrollbar">
                <button onClick={() => handleNavigation(analyticsItem.id)} className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group relative ${currentView === analyticsItem.id ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/5 text-orange-400' : 'text-gray-400 hover:bg-white/5'} ${!isExpanded && 'justify-center px-2'}`} title={!isExpanded ? analyticsItem.label : undefined}>
                    <analyticsItem.icon className={`w-5 h-5 shrink-0 ${currentView === analyticsItem.id ? 'text-orange-500' : ''}`} />
                    {isExpanded && <span className="font-medium text-[14px]">{analyticsItem.label}</span>}
                    {currentView === analyticsItem.id && !isExpanded && (<div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-500 rounded-r-full"></div>)}
                </button>

                {isExpanded && <div className="h-px bg-white/5 mx-2 my-2"></div>}
                
                {menuGroups.map((group, index) => {
                   const isOpen = isExpanded ? (openGroupLabel === group.label) : false;
                   return (
                     <div key={index}>
                        {isExpanded ? (
                          <button onClick={() => toggleGroup(group.label)} className="w-full flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2 hover:text-gray-300 transition-colors py-1">
                              <span>{group.label}</span>
                              <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                        ) : (
                           <div className="w-8 h-8 h-[2px] bg-white/10 mx-auto my-4 rounded-full"></div>
                        )}
                        
                        <div className={`space-y-1 overflow-hidden transition-all duration-300 ${isExpanded ? (isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0') : 'max-h-none opacity-100'}`}>
                           {group.items.map(item => (
                               <button key={item.id} onClick={() => handleNavigation(item.id)} className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group relative ${currentView === item.id ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/5 text-orange-400' : 'text-gray-400 hover:bg-white/5'} ${!isExpanded && 'justify-center px-2'}`} title={!isExpanded ? item.label : undefined}>
                                   <item.icon className={`w-5 h-5 shrink-0 ${currentView === item.id ? 'text-orange-500' : ''}`} />
                                   {isExpanded && <span className="font-medium text-[14px]">{item.label}</span>}
                                   {currentView === item.id && !isExpanded && (<div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-500 rounded-r-full"></div>)}
                               </button>
                           ))}
                        </div>
                     </div>
                   );
                })}
            </nav>

            {isExpanded && (
                <div className="p-4 text-center animate-in fade-in delay-200">
                    <p className="text-[10px] text-gray-600">SIBOS v2.6.0 Enterprise</p>
                </div>
            )}
        </>
    );
};

export default Sidebar;
