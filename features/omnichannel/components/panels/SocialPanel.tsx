
import React from 'react';
import { SalesChannel } from '../../types';
import { Share2, Video, MessageCircle, Heart, ShoppingBag, BarChart2, Link, Users, Instagram, Facebook, Settings } from 'lucide-react';
import GlassPanel from '../../../../components/common/GlassPanel';
import CompactNumber from '../../../../components/common/CompactNumber';
import GlassInput from '../../../../components/common/GlassInput';

interface SocialPanelProps {
    channels: SalesChannel[];
    onUpdateConfig: (id: string, field: keyof SalesChannel, value: any) => void;
}

const SocialPanel: React.FC<SocialPanelProps> = ({ channels, onUpdateConfig }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
             {/* Header */}
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Share2 className="text-pink-500" /> Social & Branding
                    </h3>
                    <p className="text-xs text-gray-400">Kelola interaksi, trafik link bio, dan penjualan via live stream.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {channels.map(channel => {
                    const isCommerce = channel.type === 'social_commerce'; // TikTok Shop
                    const isMedia = channel.type === 'social_media'; // IG / FB

                    return (
                        <GlassPanel key={channel.id} className="p-0 rounded-2xl overflow-hidden flex flex-col md:flex-row">
                            {/* Left: Brand Identity */}
                            <div className={`p-6 md:w-64 flex flex-col items-center justify-center text-center ${
                                channel.id === 'tiktok' ? 'bg-black' : 
                                channel.id === 'ig' ? 'bg-gradient-to-br from-purple-600/30 to-orange-500/30' : 
                                'bg-blue-600/20'
                            }`}>
                                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3 border border-white/10 shadow-lg">
                                    {channel.id === 'tiktok' && <Video size={32} className="text-white" />}
                                    {channel.id === 'ig' && <Instagram size={32} className="text-white" />}
                                    {channel.id === 'fb' && <Facebook size={32} className="text-white" />}
                                </div>
                                <h4 className="font-bold text-white text-lg">{channel.name}</h4>
                                <div className="flex items-center gap-1 mt-2 text-white/80">
                                    <Users size={12} />
                                    <span className="text-xs font-bold"><CompactNumber value={channel.followers || 0} currency={false} /> Follower</span>
                                </div>
                            </div>

                            {/* Right: Content & Stats */}
                            <div className="flex-1 p-6 space-y-6">
                                
                                {/* Metrics Row */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                                        <Heart size={16} className="text-pink-400 mx-auto mb-1"/>
                                        <p className="text-xs text-gray-500">Engagement</p>
                                        <p className="font-bold text-white">{channel.engagementRate}%</p>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                                        <MessageCircle size={16} className="text-green-400 mx-auto mb-1"/>
                                        <p className="text-xs text-gray-500">Interaksi (7h)</p>
                                        <p className="font-bold text-white">+128</p>
                                    </div>
                                    {isCommerce ? (
                                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                                            <ShoppingBag size={16} className="text-blue-400 mx-auto mb-1"/>
                                            <p className="text-xs text-gray-500">Penjualan</p>
                                            <p className="font-bold text-white">Rp 2.4jt</p>
                                        </div>
                                    ) : (
                                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                                            <Link size={16} className="text-blue-400 mx-auto mb-1"/>
                                            <p className="text-xs text-gray-500">Klik Link</p>
                                            <p className="font-bold text-white">342</p>
                                        </div>
                                    )}
                                </div>

                                {/* Platform Specific Tools */}
                                {isCommerce && (
                                    <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-red-600 rounded-lg animate-pulse">
                                                <Video size={18} className="text-white"/>
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-white text-sm">Live Shopping Console</h5>
                                                <p className="text-xs text-gray-400">Pin produk ke layar saat Live Streaming.</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-colors">
                                            Buka Console
                                        </button>
                                    </div>
                                )}

                                {isMedia && (
                                    <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-3">
                                        <h5 className="font-bold text-white text-sm flex items-center gap-2">
                                            <Link size={14} className="text-blue-400"/> Konfigurasi Link Bio
                                        </h5>
                                        <div className="flex gap-2">
                                            <GlassInput 
                                                value={channel.bioLink || ''} 
                                                onChange={(e) => onUpdateConfig(channel.id, 'bioLink', e.target.value)}
                                                className="py-1.5 text-xs flex-1"
                                                placeholder="https://..."
                                            />
                                            <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors">
                                                Update Link
                                            </button>
                                        </div>
                                        <p className="text-[9px] text-gray-500 italic">
                                            *Link ini mengarahkan traffic sosmed ke Website/Menu SIBOS Anda.
                                        </p>
                                    </div>
                                )}

                                {/* Footer Action */}
                                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                    <span className="text-[10px] text-gray-400">Terakhir sinkronisasi: 15 menit lalu</span>
                                    <button className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                                        <Settings size={12} /> Pengaturan Lanjut
                                    </button>
                                </div>
                            </div>
                        </GlassPanel>
                    );
                })}
            </div>
        </div>
    );
};

export default SocialPanel;
