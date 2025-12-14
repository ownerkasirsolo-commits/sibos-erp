
export type PlatformId = 'shopee' | 'tokopedia' | 'tiktok' | 'grabfood' | 'gofood' | 'instagram' | 'google' | 'website' | 'whatsapp' | 'google_shopping';

export interface ConnectedAccount {
    id: string;
    platformId: PlatformId;
    name: string;
    status: 'connected' | 'disconnected' | 'error';
    lastSync: string;
    icon: string;
    metrics?: {
        orders: number;
        revenue: number;
        rating: number;
    }
}

export interface ChannelProduct {
    id: string;
    channelId: PlatformId;
    channelName: string; // e.g., "GoFood"
    productName: string; // Name in external platform
    sku?: string;
    price: number;
    image?: string;
    isLinked: boolean;
    linkedMasterId?: string;
    similarityScore?: number; // 0-100 for AI suggestion
    suggestedMasterId?: string;
}

export interface UnifiedOrder {
    id: string;
    platform: PlatformId;
    externalId: string;
    customerName: string;
    items: string;
    total: number;
    status: 'new' | 'processing' | 'ready_to_ship' | 'shipping' | 'completed' | 'cancelled';
    date: string;
    courier?: string;
    awb?: string;
}

export interface SocialContent {
    id: string;
    image?: string;
    caption: string;
    platforms: PlatformId[];
    status: 'draft' | 'scheduled' | 'published';
    scheduledTime?: string;
    aiGenerated: boolean;
}

export interface OmniReview {
    id: string;
    platform: PlatformId;
    user: string;
    rating: number;
    comment: string;
    date: string;
    reply?: string;
}

export type SalesChannelType = 'food_delivery' | 'marketplace' | 'social_commerce' | 'social_media';

export interface SalesChannel {
    id: string;
    name: string;
    type: SalesChannelType;
    status: 'Open' | 'Closed' | 'Maintenance' | 'Connected'; 
    connected: boolean;
    color: string;
    bg: string;
    icon: string;
    
    // Transactional Config
    commission: number; // Percentage
    markup: number; // Percentage
    autoAccept: boolean;
    stockBuffer: number;
    syncStock: boolean;

    // Performance Metrics (New)
    performance?: {
        todayRevenue: number;
        todayOrders: number;
        monthRevenue: number;
        rating: number;
    };

    // Social Specific Config
    followers?: number;
    engagementRate?: number;
    bioLink?: string;
    autoReply?: boolean;
    autoReplyMessage?: string;
}

export interface SyncHistoryItem {
    id: number;
    status: 'success' | 'failed';
    itemsUpdated: number;
    timestamp: string;
    platform: string;
}

export interface IncomingOrder {
    id: string;
    platform: string;
    platformOrderId: string;
    customerName: string;
    items: string;
    total: number;
    status: 'new' | 'accepted' | 'ready' | 'completed' | 'cancelled';
    time: string;
    driverName?: string;
}

export interface OmniPost {
    id: string;
    title: string;
    content: string;
    type: 'promo' | 'product' | 'news';
    status: 'published' | 'draft' | 'scheduled';
    platforms: string[];
    date: string;
    image?: string;
    aiGenerated?: boolean;
}

export interface GalleryItem {
    id: string;
    type: 'image' | 'video';
    url: string;
    caption?: string;
}

export interface WebsiteConfig {
    title: string;
    tagline: string;
    about: string;
    primaryColor: string;
    heroImage: string;
    themeMode: 'light' | 'dark' | 'glass';
    showMenu: boolean;
    showReviews: boolean;
    showLocation: boolean;
    showBlog: boolean;
    showGallery: boolean;
    contactWA: string;
    instagram: string;
    email: string;
    address: string;
    domain: string;
    seoTitle: string;
    seoDescription: string;
    gallery: GalleryItem[];
    status: 'Published' | 'Draft' | 'Maintenance';
    visitors: number;
    lastUpdated: string;
}

// --- NEW TYPES FOR INBOX ---
export interface OmniMessage {
    id: string;
    sender: 'customer' | 'me' | 'system';
    text: string;
    timestamp: string;
    type: 'text' | 'image' | 'product_card' | 'order_update';
    meta?: any; // For product/order details
}

export interface OmniConversation {
    id: string;
    platformId: PlatformId;
    customerName: string;
    customerAvatar?: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    tags: string[]; // e.g., "Komplain", "Pre-Sales"
    messages: OmniMessage[];
    linkedOrderId?: string; // Link to an active order
}
