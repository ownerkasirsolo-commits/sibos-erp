
import React from 'react';
import { UnifiedOrder } from '../types';
import { Package, Truck, CheckCircle, Clock, Search, Filter, ArrowRight } from 'lucide-react';
import GlassPanel from '../../../components/common/GlassPanel';
import GlassInput from '../../../components/common/GlassInput';
import CompactNumber from '../../../components/common/CompactNumber';

interface UnifiedOrderStreamProps {
    orders: UnifiedOrder[];
    onProcess: (id: string, status: any) => void;
}

const UnifiedOrderStream: React.FC<UnifiedOrderStreamProps> = ({ orders, onProcess }) => {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
        {/* Toolbar */}
        <div className="flex gap-2">
            <GlassInput 
                icon={Search} 
                placeholder="Cari Order ID, Nama Customer..." 
                className="py-2.5 text-sm"
                wrapperClassName="flex-1"
            />
            <button className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-gray-400 hover:text-white">
                <Filter size={18} />
            </button>
        </div>

        {/* Kanban-like List */}
        <div className="space-y-3">
            {orders.map(order => (
                <GlassPanel key={order.id} className="p-4 rounded-xl border border-white/5 hover:border-orange-500/30 transition-all flex flex-col md:flex-row gap-4 items-start md:items-center relative overflow-hidden">
                    {/* Status Strip */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                        order.status === 'new' ? 'bg-red-500' :
                        order.status === 'processing' ? 'bg-blue-500' :
                        order.status === 'ready_to_ship' ? 'bg-yellow-500' :
                        'bg-green-500'
                    }`}></div>

                    <div className="flex items-center gap-4 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs capitalize ${
                             order.platform === 'shopee' ? 'bg-orange-500' :
                             order.platform === 'tokopedia' ? 'bg-green-600' :
                             order.platform === 'tiktok' ? 'bg-black border border-white/20' : 'bg-blue-600'
                        }`}>
                            {order.platform.slice(0,2)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-white text-sm">{order.externalId}</h4>
                                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-400">{new Date(order.date).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-xs text-gray-300 font-medium">{order.customerName}</p>
                            <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{order.items}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                         <div className="text-right">
                             <p className="text-[10px] text-gray-500 uppercase font-bold">Total</p>
                             <p className="text-sm font-bold text-white"><CompactNumber value={order.total} /></p>
                         </div>
                         
                         {/* Action Button */}
                         {order.status === 'new' && (
                             <button 
                                onClick={() => onProcess(order.id, 'processing')}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-lg flex items-center gap-2"
                             >
                                 <Package size={14} /> Proses
                             </button>
                         )}
                         {order.status === 'processing' && (
                             <button 
                                onClick={() => onProcess(order.id, 'ready_to_ship')}
                                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg text-xs font-bold shadow-lg flex items-center gap-2"
                             >
                                 <Clock size={14} /> Request Pickup
                             </button>
                         )}
                          {order.status === 'ready_to_ship' && (
                             <div className="flex flex-col items-end">
                                 <span className="text-[10px] text-gray-500 mb-1">Kurir: {order.courier}</span>
                                 <button className="px-4 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-lg text-xs font-bold flex items-center gap-2">
                                     <Truck size={14} /> Cetak Label
                                 </button>
                             </div>
                         )}
                    </div>
                </GlassPanel>
            ))}
        </div>
    </div>
  );
};

export default UnifiedOrderStream;
