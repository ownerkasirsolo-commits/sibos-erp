
import { useState, useMemo } from 'react';
import { ConnectedAccount, UnifiedOrder, SocialContent, OmniReview, PlatformId } from '../types';
import { generateBusinessAdvice } from '../../ai/services/geminiService';

export const useOmniLogic = () => {
    const [activeTab, setActiveTab] = useState<'hub' | 'orders' | 'content' | 'reviews'>('hub');
    const [isAiLoading, setIsAiLoading] = useState(false);
    
    // Connection Modal State
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState<ConnectedAccount | null>(null);

    // Settings Modal State
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [selectedChannelSettings, setSelectedChannelSettings] = useState<ConnectedAccount | null>(null);

    // Add Channel Modal State
    const [isAddChannelModalOpen, setIsAddChannelModalOpen] = useState(false);

    // --- MOCK DATA ---
    const [accounts, setAccounts] = useState<ConnectedAccount[]>([
        { id: '1', platformId: 'shopee', name: 'Shopee Store', status: 'connected', lastSync: 'Baru saja', icon: 'shopping-bag', metrics: { orders: 12, revenue: 4500000, rating: 4.8 } },
        { id: '2', platformId: 'tokopedia', name: 'Tokopedia', status: 'disconnected', lastSync: '-', icon: 'shopping-cart', metrics: { orders: 0, revenue: 0, rating: 0 } },
        { id: '3', platformId: 'tiktok', name: 'TikTok Shop', status: 'disconnected', lastSync: '-', icon: 'video', metrics: { orders: 0, revenue: 0, rating: 0 } },
        { id: '4', platformId: 'instagram', name: '@sibos.id', status: 'connected', lastSync: 'Realtime', icon: 'instagram', metrics: { orders: 0, revenue: 0, rating: 0 } },
        { id: '5', platformId: 'google', name: 'SIBOS HQ', status: 'connected', lastSync: 'Realtime', icon: 'map-pin', metrics: { orders: 0, revenue: 0, rating: 4.9 } },
        { id: '6', platformId: 'website', name: 'Website Utama', status: 'connected', lastSync: 'Realtime', icon: 'globe', metrics: { orders: 5, revenue: 1500000, rating: 0 } },
    ]);

    const [orders, setOrders] = useState<UnifiedOrder[]>([
        { id: 'ORD-001', platform: 'shopee', externalId: 'JP2938221', customerName: 'Budi Santoso', items: '2x Kopi Susu, 1x Roti Bakar', total: 85000, status: 'new', date: new Date().toISOString() },
        // ... (Keep existing mock data if any, or leave empty for now)
    ]);

    const [contents, setContents] = useState<SocialContent[]>([
        { id: 'c1', caption: 'Promo Merdeka! Diskon 50% all item khusus hari ini. #merdeka #diskon', platforms: ['instagram', 'tiktok', 'google'], status: 'published', aiGenerated: true },
        { id: 'c2', caption: 'Menu baru coming soon... Stay tuned!', platforms: ['instagram'], status: 'draft', aiGenerated: false },
    ]);

    const [reviews, setReviews] = useState<OmniReview[]>([
         { id: 'r1', platform: 'google', user: 'Agus Kotak', rating: 5, comment: 'Tempatnya enak, wifi kenceng.', date: 'Hari ini', reply: 'Terima kasih kak Agus!' },
         { id: 'r2', platform: 'shopee', user: 'Lina Geboy', rating: 4, comment: 'Pengiriman agak lama tapi barang oke.', date: 'Kemarin' },
    ]);

    // --- ACTIONS ---

    // 1. Open Modal for Disconnected Platform (Connect) or Connected (Settings)
    const handlePlatformClick = (account: ConnectedAccount) => {
        if (account.status === 'disconnected') {
            setSelectedPlatform(account);
            setIsConnectModalOpen(true);
        } else {
            // Open Settings
            setSelectedChannelSettings(account);
            setIsSettingsModalOpen(true);
        }
    };
    
    // Explicit handler for Settings Button
    const handleOpenSettings = (account: ConnectedAccount) => {
        setSelectedChannelSettings(account);
        setIsSettingsModalOpen(true);
    };

    // 2. Perform Connection Logic
    const handleConnectPlatform = (id: string) => {
        setAccounts(prev => prev.map(acc => {
            if (acc.id === id) {
                return {
                    ...acc,
                    status: 'connected',
                    lastSync: 'Baru saja',
                    // Simulate fetching initial metrics
                    metrics: {
                        orders: Math.floor(Math.random() * 50),
                        revenue: Math.floor(Math.random() * 5000000),
                        rating: 4.5 + (Math.random() * 0.5)
                    }
                };
            }
            return acc;
        }));
    };
    
    // 3. Save Settings Logic
    const handleSaveSettings = (id: string, config: any) => {
        console.log(`Settings Saved for ${id}:`, config);
        // In real app, dispatch to backend API
        // For now, we simulate update timestamp
        setAccounts(prev => prev.map(acc => 
            acc.id === id ? { ...acc, lastSync: 'Baru saja' } : acc
        ));
        alert("Konfigurasi kanal berhasil disimpan!");
    };
    
    // 4. Add Channel Logic
    const handleAddChannel = (newAccount: ConnectedAccount) => {
        setAccounts(prev => [...prev, newAccount]);
        setIsAddChannelModalOpen(false);
        // Auto open connect modal for the new channel
        setSelectedPlatform(newAccount);
        // Little delay for UX
        setTimeout(() => setIsConnectModalOpen(true), 300);
    };

    const processOrder = (id: string, nextStatus: UnifiedOrder['status']) => {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: nextStatus } : o));
    };

    const generateAiContent = async (topic: string, tone: string) => {
        setIsAiLoading(true);
        try {
            const prompt = `Buatkan caption sosial media yang menarik tentang "${topic}" dengan gaya bahasa "${tone}". Sertakan emoji dan hashtag yang relevan.`;
            const result = await generateBusinessAdvice(prompt, "Konteks: Bisnis Retail/F&B SIBOS");
            return result;
        } catch (e) {
            return "Gagal generate konten.";
        } finally {
            setIsAiLoading(false);
        }
    };
    
    const generateAiReply = async (review: string, rating: number) => {
        setIsAiLoading(true);
        try {
            const prompt = `Buatkan balasan singkat dan sopan untuk review ini: "${review}". Rating customer: ${rating}/5.`;
            const result = await generateBusinessAdvice(prompt, "Konteks: Customer Service SIBOS");
            return result;
        } catch (e) {
            return "Terima kasih atas ulasannya.";
        } finally {
            setIsAiLoading(false);
        }
    };

    const addContent = (content: SocialContent) => {
        setContents(prev => [content, ...prev]);
    };

    return {
        activeTab, setActiveTab,
        accounts,
        orders,
        contents,
        reviews,
        processOrder,
        generateAiContent,
        generateAiReply,
        addContent,
        isAiLoading,
        
        // Connection Logic Exports
        isConnectModalOpen, setIsConnectModalOpen,
        selectedPlatform, 
        handlePlatformClick,
        handleConnectPlatform,
        
        // Settings Logic Exports
        isSettingsModalOpen, setIsSettingsModalOpen,
        selectedChannelSettings,
        handleSaveSettings,
        handleOpenSettings,
        
        // Add Channel Logic Exports
        isAddChannelModalOpen, setIsAddChannelModalOpen,
        handleAddChannel
    };
};
