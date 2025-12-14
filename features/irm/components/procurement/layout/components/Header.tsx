import React from 'react';
import { User } from '../../../types';
import { Menu, Search, BrainCircuit, Store, Bell, X } from 'lucide-react';

interface HeaderProps {
    user: User;
    currentViewLabel: string;
    isFullScreen: boolean;
    onOpenSearch: () => void;
    onOpenAI: () => void;
    onOpenMobileMenu: () => void;
    isNotificationOpen: boolean;
    onToggleNotification: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    user, currentViewLabel, isFullScreen, 
    onOpenSearch, onOpenAI, onOpenMobileMenu,
    isNotificationOpen, onToggleNotification
}) => {
    if (isFullScreen) return null;

    return (
        <header className="fixed lg:absolute top-0 left-0 right-0 h-24 items-center justify-between px-6 lg:px-8 z-50 border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-xl flex">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <Store className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-2xl tracking-tight text-white">SIBOS</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold hidden sm:block">Enterprise</span>
                    </div>
                </div>
                <div className="hidden lg:block h-8 w-px bg-white/10"></div>
                <div className="hidden md:block animate-in slide-in-from-left-4 duration-500">
                    <h2 className="text-2xl font-bold text-white tracking-tight">{currentViewLabel}</h2>
                    <p className="text-sm text-gray-400">Selamat datang kembali, {user.name.split(' ')[0]}</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button onClick={onOpenSearch} className="w-11 h-11 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10" title="Global Search (Ctrl+K)">
                    <Search size={20} />
                </button>

                <div className="relative">
                    <button onClick={onToggleNotification} className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all relative ${isNotificationOpen ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'}`}>
                        <Bell size={20} />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-[#0f172a] animate-pulse"></span>
                    </button>
                    {isNotificationOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={onToggleNotification}></div>
                            <div className="absolute top-full right-0 mt-3 w-80 backdrop-blur-xl bg-[#0f172a]/95 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 z-50 animate-in slide-in-from-top-2 duration-200 overflow-hidden ring-1 ring-white/5">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
                                    <h4 className="text-sm font-bold text-white tracking-wide">Notifikasi</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded-md font-bold shadow-lg shadow-orange-500/20">2 Baru</span>
                                        <button onClick={onToggleNotification} className="text-gray-400 hover:text-white"><X size={14}/></button>
                                    </div>
                                </div>
                                {/* ... Notification items ... */}
                            </div>
                        </>
                    )}
                </div>

                <button onClick={onOpenAI} className="w-11 h-11 flex items-center justify-center rounded-xl text-orange-400 bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-all shadow-[0_0_15px_-5px_rgba(249,115,22,0.3)] group">
                    <BrainCircuit size={20} className="group-hover:scale-110 transition-transform" />
                </button>

                <div className="flex items-center gap-3 pl-2 sm:pl-4 sm:border-l border-white/10 ml-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-white leading-none">{user.name}</p>
                        <p className="text-[10px] text-orange-400 font-medium uppercase tracking-wider">{user.role}</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 border border-white/10 flex items-center justify-center shadow-lg shrink-0">
                        <span className="font-bold text-white text-sm">{user.name.charAt(0)}</span>
                    </div>
                </div>

                <button onClick={onOpenMobileMenu} className="lg:hidden w-11 h-11 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                    <Menu size={20} />
                </button>
            </div>
        </header>
    );
};

export default Header;
