
import React, { useState } from 'react';
import { usePartnerLogic } from './hooks/usePartnerLogic';
import { ClientTier } from '../../types';
import { Users, Briefcase, Wrench, Wallet, Activity, ArrowRight, UserPlus, AlertTriangle, Send, ShieldCheck, MapPin } from 'lucide-react';
import GlassPanel from '../../components/common/GlassPanel';
import CompactNumber from '../../components/common/CompactNumber';
import Modal from '../../components/common/Modal';
import GlassInput from '../../components/common/GlassInput';

const PartnerDashboard: React.FC = () => {
    const { partner, clients, invoices, isOverloaded, createServiceInvoice, transferClient } = usePartnerLogic();
    
    // Modal State
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [serviceType, setServiceType] = useState('Maintenance');
    const [serviceAmount, setServiceAmount] = useState('');
    const [serviceDesc, setServiceDesc] = useState('');

    const handleCreateInvoice = () => {
        if (!selectedClientId || !serviceAmount) return;
        createServiceInvoice(selectedClientId, serviceType as any, parseInt(serviceAmount), serviceDesc);
        setIsServiceModalOpen(false);
        // Reset
        setServiceAmount(''); setServiceDesc('');
    };

    const getLoadColor = (load: number) => {
        if (load < 50) return 'bg-green-500';
        if (load < 80) return 'bg-orange-500';
        return 'bg-red-500';
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            
            {/* HEADER: PARTNER IDENTITY & LOAD */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ID Card */}
                <div className="lg:col-span-2">
                    <GlassPanel className="p-6 rounded-3xl border border-white/5 bg-gradient-to-r from-[#0f172a] to-[#1e293b] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                        
                        <div className="relative z-10 flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                                    <Briefcase size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{partner.name}</h2>
                                    <p className="text-sm text-gray-400 flex items-center gap-2">
                                        <MapPin size={14} /> {partner.region} • Partner Resmi SIBOS
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Dompet Jasa (Net)</p>
                                <p className="text-2xl font-black text-green-400"><CompactNumber value={partner.walletBalance} /></p>
                                <button className="text-xs text-blue-400 hover:text-white mt-1 font-bold">Cairkan Dana &rarr;</button>
                            </div>
                        </div>

                        {/* Capacity Meter */}
                        <div className="mt-8">
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <p className="text-sm font-bold text-white">Kapasitas Layanan (Workload)</p>
                                    <p className="text-xs text-gray-400">Anda menangani {clients.length} klien aktif.</p>
                                </div>
                                <span className={`text-xl font-black ${isOverloaded ? 'text-red-500' : 'text-white'}`}>
                                    {partner.totalLoad}%
                                </span>
                            </div>
                            <div className="w-full h-4 bg-black/40 rounded-full overflow-hidden border border-white/5 relative">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${getLoadColor(partner.totalLoad)}`} 
                                    style={{ width: `${partner.totalLoad}%` }}
                                ></div>
                                {/* Threshold Markers */}
                                <div className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-white/10" title="50%"></div>
                                <div className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-white/10" title="80%"></div>
                            </div>
                            
                            {isOverloaded ? (
                                <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                                    <AlertTriangle size={20} className="text-red-500" />
                                    <p className="text-xs text-red-200">
                                        <b>Kapasitas Penuh!</b> Anda tidak dapat menerima klien baru. Harap alihkan klien kecil ke partner lain atau fokus maintenance.
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-3 flex gap-2">
                                     <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                         <span className="w-2 h-2 rounded-full bg-blue-500"></span> Small (2%)
                                     </div>
                                     <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                         <span className="w-2 h-2 rounded-full bg-orange-500"></span> Medium (5%)
                                     </div>
                                     <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                         <span className="w-2 h-2 rounded-full bg-red-500"></span> Large (20%)
                                     </div>
                                </div>
                            )}
                        </div>
                    </GlassPanel>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                    <button 
                        onClick={() => setIsServiceModalOpen(true)}
                        className="w-full p-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl shadow-lg transition-all flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Wrench size={20} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-sm">Input Jasa</p>
                                <p className="text-[10px] opacity-80">Instalasi / Training</p>
                            </div>
                        </div>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <button 
                         disabled={isOverloaded}
                         className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group ${isOverloaded ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10 border-white/5 text-white'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <UserPlus size={20} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-sm">Daftarkan Klien Baru</p>
                                <p className="text-[10px] opacity-60">{isOverloaded ? 'Kapasitas Penuh' : 'Generate Kode Referral'}</p>
                            </div>
                        </div>
                        {!isOverloaded && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT: CLIENT LIST & REVENUE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Client Management (8/12) */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Users size={20} className="text-blue-400" /> Klien Saya
                        </h3>
                        <input 
                            type="text" 
                            placeholder="Cari klien..." 
                            className="bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="space-y-3">
                        {clients.map(client => (
                            <GlassPanel key={client.id} className="p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors flex flex-col md:flex-row gap-4 items-center">
                                {/* Client Info */}
                                <div className="flex-1 w-full">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-white text-lg">{client.businessName}</h4>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                            client.tier === ClientTier.LARGE ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                            client.tier === ClientTier.MEDIUM ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                            'bg-green-500/10 text-green-400 border-green-500/20'
                                        }`}>
                                            {client.tier}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400">Owner: {client.ownerName} • {client.location}</p>
                                    
                                    <div className="flex gap-4 mt-3 text-xs">
                                        <span className="text-gray-500 flex items-center gap-1">
                                            <Activity size={12} /> Service Terakhir: <span className="text-gray-300">{client.lastServiceDate}</span>
                                        </span>
                                        <span className="text-orange-400 flex items-center gap-1 font-bold">
                                            Next: {client.nextServiceDue}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 w-full md:w-auto">
                                    <button 
                                        onClick={() => { setSelectedClientId(client.id); setIsServiceModalOpen(true); }}
                                        className="flex-1 md:flex-none px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold border border-white/5"
                                    >
                                        Catat Service
                                    </button>
                                    {isOverloaded && client.tier === ClientTier.SMALL && (
                                        <button 
                                            onClick={() => transferClient(client.id)}
                                            className="flex-1 md:flex-none px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl text-xs font-bold border border-red-500/20"
                                        >
                                            Alihkan
                                        </button>
                                    )}
                                </div>
                            </GlassPanel>
                        ))}
                    </div>
                </div>

                {/* Right: Revenue Stream (4/12) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <GlassPanel className="p-5 rounded-2xl border border-white/5 h-full">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Wallet size={20} className="text-green-400" /> Riwayat Jasa
                        </h3>
                        <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                            {invoices.map(inv => (
                                <div key={inv.id} className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                            inv.type === 'Instalasi' ? 'bg-blue-500/20 text-blue-300' :
                                            inv.type === 'Training' ? 'bg-purple-500/20 text-purple-300' :
                                            'bg-orange-500/20 text-orange-300'
                                        }`}>
                                            {inv.type}
                                        </span>
                                        <span className="text-xs text-gray-500">{new Date(inv.date).toLocaleDateString()}</span>
                                    </div>
                                    <h5 className="font-bold text-white text-sm truncate">{inv.clientName}</h5>
                                    <p className="text-[10px] text-gray-400 mb-2">{inv.description}</p>
                                    
                                    <div className="flex justify-between items-center border-t border-white/5 pt-2">
                                        <div>
                                            <p className="text-[10px] text-gray-500">Nilai Tagihan</p>
                                            <p className="text-xs text-gray-300"><CompactNumber value={inv.amount} /></p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-green-400 font-bold uppercase">Hak Anda ({inv.sharePercentage}%)</p>
                                            <p className="text-sm font-bold text-green-400"><CompactNumber value={inv.netIncome} /></p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassPanel>
                </div>
            </div>

            {/* MODAL: CREATE SERVICE INVOICE */}
            <Modal isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} title="Input Laporan Jasa">
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Klien</label>
                        <select 
                            className="w-full glass-input rounded-xl p-3 bg-[#1e293b] text-white appearance-none"
                            value={selectedClientId}
                            onChange={(e) => setSelectedClientId(e.target.value)}
                        >
                            <option value="">Pilih Klien...</option>
                            {clients.map(c => <option key={c.id} value={c.id} className="bg-gray-900">{c.businessName}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Jenis Layanan</label>
                        <div className="flex bg-black/30 p-1 rounded-xl">
                            {['Instalasi', 'Training', 'Maintenance', 'Visit'].map(t => (
                                <button 
                                    key={t}
                                    onClick={() => setServiceType(t)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${serviceType === t ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Biaya Jasa (Rp)</label>
                        <GlassInput type="number" placeholder="0" value={serviceAmount} onChange={e => setServiceAmount(e.target.value)} />
                        <p className="text-[10px] text-green-400 mt-1">*80-90% dari nominal ini akan masuk ke Dompet Partner Anda.</p>
                    </div>
                    <div>
                         <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Deskripsi Pekerjaan</label>
                         <textarea 
                            className="w-full glass-input rounded-xl p-3 text-sm h-24 resize-none text-white"
                            placeholder="Apa yang Anda kerjakan?"
                            value={serviceDesc}
                            onChange={e => setServiceDesc(e.target.value)}
                        />
                    </div>
                    <button onClick={handleCreateInvoice} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
                        <Send size={18} /> Kirim Tagihan ke Klien
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default PartnerDashboard;
