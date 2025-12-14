
import React from 'react';
import { Monitor, Smartphone, Save, Globe, ExternalLink, RotateCcw } from 'lucide-react';
import { useWebsiteLogic } from './hooks/useWebsiteLogic';
import EditorPanel from './components/EditorPanel';
import PreviewPanel from './components/PreviewPanel';
import StatWidget from '../../components/common/StatWidget';

const WebsiteBuilder: React.FC = () => {
    const { 
        activeTab, setActiveTab,
        previewMode, setPreviewMode,
        config, updateConfig,
        articles, addArticle, updateArticle, deleteArticle,
        addGalleryItem, removeGalleryItem,
        handleSave, isSaving,
        handlePublishToggle,
        showcaseProducts,
        // AI
        generateAIContent, isGeneratingAI,
        researchBlogContent, aiResearchResult
    } = useWebsiteLogic();

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] gap-6 animate-in fade-in zoom-in-95">
            
            {/* TOP BAR: STATS & ACTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 shrink-0">
                <StatWidget 
                    label="Status Website" 
                    value={config.status} 
                    icon={Globe} 
                    colorClass={config.status === 'Published' ? 'text-green-400' : 'text-yellow-400'}
                    bgClass={config.status === 'Published' ? 'bg-green-500/10 border-green-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}
                />
                <StatWidget 
                    label="Pengunjung (30 Hari)" 
                    value={config.visitors} 
                    icon={Monitor} 
                    colorClass="text-blue-400" 
                />
                
                {/* Actions */}
                <div className="lg:col-span-2 flex items-center justify-end gap-3 p-2">
                    <button 
                        onClick={() => window.open(`https://${config.domain}`, '_blank')}
                        className="bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2.5 rounded-xl text-xs font-bold border border-white/5 flex items-center gap-2 transition-colors"
                    >
                        <ExternalLink size={16} /> Buka Website
                    </button>
                    <button 
                        onClick={handlePublishToggle}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${config.status === 'Published' ? 'bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white' : 'bg-green-600 hover:bg-green-500 text-white shadow-lg'}`}
                    >
                        <RotateCcw size={16} /> {config.status === 'Published' ? 'Unpublish (Maintenance)' : 'Publish Sekarang'}
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                    >
                        <Save size={16} /> {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </div>

            {/* MAIN WORKSPACE */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT: EDITOR CONTROLS (4/12) */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    {/* Tabs */}
                    <div className="flex bg-black/20 p-1 rounded-xl overflow-x-auto no-scrollbar shrink-0">
                        {['design', 'content', 'gallery', 'articles', 'seo', 'settings'].map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${activeTab === tab ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                {tab === 'articles' ? 'Blog' : tab}
                            </button>
                        ))}
                    </div>

                    {/* Editor Panel */}
                    <EditorPanel 
                        activeTab={activeTab} 
                        config={config} 
                        onUpdate={updateConfig}
                        articles={articles}
                        onAddArticle={addArticle}
                        onUpdateArticle={updateArticle}
                        onDeleteArticle={deleteArticle}
                        onAddGalleryItem={addGalleryItem}
                        onRemoveGalleryItem={removeGalleryItem}
                        onGenerateAI={generateAIContent}
                        isGenerating={isGeneratingAI}
                        onResearchBlog={researchBlogContent}
                        aiResearchResult={aiResearchResult}
                    />
                </div>

                {/* RIGHT: LIVE PREVIEW (8/12) */}
                <div className="lg:col-span-8 flex flex-col bg-[#0f172a] rounded-3xl border border-white/5 overflow-hidden relative">
                    {/* Preview Toolbar */}
                    <div className="h-14 border-b border-white/5 bg-black/20 flex items-center justify-center gap-4 shrink-0">
                        <button 
                            onClick={() => setPreviewMode('desktop')}
                            className={`p-2 rounded-lg transition-colors ${previewMode === 'desktop' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            title="Desktop View"
                        >
                            <Monitor size={20} />
                        </button>
                        <button 
                            onClick={() => setPreviewMode('mobile')}
                            className={`p-2 rounded-lg transition-colors ${previewMode === 'mobile' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            title="Mobile View"
                        >
                            <Smartphone size={20} />
                        </button>
                    </div>

                    {/* Preview Area */}
                    <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] bg-opacity-5 p-8 flex items-center justify-center overflow-hidden">
                        <PreviewPanel 
                            config={config} 
                            products={showcaseProducts} 
                            articles={articles}
                            mode={previewMode} 
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default WebsiteBuilder;
