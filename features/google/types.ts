
export interface GoogleBusinessProfile {
    businessName: string;
    category: string;
    description: string;
    phone: string;
    website: string;
    location: {
        address: string;
        lat: number;
        lng: number;
    };
    openingHours: {
        day: string;
        open: string;
        close: string;
        isClosed: boolean;
    }[];
    attributes: string[]; // e.g. "Wi-Fi", "Outdoor Seating"
    verificationStatus: 'VERIFIED' | 'PENDING' | 'SUSPENDED';
    rating: number;
    totalReviews: number;
}

export interface ConnectedPlatform {
    id: 'website' | 'instagram' | 'facebook' | 'tiktok';
    name: string;
    icon: string;
    isConnected: boolean;
    lastSync?: string;
}

export interface GooglePost {
    id: string;
    type: 'UPDATE' | 'OFFER' | 'EVENT';
    summary: string; // The text content
    mediaUrl?: string;
    actionType?: 'BOOK' | 'ORDER' | 'SHOP' | 'LEARN_MORE' | 'CALL';
    actionUrl?: string;
    startDate?: string;
    endDate?: string;
    couponCode?: string;
    status: 'LIVE' | 'DRAFT' | 'EXPIRED';
    views: number;
    clicks: number;
    publishDate: string;
    // Cross-posting status
    crossPostedTo?: string[]; // ['instagram', 'facebook']
}

export interface GoogleReview {
    id: string;
    reviewerName: string;
    reviewerAvatar?: string;
    starRating: number;
    comment: string;
    createTime: string;
    reply?: {
        comment: string;
        updateTime: string;
    };
}

export interface GoogleInsightMetric {
    label: string;
    value: number;
    trend: number; // percentage
    data: number[]; // for sparkline
}
