
import React from 'react';
import { WebsiteConfig, BlogPost, GalleryItem } from '../types';
import ArticleManager from './ArticleManager';
import DesignEditor from './editors/DesignEditor';
import ContentEditor from './editors/ContentEditor';
import SeoEditor from './editors/SeoEditor';
import SettingsEditor from './editors/SettingsEditor';
import GalleryEditor from './editors/GalleryEditor';

interface EditorPanelProps {
    activeTab: 'design' | 'content' | 'gallery' | 'articles' | 'seo' | 'settings';
    config: WebsiteConfig;
    onUpdate: (field: keyof WebsiteConfig, value: any) => void;
    // Blog Props
    articles: BlogPost[];
    onAddArticle: (post: BlogPost) => void;
    onUpdateArticle: (post: BlogPost) => void;
    onDeleteArticle: (id: string) => void;
    // Gallery Props
    onAddGalleryItem: (item: GalleryItem) => void;
    onRemoveGalleryItem: (id: string) => void;
    // AI Props
    onGenerateAI: (type: 'tagline' | 'about' | 'seo') => void;
    isGenerating: boolean;
    onResearchBlog: (type: 'keywords' | 'ideas', topic?: string) => void;
    aiResearchResult: string[];
}

const EditorPanel: React.FC<EditorPanelProps> = ({ 
    activeTab, config, onUpdate,
    articles, onAddArticle, onUpdateArticle, onDeleteArticle,
    onAddGalleryItem, onRemoveGalleryItem,
    onGenerateAI, isGenerating, onResearchBlog, aiResearchResult
}) => {
    
    return (
        <div className="flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pb-20">
            
            {activeTab === 'design' && (
                <DesignEditor config={config} onUpdate={onUpdate} />
            )}

            {activeTab === 'content' && (
                <ContentEditor 
                    config={config} 
                    onUpdate={onUpdate} 
                    onGenerateAI={onGenerateAI} 
                    isGenerating={isGenerating} 
                />
            )}

            {activeTab === 'gallery' && (
                 <GalleryEditor 
                    config={config}
                    onAdd={onAddGalleryItem}
                    onRemove={onRemoveGalleryItem}
                 />
            )}

            {activeTab === 'articles' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                     <ArticleManager 
                        articles={articles}
                        onAdd={onAddArticle}
                        onUpdate={onUpdateArticle}
                        onDelete={onDeleteArticle}
                        websiteConfig={config}
                        onResearch={onResearchBlog}
                        aiResults={aiResearchResult}
                        isGenerating={isGenerating}
                     />
                </div>
            )}

            {activeTab === 'seo' && (
                <SeoEditor 
                    config={config} 
                    onUpdate={onUpdate} 
                    onGenerateAI={onGenerateAI}
                    isGenerating={isGenerating}
                />
            )}

            {activeTab === 'settings' && (
                <SettingsEditor config={config} onUpdate={onUpdate} />
            )}
        </div>
    );
};

export default EditorPanel;
