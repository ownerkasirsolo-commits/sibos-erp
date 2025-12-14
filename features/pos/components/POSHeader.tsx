
import React from 'react';
import { ArrowLeft, Store, Scan, Bell, Wifi, WifiOff, Network, Truck, Eye, RefreshCw } from 'lucide-react';
import GlassInput from '../../../components/common/GlassInput';

interface POSHeaderProps {
  mode: 'culinary' | 'retail';
  filterQuery: string;
  setFilterQuery: (val: string) => void;
  isOnline: boolean;
  onExit?: () => void;
  notifications: any[];
  toggleNotification: () => void;
  isNotificationOpen: boolean;
  onProcessOrder: (id: string) => void;
  onSwitchMode?: () => void; // New Prop
}

const POSHeader: React.FC<POSHeaderProps> = ({
  mode, filterQuery, setFilterQuery, isOnline, onExit, notifications, toggleNotification, isNotificationOpen, onProcessOrder, onSwitchMode
}) => {
  return (
    <div className="h-16 shrink-0 flex items-center px-4 border-b border-white/5 bg-black/20 gap-3">
        <button onClick={onExit} className="p-3 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20}/>
        </button>
        
        {/* SWITCH MODE BUTTON (NEW) */}
        {onSwitchMode && (
            <button 
                onClick={onSwitchMode}
                className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${mode === 'retail' ? 'bg-blue-600/10 text-blue-400 border-blue-500/30' : 'bg-orange-600/10 text-orange-400 border-orange-500/30'}`}
                title="Ganti Tampilan POS"
            >
                <RefreshCw size={16} /> 
                <span className="text-xs font-bold uppercase hidden sm:block">{mode === 'retail' ? 'Toko' : 'Resto'}</span>
            </button>
        )}
        
        <div className="relative flex-1">
           <Store size={18} className="absolute left-4 top-3 text-gray-500"/>
           <input 
              type="text" 
              placeholder={mode === 'retail' ? "Scan Barcode / SKU / Nama Produk..." : "Cari Menu..."}
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className={`w-full glass-input rounded-xl py-2.5 pl-12 pr-4 text-sm ${mode === 'retail' ? 'border-blue-500/30 focus:border-blue-500' : ''}`}
              autoFocus={mode === 'retail'} 
           />
           {mode === 'retail' && (
               <div className="absolute right-3 top-2.5 bg-blue-500/10 text-blue-400 p-1 rounded-md animate-pulse">
                   <Scan size={16} />
               </div>
           )}
        </div>

        {/* Notification Button */}
        <div className="relative">
            <button 
              onClick={toggleNotification}
              className={`p-3 rounded-xl border transition-all ${isNotificationOpen ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-white/5 border-transparent text-gray-400 hover:text-white'}`}
            >
                <Bell size={20} />
                {notifications.length > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#0f172a] animate-pulse"></span>
                )}
            </button>

            {/* Notification Dropdown */}
            {isNotificationOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={toggleNotification}></div>
                  <div className="absolute top-full left-0 mt-3 w-80 backdrop-blur-xl bg-[#0f172a]/95 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 z-50 animate-in slide-in-from-top-2 duration-200 overflow-hidden ring-1 ring-white/5">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
                          <h4 className="text-sm font-bold text-white tracking-wide">Notifikasi</h4>
                          <span className="text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded-md font-bold shadow-lg shadow-orange-500/20">{notifications.length} Baru</span>
                      </div>
                      <div className="max-h-80 overflow-y-auto custom-scrollbar">
                          {notifications.map(notif => (
                              <div key={notif.id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group relative overflow-hidden ${notif.isB2B ? 'bg-cyan-900/10' : ''}`}>
                                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${notif.type === 'delivery' ? (notif.isB2B ? 'bg-cyan-400' : 'bg-green-500') : 'bg-red-500'}`}></div>
                                  {notif.type === 'delivery' ? (
                                      <>
                                          <div className="flex justify-between items-start mb-1">
                                              <span className={`font-bold text-sm transition-colors flex items-center gap-2 ${notif.isB2B ? 'text-cyan-400' : 'text-white group-hover:text-orange-400'}`}>
                                                  {notif.isB2B && <Network size={14} />} {notif.platform} 
                                              </span>
                                              <span className="text-[10px] text-gray-500 font-mono">{notif.time}</span>
                                          </div>
                                          <p className="text-xs text-gray-300 font-mono mb-1">{notif.orderId}</p>
                                          {notif.isB2B && <p className="text-[10px] text-cyan-200 uppercase font-bold mb-1 tracking-wider">{notif.status === 'processed' ? 'Sedang Diproses' : 'Pesanan Baru'}</p>}
                                          <p className="text-xs text-gray-400 line-clamp-1">{notif.items}</p>
                                          <div className="flex gap-2 mt-3">
                                              <button 
                                                  onClick={() => onProcessOrder(notif.id)}
                                                  className={`flex-1 py-1.5 text-white text-xs font-bold rounded-lg shadow-lg transition-all flex items-center justify-center gap-1 ${notif.isB2B ? 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/20' : 'bg-green-600 hover:bg-green-500 shadow-green-900/20'}`}
                                              >
                                                  {notif.isB2B ? <Eye size={12}/> : null} Lihat Order
                                              </button>
                                          </div>
                                      </>
                                  ) : (
                                      <>
                                          <div className="flex justify-between items-start mb-1">
                                              <span className="font-bold text-gray-200 text-sm">System Alert</span>
                                              <span className="text-[10px] text-gray-500 font-mono">{notif.time}</span>
                                          </div>
                                          <p className="text-sm text-gray-300">{notif.message}</p>
                                      </>
                                  )}
                              </div>
                          ))}
                          {notifications.length === 0 && <p className="text-center text-gray-500 text-xs py-8">Tidak ada notifikasi baru</p>}
                      </div>
                  </div>
                </>
            )}
        </div>

        {/* Online/Offline Indicator */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isOnline ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
             {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
        </div>
    </div>
  );
};

export default POSHeader;
