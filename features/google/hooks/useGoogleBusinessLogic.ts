
import { useState, useMemo } from 'react';
import { GoogleBusinessProfile, GoogleReview, GoogleInsightMetric, ConnectedPlatform } from '../types';
import { MarketingPost, MarketingPlatform } from '../../marketing/types'; // Use Unified Type
import { useGlobalContext } from '../../../context/GlobalContext';
import { generateBusinessAdvice } from '../../ai/services/geminiService';

export const useGoogleBusinessLogic = () => {
    const { businessConfig, activeOutlet, setBusinessInfo, marketingPosts, addMarketingPost, deleteMarketingPost } = useGlobalContext();
    const [activeTab, setActiveTab] = useState<'profile' | 'posts' | 'reviews' | 'insights'>('profile');
    const [isAiLoading, setIsAiLoading] = useState(false);

    // --- CONNECTED PLATFORMS (MOCK) ---
    const [platforms, setPlatforms] = useState<ConnectedPlatform[]>([
        { id: 'website', name: 'Website Usaha', icon: 'globe', isConnected: true, lastSync: 'Baru saja' },
        { id: 'instagram', name: 'Instagram', icon: 'instagram', isConnected: true, lastSync: '1 jam lalu' },
        { id: 'facebook', name: 'Facebook Page', icon: 'facebook', isConnected: false },
        { id: 'tiktok', name: 'TikTok', icon: 'video', isConnected: false }
    ]);

    // --- MOCK PROFILE DATA ---
    const [profile, setProfile] = useState<GoogleBusinessProfile>({
        businessName: businessConfig?.name || 'SIBOS Business',
        category: businessConfig?.type || 'Restaurant',
        description: 'Bisnis terbaik di kota dengan pelayanan ramah dan produk berkualitas.',
        phone: '08123456789',
        website: `https://${businessConfig?.name.toLowerCase().replace(/\s/g, '-')}.sibos.id`,
        location: {
            address: activeOutlet?.address || 'Jl. Jendral Sudirman, Jakarta',
            lat: -6.2088,
            lng: 106.8456
        },
        openingHours: [
            { day: 'Mon', open: '09:00', close: '22:00', isClosed: false },
            { day: 'Tue', open: '09:00', close: '22:00', isClosed: false },
            { day: 'Wed', open: '09:00', close: '22:00', isClosed: false },
            { day: 'Thu', open: '09:00', close: '22:00', isClosed: false },
            { day: 'Fri', open: '09:00', close: '23:00', isClosed: false },
            { day: 'Sat', open: '10:00', close: '23:00', isClosed: false },
            { day: 'Sun', open: '10:00', close: '22:00', isClosed: false },
        ],
        attributes: ['Wi-Fi Gratis', 'Toilet', 'Ramah Anak'],
        verificationStatus: 'VERIFIED',
        rating: 4.8,
        totalReviews: 128
    });

    // --- FILTER GOOGLE POSTS FROM GLOBAL MARKETING POSTS ---
    // We map the unified MarketingPost to the structure expected by Google components if needed,
    // or just ensure MarketingPost has all fields (which we did).
    const googlePosts = useMemo(() => {
        return marketingPosts.filter(p => p.platforms.includes('google'))
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [marketingPosts]);

    const [reviews, setReviews] = useState<GoogleReview[]>([
        { id: 'r1', reviewerName: 'Budi Santoso', starRating: 5, comment: 'Tempatnya nyaman banget, makanannya enak!', createTime: '2 hari lalu', reply: { comment: 'Terima kasih Pak Budi! Ditunggu kedatangannya kembali.', updateTime: '1 hari lalu'} },
        { id: 'r2', reviewerName: 'Siti Aminah', starRating: 4, comment: 'Pelayanan agak lama pas jam makan siang, tapi rasa oke.', createTime: '3 hari lalu' },
        { id: 'r3', reviewerName: 'Joko Anwar', starRating: 5, comment: 'Best coffee in town!', createTime: '1 minggu lalu' },
    ]);

    const insights: GoogleInsightMetric[] = [
        { label: 'Penelusuran (Search)', value: 4520, trend: 12.5, data: [300, 450, 400, 500, 600, 750, 800] },
        { label: 'Dilihat di Maps', value: 8900, trend: 5.2, data: [1000, 1100, 1050, 1200, 1300, 1250, 1400] },
        { label: 'Klik Website', value: 320, trend: -2.1, data: [40, 50, 45, 30, 35, 40, 42] },
        { label: 'Panggilan Telepon', value: 85, trend: 8.4, data: [10, 12, 8, 15, 14, 16, 18] },
    ];

    // --- ACTIONS ---

    const handleUpdateProfile = async (field: keyof GoogleBusinessProfile, value: any, syncTargets: string[] = []) => {
        setProfile(prev => ({ ...prev, [field]: value }));

        if (syncTargets.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
            if (syncTargets.includes('website') && field === 'businessName') {
                setBusinessInfo(value, businessConfig?.type as any);
            }
            setPlatforms(prev => prev.map(p => 
                syncTargets.includes(p.id) ? { ...p, lastSync: 'Baru saja' } : p
            ));
        }
    };

    const handleCreatePost = (newPost: any, crossPostTargets: string[]) => {
        // Map GooglePost format to Unified MarketingPost if needed, 
        // but our unified type covers it.
        const post: MarketingPost = {
            id: newPost.id,
            title: 'Google Update', // Default title for updates
            content: newPost.summary,
            image: newPost.mediaUrl,
            platforms: ['google', ...crossPostTargets] as MarketingPlatform[], // Ensure Google is included
            status: 'Published',
            date: new Date().toISOString(),
            type: 'update', // Default type
            actionType: newPost.actionType,
            actionUrl: newPost.actionUrl,
            stats: { views: 0, clicks: 0, likes: 0, shares: 0 }
        };

        addMarketingPost(post);
        alert("Postingan diterbitkan ke Google" + (crossPostTargets.length ? " & Cross-platforms" : ""));
    };

    const handleDeletePost = (id: string) => {
        if(confirm("Hapus postingan ini?")) {
            deleteMarketingPost(id);
        }
    };

    // --- AI GENERATION ---
    const generateAiReply = async (reviewId: string, reviewText: string, rating: number) => {
        setIsAiLoading(true);
        try {
            const tone = rating >= 4 ? "berterima kasih dan ramah" : "meminta maaf, profesional dan solutif";
            const prompt = `Buatkan balasan singkat untuk ulasan Google ini: "${reviewText}". Rating: ${rating}/5. Nada bicara: ${tone}.`;
            const context = `Bisnis: ${profile.businessName}.`;
            const replyText = await generateBusinessAdvice(prompt, context);
            setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, reply: { comment: replyText, updateTime: 'Baru saja' } } : r));
        } catch (e) {
            alert("Gagal generate AI reply");
        } finally {
            setIsAiLoading(false);
        }
    };

    const generateAiPost = async (topic: string) => {
        setIsAiLoading(true);
        try {
            const prompt = `Buatkan konten postingan Google Business Profile yang menarik tentang "${topic}". Format: Judul pendek yang catchy, diikuti deskripsi 1-2 kalimat yang mengajak (Call to Action).`;
            const context = `Bisnis: ${profile.businessName}.`;
            const content = await generateBusinessAdvice(prompt, context);
            return content;
        } catch(e) {
            return "";
        } finally {
            setIsAiLoading(false);
        }
    };

    return {
        activeTab, setActiveTab,
        profile, handleUpdateProfile,
        posts: googlePosts, // Return filtered global posts
        handleCreatePost, handleDeletePost,
        reviews, generateAiReply,
        insights,
        platforms,
        isAiLoading,
        generateAiPost
    };
};
