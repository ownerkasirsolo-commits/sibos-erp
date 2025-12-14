
import React, { useState } from 'react';
import { WebsiteConfig, GalleryItem } from '../../types';
import { Image as ImageIcon, Video, Plus, Trash2, Link } from 'lucide-react';
import GlassPanel from '../../../../components/common/GlassPanel';
import GlassInput from '../../../../components/common/GlassInput';

interface GalleryEditorProps {
    config: WebsiteConfig;
    onAdd: (item: GalleryItem) => void;
    onRemove: (id: string) => void;
}

const GalleryEditor: React.FC<GalleryEditorProps> = ({ config, onAdd, onRemove }) => {
    const [newUrl, setNewUrl] = useState('');
    const [newCaption, setNewCaption] = useState('');
    const [newType, setNewType] = useState<'image' | 'video'>('image');

    const handleAdd = () => {
        if (!newUrl) return;
        const newItem: GalleryItem = {
            id: `GAL-${Date.now()}`,
            type: newType,
            url: newUrl,
            caption: newCaption
        };
        onAdd(newItem);
        setNewUrl('');
        setNewCaption('');
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
            {/* ADD FORM */}
            <GlassPanel className="p-5 rounded-2xl border border-white/5">
                <h4 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                    <ImageIcon size={16} className="text-pink-400" /> Tambah Media
                </h4>
                <div className="space-y-3">
                    <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Tipe Media</label>
                        <div className="flex bg-black/30 p-1 rounded-lg">
                            <button 
                                onClick={() => setNewType('image')}
                                className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 ${newType === 'image' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                            >
                                <ImageIcon size={14} /> Foto
                            </button>
                            <button 
                                onClick={() => setNewType('video')}
                                className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 ${newType === 'video' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                            >
                                <Video size={14} /> Video
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">URL Media</label>
                        <div className="flex gap-2">
                             <GlassInput 
                                value={newUrl} 
                                onChange={e => setNewUrl(e.target.value)} 
                                className="py-2 text-xs flex-1"
                                placeholder="https://..."
                            />
                            <button className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white">
                                <Link size={16} />
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Caption (Opsional)</label>
                        <GlassInput 
                            value={newCaption} 
                            onChange={e => setNewCaption(e.target.value)} 
                            className="py-2 text-xs"
                            placeholder="Deskripsi singkat..."
                        />
                    </div>
                    <button 
                        onClick={handleAdd}
                        disabled={!newUrl}
                        className="w-full py-2.5 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={14} /> Tambahkan ke Galeri
                    </button>
                </div>
            </GlassPanel>

            {/* GALLERY LIST */}
            <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Media Tersimpan ({config.gallery.length})</h4>
                {config.gallery.map(item => (
                    <div key={item.id} className="group relative aspect-video bg-black/20 rounded-xl overflow-hidden border border-white/5">
                        <img src={item.url} alt={item.caption} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                            <p className="text-xs text-white font-bold truncate">{item.caption || 'Tanpa Caption'}</p>
                            <span className="text-[9px] text-gray-400 uppercase">{item.type}</span>
                        </div>
                        <button 
                            onClick={() => onRemove(item.id)}
                            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
                 {config.gallery.length === 0 && (
                    <div className="text-center py-8 text-gray-500 border border-dashed border-white/10 rounded-xl">
                        <p className="text-xs">Belum ada foto/video.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GalleryEditor;
