
import React, { useState, useMemo, useEffect } from 'react';
import { useGlobalContext } from '../../../context/GlobalContext';
import { SalesChannel, OmniReview, SyncHistoryItem, IncomingOrder, ChannelProduct, OmniConversation, OmniMessage } from '../types';
import { generateBusinessAdvice } from '../../ai/services/geminiService';

export const useOmnichannelLogic = () => {
    const { products } = useGlobalContext();

    // Added 'content' to type
    const [activeTab, setActiveTab] = useState<'commerce' | 'inbox' | 'mapping' | 'analytics' | 'reputation' | 'sync' | 'orders' | 'content'>('commerce');
    const [subTab, setSubTab] = useState<string>('orders'); 

    const [isPanicMode, setIsPanicMode] = useState(false);
    const [simulatorBasePrice, setSimulatorBasePrice] = useState(35000);
    const [logSearchTerm, setLogSearchTerm] = useState('');
    const [isLiveLogOpen, setIsLiveLogOpen] = useState(false);

    // ... rest of the hook remains the same (omitted for brevity, assume existing logic) ...
    // --- INBOX LOGIC ---
    const [conversations, setConversations] = useState<OmniConversation[]>([
        {
            id: 'conv1',
            platformId: 'shopee',
            customerName: 'Siti Aminah',
            lastMessage: 'Kak, paketnya bisa dikirim hari ini?',
            lastMessageTime: '10:30',
            unreadCount: 2,
            tags: ['Tanya Stok'],
            linkedOrderId: 'ORD-SP-1102',
            messages: [
                { id: 'm1', sender: 'customer', text: 'Halo kak, barang ready?', timestamp: '10:00', type: 'text' },
                { id: 'm2', sender: 'me', text: 'Ready kak, silakan diorder.', timestamp: '10:05', type: 'text' },
                { id: 'm3', sender: 'customer', text: 'Kak, paketnya bisa dikirim hari ini?', timestamp: '10:30', type: 'text' },
            ]
        },
        {
            id: 'conv2',
            platformId: 'whatsapp',
            customerName: 'Budi Santoso',
            lastMessage: 'Oke terima kasih infonya.',
            lastMessageTime: 'Kemarin',
            unreadCount: 0,
            tags: ['Pelanggan Tetap'],
            messages: [
                { id: 'm1', sender: 'customer', text: 'Siang, mau tanya menu catering.', timestamp: '14:00', type: 'text' },
                { id: 'm2', sender: 'me', text: 'Boleh kak, untuk berapa porsi?', timestamp: '14:05', type: 'text' },
                { id: 'm3', sender: 'customer', text: 'Oke terima kasih infonya.', timestamp: '14:10', type: 'text' },
            ]
        },
        {
            id: 'conv3',
            platformId: 'instagram',
            customerName: 'Rina_Nose88',
            lastMessage: 'Ada promo apa bulan ini?',
            lastMessageTime: '09:15',
            unreadCount: 1,
            tags: [],
            messages: [
                { id: 'm1', sender: 'customer', text: 'Ada promo apa bulan ini?', timestamp: '09:15', type: 'text' }
            ]
        }
    ]);

    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const activeConversation = useMemo(() => conversations.find(c => c.id === activeConversationId) || null, [conversations, activeConversationId]);
    
    // AI Reply State
    const [aiReplyDraft, setAiReplyDraft] = useState('');
    const [isGeneratingReply, setIsGeneratingReply] = useState(false);

    const handleSendMessage = (text: string) => {
        if (!activeConversationId) return;
        
        const newMessage: OmniMessage = {
            id: `msg-${Date.now()}`,
            sender: 'me',
            text: text,
            timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            type: 'text'
        };

        setConversations(prev => prev.map(c => {
            if (c.id === activeConversationId) {
                return {
                    ...c,
                    messages: [...c.messages, newMessage],
                    lastMessage: text,
                    lastMessageTime: 'Baru saja',
                    unreadCount: 0 // Mark as read when replying
                };
            }
            return c;
        }));
        
        setAiReplyDraft(''); // Clear AI draft if used
    };

    const handleGenerateAiReply = async () => {
        if (!activeConversation) return;
        setIsGeneratingReply(true);
        try {
            const context = `Customer: ${activeConversation.customerName}, Platform: ${activeConversation.platformId}, Last Msg: "${activeConversation.messages[activeConversation.messages.length - 1].text}"`;
            const prompt = "Buatkan balasan singkat, ramah, dan persuasif untuk customer ini dalam bahasa Indonesia.";
            const reply = await generateBusinessAdvice(prompt, context);
            setAiReplyDraft(reply.replace(/"/g, ''));
        } catch (e) {
            console.error(e);
        } finally {
            setIsGeneratingReply(false);
        }
    };


    // --- MAPPING LOGIC ---
    const [unlinkedProducts, setUnlinkedProducts] = useState<ChannelProduct[]>([
        { id: 'ext-1', channelId: 'gofood', channelName: 'GoFood', productName: 'Nasgor Spesial + Telor', price: 42000, isLinked: false, similarityScore: 0 },
        { id: 'ext-2', channelId: 'shopee', channelName: 'ShopeeFood', productName: 'Nasi Goreng Special SIBOS', price: 41000, isLinked: false, similarityScore: 0 },
        { id: 'ext-3', channelId: 'grabfood', channelName: 'GrabFood', productName: 'Es Kopi Gula Aren (Large)', price: 24000, isLinked: false, similarityScore: 0 },
        { id: 'ext-4', channelId: 'tokopedia', channelName: 'Tokopedia', productName: 'Kopi Susu Literan', price: 85000, isLinked: false, similarityScore: 0 },
        { id: 'ext-5', channelId: 'tiktok', channelName: 'TikTok Shop', productName: 'Paket Hemat Burger', price: 55000, isLinked: false, similarityScore: 0 },
    ]);

    const processedUnlinkedProducts = useMemo(() => {
        return unlinkedProducts.map(ext => {
            let bestMatchId = undefined;
            let bestScore = 0;

            products.forEach(master => {
                const masterName = master.name.toLowerCase();
                const extName = ext.productName.toLowerCase();
                
                let score = 0;
                if (extName === masterName) score = 100;
                else if (extName.includes(masterName) || masterName.includes(extName)) score = 85;
                else {
                    const masterWords = masterName.split(' ').filter(w => w.length > 2);
                    const matches = masterWords.filter(w => extName.includes(w)).length;
                    if (masterWords.length > 0) score = (matches / masterWords.length) * 100;
                }

                if (score > bestScore) {
                    bestScore = score;
                    bestMatchId = master.id;
                }
            });

            return {
                ...ext,
                similarityScore: Math.floor(bestScore),
                suggestedMasterId: bestScore > 40 ? bestMatchId : undefined
            };
        });
    }, [unlinkedProducts, products]);

    const handleLinkProduct = (channelProductId: string, masterProductId: string) => {
        setUnlinkedProducts(prev => prev.filter(p => p.id !== channelProductId));
    };

    const handleAutoMapAll = () => {
        const toLink = processedUnlinkedProducts.filter(p => p.suggestedMasterId && p.similarityScore && p.similarityScore > 75);
        if (toLink.length === 0) {
            alert("Tidak ada produk dengan kecocokan tinggi otomatis.");
            return;
        }
        
        const idsToRemove = toLink.map(p => p.id);
        setUnlinkedProducts(prev => prev.filter(p => !idsToRemove.includes(p.id)));
        alert(`Berhasil menghubungkan ${idsToRemove.length} produk secara otomatis!`);
    };

    // --- MOCK INCOMING ORDERS ---
    const [incomingOrders, setIncomingOrders] = useState<IncomingOrder[]>([
        { id: '1', platform: 'GoFood', platformOrderId: 'GF-8821', customerName: 'Budi Santoso', items: '2x Nasi Goreng Spesial, 2x Es Teh', total: 85000, status: 'new', time: 'Baru Saja' },
        { id: '2', platform: 'ShopeeFood', platformOrderId: 'SP-1102', customerName: 'Siti Aminah', items: '1x Ayam Bakar Madu', total: 45000, status: 'accepted', time: '5m lalu', driverName: 'Pak Ujang' },
        { id: '3', platform: 'Website', platformOrderId: 'WEB-9921', customerName: 'Rina Nose', items: '3x Kopi Susu Gula Aren', total: 54000, status: 'new', time: '10m lalu' },
    ]);

    const handleAcceptOrder = (id: string) => {
        setIncomingOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'accepted' } : o));
        alert("Order diterima! Masuk ke antrian dapur (KDS).");
    };

    // --- MOCK REVIEWS & HISTORY ---
    const reviews: OmniReview[] = [
        { id: 'r1', user: 'Budi Santoso', rating: 5, comment: 'Makanannya enak banget, pengiriman cepat!', platform: 'gofood', date: 'Hari ini' },
        { id: 'r2', user: 'Siti Aminah', rating: 4, comment: 'Rasanya oke, tapi agak sedikit asin.', platform: 'grabfood', date: 'Kemarin' },
        { id: 'r3', user: 'Joko Anwar', rating: 5, comment: 'Recommended banget! Bakal pesen lagi.', platform: 'shopee', date: '2 hari lalu' },
    ];

    const syncHistory: SyncHistoryItem[] = [
        { id: 1, status: 'success', itemsUpdated: 12, timestamp: 'Baru Saja', platform: 'GoFood' },
        { id: 2, status: 'success', itemsUpdated: 5, timestamp: '15 Menit Lalu', platform: 'Tokopedia' },
        { id: 3, status: 'success', itemsUpdated: 0, timestamp: '1 Jam Lalu', platform: 'Shopee' },
    ];

    const stats = useMemo(() => {
        return {
            connectedCount: 5,
            activeCount: 4,
            totalRevenue: 18200000,
            syncStatus: 'Auto-Sync ON',
            totalPlatforms: 7,
            pendingOrders: incomingOrders.filter(o => o.status === 'new').length
        };
    }, [incomingOrders]);

    const reviewStats = { rating: 4.8, total: 124, sentiment: 'Positif' };
    const campaignStats = { active: 2, reach: 1540, conversion: 12.5 };

    const handlePanicMode = () => {
        if (window.confirm(isPanicMode ? "Matikan Panic Mode?" : "PERINGATAN: Panic Mode akan MENUTUP SEMUA toko online. Lanjutkan?")) {
            setIsPanicMode(!isPanicMode);
        }
    };

    const calculateSimulation = (markupPercent: number) => {
        const markupPrice = simulatorBasePrice + (simulatorBasePrice * (markupPercent / 100));
        const appFee = markupPrice * 0.20; // Avg 20%
        const netReceive = markupPrice - appFee;
        const marginDiff = netReceive - simulatorBasePrice;
        return { markupPrice, appFee, netReceive, marginDiff };
    };

    return {
        activeTab, setActiveTab,
        subTab, setSubTab,
        isPanicMode,
        simulatorBasePrice, setSimulatorBasePrice,
        handlePanicMode,
        calculateSimulation,
        
        // Data & Stats
        stats,
        reviewStats,
        campaignStats,
        reviews,
        syncHistory,
        incomingOrders, handleAcceptOrder,

        // Mapping Data
        unlinkedProducts: processedUnlinkedProducts,
        handleLinkProduct,
        handleAutoMapAll,

        // Inbox Data
        conversations,
        activeConversation,
        setActiveConversationId,
        handleSendMessage,
        handleGenerateAiReply,
        aiReplyDraft,
        setAiReplyDraft,
        isGeneratingReply,

        // Logs
        isLiveLogOpen, setIsLiveLogOpen,
        logSearchTerm, setLogSearchTerm
    };
};
