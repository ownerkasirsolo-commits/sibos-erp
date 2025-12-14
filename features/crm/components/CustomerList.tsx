
import React, { useState } from 'react';
import { Search, Filter, MessageCircle, TrendingUp, Users, Download, Upload, Plus, Save } from 'lucide-react';
import { CustomerDetail } from '../types';
import GlassInput from '../../../components/common/GlassInput';
import GlassPanel from '../../../components/common/GlassPanel';
import GlassSelect from '../../../components/common/GlassSelect';
import SectionHeader from '../../../components/common/SectionHeader';
import { formatCompactNumber } from '../../../utils/formatters';
import MemberCard from './MemberCard';
import Modal from '../../../components/common/Modal';

interface CustomerListProps {
    customers: CustomerDetail[];
    filterQuery: string;
    setFilterQuery: (q: string) => void;
    filterTier: string;
    setFilterTier: (t: string) => void;
    getTierColor: (tier: string) => string;
    onSelect: (c: CustomerDetail) => void;
    selectedCustomer: CustomerDetail | null;
    isMemberCardOpen: boolean;
    onCloseMemberCard: () => void;
    onExport: () => void;
    onLiveLogClick: () => void;
    isLiveLogActive: boolean;
    
    // Add Member Props
    onAddMemberClick: () => void;
    isAddMemberModalOpen: boolean;
    onCloseAddMember: () => void;
    newMemberName: string;
    setNewMemberName: (val: string) => void;
    newMemberPhone: string;
    setNewMemberPhone: (val: string) => void;
    onSaveNewMember: () => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ 
    customers, filterQuery, setFilterQuery, filterTier, setFilterTier, getTierColor, onSelect, 
    selectedCustomer, isMemberCardOpen, onCloseMemberCard, onExport, onLiveLogClick, isLiveLogActive,
    onAddMemberClick, isAddMemberModalOpen, onCloseAddMember, newMemberName, setNewMemberName, newMemberPhone, setNewMemberPhone, onSaveNewMember
}) => {
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-right-4 relative">
        
        {/* LEFT COLUMN: LIST (9/12) */}
        <div className="lg:col-span-9 flex flex-col gap-4">
            
            {/* HEADER TOOLBAR */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-4">
                <SectionHeader 
                    title="Database Pelanggan" 
                    subtitle={`${customers.length} Member Terdaftar`}
                    onLiveLogClick={onLiveLogClick}
                    isLiveLogActive={isLiveLogActive}
                />
                
                <div className="flex flex-col sm:flex-row gap-2">
                    <GlassInput 
                        icon={Search} 
                        placeholder="Cari nama, no hp..." 
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        className="py-2.5 text-sm"
                        wrapperClassName="flex-1"
                    />
                    
                    <div className="flex gap-2">
                        <button 
                            onClick={onExport}
                            className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl border border-white/5 transition-colors" 
                            title="Export CSV"
                        >
                            <Download size={18} />
                        </button>
                        
                        <button 
                            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                            className={`p-2.5 px-4 rounded-xl border flex items-center gap-2 text-sm font-bold transition-colors ${isFilterExpanded ? 'bg-orange-600 text-white border-orange-600' : 'bg-white/5 text-gray-300 border-white/5 hover:bg-white/10'}`}
                        >
                            <Filter size={18} />
                        </button>

                        <button 
                            onClick={onAddMemberClick}
                            className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg whitespace-nowrap"
                        >
                            <Plus size={18} /> <span className="hidden md:inline">Member Baru</span>
                        </button>
                    </div>
                </div>

                {isFilterExpanded && (
                    <div className="pt-3 border-t border-white/10 animate-in slide-in-from-top-2">
                        <GlassSelect
                            label="Level Member (Tier)"
                            value={filterTier}
                            onChange={e => setFilterTier(e.target.value)}
                            wrapperClassName="max-w-xs"
                        >
                            <option value="All">Semua Tier</option>
                            <option value="Bronze">Bronze</option>
                            <option value="Silver">Silver</option>
                            <option value="Gold">Gold</option>
                            <option value="Platinum">Platinum</option>
                        </GlassSelect>
                    </div>
                )}
            </div>

            {/* LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customers.map(cust => (
                    <GlassPanel 
                        key={cust.id} 
                        onClick={() => onSelect(cust)}
                        className="p-4 rounded-2xl flex items-center gap-4 hover:border-orange-500/30 transition-all group cursor-pointer border border-white/5"
                    >
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center font-bold text-2xl text-white shadow-lg shrink-0 overflow-hidden">
                             {/* Initials */}
                             {cust.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
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
                                </div>
                            </div>
                        </div>
                    </GlassPanel>
                ))}
            </div>
        </div>

        {/* RIGHT COLUMN: WIDGETS (3/12) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
             <GlassPanel className="p-5 rounded-2xl border border-white/5">
                <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Top Spenders</h4>
                <div className="space-y-3">
                    {customers.sort((a,b) => b.totalSpend - a.totalSpend).slice(0, 5).map((c, i) => (
                        <div key={c.id} className="flex justify-between items-center text-xs">
                            <span className="text-gray-400 flex items-center gap-2">
                                <span className={`font-bold w-4 ${i===0 ? 'text-yellow-400' : 'text-gray-600'}`}>#{i+1}</span>
                                {c.name.split(' ')[0]} {/* First name only for widget */}
                            </span>
                            <span className="font-bold text-white">{formatCompactNumber(c.totalSpend)}</span>
                        </div>
                    ))}
                </div>
            </GlassPanel>
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

        {/* Add Member Modal */}
        <Modal isOpen={isAddMemberModalOpen} onClose={onCloseAddMember} title="Registrasi Member Baru">
            <div className="space-y-5">
                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl mb-4">
                    <p className="text-xs text-orange-200">
                        Member baru akan otomatis masuk ke tier <b>Bronze</b>. Poin akan dihitung setelah transaksi pertama.
                    </p>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Nama Lengkap</label>
                    <GlassInput 
                        placeholder="Contoh: Budi Santoso"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        autoFocus
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Nomor Telepon / WA</label>
                    <GlassInput 
                        placeholder="Contoh: 081234567890"
                        value={newMemberPhone}
                        onChange={(e) => setNewMemberPhone(e.target.value)}
                    />
                </div>
                
                <div className="flex gap-3 pt-4">
                    <button 
                        onClick={onCloseAddMember}
                        className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white font-bold transition-colors"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={onSaveNewMember}
                        disabled={!newMemberName || !newMemberPhone}
                        className="flex-[2] py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={18} /> Simpan Member
                    </button>
                </div>
            </div>
        </Modal>
    </div>
  );
};

export default CustomerList;
