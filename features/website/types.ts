
// NEW FILE: Features specific types
export interface WebsiteConfig {
    // Identity
    title: string;
    tagline: string;
    about: string;
    logo?: string;
    
    // Appearance
    primaryColor: string;
    heroImage: string;
    themeMode: 'light' | 'dark' | 'glass';
    
    // Content Control
    showMenu: boolean;
    showReviews: boolean;
    showLocation: boolean;
    showBlog: boolean;
    showGallery: boolean; // NEW
    
    // Contact & Social
    contactWA: string;
    instagram: string;
    email: string;
    address: string;
    
    // Technical / SEO
    domain: string;
    seoTitle: string;
    seoDescription: string;
    
    // Media
    gallery: GalleryItem[]; // NEW
    
    // System
    status: 'Published' | 'Draft' | 'Maintenance';
    visitors: number;
    lastUpdated: string;
}

export interface GalleryItem {
    id: string;
    type: 'image' | 'video';
    url: string;
    caption?: string;
}

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    image: string;
    excerpt: string; // Singkat untuk card
    content: string; // HTML/Text body
    status: 'Published' | 'Draft';
    date: string;
    
    // SEO Specific
    seoTitle: string;
    seoDescription: string;
}
