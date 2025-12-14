
import React from 'react';
import { Search, Filter, MessageCircle, TrendingUp, X } from 'lucide-react';
// @FIX: 'CustomerDetail' type has been moved to its own feature module.
import { CustomerDetail } from '../../features/crm/types';
import GlassInput from '../common/GlassInput';
import GlassPanel from '../common/GlassPanel';
import { formatCompactNumber } from '../../utils/formatters';
import MemberCard from './MemberCard';
import Modal from '../common/Modal';

interface CustomerListProps {
    customers: CustomerDetail[];
    filterQuery: string;
    setFilterQuery: (q: string) => void;
    getTierColor: (tier: string) => string;
    onSelect: (c: CustomerDetail) => void;
    selectedCustomer: CustomerDetail | null;
    isMemberCardOpen: boolean;
    onCloseMemberCard: () => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ 
    customers, filterQuery, setFilterQuery, getTierColor, onSelect, selectedCustomer, isMemberCardOpen, onCloseMemberCard 
}) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 className="text-xl font-bold text-white">Database Pelanggan</h2>
                <p className="text-sm text-gray-400">Data dan riwayat belanja.</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                    <GlassInput 
                        placeholder="Cari..." 
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        className="pl-9 pr-4 text-sm py-2"
                        wrapperClassName="w-full"
                    />
                </div>
                <button className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white">
                    <Filter size={18} />
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customers.map(cust => (
                <GlassPanel 
                    key={cust.id} 
                    onClick={() => onSelect(cust)}
                    className="p-4 rounded-2xl flex items-center gap-4 hover:border-orange-500/30 transition-all group cursor-pointer"
                >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center font-bold text-2xl text-white shadow-lg shrink-0">
                        {cust.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <h4 className="font-bold text-white truncate">{cust.name}</h4>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gradient-to-r ${getTierColor(cust.tier)}`}>
                                {cust.tier}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            {cust.phone}
                        </p>
                        <div className="flex gap-4 mt-3 pt-3 border-t border-white/5">
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Belanja</p>
                                <p className="text-xs font-bold text-green-400">{formatCompactNumber(cust.totalSpend)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Poin</p>
                                <p className="text-xs font-bold text-orange-400">{cust.points} pts</p>
                            </div>
                            <div className="ml-auto flex gap-2">
                                <button className="p-2 rounded-lg bg-white/5 hover:bg-blue-600/20 text-gray-400 hover:text-blue-400 transition-colors">
                                    <MessageCircle size={14} />
                                </button>
                                <button className="p-2 rounded-lg bg-white/5 hover:bg-orange-600/20 text-gray-400 hover:text-orange-400 transition-colors">
                                    <TrendingUp size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </GlassPanel>
            ))}
        </div>

        {/* Member Card Modal */}
        <Modal isOpen={isMemberCardOpen && !!selectedCustomer} onClose={onCloseMemberCard} title="Detail Member">
            {selectedCustomer && (
                <div className="space-y-6">
                    <MemberCard customer={selectedCustomer} getTierColor={getTierColor} />
                    
                    <div className="space-y-2">
                        <h4 className="text-sm font-bold text-white">Riwayat Singkat</h4>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                            <div>
                                <p className="text-xs text-gray-400">Total Belanja (All Time)</p>
                                <p className="text-lg font-bold text-white">Rp {selectedCustomer.totalSpend.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 text-right">Favorit</p>
                                <p className="text-sm font-bold text-orange-400 text-right">{selectedCustomer.favoriteMenu}</p>
                            </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                            <div>
                                <p className="text-xs text-gray-400">Bergabung</p>
                                <p className="text-sm text-white">{selectedCustomer.joinDate}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 text-right">Terakhir Datang</p>
                                <p className="text-sm text-white text-right">{selectedCustomer.lastVisit}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    </div>
  );
};

export default CustomerList;
