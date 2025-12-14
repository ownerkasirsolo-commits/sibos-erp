
import React, { useState, useMemo } from 'react';
import { UnitType } from '@/types';
import { PurchaseOrder, PurchaseOrderItem, Ingredient } from '@/features/irm/types';
import { ChevronLeft, Search, Store, ChevronDown, Minus, Plus, MessageCircle, Network, CheckCircle2, Trash2, ShoppingBag, X, Save, Lock, AlertTriangle, TrendingUp, TrendingDown, Star, ShieldCheck, ThumbsUp, PieChart, FileText } from 'lucide-react';
import { usePOCreateLogic } from '@/features/irm/hooks/useProcurementLogic';
import { formatCompactNumber } from '@/utils/formatters';
import { useChatSystem } from '@/features/communication/hooks/useChatSystem';
import { ChatContact } from '@/features/communication/types';
import CompactNumber from '@/components/common/CompactNumber';
import GlassPanel from '@/components/common/GlassPanel';
import GlassInput from '@/components/common/GlassInput';

interface POCreateWizardProps {
    onBack: () => void;
    onSuccess: () => void;
    initialPo?: PurchaseOrder | null;
    initialRestockItem?: Ingredient | null;
}

const POCreateWizard: React.FC<POCreateWizardProps> = ({ onBack, onSuccess, initialPo, initialRestockItem }) => {
    const {
        currentUser,
        poItems, 
        totalEstimated,
        
        // Smart Mode Props
        smartSearchQuery, setSmartSearchQuery,
        smartCatalog,
        expandedCatalogId, setExpandedCatalogId,
        handleSmartAdd,
        handleRemoveItem,
        allSuppliers,

        handleSubmitPO,
        approvalLimit,
        
        // New Features
        createMode, setCreateMode,
        budgetStatus
    } = usePOCreateLogic(initialPo, onSuccess, initialRestockItem);

    const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

    // -- CHAT SYSTEM INTEGRATION --
    const allChatContacts: ChatContact[] = useMemo(() => allSuppliers.map(s => ({
        id: s.id,
        name: s.name,
        role: s.category,
        type: s.isSibosNetwork ? 'internal' : 'external',
        isOnline: true,
        phone: s.phone
    })), [allSuppliers]);

    const chatSystem = useChatSystem(allChatContacts);

    const handleChatWithSupplier = (supplierId: string) => {
        const contact = allChatContacts.find(c => c.id === supplierId);
        if (contact) {
            chatSystem.handleOpen();
            chatSystem.handleSelectContact(contact);
        } else {
            alert("Kontak supplier tidak ditemukan.");
        }
    };

    // Group items for Cart Review
    const groupedSmartItems = useMemo(() => {
        return poItems.reduce((acc, item) => {
            const castedItem = item as any;
            const supName = castedItem.supplierName || 'Unknown Supplier';
            if (!acc[supName]) acc[supName] = [];
            acc[supName].push(item);
            return acc;
        }, {} as Record<string, PurchaseOrderItem[]>);
    }, [poItems]);

    // CHECK APPROVAL REQUIREMENT
    const isApprovalNeeded = totalEstimated > approvalLimit && currentUser?.role !== 'Owner' && currentUser?.role !== 'Manager' && createMode === 'PO';

    // CHECK SUPPLIER SCORE FOR WARNING
    const problematicSuppliers = useMemo(() => {
        const ids = [...new Set(poItems.map((item: any) => item.supplierId))];
        return ids.map(id => allSuppliers.find(s => s.id === id)).filter(s => s && (s.performanceScore ?? 100) < 60);
    }, [poItems, allSuppliers]);

    // CHECK BUDGET WARNINGS (Amplop Digital Logic)
    const budgetWarnings = useMemo(() => {
        const warnings: string[] = [];
        const currentCartSpend: Record<string, number> = {};

        // Calculate Cart Impact
        poItems.forEach(item => {
            // Find category from smart catalog or raw data
            const catItem = smartCatalog.find(c => c.id === item.ingredientId);
            const cat = catItem?.category || 'Uncategorized';
            currentCartSpend[cat] = (currentCartSpend[cat] || 0) + (item.cost * item.quantity);
        });

        // Check against limits
        Object.entries(currentCartSpend).forEach(([cat, spend]) => {
            const budget = budgetStatus.find(b => b.category === cat);
            if (budget) {
                const projectedSpent = budget.spent + spend;
                const projectedPercent = (projectedSpent / budget.limit) * 100;
                
                if (projectedPercent > 100) {
                    warnings.push(`OVERBUDGET: Kategori '${cat}' melampaui limit! (Total: ${(projectedPercent).toFixed(0)}%)`);
                } else if (projectedPercent > 80) {
                    warnings.push(`WARNING: Kategori '${cat}' hampir habis (${projectedPercent.toFixed(0)}% used).`);
                }
            }
        });
        return warnings;
    }, [poItems, budgetStatus, smartCatalog]);

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] relative bg-black/20 rounded-3xl border border-white/5 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* 1. TOP BAR */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-white/5 bg-white/5 shrink-0">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onBack} 
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400"
                    >
                        <ChevronLeft size={20}/>
                    </button>
                    <div>
                        <h3 className="text-lg font-bold text-white leading-none">
                            {initialPo ? `Edit PO #${initialPo.id}` : (createMode === 'PO' ? 'Belanja Stok (PO)' : 'Buat Request (PR)')}
                        </h3>
                        <p className="text-[10px] text-gray-400 mt-0.5">Staff: {currentUser?.name}</p>
                    </div>
                </div>
                
                {/* MODE TOGGLE (PO vs PR) */}
                {!initialPo && (
                    <div className="flex bg-black/40 p-1 rounded-lg">
                        <button onClick={() => setCreateMode('PO')} className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${createMode === 'PO' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}>PO Langsung</button>
                        <button onClick={() => setCreateMode('PR')} className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${createMode === 'PR' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>Request (PR)</button>
                    </div>
                )}

                <div className="hidden md:block text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Total Estimasi</p>
                    <p className="text-xl font-bold text-orange-500"><CompactNumber value={totalEstimated} /></p>
                </div>
            </div>

            {/* 2. MAIN CONTENT AREA */}
            <div className="flex-1 overflow-hidden relative flex flex-col md:flex-row">
                
                {/* LEFT COLUMN: CATALOG LIST (Mobile: Full, Desktop: 7/12) */}
                <div className="flex-1 flex flex-col md:w-7/12 border-r border-white/5 relative bg-[#0f172a]/50">
                    <div className="p-4 border-b border-white/5 bg-black/10 shrink-0 z-10 backdrop-blur-sm sticky top-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-gray-500" size={16} />
                            <input 
                                type="text" 
                                className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:ring-1 focus:ring-orange-500 bg-white/5"
                                placeholder="Cari bahan baku..."
                                value={smartSearchQuery}
                                onChange={(e) => setSmartSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 pb-32 md:pb-4">
                        {smartCatalog.map(item => {
                            const isExpanded = expandedCatalogId === item.id;
                            const inCartTotal = poItems.filter(p => p.ingredientId === item.id).reduce((a,b) => a + b.quantity, 0);
                            
                            // Stock logic color
                            const stockRatio = item.currentStock / (item.minStock || 1);
                            let stockColor = 'text-green-400';
                            if(stockRatio <= 0) stockColor = 'text-red-500';
                            else if(stockRatio <= 1) stockColor = 'text-red-400';
                            else if(stockRatio <= 2) stockColor = 'text-orange-400';

                            return (
                                <div 
                                    key={item.id}
                                    className={`rounded-xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'bg-white/5 border-orange-500/50 shadow-lg' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                                >
                                    {/* Accordion Header */}
                                    <div 
                                        onClick={() => setExpandedCatalogId(isExpanded ? null : item.id)}
                                        className="p-4 flex items-center justify-between cursor-pointer"
                                    >
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-1">
                                                <h4 className="font-bold text-white text-sm">{item.name}</h4>
                                                {inCartTotal > 0 && (
                                                    <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-bold shadow-lg">
                                                        {inCartTotal} {item.unit}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                                                <span className={`flex items-center gap-1 font-bold ${stockColor}`}>
                                                    <Store size={12}/> {item.currentStock} {item.unit}
                                                </span>
                                                <span className="hidden sm:inline w-px h-3 bg-white/10"></span>
                                                <span className="flex items-center gap-1">
                                                    Avg Cost: <CompactNumber value={item.lastPurchasedPrice} currency/>
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronDown size={20} className={`text-gray-500 transition-transform duration-300 ml-4 ${isExpanded ? 'rotate-180' : ''}`} />
                                    </div>

                                    {/* Accordion Body */}
                                    {isExpanded && (
                                        <div className="p-4 border-t border-white/5 bg-black/20 animate-in slide-in-from-top-2">
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                                                Top 3 Rekomendasi (AI Filtered)
                                            </p>
                                            <div className="space-y-3">
                                                {item.options.map((opt, idx) => {
                                                    const itemInCart = poItems.find(p => p.ingredientId === item.id && (p as any).supplierId === opt.supplierId);
                                                    const qty = itemInCart ? itemInCart.quantity : 0;

                                                    // --- PRICE WATCH LOGIC ---
                                                    let priceDiffPercent = 0;
                                                    let isPriceUp = false;
                                                    let isPriceDown = false;
                                                    
                                                    if (item.lastPurchasedPrice > 0) {
                                                        const diff = opt.price - item.lastPurchasedPrice;
                                                        priceDiffPercent = (diff / item.lastPurchasedPrice) * 100;
                                                        isPriceUp = priceDiffPercent > 1;
                                                        isPriceDown = priceDiffPercent < -1;
                                                    }

                                                    // --- AI TAGS VISUALS ---
                                                    const isRecommended = opt.tags?.includes('recommended');
                                                    const isTrusted = opt.tags?.includes('trusted');
                                                    const isRisky = opt.tags?.includes('risk');

                                                    return (
                                                        <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                                                            isRecommended ? 'bg-orange-500/10 border-orange-500/30' : 
                                                            isRisky ? 'bg-red-500/5 border-red-500/20' : 
                                                            'bg-white/5 border-white/5 hover:border-white/10'
                                                        }`}>
                                                            <div className="flex-1 min-w-0 mr-2">
                                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                                    <h5 className="font-bold text-white text-sm truncate max-w-[120px] sm:max-w-none">{opt.supplierName}</h5>
                                                                    
                                                                    {/* BADGES */}
                                                                    {opt.isNetwork && <Network size={14} className="text-cyan-400 shrink-0" />}
                                                                    {isRecommended && <span className="text-[9px] bg-orange-500 text-white px-1.5 py-0.5 rounded font-bold shrink-0 flex items-center gap-1"><Star size={8} fill="currentColor"/> BEST</span>}
                                                                    {isTrusted && !isRecommended && <span className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded font-bold shrink-0 flex items-center gap-1"><ShieldCheck size={8} /> TRUSTED</span>}
                                                                    {isRisky && <span className="text-[9px] bg-red-500/20 text-red-300 border border-red-500/30 px-1.5 py-0.5 rounded font-bold shrink-0 flex items-center gap-1"><AlertTriangle size={8} /> RISK</span>}
                                                                </div>
                                                                
                                                                <div className="flex items-center gap-2">
                                                                    <p className="font-mono font-bold text-orange-400 text-sm"><CompactNumber value={opt.price} /></p>
                                                                    
                                                                    {/* PRICE WATCH */}
                                                                    {(isPriceUp || isPriceDown) && (
                                                                        <div className={`flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded border ${isPriceUp ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-green-400 bg-green-500/10 border-green-500/20'}`}>
                                                                            {isPriceUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                                                            <span>{Math.abs(priceDiffPercent).toFixed(0)}%</span>
                                                                        </div>
                                                                    )}

                                                                    <button onClick={(e) => {e.stopPropagation(); handleChatWithSupplier(opt.supplierId);}} className="text-blue-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors">
                                                                        <MessageCircle size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Qty Control */}
                                                            <div className="flex items-center bg-black/40 rounded-lg border border-white/10 h-9 shrink-0">
                                                                <button 
                                                                    onClick={() => handleSmartAdd(item, opt, -1)}
                                                                    className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-l-lg transition-colors"
                                                                >
                                                                    <Minus size={16} />
                                                                </button>
                                                                <input 
                                                                    type="number" 
                                                                    className="w-12 h-full bg-transparent text-center text-sm font-bold text-white outline-none appearance-none"
                                                                    placeholder="0"
                                                                    value={qty > 0 ? qty : ''}
                                                                    onChange={(e) => {
                                                                        const val = parseFloat(e.target.value) || 0;
                                                                        const diff = val - qty;
                                                                        handleSmartAdd(item, opt, diff);
                                                                    }}
                                                                />
                                                                <button 
                                                                    onClick={() => handleSmartAdd(item, opt, 1)}
                                                                    className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-r-lg transition-colors"
                                                                >
                                                                    <Plus size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* RIGHT COLUMN: CART (Desktop: Visible, Mobile: Bottom Sheet) */}
                <div className={`
                    fixed inset-0 z-50 md:static md:w-5/12 md:inset-auto md:z-auto bg-[#131b2d]/95 md:bg-[#131b2d]/80 border-l border-white/5 flex flex-col backdrop-blur-xl md:backdrop-blur-md transition-transform duration-300
                    ${isMobileCartOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
                `}>
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#131b2d] md:bg-transparent">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsMobileCartOpen(false)} className="md:hidden p-2 rounded-lg bg-white/5 text-gray-400">
                                <ChevronDown size={20} />
                            </button>
                            <h4 className="font-bold text-white flex items-center gap-2">
                                <ShoppingBag size={18} className="text-orange-500" /> Ringkasan Pesanan
                            </h4>
                        </div>
                        <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded font-bold">{poItems.length} Item</span>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                        {/* BUDGET WARNING BANNER */}
                        {budgetWarnings.map((warning, i) => (
                            <div key={i} className={`p-3 rounded-xl flex items-start gap-3 animate-pulse border ${warning.includes('OVERBUDGET') ? 'bg-red-500/10 border-red-500/30' : 'bg-orange-500/10 border-orange-500/30'}`}>
                                <PieChart size={18} className={warning.includes('OVERBUDGET') ? 'text-red-500' : 'text-orange-500'} />
                                <div>
                                    <p className={`text-xs font-bold ${warning.includes('OVERBUDGET') ? 'text-red-400' : 'text-orange-400'}`}>Budget Alert</p>
                                    <p className="text-[10px] text-gray-300 leading-tight">{warning}</p>
                                </div>
                            </div>
                        ))}

                        {/* WARNING: BAD SCORE SUPPLIER */}
                        {problematicSuppliers.map((s) => (
                            <div key={s?.id} className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 animate-pulse">
                                <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-red-400 mb-1">Peringatan Risiko!</p>
                                    <p className="text-[10px] text-gray-300 leading-tight">
                                        Anda memilih <strong>{s?.name}</strong> yang memiliki reputasi buruk (Skor: {s?.performanceScore}/100). Disarankan ganti supplier bertanda 🛡️ Trusted.
                                    </p>
                                </div>
                            </div>
                        ))}

                        {poItems.length === 0 ? (
                            <div className="text-center py-20 text-gray-500">
                                <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                                <p>Keranjang masih kosong.</p>
                                <p className="text-xs mt-1">Pilih barang dari katalog.</p>
                            </div>
                        ) : (
                            Object.entries(groupedSmartItems).map(([supName, items]: [string, PurchaseOrderItem[]]) => (
                                <div key={supName} className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                                    <div className="bg-black/20 px-3 py-2 border-b border-white/5 flex justify-between items-center">
                                        <h5 className="font-bold text-white text-xs">{supName}</h5>
                                        <span className="text-[10px] text-gray-400">{items.length} Barang</span>
                                    </div>
                                    <div className="divide-y divide-white/5">
                                        {items.map((item, idx) => {
                                            const globalIndex = poItems.indexOf(item);
                                            return (
                                                <div key={idx} className="p-3 flex justify-between items-center group">
                                                    <div>
                                                        <p className="font-bold text-white text-xs">{item.ingredientName}</p>
                                                        <p className="text-[10px] text-gray-400">
                                                            {item.quantity} {item.unit} x <CompactNumber value={item.cost} />
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <p className="font-mono text-orange-400 font-bold text-xs"><CompactNumber value={item.quantity * item.cost} /></p>
                                                        <button 
                                                            onClick={() => handleRemoveItem(globalIndex)} 
                                                            className="text-gray-600 hover:text-red-400 transition-colors md:opacity-0 md:group-hover:opacity-100"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Sticky Footer in Cart Panel */}
                    <div className="p-4 bg-[#0f172a] border-t border-white/10 space-y-3 shrink-0 pb-8 md:pb-4">
                        {/* Approval Warning */}
                        {isApprovalNeeded && (
                            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl animate-pulse">
                                <AlertTriangle size={16} className="text-yellow-500 shrink-0" />
                                <p className="text-xs text-yellow-200 leading-tight">
                                    Total &gt; <CompactNumber value={approvalLimit} />. Butuh persetujuan Manager.
                                </p>
                            </div>
                        )}

                        <div className="flex justify-between items-end">
                            <span className="text-gray-400 text-xs uppercase font-bold tracking-wider">Total Estimasi</span>
                            <span className="text-2xl font-black text-white"><CompactNumber value={totalEstimated} /></span>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => handleSubmitPO('draft')} 
                                disabled={poItems.length === 0}
                                className="flex-1 py-3.5 border border-white/10 hover:bg-white/5 text-gray-300 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                            >
                                <Save size={18} /> Simpan
                            </button>
                            <button 
                                onClick={() => handleSubmitPO(createMode === 'PR' ? 'request' : 'ordered')} 
                                disabled={poItems.length === 0}
                                className={`flex-[2] py-3.5 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm ${
                                    createMode === 'PR' 
                                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                                    : isApprovalNeeded 
                                        ? 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-yellow-600/20' 
                                        : 'bg-gradient-to-r from-orange-600 to-red-600 hover:brightness-110 text-white shadow-orange-600/20'
                                }`}
                            >
                                {createMode === 'PR' ? <FileText size={18} /> : (isApprovalNeeded ? <Lock size={18} /> : <CheckCircle2 size={18} />)}
                                {createMode === 'PR' 
                                    ? 'Ajukan Request' 
                                    : (isApprovalNeeded ? 'Ajukan Approval' : 'Proses Order')
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. MOBILE FLOATING ACTION BAR (When Cart Hidden) */}
            <div className={`md:hidden absolute bottom-0 left-0 right-0 bg-[#1e293b] border-t border-white/10 p-4 pb-6 transition-transform duration-300 ${isMobileCartOpen ? 'translate-y-full' : 'translate-y-0'} z-40`}>
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Total ({poItems.length} Item)</p>
                        <p className="text-lg font-bold text-white"><CompactNumber value={totalEstimated} /></p>
                    </div>
                    <button 
                        onClick={() => setIsMobileCartOpen(true)}
                        className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2"
                    >
                        <ShoppingBag size={18} /> Lihat Keranjang
                    </button>
                </div>
            </div>
        </div>
    );
};

export default POCreateWizard;
