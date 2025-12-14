
import React, { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../services/db';
import { useGlobalContext } from '../../../context/GlobalContext';
import { B2BService } from '../../b2b/B2BService';
import { B2BRequest } from '../../b2b/types';
import { Package, Truck, CheckCircle2, AlertCircle, Search, DollarSign, Wallet, Edit3, Save, Clock, ClipboardCheck, ChevronRight, MessageCircle } from 'lucide-react';
import GlassInput from '../../../components/common/GlassInput';
import CompactNumber from '../../../components/common/CompactNumber';
import GlassPanel from '../../../components/common/GlassPanel';
import { PurchaseOrderItem } from '../types';
import OrderReviewModal from './modals/OrderReviewModal';
import OrderProcessingModal from './modals/OrderProcessingModal'; // Import New Modal
import UniversalChatWidget from '../../../features/communication/components/UniversalChatWidget';
import { useChatSystem } from '../../../features/communication/hooks/useChatSystem';
import { ChatContact } from '../../../features/communication/types';

interface SalesOrdersProps {
    initialSearchTerm?: string;
}

const SalesOrders: React.FC<SalesOrdersProps> = ({ initialSearchTerm }) => {
    const { activeOutlet, currentUser } = useGlobalContext();
    const [activeTab, setActiveTab] = useState<'new' | 'processing' | 'shipped' | 'completed'>('new');
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm || '');
    
    // Sync search term if prop updates
    useEffect(() => {
        if (initialSearchTerm) setSearchTerm(initialSearchTerm);
    }, [initialSearchTerm]);

    // Review State (Step 1: New -> Processed)
    const [reviewOrder, setReviewOrder] = useState<B2BRequest | null>(null);
    
    // Processing State (Step 2: Processed -> Shipped)
    const [processingOrder, setProcessingOrder] = useState<B2BRequest | null>(null);

    // Fetch Orders
    const orders = useLiveQuery(() => 
        activeOutlet 
        ? db.b2bRequests.where({ targetOutletId: activeOutlet.id }).reverse().toArray()
        : Promise.resolve([]), 
    [activeOutlet]);

    // -- CHAT SYSTEM INTEGRATION --
    const chatContacts: ChatContact[] = useMemo(() => {
        if (!orders) return [];
        const uniqueSenders = new Map();
        orders.forEach(o => {
            if (!uniqueSenders.has(o.sourceBusinessId)) {
                uniqueSenders.set(o.sourceBusinessId, {
                    id: o.sourceBusinessId,
                    name: o.sourceName,
                    role: 'Mitra / Outlet',
                    type: 'internal',
                    isOnline: true,
                    phone: '-'
                });
            }
        });
        return Array.from(uniqueSenders.values());
    }, [orders]);

    const chatSystem = useChatSystem(chatContacts);

    const handleOpenChat = (order: B2BRequest) => {
        const contact = chatContacts.find(c => c.id === order.sourceBusinessId);
        if (contact) {
            chatSystem.handleOpen();
            chatSystem.handleSelectContact(contact);
        }
    };

    if (!orders) return <div className="text-white">Loading...</div>;

    // Filter Logic
    const filteredOrders = orders.filter(o => {
        if (searchTerm && (o.id === searchTerm || o.originalPoId === searchTerm)) {
            return true;
        }

        const matchesTab = 
            activeTab === 'new' ? o.status === 'pending' :
            activeTab === 'processing' ? o.status === 'processed' :
            activeTab === 'shipped' ? o.status === 'shipped' :
            (activeTab === 'completed' ? (o.status === 'completed' || o.status === 'rejected') : false);
        
        const matchesSearch = o.sourceName.toLowerCase().includes(searchTerm.toLowerCase()) || o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.originalPoId.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesTab && matchesSearch;
    });

    // --- HANDLERS ---

    // 1. Confirm Review (Accept) -> Process Order
    const handleConfirmProcess = async () => {
        if (!reviewOrder) return;
        await B2BService.processOrder(reviewOrder.id, currentUser?.name || 'Admin');
        setReviewOrder(null);
        setActiveTab('processing');
    };

    // 2. Reject Order
    const handleReject = async (id: string) => {
        if(confirm("Tolak pesanan ini secara permanen?")) {
            await B2BService.rejectOrder(id, `Ditolak oleh ${currentUser?.name || 'Admin'}`);
            setReviewOrder(null);
        }
    };

    // 3. Confirm Shipping (With Courier Info)
    const handleConfirmShipping = async (courierInfo: { driverName: string, plateNumber: string }) => {
        if (!processingOrder) return;
        try {
            await B2BService.shipOrder(processingOrder.id, courierInfo, currentUser?.name || 'Admin');
            setProcessingOrder(null);
            alert("Surat Jalan Diterbitkan! Pesanan dalam pengiriman.");
            setActiveTab('shipped');
        } catch (error: any) {
            alert("Gagal mengirim: " + error.message);
        }
    };

    // Click Handler for Cards
    const handleCardClick = (order: B2BRequest) => {
        if (order.status === 'pending') {
            setReviewOrder(order);
        } else if (order.status === 'processed') {
            setProcessingOrder(order);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Truck className="text-orange-500" /> Sales Orders (Grosir)
                    </h2>
                    <p className="text-sm text-gray-400">Manajemen pesanan masuk dari mitra/cabang lain.</p>
                </div>
                <GlassInput 
                    icon={Search}
                    placeholder="Cari No Order / Pemesan..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="py-2 text-sm w-64"
                />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar border-b border-white/10 pb-1">
                {[
                    { id: 'new', label: 'Pesanan Baru', icon: AlertCircle, count: orders.filter(o => o.status === 'pending').length },
                    { id: 'processing', label: 'Perlu Disiapkan', icon: Package, count: orders.filter(o => o.status === 'processed').length },
                    { id: 'shipped', label: 'Dikirim / Piutang', icon: Truck, count: orders.filter(o => o.status === 'shipped').length },
                    { id: 'completed', label: 'Selesai', icon: CheckCircle2, count: orders.filter(o => o.status === 'completed' || o.status === 'rejected').length },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id as any); setSearchTerm(''); }}
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-orange-500 text-white font-bold bg-white/5' : 'border-transparent text-gray-400 hover:text-white'}`}
                    >
                        <tab.icon size={16} />
                        <span>{tab.label}</span>
                        {tab.count > 0 && <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-orange-500 text-white' : 'bg-white/10'}`}>{tab.count}</span>}
                    </button>
                ))}
            </div>

            {/* Content List - COMPACT VIEW */}
            <div className="space-y-3">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <Package size={48} className="mx-auto mb-4 opacity-20"/>
                        <p>Tidak ada data pesanan pada tab ini.</p>
                    </div>
                ) : (
                    filteredOrders.map(order => (
                        <div 
                            key={order.id} 
                            onClick={() => handleCardClick(order)}
                            className={`glass-panel p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-white/5 hover:border-orange-500/30 transition-all group ${['pending', 'processed'].includes(order.status) ? '' : 'cursor-default hover:bg-transparent'}`}
                        >
                            <div className="flex items-center gap-4 min-w-0">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shrink-0 ${
                                    order.status === 'pending' ? 'bg-orange-500/20 text-orange-500' : 
                                    order.status === 'processed' ? 'bg-blue-500/20 text-blue-500' :
                                    order.status === 'shipped' ? 'bg-purple-500/20 text-purple-500' : 'bg-gray-700 text-gray-400'
                                }`}>
                                    {order.sourceName.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-bold text-white truncate">{order.sourceName}</h4>
                                        <span className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded font-mono">{order.originalPoId}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                                        <span className="flex items-center gap-1"><Clock size={10}/> {new Date(order.timestamp).toLocaleString()}</span>
                                        <span>•</span>
                                        <span className="text-gray-300">{order.items.length} Item</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right hidden sm:block">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Total Nilai</p>
                                    <p className="text-sm font-bold text-orange-400"><CompactNumber value={order.totalAmount} /></p>
                                </div>
                                
                                <div className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase border ${
                                    order.status === 'pending' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                    order.status === 'processed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                    order.status === 'shipped' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                    'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                }`}>
                                    {order.status === 'pending' ? 'Menunggu' : order.status}
                                </div>

                                {['pending', 'processed'].includes(order.status) && (
                                    <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* MODAL: STEP 1 - REVIEW */}
            <OrderReviewModal 
                isOpen={!!reviewOrder}
                onClose={() => setReviewOrder(null)}
                order={reviewOrder}
                onProcess={handleConfirmProcess}
                onReject={() => reviewOrder && handleReject(reviewOrder.id)}
                onChat={() => reviewOrder && handleOpenChat(reviewOrder)}
                currentUser={currentUser} // Pass currentUser for audit
            />

            {/* MODAL: STEP 2 - PROCESSING (CHECKLIST & SHIP) */}
            <OrderProcessingModal 
                isOpen={!!processingOrder}
                onClose={() => setProcessingOrder(null)}
                order={processingOrder}
                onShip={handleConfirmShipping}
                currentUser={currentUser}
            />

            {/* UNIVERSAL CHAT WIDGET */}
            <UniversalChatWidget
                title="Chat Pemesan"
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
};

export default SalesOrders;
