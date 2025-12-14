

import React, { useState, useEffect, useRef } from 'react';
// @FIX: Import Supplier from its new location in features/irm/types.
import { Supplier } from '../../features/irm/types';
import { MessageCircle, Network, Plus, Send, X, Paperclip, Phone, MoreHorizontal } from 'lucide-react';
import { useGlobalContext } from '../../context/GlobalContext';

interface ChatMessage {
    id: string;
    sender: 'me' | 'supplier';
    text: string;
    time: string;
}

const SupplierList: React.FC = () => {
  const { suppliers, addSupplier, activeOutlet } = useGlobalContext();
  
  const [isQuickAddSupplierOpen, setIsQuickAddSupplierOpen] = useState(false);
  const [quickSupName, setQuickSupName] = useState('');
  const [quickSupContact, setQuickSupContact] = useState('');
  const [quickSupPhone, setQuickSupPhone] = useState('');
  const [quickSupCategory, setQuickSupCategory] = useState('');

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatSupplier, setActiveChatSupplier] = useState<Supplier | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatOpen]);

  const handleContactSupplier = (supplierId: string) => {
      const supplier = suppliers.find(s => s.id === supplierId);
      if (!supplier) return;
      const greeting = `Halo ${supplier.contact}, ini dari ${activeOutlet?.name || 'SIBOS Resto'}. Saya ingin menanyakan ketersediaan stok barang.`;

      if (supplier.isSibosNetwork) {
          setActiveChatSupplier(supplier);
          setChatMessages([
              { id: '1', sender: 'me', text: greeting, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
          ]);
          setIsChatOpen(true);
      } else {
          const encodedMessage = encodeURIComponent(greeting);
          window.open(`https://wa.me/${supplier.phone}?text=${encodedMessage}`, '_blank');
      }
  };

  const handleSendChatMessage = () => {
      if (!chatInput.trim()) return;
      const newMessage: ChatMessage = {
          id: Date.now().toString(), sender: 'me', text: chatInput, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      setChatMessages(prev => [...prev, newMessage]);
      setChatInput('');
      setTimeout(() => {
          const reply: ChatMessage = {
              id: (Date.now() + 1).toString(), sender: 'supplier', text: "Baik Kak, pesan sudah kami terima.", time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
          };
          setChatMessages(prev => [...prev, reply]);
      }, 2000);
  };

  const handleSaveQuickSupplier = () => {
      if (!quickSupName) return;
      const newSupplier: Supplier = {
          id: `SUP-${Date.now()}`,
          name: quickSupName,
          contact: quickSupContact || 'Admin',
          phone: quickSupPhone || '-',
          category: quickSupCategory || 'Umum',
          isSibosNetwork: false
      };
      addSupplier(newSupplier);
      setIsQuickAddSupplierOpen(false);
      setQuickSupName(''); setQuickSupContact(''); setQuickSupPhone('');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
       <div className="flex justify-between items-center">
         <h2 className="text-xl font-bold text-white">Database Supplier</h2>
         <button onClick={() => setIsQuickAddSupplierOpen(true)} className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg"><Plus size={18} /> Supplier +</button>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {suppliers.map(sup => (
           <div key={sup.id} className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
              <div className="flex justify-between items-start">
                  <h4 className="font-bold text-white text-lg">{sup.name}</h4>
                  {sup.isSibosNetwork && <span className="bg-green-500/20 text-green-400 p-1 rounded-full"><Network size={14} /></span>}
              </div>
              <p className="text-xs text-orange-500 mb-2">{sup.category}</p>
              <p className="text-sm text-gray-400">{sup.contact} | {sup.phone}</p>
              <button onClick={() => handleContactSupplier(sup.id)} className="w-full mt-4 py-2 rounded-xl bg-white/5 hover:bg-green-600 text-gray-300 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-2">
                  <MessageCircle size={14}/> Hubungi
              </button>
           </div>
         ))}
       </div>

       {/* MODAL: QUICK ADD SUPPLIER */}
       {isQuickAddSupplierOpen && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsQuickAddSupplierOpen(false)} />
               <div className="glass-panel w-full max-w-md p-6 rounded-3xl relative z-10 animate-in zoom-in-95">
                   <h3 className="text-lg font-bold text-white mb-4">Tambah Supplier</h3>
                   <div className="space-y-3">
                       <input type="text" placeholder="Nama Supplier / Toko" className="w-full glass-input rounded-xl p-3" value={quickSupName} onChange={e => setQuickSupName(e.target.value)} autoFocus />
                       <input type="text" placeholder="Kontak Person (Sales)" className="w-full glass-input rounded-xl p-3" value={quickSupContact} onChange={e => setQuickSupContact(e.target.value)} />
                       <input type="text" placeholder="No Telepon / WA" className="w-full glass-input rounded-xl p-3" value={quickSupPhone} onChange={e => setQuickSupPhone(e.target.value)} />
                       <input type="text" placeholder="Kategori (misal: Sembako)" className="w-full glass-input rounded-xl p-3" value={quickSupCategory} onChange={e => setQuickSupCategory(e.target.value)} />
                       <button onClick={handleSaveQuickSupplier} className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl mt-4">Simpan</button>
                   </div>
               </div>
           </div>
       )}

       {/* MODAL: INTERNAL CHAT */}
       {isChatOpen && activeChatSupplier && (
           <div className="fixed bottom-0 right-4 w-96 h-[500px] bg-[#1e293b] rounded-t-3xl shadow-2xl z-[200] flex flex-col border border-white/10 animate-in slide-in-from-bottom-10">
               <div className="p-4 bg-orange-600 rounded-t-3xl flex justify-between items-center shadow-lg">
                   <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white">{activeChatSupplier.name.charAt(0)}</div>
                       <div><h4 className="text-white font-bold text-sm">{activeChatSupplier.name}</h4><p className="text-[10px] text-orange-200 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Online</p></div>
                   </div>
                   <div className="flex gap-2">
                       <button className="p-2 hover:bg-white/10 rounded-full text-white"><Phone size={18}/></button>
                       <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-white"><X size={18}/></button>
                   </div>
               </div>
               <div className="flex-1 bg-[#0f172a] p-4 overflow-y-auto space-y-3 custom-scrollbar">
                   {chatMessages.map(msg => (
                       <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                           <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'me' ? 'bg-orange-600 text-white rounded-tr-none' : 'bg-white/10 text-gray-200 rounded-tl-none'}`}>{msg.text}</div>
                           <span className="text-[10px] text-gray-500 mt-1">{msg.time}</span>
                       </div>
                   ))}
                   <div ref={chatEndRef} />
               </div>
               <div className="p-3 bg-[#1e293b] border-t border-white/5 flex gap-2">
                   <button className="p-3 text-gray-400 hover:text-white"><Paperclip size={20}/></button>
                   <input type="text" className="flex-1 bg-black/30 rounded-xl px-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500" placeholder="Ketik pesan..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendChatMessage()} />
                   <button onClick={handleSendChatMessage} className="p-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl shadow-lg"><Send size={18}/></button>
               </div>
           </div>
       )}
    </div>
  );
};

export default SupplierList;