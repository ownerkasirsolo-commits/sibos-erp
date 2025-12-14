import React from 'react';
import { CheckCircle2, FileText, Settings, Star } from 'lucide-react';

const SubscriptionSettings: React.FC = () => {
    const planFeatures = [
        "Hingga 5 Outlet",
        "Manajemen Produk & Stok Tanpa Batas",
        "Akses Penuh Asisten AI",
        "Laporan Analitik Lanjutan",
        "Dukungan Prioritas 24/7"
    ];

  return (
    <div className="space-y-8">
        <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="p-8 bg-gradient-to-r from-orange-600/10 to-red-600/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <Star className="w-6 h-6 text-orange-400" />
                        <h3 className="text-2xl font-bold text-white">Paket SIBOS Premium</h3>
                    </div>
                    <p className="text-gray-400 mt-1">Langganan Anda aktif hingga <span className="font-semibold text-gray-200">25 Desember 2025</span>.</p>
                </div>
                 <button className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20 transition-transform hover:scale-105 whitespace-nowrap">
                    Kelola Langganan
                </button>
            </div>
            <div className="p-8">
                <h4 className="font-semibold text-gray-200 mb-4">Fitur yang Anda Nikmati:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {planFeatures.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0"/>
                            <span className="text-gray-300 text-sm">{feature}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="glass-panel rounded-2xl p-8">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-3"><FileText size={20} className="text-orange-500"/> Riwayat Tagihan</h3>
                <button className="text-xs font-bold text-orange-400 hover:text-orange-300 uppercase tracking-wider">Unduh Semua</button>
            </div>
            <div className="space-y-3">
                {[
                    {invoice: "INV-2024-12A", date: "25 Des 2024", amount: "Rp 500.000", status: "Lunas"},
                    {invoice: "INV-2023-12A", date: "25 Des 2023", amount: "Rp 500.000", status: "Lunas"},
                ].map((item, i) => (
                     <div key={i} className="bg-white/5 p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-white">{item.invoice}</p>
                            <p className="text-xs text-gray-400 mt-1">Tanggal: {item.date}</p>
                        </div>
                        <div className="flex items-center gap-6">
                           <p className="font-semibold text-gray-200">{item.amount}</p>
                           <span className="text-xs font-bold bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/20">{item.status}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default SubscriptionSettings;