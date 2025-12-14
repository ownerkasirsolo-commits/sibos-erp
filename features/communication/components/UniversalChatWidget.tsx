
import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Send, Phone, Paperclip, MessageCircle, ArrowUpRight, Network, ArrowLeft } from 'lucide-react';
import { ChatContact, ChatMessage } from '../types';
import GlassInput from '../../../components/common/GlassInput';

interface UniversalChatWidgetProps {
    title?: string;
    isOpen: boolean;
    onClose: () => void;
    activeContact: ChatContact | null;
    contacts: ChatContact[];
    searchQuery: string;
    onSearchChange: (val: string) => void;
    onSelectContact: (contact: ChatContact) => void;
    onBackToContacts: () => void;
    messages: ChatMessage[];
    inputValue: string;
    onInputChange: (val: string) => void;
    onSendMessage: () => void;
}

const UniversalChatWidget: React.FC<UniversalChatWidgetProps> = ({
    title = "Communication Hub",
    isOpen, onClose, activeContact, contacts, 
    searchQuery, onSearchChange, onSelectContact, onBackToContacts,
    messages, inputValue, onInputChange, onSendMessage
}) => {
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            // Slight delay to ensure DOM is ready and animation plays smoothly
            setTimeout(() => {
                chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    }, [messages, isOpen, activeContact]);

    const handleOpenExternalWA = (phone: string | undefined) => {
        if (!phone) return;
        const url = `https://wa.me/${phone}`;
        window.open(url, '_blank');
    };

    if (!mounted || !isOpen) return null;

    // Use Portal to render outside of the main app layout stacking context
    return createPortal(
        <div className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-[#0f172a] shadow-2xl z-[9999] border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-300 font-sans">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-[#1e293b] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-600 rounded-xl text-white">
                        <MessageCircle size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">{title}</h3>
                        <p className="text-[10px] text-gray-400">Internal & External Chat</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col">
                {!activeContact ? (
                    // VIEW 1: CONTACT LIST
                    <div className="flex-1 flex flex-col p-4 overflow-hidden">
                        <div className="mb-4 shrink-0">
                            <GlassInput 
                                icon={Search}
                                placeholder="Cari kontak..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="py-2 text-sm"
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                            {contacts.map(contact => (
                                <button 
                                    key={contact.id}
                                    onClick={() => onSelectContact(contact)}
                                    className="w-full p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-orange-500/30 transition-all flex items-center justify-between group text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center font-bold text-white shrink-0 shadow-inner">
                                            {contact.avatar || contact.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm text-white group-hover:text-orange-400 transition-colors">{contact.name}</span>
                                                {contact.type === 'internal' && <Network size={12} className="text-cyan-400" />}
                                            </div>
                                            <span className="text-xs text-gray-500">{contact.role}</span>
                                        </div>
                                    </div>
                                    {contact.type === 'internal' ? (
                                        <span className="text-[10px] bg-cyan-900/30 text-cyan-400 px-2 py-1 rounded border border-cyan-500/20">Chat</span>
                                    ) : (
                                        <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-1 rounded border border-green-500/20 flex items-center gap-1">
                                            WA <ArrowUpRight size={8} />
                                        </span>
                                    )}
                                </button>
                            ))}
                            {contacts.length === 0 && (
                                <p className="text-center text-gray-500 text-xs py-8">Tidak ditemukan kontak.</p>
                            )}
                        </div>
                    </div>
                ) : (
                    // VIEW 2: CHAT ROOM
                    <div className="flex-1 flex flex-col bg-[#0b1120] overflow-hidden">
                        {/* Chat Header */}
                        <div className="p-3 bg-[#1e293b] border-b border-white/5 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <button onClick={onBackToContacts} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10">
                                    <ArrowLeft size={18} />
                                </button>
                                <div>
                                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                        {activeContact.name}
                                        {activeContact.type === 'internal' && <Network size={12} className="text-cyan-400" />}
                                    </h4>
                                    <p className="text-[10px] text-green-400 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                {activeContact.phone && (
                                    <button 
                                        onClick={() => handleOpenExternalWA(activeContact.phone)} 
                                        className="p-2 text-green-400 hover:text-white hover:bg-green-600/20 rounded-lg transition-colors"
                                        title="Chat via WhatsApp"
                                    >
                                        <MessageCircle size={16} />
                                    </button>
                                )}
                                <button className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg">
                                    <Phone size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                                        msg.sender === 'me' 
                                        ? 'bg-orange-600 text-white rounded-tr-none' 
                                        : 'bg-white/10 text-gray-200 rounded-tl-none border border-white/5'
                                    }`}>
                                        {msg.text}
                                    </div>
                                    <span className="text-[10px] text-gray-500 mt-1 px-1">{msg.timestamp}</span>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-[#1e293b] border-t border-white/10 flex gap-2 items-center shrink-0">
                            <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full">
                                <Paperclip size={20} />
                            </button>
                            <input 
                                type="text" 
                                className="flex-1 bg-black/30 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 placeholder-gray-500" 
                                placeholder="Tulis pesan..." 
                                value={inputValue} 
                                onChange={e => onInputChange(e.target.value)} 
                                onKeyDown={e => e.key === 'Enter' && onSendMessage()} 
                            />
                            <button 
                                onClick={onSendMessage} 
                                disabled={!inputValue.trim()}
                                className="p-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default UniversalChatWidget;
