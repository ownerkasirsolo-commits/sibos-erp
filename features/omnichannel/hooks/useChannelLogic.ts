
import { useState, useMemo } from 'react';
import { SalesChannel } from '../types';

export const useChannelLogic = () => {
    // Mock Data Initial State - FOKUS: CROSS-POSTING & BRANDING
    const [channels, setChannels] = useState<SalesChannel[]>([
        // --- ENGAGEMENT CHANNELS (ACTIVE - PRIORITAS) ---
        // 1. Social Media (Instagram)
        { 
            id: 'ig', name: 'Instagram', type: 'social_media', status: 'Open', connected: true, 
            color: 'text-pink-500', bg: 'bg-pink-500/10', icon: 'social', 
            followers: 24500, engagementRate: 8.4, bioLink: 'https://sibos.id/menu', 
            autoReply: true, autoReplyMessage: 'Halo! Cek menu kami di link bio ya.', 
            markup: 0, commission: 0, autoAccept: false, stockBuffer: 0, syncStock: false 
        },
        
        // 2. Social Media (Facebook)
        { 
            id: 'fb', name: 'Facebook Page', type: 'social_media', status: 'Open', connected: true, 
            color: 'text-blue-500', bg: 'bg-blue-500/10', icon: 'social', 
            followers: 5600, engagementRate: 2.1, bioLink: 'https://sibos.id', 
            autoReply: false, markup: 0, commission: 0, autoAccept: false, stockBuffer: 0, syncStock: false 
        },

        // 3. Google Business Profile (Local SEO - CRITICAL)
        {
            id: 'google', name: 'Google Business', type: 'social_media', status: 'Open', connected: true,
            color: 'text-blue-600', bg: 'bg-white/10', icon: 'social',
            followers: 0, engagementRate: 0,
            markup: 0, commission: 0, autoAccept: false, stockBuffer: 0, syncStock: false
        },

        // 4. Website Usaha (Sales Channel Milik Sendiri - ACTIVE)
        {
            id: 'website', name: 'Website Usaha', type: 'marketplace', status: 'Open', connected: true,
            color: 'text-orange-500', bg: 'bg-orange-500/10', icon: 'shop',
            commission: 0, markup: 0, autoAccept: true, stockBuffer: 0, syncStock: true,
            performance: { todayRevenue: 1500000, todayOrders: 12, monthRevenue: 45000000, rating: 5.0 }
        },

        // --- SALES CHANNELS LAINNYA (COMING SOON / MAINTENANCE) ---
        // Food Delivery
        { 
            id: 'gofood', name: 'GoFood', type: 'food_delivery', status: 'Maintenance', connected: false, 
            color: 'text-green-500', bg: 'bg-green-500/10', icon: 'bike', 
            commission: 20, markup: 25, autoAccept: true, stockBuffer: 0, syncStock: true,
            performance: { todayRevenue: 0, todayOrders: 0, monthRevenue: 0, rating: 0 }
        },
        { 
            id: 'grabfood', name: 'GrabFood', type: 'food_delivery', status: 'Maintenance', connected: false, 
            color: 'text-green-600', bg: 'bg-green-600/10', icon: 'bike', 
            commission: 20, markup: 25, autoAccept: true, stockBuffer: 0, syncStock: true,
            performance: { todayRevenue: 0, todayOrders: 0, monthRevenue: 0, rating: 0 }
        },
        { 
            id: 'shopeefood', name: 'ShopeeFood', type: 'food_delivery', status: 'Maintenance', connected: false, 
            color: 'text-orange-500', bg: 'bg-orange-500/10', icon: 'bike', 
            commission: 20, markup: 25, autoAccept: false, stockBuffer: 0, syncStock: true,
            performance: { todayRevenue: 0, todayOrders: 0, monthRevenue: 0, rating: 0 }
        },
        
        // Marketplace
        { 
            id: 'google_shopping', name: 'Google Shopping', type: 'marketplace', status: 'Maintenance', connected: false, 
            color: 'text-blue-500', bg: 'bg-white/10', icon: 'shop', 
            commission: 0, markup: 0, autoAccept: true, stockBuffer: 0, syncStock: true,
            performance: { todayRevenue: 0, todayOrders: 0, monthRevenue: 0, rating: 0 }
        },
        { 
            id: 'tokopedia', name: 'Tokopedia', type: 'marketplace', status: 'Maintenance', connected: false, 
            color: 'text-green-500', bg: 'bg-green-500/10', icon: 'shop', 
            commission: 4.5, markup: 5, autoAccept: false, stockBuffer: 2, syncStock: true,
            performance: { todayRevenue: 0, todayOrders: 0, monthRevenue: 0, rating: 0 }
        },
        { 
            id: 'shopee', name: 'Shopee', type: 'marketplace', status: 'Maintenance', connected: false, 
            color: 'text-orange-500', bg: 'bg-orange-500/10', icon: 'shop', 
            commission: 6.5, markup: 8, autoAccept: false, stockBuffer: 5, syncStock: true,
            performance: { todayRevenue: 0, todayOrders: 0, monthRevenue: 0, rating: 0 }
        },
        
        // Social Commerce (TikTok Shop)
        { 
            id: 'tiktok', name: 'TikTok Shop', type: 'social_commerce', status: 'Maintenance', connected: false, 
            color: 'text-white', bg: 'bg-black/40', icon: 'social', 
            commission: 8.3, markup: 10, autoAccept: false, stockBuffer: 2, syncStock: true, followers: 15400, engagementRate: 5.2,
            performance: { todayRevenue: 0, todayOrders: 0, monthRevenue: 0, rating: 0 }
        },
    ]);

    const foodChannels = useMemo(() => channels.filter(c => c.type === 'food_delivery'), [channels]);
    const marketChannels = useMemo(() => channels.filter(c => c.type === 'marketplace' || c.type === 'social_commerce'), [channels]);
    const socialChannels = useMemo(() => channels.filter(c => c.type === 'social_media'), [channels]);

    // Actions
    const toggleStatus = (id: string) => {
        setChannels(prev => prev.map(c => {
            if (c.id === id) {
                // Logic toggle sederhana
                const newStatus = c.status === 'Open' ? 'Closed' : 'Open';
                return { ...c, status: newStatus };
            }
            return c;
        }));
    };

    const updateConfig = (id: string, field: keyof SalesChannel, value: any) => {
        setChannels(prev => prev.map(c => {
            if (c.id === id) {
                return { ...c, [field]: value };
            }
            return c;
        }));
    };

    const handleBulkStatus = (type: SalesChannel['type'] | 'all_sales', newStatus: 'Open' | 'Closed') => {
        setChannels(prev => prev.map(c => {
            if (c.type !== 'social_media' && c.connected && c.id !== 'website') { // Website jangan di auto-close
                if (type === 'all_sales' || c.type === type) {
                    return { ...c, status: newStatus };
                }
            }
            return c;
        }));
    };

    const addChannel = (newChannel: SalesChannel) => {
        setChannels(prev => [...prev, newChannel]);
    };

    return {
        channels,
        foodChannels,
        marketChannels,
        socialChannels,
        toggleStatus,
        updateConfig,
        handleBulkStatus,
        addChannel
    };
};
