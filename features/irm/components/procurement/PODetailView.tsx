
import React, { useMemo, useState } from 'react';
import { PurchaseOrder, POHistoryLog } from '@/features/irm/types';
import { ArrowLeft, Printer, Truck, CheckCircle2, User, Network, PackageCheck, Send, MessageCircle, Clock } from 'lucide-react';
import { useGlobalContext } from '@/context/GlobalContext';
import GlassPanel from '@/components/common/GlassPanel';
import { printPurchaseOrder } from '@/utils/printService';
import UniversalChatWidget from '@/features/communication/components/UniversalChatWidget';
import { useChatSystem } from '@/features/communication/hooks/useChatSystem';
import { ChatContact } from '@/features/communication/types';
import { usePODetailLogic } from '@/features/irm/hooks/useProcurementLogic';
import CompactNumber from '@/components/common/CompactNumber';

interface PODetailViewProps {
    po: PurchaseOrder;
    onBack: () => void;
    onReceive: (po: PurchaseOrder) => void;
    onUpdate?: (po: PurchaseOrder) => void;
}

const PODetailView: React.FC<PODetailViewProps> = ({ po, onBack, onReceive, onUpdate }) => {
    const { businessConfig, activeOutlet, suppliers } = useGlobalContext();
    const { markAsShipped } = usePODetailLogic(po);
    const supplier = suppliers.find(s => s.id === po.supplierId);

    const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
    const [trackingNote, setTrackingNote] = useState('');

    const handleConfirmShipping = async () => {
        const updatedPO = await markAsShipped(trackingNote);
        if (updatedPO && onUpdate) {
            onUpdate(updatedPO);
        }
        setIsShippingModalOpen(false);
    }

    const mockHistory: POHistoryLog[] = po.history || [
        { timestamp: po.orderDate, action: 'created', actor: po.createdBy, note: 'Draft PO dibuat' },
        ...(po.status !== 'draft' ? [{ timestamp: new Date(new Date(po.orderDate).getTime() + 1000 * 60 * 15).toISOString(), action: 'sent' as const, actor: po.createdBy, note: po.isB2B ? 'Dikirim ke SIBOS Network' : 'Dikirim via WhatsApp' }] : []),
        ...(po.status === 'shipped' ? [{ timestamp: new Date().toISOString(), action: 'updated' as const, actor: supplier?.name || 'Supplier', note: 'Barang sedang dalam pengiriman' }] : []),
        ...(po.status === 'received' && po.receivedDate ? [{ timestamp: po.receivedDate, action: 'received' as const, actor: po.receivedBy || 'Gudang', note: 'Barang diterima lengkap' }] : [])
    ];

    const chatContact: ChatContact | undefined = useMemo(() => supplier ? {
        id: supplier.id,
        name: supplier.name,
        role: supplier.category,
        type: supplier.isSibosNetwork ? 'internal' : 'external',
        isOnline: true,
        phone: supplier.phone
    } : undefined, [supplier]);

    const chatSystem = useChatSystem(chatContact ? [chatContact] : []);

    const handleOpenChat = () => {
        if (chatContact) {
            chatSystem.handleOpen();
            chatSystem.handleSelectContact(chatContact);
        }
    };

    const renderSmartActionButton = () => {
        if (po.status === 'shipped') {
            return (
                <button 
                    onClick={() => onReceive(po)} 
                    className="w-full md:w-auto bg-gradient-to-r from-orange-600 to-red-600 hover:brightness-110 text-white px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-orange-600/20 transition-all"
                >
                    <PackageCheck size={18} /> Terima Barang
                </button>
            );
        }

        if (po.isB2B && ['pending', 'ordered', 'processed'].includes(po.status)) {
             return (
                <button 
                    disabled 
                    className="w-full md:w-auto bg-white/5 text-gray-500 px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold border border-white/5 cursor-not-allowed"
                >
                    <Clock size={18} /> Menunggu Kiriman
                </button>
            );
        }

        if (!po.isB2B && po.status === 'ordered') {
            return (
                <button 
                    onClick={() => setIsShippingModalOpen(true)}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-blue-500/20 animate-pulse transition-all"
                >
                    <Truck size={18} /> Update Pengiriman
                </button>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 relative pb-20 lg:pb-0">
            {/* Header Nav */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button onClick={onBack} className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex-1 md:flex-none">
                        <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2 flex-wrap">
                            PO #{po.id}
                            <span className={`text-[10px] px-2 py-0.5 rounded border uppercase ${
                                po.status === 'received' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                po.status === 'ordered' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                po.status === 'shipped' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                'bg-gray-500/10 text-gray-400 border-gray-500/20'
                            }`}>{po.status}</span>
                        </h2>
                    </div>
                </div>
                
                <div className="flex gap-2 items-center w-full md:w-auto">
                    <button onClick={() => businessConfig && printPurchaseOrder(po, businessConfig)} className="flex-1 md:flex-none bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold border border-white/5 transition-all">
                        <Printer size={16} /> <span className="md:hidden lg:inline">Cetak</span>
                    </button>
                    {renderSmartActionButton()}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT: DIGITAL INVOICE */}
                <div className="lg:col-span-2">
                    <GlassPanel className="p-6 md:p-8 rounded-3xl bg-white text-black/90 relative overflow-hidden min-h-[500px] md:min-h-[600px] shadow-2xl">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-50 pointer-events-none mix-blend-multiply"></div>
                        
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-black/10 pb-6 mb-6 gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-black text-black tracking-tight mb-1">PURCHASE ORDER</h1>
                                    <p className="text-sm text-gray-500 font-mono">#{po.id}</p>
                                </div>
                                <div className="text-left md:text-right">
                                    <h3 className="font-bold text-lg">{businessConfig?.name}</h3>
                                    <p className="text-xs text-gray-500 max-w-[200px] md:ml-auto leading-relaxed">{businessConfig?.address || 'Alamat Kantor Pusat'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 text-sm">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Kepada Supplier</p>
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-lg">{po.supplierName}</p>
                                        {supplier?.isSibosNetwork && <span title="Terhubung SIBOS Network"><Network size={16} className="text-cyan-600" /></span>}
                                    </div>
                                    <p className="text-gray-500">{supplier?.contact} • {supplier?.phone}</p>
                                    <p className="text-gray-500">{supplier?.category}</p>
                                </div>
                                <div className="md:text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Detail Pesanan</p>
                                    <p><span className="text-gray-500">Tanggal:</span> <span className="font-bold">{new Date(po.orderDate).toLocaleDateString()}</span></p>
                                    <p><span className="text-gray-500">Dibuat Oleh:</span> <span className="font-bold">{po.createdBy}</span></p>
                                    {po.receivedBy && <p><span className="text-gray-500">Diterima Oleh:</span> <span className="font-bold text-green-600">{po.receivedBy}</span></p>}
                                </div>
                            </div>

                            <div className="overflow-x-auto mb-8 -mx-6 px-6 md:mx-0 md:px-0">
                                <table className="w-full text-left border-collapse min-w-[500px]">
                                    <thead>
                                        <tr className="border-b border-black/10 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            <th className="py-3">Item</th>
                                            <th className="py-3 text-center">Qty</th>
                                            <th className="py-3 text-right">Harga Satuan</th>
                                            <th className="py-3 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {po.items.map((item, idx) => (
                                            <tr key={idx} className="border-b border-black/5">
                                                <td className="py-3 font-bold text-gray-800">{item.ingredientName}</td>
                                                <td className="py-3 text-center">{item.quantity} {item.unit}</td>
                                                <td className="py-3 text-right font-mono text-gray-600"><CompactNumber value={item.cost} currency={false} forceFull /></td>
                                                <td className="py-3 text-right font-mono font-bold text-black"><CompactNumber value={item.quantity * item.cost} currency={false} forceFull /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-auto pt-6 border-t-2 border-black/10 flex flex-col md:flex-row justify-end">
                                <div className="w-full md:w-64">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-gray-500">Total Estimasi</span>
                                        <span className="text-2xl font-black text-black">
                                            <CompactNumber value={po.totalEstimated} forceFull />
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 text-right mt-4 italic">
                                        Dokumen ini sah dan diterbitkan secara digital oleh sistem SIBOS.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </GlassPanel>
                </div>

                {/* RIGHT: ACTIVITY LOG & ACTIONS */}
                <div className="space-y-6">
                    <div className="glass-panel p-5 rounded-2xl border border-white/5">
                        <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Truck size={16} className="text-orange-500"/> Kontak Supplier
                        </h4>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center font-bold text-white">
                                {po.supplierName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-white text-sm truncate">{po.supplierName}</p>
                                    {supplier?.isSibosNetwork && <Network size={14} className="text-cyan-400" />}
                                </div>
                                <p className="text-xs text-gray-400">{supplier?.phone || '-'}</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleOpenChat} 
                            className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border border-white/10"
                        >
                            <MessageCircle size={16} /> Hubungi / Chat
                        </button>
                    </div>

                    <div className="glass-panel p-6 rounded-3xl border border-white/5 h-fit">
                        <h4 className="font-bold text-white mb-6">Jejak Aktivitas</h4>
                        <div className="relative border-l border-white/10 ml-2 space-y-8 pl-6 pb-2">
                            {mockHistory.map((log, idx) => (
                                <div key={idx} className="relative group">
                                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#0f172a] border-2 border-orange-500 flex items-center justify-center z-10">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">{log.action}</span>
                                            <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        <p className="text-sm text-gray-300 font-medium">{log.note}</p>
                                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-500">
                                            <User size={10} /> <span>{log.actor}</span>
                                            <span>•</span>
                                            <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL: MANUAL SHIPPING CONFIRMATION */}
            {isShippingModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsShippingModalOpen(false)} />
                    <div className="glass-panel w-full max-w-sm p-6 rounded-3xl relative z-10 animate-in zoom-in-95 border border-white/10">
                        <h3 className="text-lg font-bold text-white mb-2">Update Status Pengiriman</h3>
                        <p className="text-xs text-gray-400 mb-4">Pastikan supplier sudah mengirim barang. Input info resi atau supir jika ada.</p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Info Kurir / Resi (Opsional)</label>
                                <input 
                                    type="text" 
                                    className="w-full glass-input rounded-xl p-3 mt-1 text-white text-sm" 
                                    placeholder="Contoh: JNE 12345 / Pak Ujang" 
                                    value={trackingNote}
                                    onChange={(e) => setTrackingNote(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setIsShippingModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-bold text-sm transition-colors">Batal</button>
                                <button onClick={handleConfirmShipping} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                                    <Send size={16} /> Tandai Dikirim
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
};

export default PODetailView;
