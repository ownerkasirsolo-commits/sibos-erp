import React, { useState } from 'react';
// @FIX: Import BusinessConfig from its new location in features/irm/types.
import { BusinessType } from '../../types';
import { BusinessConfig } from '../../features/irm/types';
import { Camera, Building, Save, Plus, MapPin, X } from 'lucide-react';

interface BusinessSettingsProps {
  businessConfig: BusinessConfig;
}

const BusinessSettings: React.FC<BusinessSettingsProps> = ({ businessConfig }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Cabang Sudirman Activated
  const [outlets, setOutlets] = useState([
    { id: 1, name: 'Outlet Utama', address: 'Jl. Merdeka No. 1, Jakarta', active: true },
    { id: 2, name: 'Cabang Sudirman', address: 'Jl. Jend. Sudirman No. 2, Jakarta', active: true },
  ]);

  return (
    <div className="space-y-8">
      {/* Business Info Panel */}
      <div className="glass-panel rounded-2xl p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="relative group shrink-0">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-white/10 flex items-center justify-center shadow-lg">
                    <Building className="w-16 h-16 text-gray-500"/>
                </div>
                <button className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                </button>
            </div>

            <form className="space-y-6 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Nama Bisnis</label>
                        <input type="text" defaultValue={businessConfig.name} className="w-full glass-input rounded-xl p-3" />
                    </div>
                     <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Tipe Bisnis</label>
                        <select defaultValue={businessConfig.type} className="w-full glass-input rounded-xl p-3 appearance-none cursor-pointer">
                           {Object.values(BusinessType).map(type => <option key={type} className="bg-[#0f172a]">{type}</option>)}
                        </select>
                    </div>
                </div>
                 <div className="pt-4 flex justify-end">
                    <button type="submit" className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20 transition-transform hover:scale-105 flex items-center gap-2">
                      <Save size={16}/> Simpan Informasi
                    </button>
                </div>
            </form>
        </div>
      </div>
      
      {/* Outlet Management Panel */}
      <div className="glass-panel rounded-2xl p-8">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Manajemen Outlet</h3>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600/10 border border-orange-500/20 text-orange-400 text-sm font-semibold rounded-lg hover:bg-orange-600/20 transition-colors">
                <Plus size={16} />
                <span>Outlet Baru</span>
            </button>
        </div>
        <div className="space-y-4">
            {outlets.map(outlet => (
                <div key={outlet.id} className="bg-white/5 p-4 rounded-xl flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <p className="font-semibold text-white">{outlet.name}</p>
                            {outlet.active && <span className="text-[10px] font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">AKTIF</span>}
                        </div>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5"><MapPin size={12} /> {outlet.address}</p>
                    </div>
                    {!outlet.active && (
                         <button className="px-4 py-2 text-xs font-semibold text-gray-300 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                           Pindah ke Outlet Ini
                         </button>
                    )}
                </div>
            ))}
        </div>
      </div>
      
      {/* Add Outlet Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in" onClick={() => setIsModalOpen(false)} />
          <div className="glass-panel w-full max-w-lg rounded-2xl p-8 shadow-2xl relative z-10 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold text-white">Tambah Outlet Baru</h3>
               <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                 <X size={18} />
               </button>
            </div>
            <form className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Nama Outlet</label>
                  <input type="text" placeholder="Contoh: Cabang Kemang" className="w-full glass-input rounded-xl p-3" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Alamat Outlet</label>
                  <textarea placeholder="Masukkan alamat lengkap outlet..." className="w-full glass-input rounded-xl p-3 h-24 resize-none"></textarea>
                </div>
                 <div className="pt-4 flex justify-end">
                    <button type="submit" className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20 transition-transform hover:scale-105">
                      Simpan Outlet
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessSettings;