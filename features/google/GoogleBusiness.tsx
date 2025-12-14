
import React from 'react';
import { useGoogleBusinessLogic } from './hooks/useGoogleBusinessLogic';
import { Layout, MessageSquare, BarChart2, Store, ExternalLink } from 'lucide-react';
import ProfileEditor from './components/editors/ProfileEditor';
import PostManager from './components/managers/PostManager';
import GoogleInsights from './components/GoogleInsights';
import GlassPanel from '../../components/common/GlassPanel';
import { Star } from 'lucide-react';

const GoogleBusiness: React.FC = () => {
    const { 
        activeTab, setActiveTab,
        profile, handleUpdateProfile,
        posts, handleCreatePost, handleDeletePost,
        reviews, generateAiReply,
        insights,
        isAiLoading,
        generateAiPost,
        platforms // New prop
    } = useGoogleBusinessLogic();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-6 rounded-3xl border border-white/5">
                <div className="flex items-center gap-4">
                     <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden p-3">
                         <img src="https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Business_Profile_Logo.svg" alt="GMB" className="w-full h-full object-contain" />
                     </div>
                     <div>
                         <h2 className="text-2xl font-bold text-white">{profile.businessName}</h2>
                         <div className="flex items-center gap-3 mt-1">
                             <div className="flex text-yellow-400">
                                 {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < Math.floor(profile.rating) ? "currentColor" : "none"} className={i >= Math.floor(profile.rating) ? "text-gray-600" : ""} />)}
                             </div>
                             <span className="text-sm text-gray-400 font-bold">{profile.rating} ({profile.totalReviews} ulasan)</span>
                             <a href="#" className="text-blue-400 text-xs flex items-center gap-1 hover:underline"><ExternalLink size={12}/> Lihat di Maps</a>
                         </div>
                     </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-black/20 p-1 rounded-xl w-full md:w-fit overflow-x-auto no-scrollbar">
                {[
                    { id: 'profile', label: 'Profil Bisnis', icon: Store },
                    { id: 'posts', label: 'Postingan', icon: Layout },
                    { id: 'reviews', label: 'Ulasan', icon: MessageSquare },
                    { id: 'insights', label: 'Performa', icon: BarChart2 },
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 md:flex-none py-2.5 px-6 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                            activeTab === tab.id 
                            ? 'bg-blue-600 text-white shadow-lg' 
                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                        }`}
                    >
                        <tab.icon size={14} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[500px]">
                {activeTab === 'profile' && (
                    <ProfileEditor 
                        profile={profile} 
                        platforms={platforms}
                        onUpdate={handleUpdateProfile} 
                    />
                )}

                {activeTab === 'posts' && (
                    <PostManager 
                        posts={posts} 
                        platforms={platforms}
                        onCreate={handleCreatePost} 
                        onDelete={handleDeletePost}
                        onGenerateAI={generateAiPost}
                        isAiLoading={isAiLoading}
                    />
                )}
                
                {activeTab === 'insights' && (
                    <GoogleInsights metrics={insights} />
                )}

                {activeTab === 'reviews' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-right-4">
                        {reviews.map(review => (
                            <GlassPanel key={review.id} className="p-5 rounded-2xl flex flex-col h-full">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
                                            {review.reviewerName.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm">{review.reviewerName}</h4>
                                            <div className="flex text-yellow-500 mt-0.5">
                                                {[...Array(5)].map((_, i) => <Star key={i} size={10} fill={i < review.starRating ? "currentColor" : "none"} />)}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-gray-500">{review.createTime}</span>
                                </div>
                                <p className="text-sm text-gray-300 mb-4 flex-1">"{review.comment}"</p>
                                
                                {review.reply ? (
                                    <div className="bg-white/5 p-3 rounded-xl border-l-2 border-blue-500">
                                        <p className="text-[10px] font-bold text-blue-400 mb-1">Balasan Anda</p>
                                        <p className="text-xs text-gray-400 italic">{review.reply.comment}</p>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => generateAiReply(review.id, review.comment, review.starRating)}
                                        disabled={isAiLoading}
                                        className="w-full py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-blue-500/30 flex items-center justify-center gap-2"
                                    >
                                        <MessageSquare size={14} /> 
                                        {isAiLoading ? 'Menulis...' : 'Balas dengan AI'}
                                    </button>
                                )}
                            </GlassPanel>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GoogleBusiness;
