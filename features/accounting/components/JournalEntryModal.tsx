
import React, { useState, useRef } from 'react';
import Modal from '../../../components/common/Modal';
import GlassInput from '../../../components/common/GlassInput';
import { ChartOfAccount } from '../types';
import { Save, DollarSign, FileText, ArrowRightLeft, Sparkles, Zap, Camera, X, Image as ImageIcon } from 'lucide-react';

interface JournalEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    accounts: ChartOfAccount[];
}

// RULES: Kata kunci -> [Target Account (Allocation), Source Account (Fund), Type]
// Expanded for smarter detection
const AUTO_MAP: Record<string, { target: string, source: string, type: 'in' | 'out' }> = {
    // --- UTILITIES (Listrik/Air/Internet) ---
    'listrik': { target: 'acc_exp_utility', source: 'acc_cash', type: 'out' },
    'pln': { target: 'acc_exp_utility', source: 'acc_cash', type: 'out' },
    'token': { target: 'acc_exp_utility', source: 'acc_cash', type: 'out' },
    'air': { target: 'acc_exp_utility', source: 'acc_cash', type: 'out' },
    'pdam': { target: 'acc_exp_utility', source: 'acc_cash', type: 'out' },
    'galon': { target: 'acc_exp_utility', source: 'acc_cash', type: 'out' },
    'wifi': { target: 'acc_exp_utility', source: 'acc_bank_bca', type: 'out' },
    'internet': { target: 'acc_exp_utility', source: 'acc_bank_bca', type: 'out' },
    'indihome': { target: 'acc_exp_utility', source: 'acc_bank_bca', type: 'out' },
    'biznet': { target: 'acc_exp_utility', source: 'acc_bank_bca', type: 'out' },
    'pulsa': { target: 'acc_exp_utility', source: 'acc_cash', type: 'out' },
    'kuota': { target: 'acc_exp_utility', source: 'acc_cash', type: 'out' },

    // --- GAJI & HR (Payroll) ---
    'gaji': { target: 'acc_exp_salary', source: 'acc_bank_bca', type: 'out' },
    'salary': { target: 'acc_exp_salary', source: 'acc_bank_bca', type: 'out' },
    'upah': { target: 'acc_exp_salary', source: 'acc_cash', type: 'out' },
    'thr': { target: 'acc_exp_salary', source: 'acc_bank_bca', type: 'out' },
    'bonus': { target: 'acc_exp_salary', source: 'acc_bank_bca', type: 'out' },
    'kasbon': { target: 'acc_ar', source: 'acc_cash', type: 'out' }, // Kasbon = Piutang Karyawan

    // --- MARKETING & PROMOSI ---
    'iklan': { target: 'acc_exp_marketing', source: 'acc_bank_bca', type: 'out' },
    'ads': { target: 'acc_exp_marketing', source: 'acc_bank_bca', type: 'out' },
    'promo': { target: 'acc_exp_marketing', source: 'acc_cash', type: 'out' },
    'brosur': { target: 'acc_exp_marketing', source: 'acc_cash', type: 'out' },
    'banner': { target: 'acc_exp_marketing', source: 'acc_cash', type: 'out' },
    'endorse': { target: 'acc_exp_marketing', source: 'acc_bank_bca', type: 'out' },
    'sosmed': { target: 'acc_exp_marketing', source: 'acc_bank_bca', type: 'out' },

    // --- SEWA & TEMPAT (Rent) ---
    'sewa': { target: 'acc_exp_rent', source: 'acc_bank_bca', type: 'out' },
    'kontrak': { target: 'acc_exp_rent', source: 'acc_bank_bca', type: 'out' },
    'ruko': { target: 'acc_exp_rent', source: 'acc_bank_bca', type: 'out' },
    'kios': { target: 'acc_exp_rent', source: 'acc_bank_bca', type: 'out' },

    // --- MAINTENANCE & PERBAIKAN ---
    'servis': { target: 'acc_exp_maintenance', source: 'acc_cash', type: 'out' },
    'service': { target: 'acc_exp_maintenance', source: 'acc_cash', type: 'out' },
    'perbaikan': { target: 'acc_exp_maintenance', source: 'acc_cash', type: 'out' },
    'tukang': { target: 'acc_exp_maintenance', source: 'acc_cash', type: 'out' },
    'renovasi': { target: 'acc_exp_maintenance', source: 'acc_bank_bca', type: 'out' },
    'cat': { target: 'acc_exp_maintenance', source: 'acc_cash', type: 'out' },
    'lampu': { target: 'acc_exp_maintenance', source: 'acc_cash', type: 'out' },
    'kabel': { target: 'acc_exp_maintenance', source: 'acc_cash', type: 'out' },

    // --- OPERASIONAL KANTOR / ADMIN (ATK & Umum) ---
    'atk': { target: 'acc_exp_admin', source: 'acc_cash', type: 'out' },
    'kertas': { target: 'acc_exp_admin', source: 'acc_cash', type: 'out' },
    'tinta': { target: 'acc_exp_admin', source: 'acc_cash', type: 'out' },
    'pulpen': { target: 'acc_exp_admin', source: 'acc_cash', type: 'out' },
    'fotokopi': { target: 'acc_exp_admin', source: 'acc_cash', type: 'out' },
    'materai': { target: 'acc_exp_admin', source: 'acc_cash', type: 'out' },
    'iuran': { target: 'acc_exp_admin', source: 'acc_cash', type: 'out' },
    'sampah': { target: 'acc_exp_admin', source: 'acc_cash', type: 'out' },
    'kebersihan': { target: 'acc_exp_admin', source: 'acc_cash', type: 'out' },
    'parkir': { target: 'acc_exp_admin', source: 'acc_cash', type: 'out' },
    'bensin': { target: 'acc_exp_admin', source: 'acc_cash', type: 'out' },
    'ongkir': { target: 'acc_exp_admin', source: 'acc_cash', type: 'out' },

    // --- HPP / BAHAN BAKU (Procurement) ---
    'belanja': { target: 'acc_cogs', source: 'acc_cash', type: 'out' },
    'pasar': { target: 'acc_cogs', source: 'acc_cash', type: 'out' },
    'bahan': { target: 'acc_cogs', source: 'acc_cash', type: 'out' },
    'stok': { target: 'acc_cogs', source: 'acc_bank_bca', type: 'out' },
    'supplier': { target: 'acc_cogs', source: 'acc_bank_bca', type: 'out' },
    'kulakan': { target: 'acc_cogs', source: 'acc_bank_bca', type: 'out' },
    'restock': { target: 'acc_cogs', source: 'acc_bank_bca', type: 'out' },
    'beras': { target: 'acc_cogs', source: 'acc_cash', type: 'out' },
    'telur': { target: 'acc_cogs', source: 'acc_cash', type: 'out' },
    'daging': { target: 'acc_cogs', source: 'acc_cash', type: 'out' },
    'sayur': { target: 'acc_cogs', source: 'acc_cash', type: 'out' },
    'kopi': { target: 'acc_cogs', source: 'acc_cash', type: 'out' },
    'susu': { target: 'acc_cogs', source: 'acc_cash', type: 'out' },
    'gula': { target: 'acc_cogs', source: 'acc_cash', type: 'out' },

    // --- PENDAPATAN (Income) ---
    'jual': { target: 'acc_sales_other', source: 'acc_cash', type: 'in' },
    'rongsok': { target: 'acc_sales_other', source: 'acc_cash', type: 'in' },
    'kardus': { target: 'acc_sales_other', source: 'acc_cash', type: 'in' },
    'modal': { target: 'acc_capital', source: 'acc_bank_bca', type: 'in' },
    'suntikan': { target: 'acc_capital', source: 'acc_bank_bca', type: 'in' },
    'invest': { target: 'acc_capital', source: 'acc_bank_bca', type: 'in' },
    'catering': { target: 'acc_sales_food', source: 'acc_bank_bca', type: 'in' },
    'pesanan': { target: 'acc_sales_food', source: 'acc_bank_bca', type: 'in' },
};

const JournalEntryModal: React.FC<JournalEntryModalProps> = ({ isOpen, onClose, onSave, accounts }) => {
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'in' | 'out'>('out');
    const [accountId, setAccountId] = useState(''); // Target Account
    const [sourceAccountId, setSourceAccountId] = useState('acc_cash'); // Source Account
    const [note, setNote] = useState('');
    const [autoMatched, setAutoMatched] = useState<string | null>(null); // Visual feedback
    
    // Attachment State
    const [attachment, setAttachment] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Filter accounts based on type
    const targetAccounts = accounts.filter(acc => {
        if (type === 'out') return acc.category === 'EXPENSE' || acc.category === 'LIABILITY' || acc.category === 'ASSET'; 
        return acc.category === 'REVENUE' || acc.category === 'EQUITY' || acc.category === 'LIABILITY'; 
    });

    const sourceAccounts = accounts.filter(acc => acc.category === 'ASSET' && acc.subcategory === 'Lancar');

    // Smart Auto-Fill Logic
    const handleNoteChange = (text: string) => {
        setNote(text);
        const lowerText = text.toLowerCase();
        let matchFound = false;

        if (!text) setAutoMatched(null);

        // Sort keys by length desc to match "fb ads" before "ads"
        const sortedKeys = Object.keys(AUTO_MAP).sort((a, b) => b.length - a.length);

        for (const keyword of sortedKeys) {
            if (lowerText.includes(keyword)) {
                const rule = AUTO_MAP[keyword];
                
                const targetExists = accounts.some(a => a.id === rule.target);
                const sourceExists = accounts.some(a => a.id === rule.source);

                if (targetExists && sourceExists) {
                    setType(rule.type);
                    setAccountId(rule.target);
                    setSourceAccountId(rule.source);
                    setAutoMatched(keyword);
                    matchFound = true;
                }
                break;
            }
        }
        
        if (!matchFound && autoMatched && !text.toLowerCase().includes(autoMatched)) {
            setAutoMatched(null); 
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAttachment(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        if (!amount || !accountId || !sourceAccountId) return;
        const selectedAcc = accounts.find(a => a.id === accountId);
        
        onSave({
            amount: parseFloat(amount),
            type,
            accountId, 
            sourceAccountId, 
            accountName: selectedAcc?.name || 'Unknown',
            category: type === 'in' ? 'other' : 'operational',
            note: note || selectedAcc?.name || 'Manual Transaction',
            attachment // Save image data
        });
        
        onClose();
        setAmount('');
        setNote('');
        setAccountId('');
        setAutoMatched(null);
        setAttachment(null);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Catat Transaksi Manual">
            <div className="space-y-5">
                
                {/* 1. NOMINAL (Paling Atas) */}
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Nominal (Rp)</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-orange-500">Rp</span>
                        <GlassInput 
                            type="number" 
                            placeholder="0"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="font-black text-2xl pl-12 py-4 h-16 text-white"
                            autoFocus
                        />
                    </div>
                </div>

                {/* 2. KETERANGAN (Auto Detect) */}
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-gray-400 uppercase">Keterangan / Keperluan</label>
                        {autoMatched && (
                            <span className="text-[10px] text-orange-400 flex items-center gap-1 animate-in fade-in slide-in-from-right-2 font-bold bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/30">
                                <Sparkles size={10} /> Auto: {autoMatched.toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="relative">
                        <FileText size={18} className={`absolute left-3 top-3 transition-colors ${autoMatched ? 'text-orange-500' : 'text-gray-500'}`} />
                        <textarea 
                            className={`w-full glass-input rounded-xl py-2.5 pl-10 pr-4 text-white text-sm h-20 resize-none transition-all ${autoMatched ? 'border-orange-500/50 focus:border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : ''}`}
                            placeholder="Contoh: Beli Bensin, Bayar Listrik, Gaji Karyawan..."
                            value={note}
                            onChange={e => handleNoteChange(e.target.value)}
                        ></textarea>
                    </div>
                </div>

                {/* 3. TYPE SWITCHER */}
                <div className="flex bg-black/40 p-1 rounded-xl">
                    <button 
                        onClick={() => { setType('out'); setAccountId(''); setAutoMatched(null); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === 'out' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Pengeluaran (Out)
                    </button>
                    <button 
                        onClick={() => { setType('in'); setAccountId(''); setAutoMatched(null); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === 'in' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Pemasukan (In)
                    </button>
                </div>

                {/* 4. ACCOUNT MAPPING */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-4">
                    {/* Source Account */}
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                            {type === 'out' ? 'Sumber Dana (Kredit)' : 'Masuk Ke (Debit)'}
                        </label>
                        <select 
                            value={sourceAccountId}
                            onChange={e => setSourceAccountId(e.target.value)}
                            className="w-full glass-input rounded-xl p-3 bg-[#1e293b] text-white appearance-none cursor-pointer border-blue-500/30"
                        >
                            {sourceAccounts.map(acc => (
                                <option key={acc.id} value={acc.id} className="bg-gray-900">{acc.name} (Rp {acc.balance.toLocaleString()})</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-center text-gray-500">
                        <ArrowRightLeft size={16} className="rotate-90"/>
                    </div>

                    {/* Target Account */}
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                            {type === 'out' ? 'Alokasi Ke (Debit)' : 'Sumber Pendapatan (Kredit)'}
                        </label>
                        <select 
                            value={accountId}
                            onChange={e => setAccountId(e.target.value)}
                            className={`w-full glass-input rounded-xl p-3 bg-[#1e293b] text-white appearance-none cursor-pointer transition-all ${autoMatched ? 'border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.2)]' : ''}`}
                        >
                            <option value="">-- Pilih Akun --</option>
                            {targetAccounts.map(acc => (
                                <option key={acc.id} value={acc.id} className="bg-gray-900">{acc.code} - {acc.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 5. ATTACHMENT / BUKTI */}
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Bukti Transaksi / Struk (Opsional)</label>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                    />
                    
                    {!attachment ? (
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-3 border border-dashed border-gray-600 rounded-xl flex items-center justify-center gap-2 text-gray-500 hover:text-white hover:border-white/30 transition-all hover:bg-white/5"
                        >
                            <Camera size={18} /> Upload Foto Bukti
                        </button>
                    ) : (
                        <div className="relative rounded-xl overflow-hidden bg-black/40 border border-white/10 group">
                            <img src={attachment} alt="Preview" className="w-full h-32 object-cover opacity-80" />
                            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-sm">
                                <button onClick={() => setAttachment(null)} className="p-2 bg-red-600 text-white rounded-lg">
                                    <X size={16} />
                                </button>
                                <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-white/20 text-white rounded-lg">
                                    <Camera size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <button 
                    onClick={handleSubmit}
                    disabled={!amount || !accountId || !sourceAccountId}
                    className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 mt-4"
                >
                    <Save size={18} /> Simpan Transaksi
                </button>
            </div>
        </Modal>
    );
};

export default JournalEntryModal;
