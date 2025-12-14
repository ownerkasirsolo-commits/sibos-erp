
import React from 'react';
import { WebsiteConfig } from '../../types';
import { Palette, Image as ImageIcon } from 'lucide-react';
import GlassPanel from '../../../../components/common/GlassPanel';
import GlassInput from '../../../../components/common/GlassInput';

interface DesignEditorProps {
    config: WebsiteConfig;
    onUpdate: (field: keyof WebsiteConfig, value: any) => void;
}

const DesignEditor: React.FC<DesignEditorProps> = ({ config, onUpdate }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
            <GlassPanel className="p-5 rounded-2xl border border-white/5">
                <h4 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                    <Palette size={16} className="text-purple-400" /> Tema & Warna
                </h4>
                <div className="space-y-4">
                        <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-2 block">Mode Tampilan</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['dark', 'light', 'glass'].map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => onUpdate('themeMode', mode)}
                                    className={`py-2 rounded-xl text-xs font-bold capitalize border ${config.themeMode === mode ? 'bg-orange-600 text-white border-orange-500' : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10'}`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-2 block">Warna Aksen</label>
                        <div className="flex gap-3">
                            {['#f97316', '#3b82f6', '#ef4444', '#10b981', '#a855f7'].map(color => (
                                <button 
                                    key={color}
                                    onClick={() => onUpdate('primaryColor', color)}
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${config.primaryColor === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                            <input 
                                type="color" 
                                value={config.primaryColor}
                                onChange={e => onUpdate('primaryColor', e.target.value)}
                                className="w-8 h-8 rounded-full overflow-hidden cursor-pointer border-none p-0 bg-transparent"
                            />
                        </div>
                    </div>
                </div>
            </GlassPanel>

            <GlassPanel className="p-5 rounded-2xl border border-white/5">
                <h4 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                    <ImageIcon size={16} className="text-blue-400" /> Media Hero
                </h4>
                <div className="space-y-3">
                    <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">URL Gambar Utama</label>
                        <GlassInput 
                            value={config.heroImage} 
                            onChange={e => onUpdate('heroImage', e.target.value)}
                            className="py-2 text-xs"
                            placeholder="https://..."
                        />
                    </div>
                    <div className="h-32 w-full rounded-xl bg-gray-800 overflow-hidden relative group">
                        <img src={config.heroImage} alt="Hero" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="bg-black/50 text-white text-[10px] px-2 py-1 rounded">Preview</span>
                        </div>
                    </div>
                </div>
            </GlassPanel>
        </div>
    );
};

export default DesignEditor;
