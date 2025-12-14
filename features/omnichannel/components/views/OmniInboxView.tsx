
import React, { useState, useEffect, useRef } from 'react';
import { OmniConversation } from '../../types';
import { useGlobalContext } from '../../../../context/GlobalContext';
import { Search, Send, Paperclip, Smile, BrainCircuit, User, ShoppingBag, Clock, MoreVertical, Phone, ShoppingCart, Image as ImageIcon, Bike, MapPin, MessageCircle } from 'lucide-react';
import GlassPanel from '../../../../components/common/GlassPanel';
import GlassInput from '../../../../components/common/GlassInput';
import CompactNumber from '../../../../components/common/CompactNumber';

interface OmniInboxViewProps {
    conversations: OmniConversation[];
    activeConversation: OmniConversation | null;
    onSelectConversation: (id: string) => void;
    onSendMessage: (text: string) => void;
    onGenerateReply: () => void;
    aiReplyDraft: string;
    setAiReplyDraft: (val: string) => void;
    isGeneratingReply: boolean;
}

const OmniInboxView: React.FC<OmniInboxViewProps> = ({ 
    conversations, activeConversation, onSelectConversation, onSendMessage, 
    onGenerateReply, aiReplyDraft, setAiReplyDraft, isGeneratingReply 
}) => {
    const { products } = useGlobalContext();
    const [inputValue, setInputValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Apply AI draft to input
    useEffect(() => {
        if (aiReplyDraft) setInputValue(aiReplyDraft);
    }, [aiReplyDraft]);

    // Auto-scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConversation?.messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        onSendMessage(inputValue);
        setInputValue('');
    };

    const getPlatformIcon = (id: string) => {
        if (id === 'whatsapp') return <MessageCircle size={16} className="text-green-500" />;
        if (id === 'instagram') return <div className="bg-pink-600 rounded-full w-4 h-4 flex items-center justify-center text-white text-[8px] font-bold">IG</div>;
        if (id === 'shopee') return <ShoppingBag size={16} className="text-orange-500" />;
        return <GlobeIcon size={16} className="text-blue-400" />;
    };

    // Filter conversations
    const filteredConversations = conversations.filter(c => 
        c.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-200px)] grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-right-4">
            
            {/* LEFT: CONVERSATION LIST (3/12) */}
            <div className={`lg:col-span-3 flex flex-col h-full ${activeConversation ? 'hidden lg:flex' : 'flex'}`}>
                <div className="mb-4">
                    <GlassInput 
                        icon={Search}
                        placeholder="Cari chat..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="py-2.5 text-sm"
                    />
                </div>
                
                <GlassPanel className="flex-1 overflow-y-auto custom-scrollbar p-0 rounded-2xl border border-white/5 bg-black/20">
                    <div className="divide-y divide-white/5">
                        {filteredConversations.map(conv => (
                            <div 
                                key={conv.id}
                                onClick={() => onSelectConversation(conv.id)}
                                className={`p-4 cursor-pointer hover:bg-white/5 transition-colors relative ${activeConversation?.id === conv.id ? 'bg-white/10' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        {getPlatformIcon(conv.platformId)}
                                        <span className={`font-bold text-sm ${conv.unreadCount > 0 ? 'text-white' : 'text-gray-300'}`}>{conv.customerName}</span>
                                    </div>
                                    <span className="text-[10px] text-gray-500">{conv.lastMessageTime}</span>
                                </div>
                                <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-white font-medium' : 'text-gray-500'}`}>{conv.lastMessage}</p>
                                
                                {conv.unreadCount > 0 && (
                                    <div className="absolute top-4 right-4 bg-orange-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                        {conv.unreadCount}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </GlassPanel>
            </div>

            {/* CENTER: CHAT AREA (6/12) */}
            <div className={`lg:col-span-6 flex flex-col h-full ${!activeConversation ? 'hidden lg:flex' : 'flex'}`}>
                {activeConversation ? (
                    <GlassPanel className="flex-1 flex flex-col p-0 rounded-2xl overflow-hidden border border-white/5 relative">
                        {/* Header */}
                        <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                <button onClick={() => onSelectConversation('')} className="lg:hidden p-1 text-gray-400 hover:text-white">
                                    <ArrowLeftIcon />
                                </button>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center font-bold text-white">
                                    {activeConversation.customerName.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">{activeConversation.customerName}</h4>
                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                                        <span className="capitalize">{activeConversation.platformId}</span>
                                        {activeConversation.tags.map(tag => (
                                            <span key={tag} className="bg-white/10 px-1.5 rounded text-white">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"><MoreVertical size={18}/></button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20">
                            {activeConversation.messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${msg.sender === 'me' ? 'bg-orange-600 text-white rounded-tr-none' : 'bg-[#1e293b] text-gray-200 rounded-tl-none'}`}>
                                        <p>{msg.text}</p>
                                        <span className="text-[10px] opacity-70 block text-right mt-1">{msg.timestamp}</span>
                                    </div>
                                </div>
                            ))}
                            {activeConversation.linkedOrderId && (
                                <div className="flex justify-center">
                                    <div className="bg-blue-900/20 border border-blue-500/30 px-4 py-2 rounded-full text-xs text-blue-300 flex items-center gap-2">
                                        <ShoppingBag size={12} /> Menanyakan Order #{activeConversation.linkedOrderId}
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-[#1e293b] border-t border-white/10 shrink-0">
                            {/* Smart Reply Suggestions */}
                            <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
                                <button 
                                    onClick={onGenerateReply}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold hover:bg-purple-600/40 transition-colors whitespace-nowrap"
                                >
                                    <BrainCircuit size={12} /> {isGeneratingReply ? 'Berpikir...' : 'AI Smart Reply'}
                                </button>
                                <button onClick={() => setInputValue('Barang ready kak, silakan diorder.')} className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 text-[10px] whitespace-nowrap">Ready Stock</button>
                                <button onClick={() => setInputValue('Terima kasih sudah berbelanja!')} className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 text-[10px] whitespace-nowrap">Terima Kasih</button>
                            </div>

                            <div className="flex gap-2 items-center">
                                <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full"><Paperclip size={20}/></button>
                                <div className="flex-1 relative">
                                    <input 
                                        type="text" 
                                        className="w-full bg-black/30 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                                        placeholder="Ketik pesan..."
                                        value={inputValue}
                                        onChange={e => setInputValue(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                                    />
                                    <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"><Smile size={18}/></button>
                                </div>
                                <button 
                                    onClick={handleSend}
                                    className="p-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl shadow-lg transition-colors"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </GlassPanel>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-2xl bg-white/5">
                        <MessageCircle size={48} className="mb-4 opacity-20" />
                        <p>Pilih percakapan untuk mulai chat.</p>
                    </div>
                )}
            </div>

            {/* RIGHT: CONTEXT PANEL (3/12) */}
            <div className="lg:col-span-3 hidden lg:flex flex-col gap-4 h-full">
                {activeConversation ? (
                    <>
                        <GlassPanel className="p-5 rounded-2xl border border-white/5">
                            <div className="text-center mb-4">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center font-bold text-3xl text-white mx-auto mb-3 shadow-lg">
                                    {activeConversation.customerName.charAt(0)}
                                </div>
                                <h4 className="font-bold text-white text-lg">{activeConversation.customerName}</h4>
                                <div className="flex items-center justify-center gap-2 mt-1">
                                     <span className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded">Silver Member</span>
                                     <span className="text-xs text-green-400 flex items-center gap-1"><Clock size={10}/> Aktif</span>
                                </div>
                            </div>
                            
                            <div className="space-y-3 pt-4 border-t border-white/10">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Total Order</span>
                                    <span className="text-white font-bold">12x</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Total Spend</span>
                                    <span className="text-white font-bold">Rp 4.5jt</span>
                                </div>
                            </div>
                            <button className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold rounded-lg transition-colors border border-white/5">
                                Lihat Profil CRM
                            </button>
                        </GlassPanel>

                        <GlassPanel className="p-5 rounded-2xl border border-white/5 flex-1">
                            <h5 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                                <ShoppingBag size={14} className="text-blue-400"/> Order Terakhir
                            </h5>
                            
                            {activeConversation.linkedOrderId ? (
                                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-4">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-blue-300 font-bold text-xs">{activeConversation.linkedOrderId}</span>
                                        <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 rounded">Proses</span>
                                    </div>
                                    <p className="text-xs text-gray-300">2x Nasi Goreng Spesial</p>
                                    <p className="text-xs text-gray-300">1x Es Teh Manis</p>
                                    <div className="mt-2 pt-2 border-t border-blue-500/20 flex justify-between items-center">
                                        <span className="text-[10px] text-gray-400">Total</span>
                                        <span className="font-bold text-white text-sm">Rp 85.000</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500 italic mb-4">Tidak ada order aktif.</p>
                            )}

                            <button className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2">
                                <ShoppingCart size={14} /> Buat Pesanan Manual
                            </button>
                        </GlassPanel>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 text-xs italic">
                        Pilih chat untuk melihat detail pelanggan.
                    </div>
                )}
            </div>
        </div>
    );
};

// Simple Arrow Left Icon for Mobile Back Button
const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);

const GlobeIcon = ({size, className}: {size?: number, className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
);

export default OmniInboxView;
