
import React from 'react';
import { IncomingOrder } from '../../types';
import { ShoppingBag, Clock, CheckCircle2, XCircle, Bike, Globe, ShoppingCart, User, MapPin } from 'lucide-react';
import CompactNumber from '../../../../components/common/CompactNumber';
import GlassPanel from '../../../../components/common/GlassPanel';

interface OrderCentralViewProps {
    orders: IncomingOrder[];
    onAccept: (id: string) => void;
}

const OrderCentralView: React.FC<OrderCentralViewProps> = ({ orders, onAccept }) => {
    const getPlatformIcon = (platform: string) => {
        const p = platform.toLowerCase();
        if (p.includes('food')) return <Bike size={16} />;
        if (p.includes('web')) return <Globe size={16} />;
        return <ShoppingCart size={16} />;
    };

    const getPlatformColor = (platform: string) => {
        const p = platform.toLowerCase();
        if (p.includes('go')) return 'text-green-400 bg-green-500/10 border-green-500/20';
        if (p.includes('grab')) return 'text-green-500 bg-green-600/10 border-green-600/20';
        if (p.includes('shopee')) return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    };

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            
            {orders.length === 0 ? (
                <div className="text-center py-20 text-gray-500 bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Belum ada pesanan masuk.</p>
                </div>
            ) : (
                orders.map(order => (
                    <GlassPanel key={order.id} className={`p-0 rounded-2xl flex flex-col md:flex-row overflow-hidden transition-all ${order.status === 'new' ? 'border-orange-500 shadow-lg shadow-orange-500/10' : 'border-white/5 opacity-90'}`}>
                        
                        {/* Left: Platform & Time (Visual Spine) */}
                        <div className={`p-4 md:w-48 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-white/5 ${order.status === 'new' ? 'bg-orange-500/5' : 'bg-black/20'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border mb-2 ${getPlatformColor(order.platform)}`}>
                                {getPlatformIcon(order.platform)}
                            </div>
                            <h4 className="font-bold text-white text-sm">{order.platform}</h4>
                            <p className="text-[10px] text-gray-500 font-mono mb-2">#{order.platformOrderId}</p>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full">
                                <Clock size={10} /> {order.time}
                            </span>
                        </div>

                        {/* Center: Details */}
                        <div className="flex-1 p-4">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <User size={14} className="text-blue-400"/>
                                    <span className="text-sm font-bold text-white">{order.customerName}</span>
                                </div>
                                {order.driverName && (
                                    <div className="flex items-center gap-2 text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                                        <Bike size={10} /> Driver: {order.driverName}
                                    </div>
                                )}
                            </div>
                            
                            <p className="text-sm text-gray-300 leading-relaxed font-medium mb-3">{order.items}</p>
                            
                            {/* Tags / Notes could go here */}
                        </div>

                        {/* Right: Actions */}
                        <div className="p-4 md:w-56 bg-white/[0.02] border-t md:border-t-0 md:border-l border-white/5 flex flex-col justify-center gap-3">
                            <div className="flex justify-between items-center md:block md:text-right">
                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">Total</p>
                                <p className="text-xl font-bold text-white"><CompactNumber value={order.total} /></p>
                            </div>

                            {order.status === 'new' ? (
                                <div className="flex gap-2">
                                    <button className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 text-xs font-bold transition-all">
                                        Tolak
                                    </button>
                                    <button 
                                        onClick={() => onAccept(order.id)}
                                        className="flex-[2] py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition-all"
                                    >
                                        <CheckCircle2 size={14} /> Terima
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full py-2 bg-white/5 rounded-xl border border-white/5 text-center">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{order.status}</span>
                                </div>
                            )}
                        </div>

                    </GlassPanel>
                ))
            )}
        </div>
    );
};

export default OrderCentralView;
