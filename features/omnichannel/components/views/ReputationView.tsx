
import React from 'react';
import { Star } from 'lucide-react';
import GlassPanel from '../../../../components/common/GlassPanel';
import { OmniReview } from '../../types';

interface ReputationViewProps {
    reviews: OmniReview[];
    rating: number;
    total: number;
}

const ReputationView: React.FC<ReputationViewProps> = ({ reviews, rating, total }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in zoom-in-95">
        <div className="lg:col-span-9">
            <div className="glass-panel p-6 rounded-3xl border border-white/5">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Star className="text-yellow-500" /> Ulasan Pelanggan
                    </h3>
                    <div className="flex gap-2">
                        <button className="bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-1.5 rounded-lg text-xs font-bold border border-white/5 transition-colors">Filter: Semua</button>
                    </div>
                </div>
                
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center font-bold text-white shrink-0">
                                {review.user.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-white text-sm">{review.user}</h4>
                                    <span className="text-[10px] text-gray-500">{review.date} • {review.platform}</span>
                                </div>
                                <div className="flex text-yellow-500 my-1">
                                    {[...Array(review.rating)].map((_, j) => <Star key={j} size={12} fill="currentColor" />)}
                                </div>
                                <p className="text-sm text-gray-300">{review.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="w-full mt-6 py-3 text-sm font-bold text-gray-400 hover:text-white bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                    Lihat Semua Ulasan
                </button>
            </div>
        </div>
        
        <div className="lg:col-span-3 flex flex-col gap-6">
            <GlassPanel className="p-6 rounded-2xl border border-white/5 text-center">
                <h4 className="text-gray-400 text-xs font-bold uppercase mb-2">Rating Rata-rata</h4>
                <div className="text-5xl font-black text-white mb-2">{rating}</div>
                <div className="flex justify-center gap-1 text-yellow-500 mb-2">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <p className="text-xs text-gray-500">Dari {total} Ulasan</p>
            </GlassPanel>
        </div>
    </div>
  );
};

export default ReputationView;
