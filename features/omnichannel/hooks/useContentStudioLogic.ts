
import { useState, useMemo } from 'react';
import { MarketingPost } from '../../marketing/types'; // Use unified type
import { useGlobalContext } from '../../../context/GlobalContext';
import { generateBusinessAdvice } from '../../ai/services/geminiService';

export const useContentStudioLogic = () => {
    const { marketingPosts, addMarketingPost, updateMarketingPost } = useGlobalContext();
    const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
    const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'scheduled'>('all');
    
    // Editor State
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [editingPost, setEditingPost] = useState<MarketingPost | null>(null);

    // Filter Logic
    const filteredPosts = useMemo(() => {
        let data = marketingPosts;
        if (filterStatus !== 'all') {
            // @ts-ignore
            data = data.filter(p => p.status.toLowerCase() === filterStatus.toLowerCase());
        }
        return data.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [marketingPosts, filterStatus]);

    // AI Generator
    const generateCaption = async (topic: string, tone: string, platform: string) => {
        setIsGenerating(true);
        try {
            const prompt = `Buatkan caption sosial media untuk platform ${platform} tentang "${topic}". Gaya bahasa: ${tone}. Sertakan emoji dan 3-5 hashtag relevan.`;
            const result = await generateBusinessAdvice(prompt, "Konteks: Bisnis Retail/F&B");
            return result.replace(/^"|"$/g, ''); // Remove quotes if any
        } catch (error) {
            console.error(error);
            return "";
        } finally {
            setIsGenerating(false);
        }
    };

    const generateIdeas = async () => {
        setIsGenerating(true);
        try {
            const prompt = "Berikan 5 ide konten kreatif untuk minggu ini yang bisa meningkatkan interaksi followers.";
            const result = await generateBusinessAdvice(prompt, "Konteks: Bisnis F&B/Retail");
            return result;
        } catch (e) {
            return "";
        } finally {
            setIsGenerating(false);
        }
    }

    const handleSavePost = (post: MarketingPost) => {
        if (editingPost) {
            updateMarketingPost(post);
        } else {
            addMarketingPost(post);
        }
        setIsEditorOpen(false);
        setEditingPost(null);
    };

    const handleCreateNew = () => {
        setEditingPost(null);
        setIsEditorOpen(true);
    };

    const handleEdit = (post: MarketingPost) => {
        setEditingPost(post);
        setIsEditorOpen(true);
    };

    return {
        viewMode, setViewMode,
        filterStatus, setFilterStatus,
        filteredPosts,
        isEditorOpen, setIsEditorOpen,
        isGenerating,
        generateCaption,
        generateIdeas,
        handleSavePost,
        handleCreateNew,
        handleEdit,
        editingPost
    };
};
