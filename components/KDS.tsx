
import React from 'react';
import { Order } from '../types';
import { Clock, CheckCircle2, ChefHat, AlertCircle, ArrowLeft, Wifi, Soup } from 'lucide-react';
import { useGlobalContext } from '../context/GlobalContext';

interface KDSProps {
    onExit?: () => void;
}

const KDS: React.FC<KDSProps> = ({ onExit }) => {
  // CONNECT TO GLOBAL CONTEXT
  const { transactions, updateOrderStatus } = useGlobalContext();

  // Filter Active Orders for Kitchen
  // Show: Paid (New), Cooking (In Progress), Ready (Waiting for waiter)
  // Hide: Served (Done) or Debt (if unpaid shouldn't be cooked yet, depends on policy. Here we assume 'paid' or 'debt' both go to kitchen)
  const activeOrders = transactions.filter(t => 
      ['paid', 'debt', 'cooking', 'ready'].includes(t.status)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()); // FIFO (First In First Out)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': 
      case 'debt':
          return 'bg-red-500/20 border-red-500/50 text-red-400';
      case 'cooking': return 'bg-orange-500/20 border-orange-500/50 text-orange-400';
      case 'ready': return 'bg-green-500/20 border-green-500/50 text-green-400';
      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-400';
    }
  };
  
  const getStatusGlow = (status: string) => {
     switch (status) {
      case 'paid':
      case 'debt': 
          return 'shadow-lg shadow-red-900/50';
      case 'cooking': return 'shadow-lg shadow-orange-900/50';
      case 'ready': return 'shadow-lg shadow-green-900/50';
      default: return 'shadow-lg shadow-black/30';
    }
  }

  const getTimeDifference = (timestamp: string) => {
      const diffMs = new Date().getTime() - new Date(timestamp).getTime();
      return Math.floor(diffMs / 60000); // minutes
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-white">
        
        {/* KDS Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-[#0f172a] shrink-0">
            <div className="flex items-center gap-3">
                {onExit && (
                    <button onClick={onExit} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                )}
                <div className="flex items-center gap-2">
                     <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                        <ChefHat size={16} />
                     </div>
                     <div>
                         <h1 className="text-white font-bold leading-none text-sm">Kitchen Display System</h1>
                         <p className="text-[10px] text-gray-400">Station: Main Kitchen</p>
                     </div>
                </div>
            </div>

            {/* Stats / Legend */}
            <div className="flex items-center gap-6">
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Baru ({activeOrders.filter(o => o.status === 'paid' || o.status === 'debt').length})
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span> Dimasak ({activeOrders.filter(o => o.status === 'cooking').length})
                    </div>
                </div>
                
                <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block"></div>

                <div className="text-right hidden sm:block">
                   <p className="text-white font-bold text-xs flex items-center gap-2 justify-end">
                       <Clock size={12} className="text-orange-500" /> {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                   </p>
                   <p className="text-[10px] text-gray-500 flex items-center gap-1 justify-end">
                       <Wifi size={10} className="text-green-500" /> Online
                   </p>
               </div>
            </div>
        </div>

      {/* Orders Grid */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {activeOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                  <Soup size={64} className="mb-4" />
                  <h2 className="text-2xl font-bold">Tidak ada pesanan aktif</h2>
                  <p>Silakan istirahat sejenak, Chef!</p>
              </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {activeOrders.map(order => (
                <div key={order.id} className={`bg-[#121a2c] border rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ${getStatusGlow(order.status)} ${['paid', 'debt'].includes(order.status) ? 'border-red-500/30' : 'border-white/10'}`}>
                    {/* Header */}
                    <div className={`p-4 border-b border-white/5 flex justify-between items-center ${getStatusColor(order.status)} bg-opacity-10`}>
                    <div>
                        <h3 className="font-bold text-lg leading-tight">{order.customerName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-[10px] opacity-80 uppercase tracking-wider font-bold">{order.type}</p>
                            {order.tableNumber && <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded font-bold">{order.tableNumber}</span>}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-mono font-bold opacity-70">#{order.id.slice(-4)}</p>
                        <div className="flex items-center gap-1 text-xs mt-1 font-bold">
                            <Clock size={12} />
                            <span>{getTimeDifference(order.timestamp)}m</span>
                        </div>
                    </div>
                    </div>

                    {/* Items */}
                    <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[350px] custom-scrollbar">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-3 items-start border-b border-white/5 pb-3 last:border-0 last:pb-0">
                        <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center font-bold text-white shrink-0">
                            {item.quantity}
                        </div>
                        <div>
                            <p className="font-bold text-gray-200 leading-snug text-sm">{item.name}</p>
                            {item.note && (
                            <p className="text-xs text-red-400 mt-1 italic flex items-center gap-1 font-semibold bg-red-500/10 px-1.5 py-0.5 rounded w-fit">
                                <AlertCircle size={10} /> {item.note}
                            </p>
                            )}
                        </div>
                        </div>
                    ))}
                    </div>

                    {/* Actions */}
                    <div className="p-3 bg-black/20 border-t border-white/5 grid grid-cols-2 gap-2">
                    {['paid', 'debt'].includes(order.status) && (
                        <button 
                        onClick={() => updateOrderStatus(order.id, 'cooking')}
                        className="col-span-2 bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl font-bold transition-colors shadow-lg shadow-orange-900/20"
                        >
                        Mulai Masak
                        </button>
                    )}
                    {order.status === 'cooking' && (
                        <button 
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="col-span-2 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold transition-colors shadow-lg shadow-green-900/20"
                        >
                        Selesai Masak
                        </button>
                    )}
                    {order.status === 'ready' && (
                        <button 
                        onClick={() => updateOrderStatus(order.id, 'served')}
                        className="col-span-2 bg-gray-700 hover:bg-gray-600 text-gray-300 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                        >
                        <CheckCircle2 size={16} /> Disajikan
                        </button>
                    )}
                    </div>
                </div>
                ))}
            </div>
          )}
      </div>
    </div>
  );
};

export default KDS;
