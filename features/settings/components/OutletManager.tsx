
import React, { useState } from 'react';
import { Store, Target, Printer, Receipt, Server, LayoutTemplate, Calculator, MapPin, Phone, Save, ShieldCheck, Trash2, AlertTriangle, Lock, Plus, Edit2, Check, Grid3x3, Wallet, CreditCard, Banknote, QrCode, ArrowRightLeft, ChevronDown } from 'lucide-react';
import { useGlobalContext } from '../../../context/GlobalContext'; 
import { PrinterPaperSize, BusinessType } from '../../../types';
import { BusinessConfig } from '../../irm/types';


// Master list of available permissions in the system
const MASTER_PERMISSIONS = [
  { id: 'p1', label: 'Buka Laci Uang (Open Drawer)', description: 'Membuka cash drawer tanpa transaksi' },
  { id: 'p2', label: 'Void Transaksi / Hapus Item', description: 'Menghapus item yang sudah dipesan atau membatalkan struk' },
  { id: 'p3', label: 'Berikan Diskon Manual', description: 'Input diskon custom atau nominal bebas' },
  { id: 'p4', label: 'Cetak Ulang Struk (Reprint)', description: 'Mencetak ulang struk transaksi lama' },
  { id: 'p5', label: 'Akses Laporan Shift', description: 'Melihat ringkasan penjualan per shift (X-Report)' },
  { id: 'p6', label: 'Akses Laporan Omset Harian', description: 'Melihat total pendapatan harian (Z-Report)' },
  { id: 'p7', label: 'Refund / Pengembalian Dana', description: 'Melakukan refund transaksi yang sudah lunas' },
  { id: 'p8', label: 'Kelola Stok / Opname', description: 'Mengubah jumlah stok di sistem' },
];

const OutletManager: React.FC = () => {
  const { businessConfig, setBusinessInfo, activeBusiness } = useGlobalContext(); 
  const [activeTab, setActiveTab] = useState<'info' | 'strategy' | 'payment' | 'hardware' | 'access'>('info');
  
  // Local state for hardware config (in real app, sync with global context)
  const [footerText, setFooterText] = useState(businessConfig?.footerMessage || "Terima kasih telah berbelanja di SIBOS!\nPassword Wifi: KopiEnak123");
  const [printerSize, setPrinterSize] = useState<PrinterPaperSize>(businessConfig?.printerPaperSize || '58mm');
  
  // Determine if Retail to adjust UI
  const isRetail = activeBusiness?.type === BusinessType.RETAIL;

  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 'cash', name: 'Tunai (Cash)', icon: Banknote, active: true, type: 'cash', fee: 0, detail: '' },
    { id: 'qris', name: 'QRIS (Static/Dynamic)', icon: QrCode, active: true, type: 'digital', fee: 0.7, detail: 'NMID: 123456789' },
    { id: 'debit', name: 'Kartu Debit', icon: CreditCard, active: false, type: 'card', fee: 0.15, detail: 'EDC BCA' },
    { id: 'credit', name: 'Kartu Kredit', icon: CreditCard, active: false, type: 'card', fee: 2.5, detail: 'EDC Mandiri' },
    { id: 'transfer', name: 'Transfer Bank', icon: ArrowRightLeft, active: false, type: 'bank', fee: 0, detail: 'BCA 888000111 a/n PT SIBOS' },
  ]);

  // Dynamic Roles State
  const [roles, setRoles] = useState([
    { id: 'r1', name: 'Manager', permissions: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'] },
    { id: 'r2', name: 'Kasir', permissions: ['p1', 'p4', 'p5'] },
    { id: 'r3', name: 'Kitchen', permissions: [] }, // Waiter removed if Retail usually, but kept simple
    { id: 'r4', name: 'Waiter', permissions: [] },
  ]);
  const [selectedRoleId, setSelectedRoleId] = useState('r2'); // Default selected: Kasir

  const activeRole = roles.find(r => r.id === selectedRoleId) || roles[0];

  const handleAddRole = () => {
    const name = window.prompt("Masukkan Nama Jabatan Baru (Contoh: Head Barista):");
    if (name) {
      const newRole = {
        id: `r-${Date.now()}`,
        name: name,
        permissions: ['p4'] // Default permission
      };
      setRoles([...roles, newRole]);
      setSelectedRoleId(newRole.id);
    }
  };

  const handleEditRoleName = () => {
    const newName = window.prompt("Ubah Nama Jabatan:", activeRole.name);
    if (newName && newName !== activeRole.name) {
      setRoles(roles.map(r => r.id === activeRole.id ? { ...r, name: newName } : r));
    }
  };

  const handleDeleteRole = () => {
    if (roles.length <= 1) {
      alert("Minimal harus ada satu jabatan!");
      return;
    }
    if (window.confirm(`Yakin ingin menghapus jabatan "${activeRole.name}"?`)) {
      const newRoles = roles.filter(r => r.id !== activeRole.id);
      setRoles(newRoles);
      setSelectedRoleId(newRoles[0].id);
    }
  };

  const togglePermission = (permId: string) => {
    const currentPerms = activeRole.permissions;
    let newPerms;
    if (currentPerms.includes(permId)) {
      newPerms = currentPerms.filter(id => id !== permId);
    } else {
      newPerms = [...currentPerms, permId];
    }

    setRoles(roles.map(r => r.id === activeRole.id ? { ...r, permissions: newPerms } : r));
  };

  const togglePaymentMethod = (id: string) => {
    setPaymentMethods(paymentMethods.map(pm => pm.id === id ? { ...pm, active: !pm.active } : pm));
  };

  const updatePaymentDetail = (id: string, field: 'fee' | 'detail', value: string | number) => {
      setPaymentMethods(paymentMethods.map(pm => pm.id === id ? { ...pm, [field]: value } : pm));
  };

  // Save config wrapper (Simulated)
  const handleSaveConfig = () => {
      alert(`Konfigurasi Tersimpan!\nKertas Printer: ${printerSize}\nFooter: "${footerText.substring(0,20)}..."`);
      if(businessConfig) {
          const newConfig: BusinessConfig = {
              ...businessConfig,
              printerPaperSize: printerSize,
              footerMessage: footerText
          }
          // In real app, this would call a method like `updateBusinessConfig(newConfig)`
          console.log("Saving new config:", newConfig);
      }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Tabs - Centered & Responsive - SCROLL TO CENTER ADDED */}
      <div className="flex bg-black/20 p-1 rounded-xl w-full md:w-fit md:mx-auto overflow-x-auto no-scrollbar">
            <button 
                onClick={(e) => {
                    setActiveTab('info');
                    e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                }}
                className={`flex-1 md:flex-none py-2.5 px-6 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'info' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
            >
                <Store size={14} />
                <span>Info</span>
            </button>
            <button 
                onClick={(e) => {
                    setActiveTab('strategy');
                    e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                }}
                className={`flex-1 md:flex-none py-2.5 px-6 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'strategy' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
            >
                <Target size={14} />
                <span>Strategi</span>
            </button>
             <button 
                onClick={(e) => {
                    setActiveTab('payment');
                    e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                }}
                className={`flex-1 md:flex-none py-2.5 px-6 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'payment' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
            >
                <Wallet size={14} />
                <span>Pembayaran</span>
            </button>
            <button 
                onClick={(e) => {
                    setActiveTab('access');
                    e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                }}
                className={`flex-1 md:flex-none py-2.5 px-6 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'access' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
            >
                <ShieldCheck size={14} />
                <span>Akses & Role</span>
            </button>
            <button 
                onClick={(e) => {
                    setActiveTab('hardware');
                    e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                }}
                className={`flex-1 md:flex-none py-2.5 px-6 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'hardware' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
            >
                <Printer size={14} />
                <span>Hardware</span>
            </button>
      </div>

      {/* Content Area */}
      <div className="space-y-6">
            
            {/* TAB 1: IDENTITAS & LOKASI */}
            {activeTab === 'info' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Nama Outlet</label>
                            <input type="text" defaultValue="Outlet Utama (Pusat)" className="w-full glass-input rounded-xl p-3.5" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Penanggung Jawab</label>
                            <div className="relative">
                                <select className="w-full glass-input rounded-xl p-3.5 appearance-none cursor-pointer pr-10">
                                    <option className="bg-gray-900 text-gray-200">Budi Santoso (Manager)</option>
                                    <option className="bg-gray-900 text-gray-200">Rina Nose (SPV)</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" size={18} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Telepon</label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
                                <input type="tel" defaultValue="021-5555-8888" className="w-full glass-input rounded-xl py-3.5 pl-11 pr-4" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Jam Operasional</label>
                            <div className="flex gap-2">
                                <input type="time" defaultValue="09:00" className="w-full glass-input rounded-xl p-3.5 text-center" />
                                <span className="self-center text-gray-500">-</span>
                                <input type="time" defaultValue="22:00" className="w-full glass-input rounded-xl p-3.5 text-center" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Alamat Lengkap</label>
                        <div className="relative">
                            <MapPin className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
                            <textarea className="w-full glass-input rounded-xl py-3.5 pl-11 pr-4 h-24 resize-none" defaultValue="Jl. Merdeka No. 1, Jakarta Pusat, DKI Jakarta"></textarea>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: STRATEGI BISNIS */}
            {activeTab === 'strategy' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {/* Pricing Strategy */}
                         <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-1">
                                <LayoutTemplate size={12} /> Kebijakan Harga (Price Tier)
                            </label>
                            <div className="relative">
                                <select className="w-full glass-input rounded-xl p-3.5 appearance-none cursor-pointer pr-10">
                                    <option className="bg-gray-900 text-gray-200">Tier 1 (Harga Standar Pusat)</option>
                                    <option className="bg-gray-900 text-gray-200">Tier 2 (Harga Mall/Premium)</option>
                                    <option className="bg-gray-900 text-gray-200">Tier 3 (Harga Event/Bazaar)</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" size={18} />
                            </div>
                            <p className="text-[10px] text-gray-500 ml-1">Menentukan skema harga produk yang berlaku di outlet ini.</p>
                        </div>

                        {/* Inventory Source */}
                         <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-1">
                                <Server size={12} /> Sumber Stok (Inventory)
                            </label>
                            <div className="relative">
                                <select className="w-full glass-input rounded-xl p-3.5 appearance-none cursor-pointer pr-10">
                                    <option className="bg-gray-900 text-gray-200">Gudang Pusat (Central Kitchen)</option>
                                    <option className="bg-gray-900 text-gray-200">Stok Lokal (Belanja Mandiri)</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" size={18} />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-white/5 pt-4">
                        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <Calculator size={16} className="text-orange-500" /> Konfigurasi Pajak & Biaya
                        </h4>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Pajak Utama (%)</label>
                                <div className="relative">
                                    <input type="number" defaultValue="11" className="w-full glass-input rounded-xl p-3.5 pr-8" />
                                    <span className="absolute right-4 top-3.5 text-gray-500 font-bold">%</span>
                                </div>
                                <div className="flex gap-2 text-[10px] text-gray-500">
                                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="taxType" defaultChecked className="accent-orange-500"/> PPN</label>
                                    {!isRetail && <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="taxType" className="accent-orange-500"/> PB1 (Resto)</label>}
                                </div>
                            </div>
                            
                            {/* SERVICE CHARGE - ONLY FOR F&B */}
                            {!isRetail && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Service Charge (%)</label>
                                    <div className="relative">
                                        <input type="number" defaultValue="5" className="w-full glass-input rounded-xl p-3.5 pr-8" />
                                        <span className="absolute right-4 top-3.5 text-gray-500 font-bold">%</span>
                                    </div>
                                </div>
                            )}

                             {/* ROUNDING - ONLY FOR RETAIL */}
                             {isRetail && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Pembulatan Harga</label>
                                    <div className="relative">
                                        <select className="w-full glass-input rounded-xl p-3.5 appearance-none cursor-pointer pr-10">
                                            <option className="bg-gray-900 text-gray-200">Tidak Ada</option>
                                            <option className="bg-gray-900 text-gray-200">Ke Bawah (100)</option>
                                            <option className="bg-gray-900 text-gray-200">Ke Atas (100)</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" size={18} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: PAYMENT METHODS */}
            {activeTab === 'payment' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="glass-panel p-4 rounded-xl bg-green-600/5 border-green-500/20 mb-4">
                        <p className="text-xs text-green-300 flex items-start gap-2">
                            <Wallet size={14} className="shrink-0 mt-0.5" />
                            <span>Atur metode pembayaran yang diterima di outlet ini. Anda juga bisa mengatur <strong>biaya merchant (MDR)</strong> untuk setiap metode non-tunai.</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {paymentMethods.map((method) => (
                            <div key={method.id} className={`p-4 rounded-2xl border transition-all ${method.active ? 'bg-white/5 border-orange-500/30' : 'bg-black/20 border-white/5 opacity-70'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${method.active ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-gray-500'}`}>
                                            <method.icon size={20} />
                                        </div>
                                        <div>
                                            <h4 className={`font-bold text-sm ${method.active ? 'text-white' : 'text-gray-400'}`}>{method.name}</h4>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{method.type}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Toggle Switch */}
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={method.active} onChange={() => togglePaymentMethod(method.id)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                    </label>
                                </div>

                                {/* Configuration Fields (Only if active & not cash) */}
                                {method.active && method.type !== 'cash' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Potongan Fee / MDR (%)</label>
                                            <div className="relative">
                                                <input 
                                                    type="number" 
                                                    value={method.fee}
                                                    onChange={(e) => updatePaymentDetail(method.id, 'fee', parseFloat(e.target.value))}
                                                    className="w-full glass-input rounded-lg py-2 px-3 text-sm pr-8" 
                                                />
                                                <span className="absolute right-3 top-2 text-xs font-bold text-gray-500">%</span>
                                            </div>
                                            <p className="text-[10px] text-gray-500 italic">
                                                *Simulasi: Potongan Rp {((method.fee / 100) * 100000).toLocaleString('id-ID')} per Rp 100rb
                                            </p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Detail Akun / Terminal ID</label>
                                            <input 
                                                type="text" 
                                                value={method.detail}
                                                onChange={(e) => updatePaymentDetail(method.id, 'detail', e.target.value)}
                                                className="w-full glass-input rounded-lg py-2 px-3 text-sm" 
                                                placeholder={method.type === 'bank' ? 'Nama Bank & No Rek' : 'Nama/ID Terminal EDC'}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 4: ACCESS & ROLE (DYNAMIC) */}
            {activeTab === 'access' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                     <div className="glass-panel p-4 rounded-xl bg-blue-600/5 border-blue-500/20 mb-6">
                        <p className="text-xs text-blue-300 flex items-start gap-2">
                            <ShieldCheck size={14} className="shrink-0 mt-0.5" />
                            <span>Atur <strong>Kewenangan (Permission)</strong> untuk setiap jabatan di outlet ini. Gunakan modul HRM untuk menempatkan pegawai ke jabatan tersebut.</span>
                        </p>
                    </div>

                    {/* Role Navigation */}
                    <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
                         {roles.map(role => (
                             <button
                                key={role.id}
                                onClick={() => setSelectedRoleId(role.id)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all whitespace-nowrap flex items-center gap-2 group ${
                                    selectedRoleId === role.id
                                    ? 'bg-orange-500/10 border-orange-500 text-orange-400'
                                    : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                             >
                                 {role.name}
                                 {selectedRoleId === role.id && (
                                   <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                                 )}
                             </button>
                         ))}
                         
                         {/* Add Role Button */}
                         <button 
                            onClick={handleAddRole}
                            className="px-3 py-2 rounded-xl border border-dashed border-gray-600 text-gray-500 hover:text-orange-400 hover:border-orange-500 hover:bg-orange-500/10 transition-all"
                            title="Tambah Jabatan Baru"
                         >
                            <Plus size={16} />
                         </button>
                    </div>

                    {/* Permission Editor for Selected Role */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-4 border-b border-white/5">
                            <div className="flex items-center gap-3">
                              <h4 className="text-lg font-bold text-white">{activeRole.name}</h4>
                              <button onClick={handleEditRoleName} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors">
                                <Edit2 size={14} />
                              </button>
                            </div>
                            <button 
                              onClick={handleDeleteRole}
                              className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 size={14} /> Hapus Jabatan
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          {MASTER_PERMISSIONS.map((perm) => {
                              const isGranted = activeRole.permissions.includes(perm.id);
                              return (
                                <label key={perm.id} className={`flex items-start justify-between p-4 rounded-xl border cursor-pointer transition-all ${isGranted ? 'bg-orange-500/5 border-orange-500/30' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                                    <div className="pr-4">
                                        <span className={`block text-sm font-bold ${isGranted ? 'text-orange-200' : 'text-gray-300'}`}>{perm.label}</span>
                                        <span className="block text-xs text-gray-500 mt-0.5">{perm.description}</span>
                                    </div>
                                    <div className="relative shrink-0 mt-1">
                                        <input 
                                            type="checkbox" 
                                            checked={isGranted} 
                                            onChange={() => togglePermission(perm.id)}
                                            className="sr-only peer" 
                                        />
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                    </div>
                                </label>
                              )
                          })}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 5: SYSTEM & HARDWARE */}
            {activeTab === 'hardware' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    
                    {/* PRINTER SETTINGS - NEW */}
                    <div className="glass-panel p-6 rounded-xl border border-white/5">
                        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                             <Printer size={18} className="text-orange-500"/> Konfigurasi Printer Struk
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Ukuran Kertas</label>
                                <div className="relative">
                                    <select 
                                        value={printerSize}
                                        onChange={(e) => setPrinterSize(e.target.value as PrinterPaperSize)}
                                        className="w-full glass-input rounded-xl p-3.5 appearance-none cursor-pointer pr-10"
                                    >
                                        <option value="58mm" className="bg-[#1e293b] text-white">Thermal 58mm (Small)</option>
                                        <option value="80mm" className="bg-[#1e293b] text-white">Thermal 80mm (Standard)</option>
                                        <option value="DotMatrix-76mm" className="bg-[#1e293b] text-white">Dot Matrix 76mm (Struk Kasir)</option>
                                        <option value="A4" className="bg-[#1e293b] text-white">A4 Invoice (Office)</option>
                                        <option value="DotMatrix-Continuous" className="bg-[#1e293b] text-white">Dot Matrix Continuous (9.5" Letter)</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" size={18} />
                                </div>
                                <p className="text-[10px] text-gray-500 ml-1">Pilih sesuai jenis printer yang terhubung.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">IP Address Printer</label>
                                <input type="text" defaultValue="192.168.1.200" className="w-full glass-input rounded-xl p-3.5 font-mono text-sm" placeholder="Ex: 192.168.1.200" />
                            </div>
                        </div>
                    </div>

                    {/* Receipt Configuration with Live Preview */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-1">
                                <Receipt size={12} /> Pesan Footer Struk
                            </label>
                            <textarea 
                                className="w-full glass-input rounded-xl p-3.5 h-64 resize-none text-sm font-mono" 
                                value={footerText}
                                onChange={(e) => setFooterText(e.target.value)}
                                placeholder="Masukkan pesan footer..."
                            ></textarea>
                            <p className="text-[10px] text-gray-500 ml-1">Pesan ini akan tercetak di bagian paling bawah struk belanja.</p>
                        </div>
                        
                        {/* Live Preview */}
                        <div className="space-y-2">
                             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-1">
                                Preview Tampilan ({printerSize})
                            </label>
                            <div className={`bg-white text-black p-4 rounded-xl font-mono text-xs overflow-y-auto shadow-inner opacity-90 mx-auto transition-all duration-300 ${printerSize === '58mm' ? 'w-[58mm]' : (printerSize === '80mm' || printerSize === 'DotMatrix-76mm') ? 'w-[80mm]' : 'w-full h-64'}`}>
                                <div className="text-center mb-2">
                                    <p className="font-bold text-sm">{businessConfig?.name || 'SIBOS'}</p>
                                    <p>Jl. Merdeka No. 1, Jakarta</p>
                                    <p>--------------------------------</p>
                                </div>
                                <div className="space-y-1 mb-2">
                                    <div className="flex justify-between"><span>Produk A</span><span>35.000</span></div>
                                    <div className="flex justify-between"><span>Produk B</span><span>5.000</span></div>
                                </div>
                                <div className="text-center my-2">
                                    <p>--------------------------------</p>
                                    <div className="flex justify-between font-bold"><span>TOTAL</span><span>40.000</span></div>
                                    <p>--------------------------------</p>
                                </div>
                                {/* Footer Content */}
                                <div className="text-center mt-4 whitespace-pre-wrap text-gray-600">
                                    {footerText}
                                </div>
                                <div className="text-center mt-4 text-[10px] text-gray-400">
                                    *** TERIMA KASIH ***
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                        <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400">
                            <Server size={20} />
                        </div>
                        <div>
                            <h5 className="text-sm font-bold text-white">Status Koneksi Server</h5>
                            <p className="text-xs text-green-400 font-medium flex items-center gap-1">● Terhubung (Ping: 24ms)</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Footer & Danger Zone */}
            <div className="space-y-8 pt-4 border-t border-white/5 mt-8">
                 <div className="flex justify-end">
                    <button 
                        onClick={handleSaveConfig}
                        className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20 transition-transform hover:scale-105 flex items-center gap-2"
                    >
                        <Save size={18} />
                        <span>Simpan Konfigurasi Outlet</span>
                    </button>
                </div>

                {/* DANGER ZONE FOR OUTLET */}
                <div className="pt-8 border-t border-white/10">
                    <h3 className="text-red-500 font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                        <AlertTriangle size={16} /> Danger Zone (Outlet)
                    </h3>
                    <div className="border border-red-500/20 bg-red-500/5 rounded-2xl p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-white font-bold text-sm">Nonaktifkan Outlet</h4>
                                <p className="text-xs text-gray-400 mt-1">Outlet tidak bisa melakukan transaksi, namun data historis aman.</p>
                            </div>
                            <button className="px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg text-xs font-bold transition-colors flex items-center gap-2">
                                <Lock size={14} /> Tutup Sementara
                            </button>
                        </div>
                        <div className="w-full h-px bg-red-500/10"></div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-white font-bold text-sm">Hapus Outlet Permanen</h4>
                                <p className="text-xs text-gray-400 mt-1">Data penjualan, stok, dan pegawai di outlet ini akan dihapus permanen.</p>
                            </div>
                            <button className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors shadow-lg shadow-red-900/20 flex items-center gap-2">
                                <Trash2 size={14} /> Hapus Permanen
                            </button>
                        </div>
                    </div>
                </div>
            </div>
      </div>
    </div>
  );
};

export default OutletManager;
