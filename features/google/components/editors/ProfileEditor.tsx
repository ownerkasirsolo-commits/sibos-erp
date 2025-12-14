
import React, { useState } from 'react';
import { GoogleBusinessProfile, ConnectedPlatform } from '../../types';
import { MapPin, Globe, Phone, Clock, CheckCircle2, Share2, Instagram, Facebook, Monitor, RefreshCw } from 'lucide-react';
import GlassPanel from '../../../../components/common/GlassPanel';
import GlassInput from '../../../../components/common/GlassInput';

interface ProfileEditorProps {
    profile: GoogleBusinessProfile;
    platforms: ConnectedPlatform[];
    onUpdate: (field: keyof GoogleBusinessProfile, value: any, syncTargets: string[]) => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ profile, platforms, onUpdate }) => {
    const [selectedSyncs, setSelectedSyncs] = useState<string[]>(['website']); // Default sync to website

    const toggleSync = (id: string) => {
        setSelectedSyncs(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    };

    const handleChange = (field: keyof GoogleBusinessProfile, value: any) => {
        // Real-time local update, trigger save/sync on blur or dedicated button? 
        // For smoother UX in React controlled components, we usually update state immediately.
        // Sync triggers usually happen on specific "Save" actions or debounced.
        // Here we pass it up directly, but sync targets are passed along.
        onUpdate(field, value, selectedSyncs);
    };

    const getPlatformIcon = (iconName: string) => {
        switch(iconName) {
            case 'instagram': return <Instagram size={14} />;
            case 'facebook': return <Facebook size={14} />;
            case 'globe': return <Monitor size={14} />;
            default: return <Globe size={14} />;
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-right-4">
            
            {/* LEFT: FORM (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
                <GlassPanel className="p-6 rounded-3xl border border-blue-500/20 bg-blue-900/5">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Globe className="text-blue-500" /> Identitas & Info Dasar
                            </h3>
                            <p className="text-xs text-gray-400">Informasi utama bisnis di Google.</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full border border-green-500/30">
                            <CheckCircle2 size={12} className="text-green-500" />
                            <span className="text-[10px] font-bold text-green-400">{profile.verificationStatus}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nama Bisnis</label>
                            <GlassInput value={profile.businessName} onChange={e => handleChange('businessName', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Kategori Utama</label>
                            <GlassInput value={profile.category} onChange={e => handleChange('category', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Deskripsi</label>
                            <textarea 
                                className="w-full glass-input rounded-xl p-3 text-sm h-24 resize-none text-white"
                                value={profile.description}
                                onChange={e => handleChange('description', e.target.value)}
                            />
                        </div>
                    </div>
                </GlassPanel>

                <GlassPanel className="p-6 rounded-3xl border border-white/5">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <MapPin className="text-red-500" /> Lokasi & Kontak
                    </h3>
                    <div className="space-y-4">
                         <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Alamat Lengkap</label>
                            <textarea 
                                className="w-full glass-input rounded-xl p-3 text-sm h-20 resize-none text-white"
                                value={profile.location.address}
                                onChange={e => handleChange('location', { ...profile.location, address: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <GlassInput icon={Phone} value={profile.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="Telepon" />
                            <GlassInput icon={Globe} value={profile.website} onChange={e => handleChange('website', e.target.value)} placeholder="Website" />
                        </div>
                    </div>
                </GlassPanel>
            </div>

            {/* RIGHT: SYNC CENTER & HOURS (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
                
                {/* SYNC CENTER WIDGET */}
                <GlassPanel className="p-5 rounded-3xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30">
                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <Share2 size={16} className="text-indigo-400" /> Sync Center
                    </h4>
                    <p className="text-[10px] text-indigo-200 mb-4 leading-relaxed">
                        Pilih platform yang akan ikut di-update secara otomatis saat Anda mengubah info di Google Business.
                    </p>
                    
                    <div className="space-y-2">
                        {platforms.filter(p => p.isConnected).map(p => (
                            <div key={p.id} 
                                onClick={() => toggleSync(p.id)}
                                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${selectedSyncs.includes(p.id) ? 'bg-indigo-500/20 border-indigo-500/50' : 'bg-black/20 border-transparent hover:bg-black/40'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-lg ${selectedSyncs.includes(p.id) ? 'text-indigo-300' : 'text-gray-500'}`}>
                                        {getPlatformIcon(p.icon)}
                                    </div>
                                    <div>
                                        <p className={`text-xs font-bold ${selectedSyncs.includes(p.id) ? 'text-white' : 'text-gray-400'}`}>{p.name}</p>
                                        <p className="text-[9px] text-gray-500">Sync: {p.lastSync}</p>
                                    </div>
                                </div>
                                {selectedSyncs.includes(p.id) && <RefreshCw size={12} className="text-indigo-400 animate-spin-slow" />}
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-indigo-500/20 text-center">
                        <p className="text-[10px] text-indigo-300">Perubahan disimpan & disebar otomatis.</p>
                    </div>
                </GlassPanel>

                <GlassPanel className="p-6 rounded-3xl border border-white/5">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Clock className="text-orange-500" /> Jam Operasional
                    </h3>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                        {profile.openingHours.map((hour, idx) => (
                            <div key={hour.day} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5">
                                <span className="font-bold text-gray-300 w-10 text-xs">{hour.day}</span>
                                {hour.isClosed ? (
                                    <span className="text-red-400 text-[10px] font-bold flex-1 text-center bg-red-500/10 py-1 rounded">TUTUP</span>
                                ) : (
                                    <div className="flex items-center gap-1 text-xs">
                                        <span className="bg-black/30 text-white rounded px-1.5 py-1">{hour.open}</span>
                                        <span className="text-gray-500">-</span>
                                        <span className="bg-black/30 text-white rounded px-1.5 py-1">{hour.close}</span>
                                    </div>
                                )}
                                <input 
                                    type="checkbox" 
                                    checked={!hour.isClosed} 
                                    className="accent-orange-500 w-3.5 h-3.5 ml-2 cursor-pointer" 
                                    onChange={() => {
                                        const newHours = [...profile.openingHours];
                                        newHours[idx].isClosed = !newHours[idx].isClosed;
                                        onUpdate('openingHours', newHours, selectedSyncs);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </GlassPanel>
            </div>
        </div>
    );
};

export default ProfileEditor;
