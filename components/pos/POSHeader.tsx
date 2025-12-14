
import React from 'react';
import { ArrowLeft, Store, Scan, Bell, Wifi, WifiOff } from 'lucide-react';
import { BusinessType } from '../../types';
import GlassInput from '../common/GlassInput';

interface POSHeaderProps {
  businessType: BusinessType;
  filterQuery: string;
  setFilterQuery: (val: string) => void;
  isOnline: boolean;
  onExit?: () => void;
  notifications: any[];
  toggleNotification: () => void;
  isNotificationOpen: boolean;
  onAcceptDelivery: (id: number) => void;
}

const POSHeader: React.FC<POSHeaderProps> = ({
  businessType, filterQuery, setFilterQuery, isOnline, onExit, notifications, toggleNotification, isNotificationOpen, onAcceptDelivery
}) => {
  return (
    <div className="h-16 shrink-0 flex items-center px-4 border-b border-white/5 bg-black/20 gap-3">
        <button onClick={onExit} className="p-3 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20}/>
        </button>
        
        <div className="relative flex-1">
           <Store size={18} className="absolute left-4 top-3 text-gray-500"/>
           <input 
              type="text" 
              placeholder={businessType === BusinessType.RETAIL ? "Scan Barcode / Cari Produk..." : "Cari Menu..."}
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full glass-input rounded-xl py-2.5 pl-12 pr-4 text-sm"
              autoFocus={businessType === BusinessType.RETAIL} 
           />
           {businessType === BusinessType.RETAIL && (
               <Scan size={18} className="absolute right-4 top-3 text-orange-500" />
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
                              <div key={notif.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group relative overflow-hidden">
                                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${notif.type === 'delivery' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                  {notif.type === 'delivery' ? (
                                      <>
                                          <div className="flex justify-between items-start mb-1">
                                              <span className="font-bold text-white text-sm group-hover:text-orange-400 transition-colors">{notif.platform} <span className="text-gray-400 font-normal">{notif.orderId}</span></span>
                                              <span className="text-[10px] text-gray-500 font-mono">{notif.time}</span>
                                          </div>
                                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{notif.items}</p>
                                          <div className="flex gap-2 mt-3">
                                              <button 
                                                  onClick={() => onAcceptDelivery(notif.id)}
                                                  className="flex-1 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-green-900/20 transition-all"
                                              >
                                                  Terima
                                              </button>
                                              <button className="flex-1 py-1.5 bg-white/10 hover:bg-red-600/20 text-gray-300 hover:text-red-400 text-xs font-bold rounded-lg transition-all">Tolak</button>
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
