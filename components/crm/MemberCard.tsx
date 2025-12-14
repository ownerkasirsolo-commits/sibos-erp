
import React from 'react';
// @FIX: 'CustomerDetail' type has been moved to its own feature module.
import { CustomerDetail } from '../../features/crm/types';
import { QrCode, Wifi } from 'lucide-react';
import { formatCompactNumber } from '../../utils/formatters';

interface MemberCardProps {
    customer: CustomerDetail;
    getTierColor: (tier: string) => string;
}

const MemberCard: React.FC<MemberCardProps> = ({ customer, getTierColor }) => {
    // Generate background based on tier
    const getCardBackground = (tier: string) => {
        switch (tier) {
            case 'Platinum': return 'bg-gradient-to-br from-slate-800 via-slate-700 to-black border-slate-500/50';
            case 'Gold': return 'bg-gradient-to-br from-yellow-900/80 via-yellow-800/50 to-black border-yellow-500/50';
            case 'Silver': return 'bg-gradient-to-br from-gray-800 via-gray-700 to-black border-gray-500/50';
            default: return 'bg-gradient-to-br from-orange-900/80 via-orange-800/50 to-black border-orange-500/50';
        }
    };

    return (
        <div className={`relative w-full aspect-[1.6/1] rounded-3xl p-6 overflow-hidden shadow-2xl border ${getCardBackground(customer.tier)}`}>
            {/* Gloss Effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/40 rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none"></div>

            {/* Chip & Signal */}
            <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="w-12 h-9 bg-yellow-200/20 rounded-md border border-yellow-200/40 backdrop-blur-sm flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 border-r border-yellow-200/30 w-1/3 left-0"></div>
                    <div className="absolute inset-0 border-l border-yellow-200/30 w-1/3 right-0"></div>
                    <div className="absolute top-1/2 w-full h-[1px] bg-yellow-200/30"></div>
                </div>
                <Wifi className="text-white/30 rotate-90" size={24} />
            </div>

            {/* Points & Tier */}
            <div className="relative z-10">
                <p className="text-white/60 text-xs font-mono tracking-widest mb-1">MEMBERSHIP</p>
                <h3 className={`text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${getTierColor(customer.tier)}`}>
                    {customer.tier.toUpperCase()}
                </h3>
            </div>

            {/* Footer Info */}
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-10">
                <div>
                    <p className="text-white/80 font-bold text-lg tracking-wide uppercase">{customer.name}</p>
                    <p className="text-white/50 text-xs font-mono mt-1">{customer.phone}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-white/50 uppercase tracking-wider mb-0.5">Points Balance</p>
                    <p className="text-white font-bold text-xl">{customer.points.toLocaleString()}</p>
                </div>
            </div>
            
            {/* QR Code Watermark */}
            <div className="absolute bottom-4 right-4 opacity-10 scale-150 rotate-12">
                <QrCode size={100} className="text-white" />
            </div>
        </div>
    );
};

export default MemberCard;
