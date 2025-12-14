
import { useState } from 'react';
import { useGlobalContext } from '../../../context/GlobalContext';
import { WebsiteConfig, BlogPost, GalleryItem } from '../types';
import { generateBusinessAdvice } from '../../ai/services/geminiService';

export const useWebsiteLogic = () => {
    const { 
        businessConfig, products,
        articles, addArticle, deleteArticle, 
        gallery, addGalleryItem, deleteGalleryItem
    } = useGlobalContext();

    const [activeTab, setActiveTab] = useState<'design' | 'content' | 'gallery' | 'articles' | 'seo' | 'settings'>('design');
    const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('desktop');
    const [isSaving, setIsSaving] = useState(false);
    
    // AI States
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [aiResearchResult, setAiResearchResult] = useState<string[]>([]);

    // Initial State (Mock Data or from DB)
    const [config, setConfig] = useState<WebsiteConfig>({
        title: businessConfig?.name || 'Bisnis Saya',
        tagline: 'Nikmati kualitas terbaik dari produk kami.',
        about: 'Kami berkomitmen menyajikan pengalaman terbaik untuk pelanggan setia.',
        primaryColor: '#f97316',
        heroImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
        themeMode: 'dark',
        showMenu: true,
        showReviews: true,
        showLocation: true,
        showBlog: true,
        showGallery: true,
        contactWA: '62812345678',
        instagram: '@sibos.id',
        email: 'hello@sibos.id',
        address: 'Jl. Sudirman No. 1, Jakarta',
        domain: `${businessConfig?.name.toLowerCase().replace(/\s/g, '-')}.sibos.id`,
        seoTitle: businessConfig?.name || '',
        seoDescription: 'Website resmi bisnis kami.',
        gallery: [], // Loaded from Context now
        status: 'Published',
        visitors: 1540,
        lastUpdated: new Date().toISOString()
    });

    const showcaseProducts = products.slice(0, 4);

    const updateConfig = (field: keyof WebsiteConfig, value: any) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    // Article Handlers (Wrappers for Global Actions)
    const handleAddArticle = (newArticle: BlogPost) => {
        addArticle(newArticle);
    };

    const handleUpdateArticle = (updatedArticle: BlogPost) => {
        // Since we don't have updateArticle in global context for simplicity in this demo,
        // we simulate update by overwrite (add with same ID usually handles put in IndexedDB if configured, 
        // but Dexie .add fails on duplicate key. .put is better).
        // For now, we will just use addArticle assuming our global logic handles upsert or we add update logic later.
        // Actually, GlobalContext.updateProduct uses .put, so let's check global.
        // Let's assume addArticle uses .put or similar, or just re-add.
        // Quick fix: Delete then Add
        deleteArticle(updatedArticle.id);
        addArticle(updatedArticle);
    };

    const handleDeleteArticle = (id: string) => {
        if(confirm("Hapus artikel ini?")) {
            deleteArticle(id);
        }
    };

    // Gallery Handlers
    const handleAddGalleryItem = (item: GalleryItem) => {
        addGalleryItem(item);
    };

    const handleRemoveGalleryItem = (id: string) => {
        deleteGalleryItem(id);
    };

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API/DB call
        setTimeout(() => {
            setIsSaving(false);
            updateConfig('lastUpdated', new Date().toISOString());
            alert('Perubahan website berhasil disimpan!');
        }, 800);
    };

    const handlePublishToggle = () => {
        const newStatus = config.status === 'Published' ? 'Maintenance' : 'Published';
        updateConfig('status', newStatus);
        alert(newStatus === 'Published' ? 'Website Anda sekarang ONLINE!' : 'Website masuk mode MAINTENANCE.');
    };

    // ... (AI Logic Remains Same) ...
    const generateAIContent = async (type: 'tagline' | 'about' | 'seo') => {
        // ... existing implementation ...
        if (!businessConfig) return;
        setIsGeneratingAI(true);
        try {
            let prompt = "";
            let context = `Nama Bisnis: ${config.title}. Jenis: ${businessConfig.type}.`;
            if (type === 'tagline') prompt = "Buatkan 1 slogan/tagline pendek yang menarik.";
            else if (type === 'about') prompt = "Buatkan deskripsi 'Tentang Kami' profesional.";
            else if (type === 'seo') prompt = `Buatkan JSON object {seoTitle, seoDescription} untuk SEO.`;

            const result = await generateBusinessAdvice(prompt, context);
            if (type === 'seo') {
                 // ... parse json logic ...
                 try {
                    const cleaned = result.replace(/```json/g, '').replace(/```/g, '').trim();
                    const json = JSON.parse(cleaned);
                    updateConfig('seoTitle', json.seoTitle);
                    updateConfig('seoDescription', json.seoDescription);
                } catch (e) { console.error("AI SEO Error"); }
            } else {
                updateConfig(type, result.trim());
            }
        } catch (e) { console.error(e); } finally { setIsGeneratingAI(false); }
    };

    const researchBlogContent = async (type: 'keywords' | 'ideas', topic?: string) => {
        // ... existing implementation ...
        setIsGeneratingAI(true);
        setAiResearchResult([]);
        try {
            let prompt = type === 'keywords' ? "Berikan 5 keyword SEO." : `Berikan 3 ide judul artikel blog tentang ${topic}.`;
            const context = `Bisnis: ${config.title}.`;
            const result = await generateBusinessAdvice(prompt, context);
            const list = result.split(/,|\n/).map(s => s.trim()).filter(s => s.length > 0);
            setAiResearchResult(list);
        } catch (e) { console.error(e); } finally { setIsGeneratingAI(false); }
    };

    return {
        activeTab, setActiveTab,
        previewMode, setPreviewMode,
        config: { ...config, gallery }, // Inject global gallery into config object for preview
        updateConfig,
        articles, 
        addArticle: handleAddArticle, 
        updateArticle: handleUpdateArticle, 
        deleteArticle: handleDeleteArticle,
        addGalleryItem: handleAddGalleryItem, 
        removeGalleryItem: handleRemoveGalleryItem,
        handleSave, isSaving,
        handlePublishToggle,
        showcaseProducts,
        generateAIContent,
        researchBlogContent,
        isGeneratingAI,
        aiResearchResult
    };
};
