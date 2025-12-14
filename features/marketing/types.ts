
export type MarketingPlatform = 'website' | 'google' | 'instagram' | 'facebook' | 'tiktok' | 'whatsapp' | 'youtube' | 'linkedin';

export interface MarketingPost {
    id: string;
    title: string; // Headline for Website/Google/Job
    content: string; // Caption/Body
    image?: string;
    platforms: MarketingPlatform[];
    status: 'Draft' | 'Published' | 'Scheduled';
    date: string; // ISO String
    type: 'update' | 'promo' | 'article' | 'event' | 'job' | 'gallery'; // Unified types
    
    // Analytics (Unified)
    stats?: {
        views: number;
        likes: number;
        shares: number;
        clicks: number; // Added for Google/Ads
    };

    // SEO / Website Specific
    seo?: {
        focusKeyword: string;
        seoTitle: string;
        metaDescription: string;
        score: number;
    };

    // Google Business Specific
    actionType?: 'BOOK' | 'ORDER' | 'SHOP' | 'LEARN_MORE' | 'CALL';
    actionUrl?: string;
    couponCode?: string;

    aiGenerated?: boolean;
}

export interface PlatformStatus {
    id: MarketingPlatform;
    name: string;
    icon: any; 
    color: string;
    status: 'Connected' | 'Coming Soon' | 'Maintenance';
}
