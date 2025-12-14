import React, { useState } from 'react';
// @FIX: Import BusinessConfig from its new location in features/irm/types.
import { BusinessType } from '../../types';
import { BusinessConfig } from '../../features/irm/types';
import { Camera, Save, Globe, Info, AlertTriangle, Trash2, Lock, ChevronDown } from 'lucide-react';

interface GeneralBusinessSettingsProps {
  businessConfig: BusinessConfig;
}

const GeneralBusinessSettings: React.FC<GeneralBusinessSettingsProps> = ({ businessConfig }) => {
  return (
    <div className="space-y-8 w-full animate-in fade-in duration-300 pb-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Logo Upload */}
            <div className="flex flex-col items-center gap-3 shrink-0 mx-auto md:mx-0">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] border-2 border-white/10 flex items-center justify-center shadow-xl relative overflow-hidden">
                         {/* Placeholder Logo */}
                         <div className="absolute inset-0 bg-[url('https://picsum.photos/id/433/200/200')] bg-cover bg-center opacity-50 grayscale group-hover:grayscale-0 transition-all duration-500"></div>
                         <div className="relative z-10 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                            <Camera className="w-5 h-5 text-white" />
                         </div>
                    </div>
                </div>
                <p className="text-xs text-gray-500 font-medium">Logo (500x500px)</p>
            </div>

            {/* Form */}
            <form className="space-y-6 flex-1 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Nama Brand / Bisnis</label>
                        <input type="text" defaultValue={businessConfig.name} className="w-full glass-input rounded-xl p-3.5 text-gray-200 focus:border-orange-500/50" />
                    </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Kategori Usaha</label>
                        <div className="relative">
                            <select defaultValue={businessConfig.type} className="w-full glass-input rounded-xl p-3.5 appearance-none cursor-pointer text-gray-200 focus:border-orange-500/50 pr-10">
                              {Object.values(BusinessType).map(type => <option key={type} value={type} className="bg-gray-900 text-gray-200">{type}</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" size={18} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Website</label>
                        <div className="relative">
                             <Globe className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
                             <input type="text" placeholder="www.bisnisanda.com" className="w-full glass-input rounded-xl py-3.5 pl-11 pr-4 text-gray-200 focus:border-orange-500/50" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Mata Uang</label>
                         <div className="relative">
                             <select className="w-full glass-input rounded-xl p-3.5 appearance-none cursor-pointer text-gray-200 focus:border-orange-500/50 pr-10">
                                <option className="bg-gray-900 text-gray-200">IDR (Rupiah Indonesia)</option>
                                <option className="bg-gray-900 text-gray-200">USD (United States Dollar)</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" size={18} />
                         </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Deskripsi Singkat</label>
                    <textarea 
                        className="w-full glass-input rounded-xl p-3.5 h-20 text-gray-200 focus:border-orange-500/50 resize-none"
                        placeholder="Deskripsi bisnis..."
                    ></textarea>
                </div>
                
                 <div className="pt-2 flex justify-end border-t border-white/5 mt-4">
                    <button type="submit" className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20 transition-transform hover:scale-105 flex items-center gap-2">
                      <Save size={18}/> 
                      <span>Simpan Info Brand</span>
                    </button>
                </div>
            </form>
        </div>

        {/* Danger Zone */}
        <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-red-500 font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertTriangle size={16} /> Danger Zone
            </h3>
            <div className="border border-red-500/20 bg-red-500/5 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-white font-bold text-sm">Bekukan Bisnis Sementara</h4>
                        <p className="text-xs text-gray-400 mt-1">Bisnis tidak akan bisa diakses oleh pelanggan, namun data aman.</p>
                    </div>
                    <button className="px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg text-xs font-bold transition-colors flex items-center gap-2">
                        <Lock size={14} /> Bekukan
                    </button>
                </div>
                <div className="w-full h-px bg-red-500/10"></div>
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-white font-bold text-sm">Hapus Bisnis Permanen</h4>
                        <p className="text-xs text-gray-400 mt-1">Tindakan ini tidak dapat dibatalkan. Semua data outlet & transaksi akan hilang.</p>
                    </div>
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors shadow-lg shadow-red-900/20 flex items-center gap-2">
                        <Trash2 size={14} /> Hapus Permanen
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default GeneralBusinessSettings;