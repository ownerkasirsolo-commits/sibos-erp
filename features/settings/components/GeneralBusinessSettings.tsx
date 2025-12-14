
import React, { useState, useEffect } from 'react';
import { BusinessType } from '../../../types';
import { BusinessConfig, ModuleId } from '../../irm/types';
import { Camera, Save, Globe, Info, AlertTriangle, Trash2, Lock, ChevronDown, Handshake, ShieldCheck, Phone, MessageCircle, Layers, Monitor, LayoutTemplate, CheckCircle2 } from 'lucide-react';
import GlassPanel from '../../../../components/common/GlassPanel';
import GlassInput from '../../../../components/common/GlassInput';
import { useGlobalContext } from '../../../../context/GlobalContext';

interface GeneralBusinessSettingsProps {
  businessConfig: BusinessConfig;
}

const MODULE_LIST: { id: ModuleId, label: string, desc: string, recommendedFor: BusinessType[] }[] = [
    { id: 'pos', label: 'Point of Sales (Kasir)', desc: 'Fitur utama penjualan.', recommendedFor: [BusinessType.CULINARY, BusinessType.RETAIL, BusinessType.SERVICE, BusinessType.FASHION, BusinessType.ELECTRONIC, BusinessType.PHARMACY] },
    { id: 'kds', label: 'Kitchen Display (KDS)', desc: 'Layar untuk kru dapur/bar.', recommendedFor: [BusinessType.CULINARY] },
    { id: 'cds', label: 'Customer Display', desc: 'Layar sekunder untuk pelanggan.', recommendedFor: [BusinessType.CULINARY, BusinessType.RETAIL] },
    { id: 'reservations', label: 'Reservasi Meja', desc: 'Booking meja & jadwal.', recommendedFor: [BusinessType.CULINARY, BusinessType.SERVICE] },
    { id: 'queue', label: 'Manajemen Antrian', desc: 'Sistem nomor antrian & panggilan suara.', recommendedFor: [BusinessType.CULINARY, BusinessType.SERVICE, BusinessType.PHARMACY] },
    { id: 'crm', label: 'CRM & Loyalty', desc: 'Database pelanggan & poin member.', recommendedFor: [BusinessType.CULINARY, BusinessType.RETAIL, BusinessType.FASHION] },
    { id: 'irm', label: 'Inventory (IRM)', desc: 'Stok bahan, resep, dan HPP.', recommendedFor: [BusinessType.CULINARY, BusinessType.RETAIL, BusinessType.MANUFACTURING] },
    { id: 'hrm', label: 'Pegawai (HRM)', desc: 'Absensi, gaji, dan shift.', recommendedFor: [BusinessType.CULINARY, BusinessType.RETAIL, BusinessType.SERVICE, BusinessType.MANUFACTURING] },
    { id: 'accounting', label: 'Akuntansi', desc: 'Laporan keuangan & jurnal.', recommendedFor: [BusinessType.CULINARY, BusinessType.RETAIL, BusinessType.SERVICE, BusinessType.MANUFACTURING] },
    { id: 'omnichannel', label: 'Omnichannel', desc: 'Integrasi GoFood, Grab, Shopee, dll.', recommendedFor: [BusinessType.CULINARY, BusinessType.RETAIL] },
    { id: 'marketing', label: 'Pusat Pemasaran', desc: 'Buat konten sosmed & iklan.', recommendedFor: [BusinessType.CULINARY, BusinessType.RETAIL, BusinessType.FASHION] },
    { id: 'website', label: 'Website Builder', desc: 'Buat website toko online sendiri.', recommendedFor: [BusinessType.CULINARY, BusinessType.RETAIL, BusinessType.FASHION, BusinessType.SERVICE] },
];

const GeneralBusinessSettings: React.FC<GeneralBusinessSettingsProps> = ({ businessConfig }) => {
  const { setBusinessInfo } = useGlobalContext(); 
  
  // Local state for config form
  const [formData, setFormData] = useState<BusinessConfig>(businessConfig);
  
  // MOCK PARTNER DATA
  const partnerInfo = {
      name: "Andi Techno Solution",
      id: "PARTNER-JKT-001",
      role: "Authorized Distributor",
      phone: "6281234567890",
      email: "support@anditechno.com",
      area: "Jakarta Selatan",
      status: "Active"
  };

  useEffect(() => {
      // Ensure defaults based on business type if not set
      const recommendedModules = MODULE_LIST.filter(m => m.recommendedFor.includes(businessConfig.type)).map(m => m.id);
      
      setFormData({
          ...businessConfig,
          activeModules: businessConfig.activeModules || recommendedModules, 
          defaultPosMode: businessConfig.defaultPosMode || (businessConfig.type === BusinessType.RETAIL ? 'retail' : 'culinary')
      });
  }, [businessConfig]);

  const handleUpdate = (field: keyof BusinessConfig, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleModule = (id: ModuleId) => {
      const current = formData.activeModules || [];
      const updated = current.includes(id) 
        ? current.filter(m => m !== id) 
        : [...current, id];
      handleUpdate('activeModules', updated);
  };

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      // Simulation: Update context wrapper (Partial update support ideally needed)
      // For this demo, just console log and alert
      console.log("Saving Configuration:", formData);
      alert("Pengaturan tersimpan! (Refresh mungkin diperlukan untuk melihat perubahan modul)");
  };

  const handleContactPartner = () => {
      window.open(`https://wa.me/${partnerInfo.phone}?text=Halo, saya butuh bantuan untuk bisnis ${formData.name}`, '_blank');
  };

  return (
    <div className="space-y-8 w-full animate-in fade-in duration-300 pb-8">
        
        {/* SECTION 1: IDENTITY */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Logo Upload */}
            <div className="flex flex-col items-center gap-3 shrink-0 mx-auto md:mx-0">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] border-2 border-white/10 flex items-center justify-center shadow-xl relative overflow-hidden">
                         <div className="absolute inset-0 bg-[url('https://picsum.photos/id/433/200/200')] bg-cover bg-center opacity-50 grayscale group-hover:grayscale-0 transition-all duration-500"></div>
                         <div className="relative z-10 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                            <Camera className="w-5 h-5 text-white" />
                         </div>
                    </div>
                </div>
                <p className="text-xs text-gray-500 font-medium">Logo (500x500px)</p>
            </div>

            {/* Form */}
            <div className="space-y-6 flex-1 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Nama Brand / Bisnis</label>
                        <GlassInput value={formData.name} onChange={e => handleUpdate('name', e.target.value)} className="font-bold text-white" />
                    </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Kategori Usaha Utama</label>
                        <div className="relative">
                            <select 
                                value={formData.type} 
                                onChange={e => handleUpdate('type', e.target.value)}
                                className="w-full glass-input rounded-xl p-3.5 appearance-none cursor-pointer text-gray-200 focus:border-orange-500/50 pr-10"
                            >
                              {Object.values(BusinessType).map(type => <option key={type} value={type} className="bg-gray-900 text-gray-200">{type}</option>)}
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
                        value="Tempat nongkrong asik dengan kopi terbaik." 
                        disabled
                    ></textarea>
                </div>
            </div>
        </div>

        {/* SECTION 2: MODULE CONFIGURATION (HYBRID MODE) */}
        <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                <Layers size={16} className="text-purple-400" /> Konfigurasi Modul & Tampilan
            </h3>
            
            <GlassPanel className="p-6 rounded-2xl bg-purple-900/5 border border-purple-500/20 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                        <h4 className="font-bold text-white mb-1">Tampilan POS (Kasir) Utama</h4>
                        <p className="text-xs text-gray-400">Pilih gaya antarmuka kasir yang paling sering digunakan. Anda tetap bisa menggantinya secara instan di halaman Kasir.</p>
                    </div>
                    <div className="flex bg-black/30 p-1 rounded-xl">
                        <button 
                            onClick={() => handleUpdate('defaultPosMode', 'culinary')}
                            className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${formData.defaultPosMode === 'culinary' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <LayoutTemplate size={14} /> Mode Restoran (F&B)
                        </button>
                        <button 
                             onClick={() => handleUpdate('defaultPosMode', 'retail')}
                             className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${formData.defaultPosMode === 'retail' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Monitor size={14} /> Mode Ritel (Toko)
                        </button>
                    </div>
                </div>
            </GlassPanel>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {MODULE_LIST.map(mod => {
                    const isActive = (formData.activeModules || []).includes(mod.id);
                    const isRecommended = mod.recommendedFor.includes(formData.type);

                    return (
                        <div 
                            key={mod.id} 
                            onClick={() => toggleModule(mod.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none relative overflow-hidden ${isActive ? 'bg-white/5 border-green-500/30' : 'bg-black/20 border-white/5 opacity-60 hover:opacity-80'}`}
                        >
                            {isRecommended && (
                                <div className="absolute top-0 right-0 bg-blue-600/20 text-blue-300 text-[9px] px-2 py-0.5 rounded-bl-lg font-bold">Recommended</div>
                            )}

                            <div className={`w-5 h-5 rounded flex items-center justify-center mt-0.5 border ${isActive ? 'bg-green-500 border-green-500' : 'border-gray-600'}`}>
                                {isActive && <CheckCircle2 size={14} className="text-white" />}
                            </div>
                            <div>
                                <h5 className={`text-sm font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>{mod.label}</h5>
                                <p className="text-[10px] text-gray-500 mt-0.5">{mod.desc}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>

        {/* SECTION 3: PARTNER INFO */}
        <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-blue-400 font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                <Handshake size={16} /> Partner Layanan
            </h3>
            <GlassPanel className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/20 to-indigo-900/10 border border-blue-500/30 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0 border-4 border-[#0f172a]">
                         <span className="text-2xl font-bold text-white">{partnerInfo.name.charAt(0)}{partnerInfo.name.split(' ')[1]?.charAt(0)}</span>
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                             <h4 className="text-lg font-bold text-white">{partnerInfo.name}</h4>
                             <ShieldCheck size={16} className="text-blue-400" fill="currentColor" fillOpacity={0.2} />
                        </div>
                        <p className="text-sm text-blue-200 mb-1">{partnerInfo.role} &bull; {partnerInfo.area}</p>
                        <p className="text-[10px] text-gray-400 font-mono bg-black/20 px-2 py-0.5 rounded-full w-fit mx-auto md:mx-0">ID: {partnerInfo.id}</p>
                    </div>

                    <div className="flex gap-3">
                         <button className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-white transition-colors">
                             <Phone size={14} /> <span className="hidden sm:inline">Telepon</span>
                         </button>
                         <button 
                            onClick={handleContactPartner}
                            className="px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl flex items-center gap-2 text-xs font-bold shadow-lg shadow-green-600/20 transition-transform active:scale-95"
                        >
                            <MessageCircle size={16} /> WhatsApp Partner
                         </button>
                    </div>
                </div>
            </GlassPanel>
        </div>

        {/* SAVE BUTTON */}
        <div className="sticky bottom-4 z-50 flex justify-end">
            <button 
                onClick={handleSave}
                className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl shadow-2xl shadow-orange-600/30 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
            >
                <Save size={18}/> 
                <span>Simpan Konfigurasi Global</span>
            </button>
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
