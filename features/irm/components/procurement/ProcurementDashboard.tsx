
import React, { useState, useRef, useEffect } from 'react';
import { useProcurementDashboardLogic, FilterState, usePOCreateLogic } from '@/features/irm/hooks/useProcurementLogic';
import { Wand2, Search, Plus, Filter, ChevronLeft, ChevronRight, User, PackageCheck, ShoppingBag, PieChart, CheckCircle2, XCircle, Send, MessageCircle, Truck, Trash2, X, Network, FileCheck, Upload, Download, FileBarChart, Activity, Calendar, Wallet } from 'lucide-react';
import CompactNumber from '@/components/common/CompactNumber';
import GlassInput from '@/components/common/GlassInput';
import UniversalChatWidget from '@/features/communication/components/UniversalChatWidget';
import { useChatSystem } from '@/features/communication/hooks/useChatSystem';
import { ChatContact } from '@/features/communication/types';
import GlassPanel from '@/components/common/GlassPanel';
import ApprovalWorkflowModal from './modals/ApprovalWorkflowModal';
import { PurchaseOrder } from '@/features/irm/types';
import LiveLogPanel from '@/components/common/LiveLogPanel';
import ProcurementReportModal from './modals/ProcurementReportModal';

interface ProcurementDashboardProps {
    onNavigate: (view: 'list' | 'create' | 'receive' | 'direct' | 'detail', po?: any) => void;
}

const ProcurementDashboard: React.FC<ProcurementDashboardProps> = ({ onNavigate }) => {
    const { 
        isHqView, 
        isManagerOrOwner,
        kpis,
        pendingApprovalList,
        budgetStats, 
        paginatedPOs,
        pagination,
        dashboardSearch, setDashboardSearch,
        activeFilters, toggleFilter, clearFilters,
        setDashboardPage,
        generateRecommendations,
        getPoStatusDisplay,
        searchSuggestions,
        dateFilter, handleDateFilterChange,
        selectedPoIds, toggleSelectPO, handleSelectAll, handleBulkAction,
        allSuppliers,
        handleApprovePO, handleRejectPO,
        
        // NEW HOOK EXPORTS
        handleExportCSV,
        handleImportCSV,
        liveLogs,
        isReportModalOpen, setIsReportModalOpen,
        isLiveLogOpen, setIsLiveLogOpen
    } = useProcurementDashboardLogic();

    // Use create logic purely to get budget status for visualization (reuse logic)
    const { budgetStatus } = usePOCreateLogic(); 

    // -- CHAT INTEGRATION --
    const chatContacts: ChatContact[] = allSuppliers.map(s => ({
        id: s.id,
        name: s.name,
        role: s.category,
        type: s.isSibosNetwork ? 'internal' : 'external',
        isOnline: true,
        phone: s.phone
    }));

    const chatSystem = useChatSystem(chatContacts);

    // -- DASHBOARD LOCAL STATE --
    const [isFilterExpanded, setIsFilterExpanded] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    
    // Approval Modal State
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
    const [selectedApprovalPO, setSelectedApprovalPO] = useState<PurchaseOrder | null>(null);
    
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    const searchWrapperRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Helper to handle custom date logic inside the panel
    const onCustomDateChange = (start: string, end: string) => {
        setCustomStart(start);
        setCustomEnd(end);
        if (start && end) {
            handleDateFilterChange('custom', start, end);
        }
    };

    const filterOptions: { label: string, key: keyof FilterState, values: { val: string, label: string }[] }[] = [
        { label: "Status Pesanan", key: "status", values: [{ val: "draft", label: "Draft" }, { val: "pending_approval", label: "Butuh Approval" }, { val: "ordered", label: "Dipesan" }, { val: "processed", label: "Diproses" }, { val: "shipped", label: "Dikirim" }, { val: "received", label: "Selesai" }, { val: "cancelled", label: "Batal" }] },
        { label: "Pembayaran", key: "payment", values: [{ val: "paid", label: "Lunas" }, { val: "unpaid", label: "Belum Bayar" }] },
        { label: "Tipe", key: "type", values: [{ val: "regular", label: "Regular" }, { val: "b2b", label: "SIBOS Network" }] }
    ];

    const openApprovalModal = (po: PurchaseOrder) => {
        setSelectedApprovalPO(po);
        setIsApprovalModalOpen(true);
    };

    const hasActiveFilters = activeFilters.status.length > 0 || activeFilters.payment.length > 0 || activeFilters.type.length > 0 || dateFilter.type !== 'all';

    return (
        <div className="relative pb-20 lg:pb-0 animate-in fade-in slide-in-from-right-4">
            
            {/* MAIN LAYOUT: 9 Columns (List) - 3 Columns (Widget) */}
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
                
                {/* LEFT COLUMN (Main Content) */}
                <div className="order-2 lg:order-1 lg:col-span-9 flex flex-col gap-4">
                    
                    {/* 1. HEADER TOOLBAR (Unified like StockList) */}
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-4">
                        {/* Title Section */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    Belanja & Procurement
                                    {isManagerOrOwner && (
                                        <button 
                                            onClick={() => setIsLiveLogOpen(true)}
                                            className="bg-orange-500/20 text-orange-400 p-1.5 rounded-lg hover:bg-orange-500 hover:text-white transition-colors animate-pulse"
                                            title="Live Activity Log"
                                        >
                                            <Activity size={16} />
                                        </button>
                                    )}
                                </h2>
                                <p className="text-xs text-gray-400 mt-1">Kelola pembelian stok dan pengadaan barang.</p>
                            </div>
                        </div>

                        {/* TOOLBAR ROW: Search, Actions, Filter, Primary Actions */}
                        <div className="flex flex-col sm:flex-row gap-2">
                            {/* SMART SEARCH */}
                            <div ref={searchWrapperRef} className="relative flex-1">
                                <GlassInput 
                                    icon={Search} 
                                    placeholder="Cari PO, Supplier..." 
                                    className="py-2.5 text-sm w-full"
                                    value={dashboardSearch}
                                    onChange={(e) => setDashboardSearch(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                />
                                {isSearchFocused && searchSuggestions.length > 0 && (
                                    <div className="absolute top-full left-0 w-full mt-2 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                        {searchSuggestions.map((suggestion, idx) => (
                                            <button 
                                                key={idx}
                                                onClick={() => { setDashboardSearch(suggestion); setIsSearchFocused(false); }}
                                                className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors border-b border-white/5 last:border-0"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* BUTTON GROUP */}
                            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                                <button 
                                    onClick={() => setIsReportModalOpen(true)}
                                    className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl border border-white/5 transition-colors" 
                                    title="Laporan"
                                >
                                    <FileBarChart size={18} />
                                </button>

                                <button 
                                    onClick={handleExportCSV}
                                    className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl border border-white/5 transition-colors" 
                                    title="Export CSV"
                                >
                                    <Upload size={18} />
                                </button>
                                
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl border border-white/5 transition-colors" 
                                    title="Import CSV"
                                >
                                    <Download size={18} />
                                </button>
                                <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleImportCSV} />

                                {/* FILTER TOGGLE BUTTON */}
                                <button 
                                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                                    className={`p-2.5 px-4 rounded-xl border flex items-center gap-2 text-sm font-bold transition-colors whitespace-nowrap ${isFilterExpanded || hasActiveFilters ? 'bg-orange-600 text-white border-orange-600' : 'bg-white/5 text-gray-300 border-white/5 hover:bg-white/10'}`}
                                >
                                    <Filter size={18} /> <span className="hidden sm:inline">Filter</span>
                                    {hasActiveFilters && !isFilterExpanded && <span className="w-2 h-2 bg-white rounded-full ml-1"></span>}
                                </button>

                                {/* PRIMARY ACTIONS */}
                                <div className="flex gap-2">
                                    <button onClick={() => onNavigate('create')} className="px-4 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 hover:brightness-110 text-white rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-orange-500/20 transition-all whitespace-nowrap">
                                        <Plus size={18} /> <span className="hidden lg:inline">Buat PO</span>
                                    </button>
                                    <button onClick={() => onNavigate('direct')} className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-teal-500/20 transition-all whitespace-nowrap" title="Belanja Langsung">
                                        <ShoppingBag size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* UNIFIED EXPANDABLE FILTER PANEL */}
                        {isFilterExpanded && (
                            <div className="pt-4 border-t border-white/10 animate-in slide-in-from-top-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    {/* 1. Date Filter */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-bold uppercase block">Periode</label>
                                        <select 
                                            value={dateFilter.type} 
                                            onChange={(e) => handleDateFilterChange(e.target.value as any)}
                                            className="w-full glass-input rounded-xl text-sm py-2 px-3 bg-[#1e293b] appearance-none cursor-pointer"
                                        >
                                            <option value="all">Semua Waktu</option>
                                            <option value="today">Hari Ini</option>
                                            <option value="week">Minggu Ini</option>
                                            <option value="month">Bulan Ini</option>
                                            <option value="custom">Custom Tanggal</option>
                                        </select>
                                        
                                        {/* Custom Date Inputs */}
                                        {dateFilter.type === 'custom' && (
                                            <div className="flex gap-2 mt-2">
                                                <input type="date" value={customStart} onChange={e => onCustomDateChange(e.target.value, customEnd)} className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-xs text-white" />
                                                <input type="date" value={customEnd} onChange={e => onCustomDateChange(customStart, e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-xs text-white" />
                                            </div>
                                        )}
                                    </div>

                                    {/* 2. Status Filter */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-bold uppercase block">Status Pesanan</label>
                                        <select 
                                            value={activeFilters.status[0] || ""} 
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                // Simplified: Reset other status filters when one is selected in this UI mode
                                                if (val) {
                                                    toggleFilter('status', val);
                                                    // In a real multi-select UI we wouldn't clear others, but here simpler is better for select
                                                } else {
                                                    clearFilters(); 
                                                }
                                            }}
                                            className="w-full glass-input rounded-xl text-sm py-2 px-3 bg-[#1e293b] appearance-none cursor-pointer"
                                        >
                                            <option value="">Semua Status</option>
                                            {filterOptions[0].values.map(v => (
                                                <option key={v.val} value={v.val}>{v.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 3. Payment Filter */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-bold uppercase block">Pembayaran</label>
                                        <select 
                                            value={activeFilters.payment[0] || ""} 
                                            onChange={(e) => toggleFilter('payment', e.target.value)}
                                            className="w-full glass-input rounded-xl text-sm py-2 px-3 bg-[#1e293b] appearance-none cursor-pointer"
                                        >
                                            <option value="">Semua</option>
                                            <option value="paid">Lunas</option>
                                            <option value="unpaid">Belum Bayar (Hutang)</option>
                                        </select>
                                    </div>

                                    {/* 4. Type Filter */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-bold uppercase block">Tipe Supplier</label>
                                        <select 
                                            value={activeFilters.type[0] || ""} 
                                            onChange={(e) => toggleFilter('type', e.target.value)}
                                            className="w-full glass-input rounded-xl text-sm py-2 px-3 bg-[#1e293b] appearance-none cursor-pointer"
                                        >
                                            <option value="">Semua</option>
                                            <option value="regular">Regular</option>
                                            <option value="b2b">SIBOS Network</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <button onClick={clearFilters} className="text-xs text-red-400 hover:text-white font-bold flex items-center gap-1 transition-colors">
                                        <X size={14} /> Reset Filter
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 2. PO LIST TABLE */}
                    <div className="glass-panel rounded-2xl overflow-visible flex flex-col relative z-20 h-full border border-white/5 bg-black/20">
                        {/* Desktop Header */}
                        <div className="hidden md:grid grid-cols-12 bg-white/5 text-gray-400 text-xs uppercase tracking-wider border-b border-white/5 font-bold p-4">
                            <div className="col-span-1 text-center">
                                <input 
                                    type="checkbox" 
                                    className="rounded border-gray-600 bg-white/5 text-orange-600 focus:ring-orange-500"
                                    checked={paginatedPOs.length > 0 && selectedPoIds.length === paginatedPOs.length}
                                    onChange={() => handleSelectAll(paginatedPOs.map(p => p.id))}
                                />
                            </div>
                            <div className="col-span-3">ID & Supplier</div>
                            <div className="col-span-2 text-center">Status</div>
                            <div className="col-span-2">Dibuat Oleh</div>
                            <div className="col-span-2 text-right">Tanggal</div>
                            <div className="col-span-2 text-right">Total</div>
                        </div>

                        {paginatedPOs.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">Tidak ada data pesanan yang cocok dengan filter.</div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {paginatedPOs.map(po => {
                                    const statusDisplay = getPoStatusDisplay(po.status, po.isB2B, po.paymentStatus);
                                    const isSelected = selectedPoIds.includes(po.id);
                                    
                                    return (
                                        <div 
                                            key={po.id} 
                                            onClick={() => {
                                                if (po.status === 'draft') {
                                                    onNavigate('create', po);
                                                } else if (po.status === 'pending_approval' && isManagerOrOwner) {
                                                    openApprovalModal(po);
                                                } else {
                                                    onNavigate('detail', po);
                                                }
                                            }}
                                            className={`group transition-colors cursor-pointer ${isSelected ? 'bg-orange-500/5' : 'hover:bg-white/5'}`}
                                        >
                                            {/* Desktop Row */}
                                            <div className="hidden md:grid grid-cols-12 p-4 items-center text-sm">
                                                <div className="col-span-1 text-center" onClick={(e) => { e.stopPropagation(); toggleSelectPO(po.id); }}>
                                                    <input type="checkbox" className="rounded border-gray-600 bg-white/5 text-orange-600" checked={isSelected} onChange={() => {}} />
                                                </div>
                                                <div className="col-span-3">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-white group-hover:text-orange-400 transition-colors truncate">{po.supplierName}</p>
                                                        {po.isB2B && <span title="SIBOS Network"><Network size={14} className="text-cyan-400" /></span>}
                                                    </div>
                                                    <p className="text-xs text-gray-500 font-mono">{po.id}</p>
                                                </div>
                                                <div className="col-span-2 text-center">
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${statusDisplay.style}`}>
                                                        {statusDisplay.label}
                                                    </span>
                                                </div>
                                                <div className="col-span-2 text-gray-400 text-xs flex items-center gap-2">
                                                    <User size={12}/> {po.createdBy}
                                                </div>
                                                <div className="col-span-2 text-gray-400 text-xs text-right">{new Date(po.orderDate).toLocaleDateString()}</div>
                                                <div className="col-span-2 text-right font-mono font-bold text-white">
                                                    <CompactNumber value={po.totalEstimated} />
                                                </div>
                                            </div>

                                            {/* Mobile Card */}
                                            <div className="md:hidden p-4 flex justify-between items-start">
                                                <div className="flex items-start gap-3">
                                                    <div onClick={(e) => { e.stopPropagation(); toggleSelectPO(po.id); }} className="pt-1">
                                                        <input type="checkbox" className="rounded border-gray-600 bg-white/5 text-orange-600" checked={isSelected} onChange={() => {}} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-white text-sm group-hover:text-orange-400">{po.supplierName}</h4>
                                                            {po.isB2B && <Network size={12} className="text-cyan-400" />}
                                                        </div>
                                                        <p className="text-[10px] text-gray-500 font-mono mb-1">{po.id}</p>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusDisplay.style}`}>
                                                            {statusDisplay.label}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-white text-sm"><CompactNumber value={po.totalEstimated} /></p>
                                                    <p className="text-[10px] text-gray-500 mt-1">{new Date(po.orderDate).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination */}
                        <div className="p-4 border-t border-white/5 flex justify-between items-center text-sm text-gray-400">
                            <span>Hal {pagination.currentPage} / {pagination.totalPages || 1}</span>
                            <div className="flex gap-2">
                                <button 
                                    disabled={pagination.currentPage === 1}
                                    onClick={() => setDashboardPage(p => Math.max(1, p - 1))}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button 
                                    disabled={pagination.currentPage === pagination.totalPages || pagination.totalPages === 0}
                                    onClick={() => setDashboardPage(p => p + 1)}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN (Widgets) */}
                <div className="order-1 lg:order-2 lg:col-span-3 flex flex-col gap-4 lg:gap-6">
                     
                     {/* WIDGET 1: QUICK ACTIONS + CONTACT */}
                     {!isHqView && (
                        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
                            <h4 className="font-bold text-white text-sm mb-2">Aksi Cepat</h4>
                            
                            {/* Contact Button (Replaces Direct Purchase) */}
                            <button 
                                onClick={chatSystem.handleOpen}
                                className="w-full bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all"
                            >
                                <MessageCircle size={16} /> Kontak Supplier
                            </button>

                            {/* Auto Order */}
                            {kpis.lowStockCount > 0 ? (
                                <button 
                                    onClick={generateRecommendations} 
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:brightness-110 text-white py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold shadow-lg shadow-blue-500/20 animate-pulse border border-blue-400/50"
                                >
                                    <Wand2 size={16} /> Auto-Order ({kpis.lowStockCount})
                                </button>
                            ) : (
                                <div className="w-full py-3 bg-white/5 rounded-xl flex items-center justify-center text-gray-500 text-xs font-bold border border-white/5">
                                    Stok Aman
                                </div>
                            )}
                        </div>
                    )}

                    {/* WIDGET 2: APPROVAL NEEDED (MANAGER ONLY) */}
                    {isManagerOrOwner && kpis.pendingApprovalCount > 0 && (
                        <div className="glass-panel p-5 rounded-2xl bg-orange-600/10 border-orange-500/30 shadow-lg shadow-orange-900/20 animate-in slide-in-from-right">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                                        <FileCheck size={14}/> Butuh Persetujuan
                                    </p>
                                    <p className="text-3xl font-black text-white mt-1">{kpis.pendingApprovalCount}</p>
                                </div>
                                <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400 animate-pulse">
                                    <FileCheck size={20} />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mb-3">Pesanan di atas Rp 5.000.000 menunggu persetujuan Anda.</p>
                            <div className="space-y-2">
                                {pendingApprovalList.slice(0, 2).map(po => (
                                    <button 
                                        key={po.id}
                                        onClick={() => openApprovalModal(po)}
                                        className="w-full text-left p-2.5 rounded-lg bg-black/20 hover:bg-orange-500/20 border border-white/5 hover:border-orange-500/30 transition-all flex justify-between items-center group"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-white group-hover:text-orange-300">{po.supplierName}</span>
                                            <span className="text-[10px] text-gray-500">Oleh: {po.createdBy}</span>
                                        </div>
                                        <span className="text-xs font-mono font-bold text-orange-400"><CompactNumber value={po.totalEstimated} /></span>
                                    </button>
                                ))}
                                {pendingApprovalList.length > 2 && (
                                    <p className="text-[10px] text-center text-gray-500">+{pendingApprovalList.length - 2} lainnya</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* WIDGET 3: CATEGORY BUDGET (Amplop Digital) */}
                    <div className="glass-panel p-5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/10 rounded-lg text-gray-300">
                                <PieChart size={18} />
                            </div>
                            <h4 className="font-bold text-white text-sm">Amplop Digital (Budget)</h4>
                        </div>
                        <div className="space-y-4">
                             {budgetStatus.slice(0, 3).map((budget) => (
                                <div key={budget.category}>
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="text-gray-400 font-bold">{budget.category}</span>
                                        <span className={`font-bold ${budget.percent > 90 ? 'text-red-400' : 'text-white'}`}>
                                            {budget.percent.toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ease-out ${budget.percent > 90 ? 'bg-red-500' : (budget.percent > 75 ? 'bg-orange-500' : 'bg-green-500')}`} 
                                            style={{width: `${budget.percent}%`}}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span className="text-[9px] text-gray-500">Sisa: <CompactNumber value={Math.max(budget.limit - budget.spent, 0)} /></span>
                                        <span className="text-[9px] text-gray-500">Limit: <CompactNumber value={budget.limit} /></span>
                                    </div>
                                </div>
                             ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* FLOATING ACTION BAR FOR BULK ACTIONS */}
            {selectedPoIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in w-[90%] max-w-md md:w-auto">
                    <div className="bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl p-2 flex items-center justify-between gap-3 pr-4">
                        <div className="px-4 py-2 bg-white/5 rounded-xl text-sm font-bold text-white border border-white/5 whitespace-nowrap">
                            {selectedPoIds.length} Dipilih
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleBulkAction('approve')}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl transition-colors shadow-lg"
                            >
                                <Send size={14} /> <span className="hidden sm:inline">Proses</span>
                            </button>
                            <button 
                                onClick={() => handleBulkAction('delete')}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-xs font-bold rounded-xl transition-colors border border-red-500/20"
                            >
                                <Trash2 size={14} />
                            </button>
                            <button onClick={() => handleSelectAll([])} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white ml-2">
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: APPROVAL WORKFLOW (For Managers) */}
            <ApprovalWorkflowModal 
                isOpen={isApprovalModalOpen}
                onClose={() => setIsApprovalModalOpen(false)}
                po={selectedApprovalPO}
                onApprove={handleApprovePO}
                onReject={handleRejectPO}
            />

            {/* MODAL: PROCUREMENT REPORT (NEW) */}
            <ProcurementReportModal 
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                purchaseOrders={paginatedPOs}
            />

            {/* ATOMIC COMPONENT: LIVE LOG PANEL (NEW) */}
            <LiveLogPanel
                isOpen={isLiveLogOpen}
                onClose={() => setIsLiveLogOpen(false)}
                title="Log Aktivitas Belanja"
                logs={liveLogs}
                onDownload={() => alert("Downloading Logs...")}
            />

            {/* UNIVERSAL CHAT WIDGET */}
            <UniversalChatWidget
                title="Pesan Supplier"
                isOpen={chatSystem.isOpen}
                onClose={chatSystem.handleClose}
                activeContact={chatSystem.activeContact}
                contacts={chatSystem.filteredContacts}
                searchQuery={chatSystem.searchQuery}
                onSearchChange={chatSystem.setSearchQuery}
                onSelectContact={chatSystem.handleSelectContact}
                onBackToContacts={chatSystem.handleBackToContacts}
                messages={chatSystem.currentMessages}
                inputValue={chatSystem.inputValue}
                onInputChange={chatSystem.setInputValue}
                onSendMessage={chatSystem.handleSendMessage}
            />
        </div>
    );
}

export default ProcurementDashboard;
