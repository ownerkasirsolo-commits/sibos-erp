
import React from 'react';
import { GoogleBusinessProfile } from '../types';
import { MapPin, Globe, Phone, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';
import GlassPanel from '../../../components/common/GlassPanel';
import GlassInput from '../../../components/common/GlassInput';

interface GoogleProfileEditorProps {
    profile: GoogleBusinessProfile;
    onUpdate: (field: keyof GoogleBusinessProfile, value: any) => void;
    onSync: () => void;
}

const GoogleProfileEditor: React.FC<GoogleProfileEditorProps> = ({ profile, onUpdate, onSync }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4">
            
            {/* Left: General Info */}
            <div className="space-y-6">
                <GlassPanel className="p-6 rounded-3xl border border-blue-500/20 bg-blue-900/5">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Globe className="text-blue-500" /> Profil Bisnis
                            </h3>
                            <p className="text-xs text-gray-400">Informasi yang tampil di Google Search & Maps.</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full border border-green-500/30">
                            <CheckCircle2 size={12} className="text-green-500" />
                            <span className="text-[10px] font-bold text-green-400">{profile.verificationStatus}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nama Bisnis</label>
                            <GlassInput value={profile.businessName} onChange={e => onUpdate('businessName', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Kategori Utama</label>
                            <GlassInput value={profile.category} onChange={e => onUpdate('category', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Deskripsi</label>
                            <textarea 
                                className="w-full glass-input rounded-xl p-3 text-sm h-24 resize-none text-white"
                                value={profile.description}
                                onChange={e => onUpdate('description', e.target.value)}
                            />
                        </div>
                        
                        <button 
                            onClick={onSync}
                            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all"
                        >
                            <RefreshCw size={14} /> Sinkronisasi dengan Website Usaha
                        </button>
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
                                onChange={e => onUpdate('location', { ...profile.location, address: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <GlassInput icon={Phone} value={profile.phone} onChange={e => onUpdate('phone', e.target.value)} placeholder="Telepon" />
                            <GlassInput icon={Globe} value={profile.website} onChange={e => onUpdate('website', e.target.value)} placeholder="Website" />
                        </div>
                    </div>
                </GlassPanel>
            </div>

            {/* Right: Operational Hours */}
            <div>
                <GlassPanel className="p-6 rounded-3xl border border-white/5 h-full">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Clock className="text-orange-500" /> Jam Operasional
                    </h3>
                    <div className="space-y-2">
                        {profile.openingHours.map((hour, idx) => (
                            <div key={hour.day} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                <span className="font-bold text-gray-300 w-12">{hour.day}</span>
                                {hour.isClosed ? (
                                    <span className="text-red-400 text-xs font-bold flex-1 text-center">TUTUP</span>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <input type="time" value={hour.open} className="bg-black/30 text-white rounded px-2 py-1 text-xs border border-white/10" readOnly />
                                        <span className="text-gray-500">-</span>
                                        <input type="time" value={hour.close} className="bg-black/30 text-white rounded px-2 py-1 text-xs border border-white/10" readOnly />
                                    </div>
                                )}
                                <input 
                                    type="checkbox" 
                                    checked={!hour.isClosed} 
                                    className="accent-orange-500 w-4 h-4 ml-4" 
                                    onChange={() => {
                                        const newHours = [...profile.openingHours];
                                        newHours[idx].isClosed = !newHours[idx].isClosed;
                                        onUpdate('openingHours', newHours);
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

export default GoogleProfileEditor;
