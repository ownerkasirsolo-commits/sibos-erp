
import { useState, useRef, useEffect } from 'react';
import { ChatContact, ChatMessage } from '../types';

export const useChatSystem = (initialContacts: ChatContact[] = []) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeContact, setActiveContact] = useState<ChatContact | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({}); // Map contactId -> Messages
    const [inputValue, setInputValue] = useState('');
    
    // Filter contacts based on search
    const filteredContacts = initialContacts.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => {
        setIsOpen(false);
        setActiveContact(null);
    };

    const handleSelectContact = (contact: ChatContact) => {
        if (contact.type === 'external') {
            // Handle External Link (WA)
            const message = `Halo ${contact.name}, saya menghubungi dari aplikasi SIBOS.`;
            const url = `https://wa.me/${contact.phone}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        } else {
            // Handle Internal Chat
            setActiveContact(contact);
            // Mock: Load initial messages if empty
            if (!messages[contact.id]) {
                setMessages(prev => ({
                    ...prev,
                    [contact.id]: [
                        { id: '1', sender: 'them', text: `Halo! Ada yang bisa dibantu terkait ${contact.role}?`, timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
                    ]
                }));
            }
        }
    };

    const handleBackToContacts = () => setActiveContact(null);

    const handleSendMessage = () => {
        if (!inputValue.trim() || !activeContact) return;

        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: 'me',
            text: inputValue,
            timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };

        setMessages(prev => ({
            ...prev,
            [activeContact.id]: [...(prev[activeContact.id] || []), newMessage]
        }));
        
        setInputValue('');

        // Mock Auto Reply
        setTimeout(() => {
            const reply: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'them',
                text: "Pesan diterima. Akan segera kami proses.",
                timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            };
            setMessages(prev => ({
                ...prev,
                [activeContact.id]: [...(prev[activeContact.id] || []), reply]
            }));
        }, 1500);
    };

    return {
        isOpen,
        handleOpen,
        handleClose,
        activeContact,
        filteredContacts,
        searchQuery,
        setSearchQuery,
        handleSelectContact,
        handleBackToContacts,
        currentMessages: activeContact ? (messages[activeContact.id] || []) : [],
        inputValue,
        setInputValue,
        handleSendMessage
    };
};
