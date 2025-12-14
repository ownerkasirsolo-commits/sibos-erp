
import { useState } from 'react';
import { useGlobalContext } from '../../../context/GlobalContext';
import { MarketingPost } from '../types';
import { generateBusinessAdvice } from '../../ai/services/geminiService';

export const useContentLogic = () => {
    const { addArticle, businessConfig, marketingPosts, addMarketingPost } = useGlobalContext();
    const [isGenerating, setIsGenerating] = useState(false);

    // Filter posts from global state (can add more filters here)
    const posts = marketingPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // AI: Generate Caption Biasa
    const generateCaption = async (topic: string, tone: string) => {
        setIsGenerating(true);
        try {
            const context = `Bisnis: ${businessConfig?.name || 'Bisnis Saya'}. Tipe: ${businessConfig?.type}.`;
            const prompt = `Buatkan caption sosial media yang menarik, singkat, dan persuasif tentang "${topic}". Gaya bahasa: ${tone}. Sertakan emoji dan hashtag.`;
            const result = await generateBusinessAdvice(prompt, context);
            return result.replace(/^"|"$/g, '');
        } catch (error) {
            console.error(error);
            return "Gagal membuat konten.";
        } finally {
            setIsGenerating(false);
        }
    };

    // AI: Research Keyword SEO
    const generateSeoKeywords = async (topic: string) => {
        setIsGenerating(true);
        try {
            const context = `Bisnis: ${businessConfig?.name}, Industri: ${businessConfig?.type}`;
            const prompt = `Berikan 5 ide kata kunci SEO (keywords) yang relevan dan bervolume pencarian tinggi untuk topik artikel: "${topic}". Format: pisahkan dengan koma.`;
            const result = await generateBusinessAdvice(prompt, context);
            return result.split(',').map(k => k.trim());
        } catch (error) {
            return ["Promo", "Diskon", "Viral"]; // Fallback
        } finally {
            setIsGenerating(false);
        }
    };

    // Logic: Analisis Skor SEO (Basic)
    const analyzeSeoScore = (title: string, content: string, keyword: string) => {
        if (!keyword) return 0;
        let score = 0;
        const lowerContent = content.toLowerCase();
        const lowerTitle = title.toLowerCase();
        const lowerKey = keyword.toLowerCase();

        if (lowerTitle.includes(lowerKey)) score += 30;
        if (content.split(' ').length > 50) score += 20;
        if (lowerContent.includes(lowerKey)) score += 30;
        if (title.length >= 20 && title.length <= 70) score += 20;

        return score;
    };

    const publishPost = async (newPost: MarketingPost) => {
        // 1. Simpan ke Global Database
        await addMarketingPost(newPost);

        // 2. Distribusi ke Modul Website (Jika dipilih)
        if (newPost.platforms.includes('website')) {
            await addArticle({
                id: `BLOG-${Date.now()}`,
                title: newPost.seo?.seoTitle || newPost.title,
                slug: newPost.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                image: newPost.image || '',
                excerpt: newPost.seo?.metaDescription || newPost.content.substring(0, 100) + '...',
                content: newPost.content, 
                status: 'Published',
                date: new Date().toISOString().split('T')[0],
                seoTitle: newPost.seo?.seoTitle || newPost.title,
                seoDescription: newPost.seo?.metaDescription || newPost.content.substring(0, 150)
            });
        }

        // 3. Distribusi ke Platform Lain (Simulasi)
        newPost.platforms.forEach(p => {
            if (p === 'google') console.log("[API] Google Business Post Created");
            if (p === 'whatsapp') console.log("[API] WhatsApp Broadcast Sent");
            if (p === 'tiktok') console.log("[API] TikTok Video Uploaded");
            if (p === 'youtube') console.log("[API] YouTube Video Uploaded");
            if (p === 'linkedin') console.log("[API] LinkedIn Post Created");
        });

        return true;
    };

    return {
        posts,
        isGenerating,
        generateCaption,
        generateSeoKeywords,
        analyzeSeoScore,
        publishPost
    };
};
