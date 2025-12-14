
import React, { useState } from 'react';
import { CashTransaction } from '../types';
import CompactNumber from '../../../components/common/CompactNumber';
import GlassPanel from '../../../components/common/GlassPanel';
import { Image as ImageIcon, X } from 'lucide-react';
import Modal from '../../../components/common/Modal';

interface TransactionTableProps {
    transactions: CashTransaction[];
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
        <GlassPanel className="p-6 rounded-3xl">
            <h3 className="text-lg font-bold text-white mb-4">Transaksi Terakhir</h3>
            <div className="space-y-3">
                {transactions.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">Belum ada data.</p>
                ) : (
                    transactions.map(tx => (
                        <div key={tx.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5 gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-white text-sm truncate">{tx.note}</p>
                                    {tx.attachment && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setSelectedImage(tx.attachment || null); }}
                                            className="text-blue-400 hover:text-blue-300 transition-colors shrink-0"
                                            title="Lihat Bukti Transaksi"
                                        >
                                            <ImageIcon size={14} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 truncate">{new Date(tx.timestamp).toLocaleString()}</p>
                            </div>
                            <div className={`font-mono font-bold flex items-center gap-1 shrink-0 ${tx.type === 'in' ? 'text-green-400' : 'text-red-400'}`}>
                                <span>{tx.type === 'in' ? '+' : '-'}</span>
                                <CompactNumber value={tx.amount} forceFull />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </GlassPanel>

        {/* IMAGE PREVIEW MODAL */}
        {selectedImage && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
                <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                    <X size={24} />
                </button>
                <img 
                    src={selectedImage} 
                    alt="Bukti Transaksi" 
                    className="max-w-full max-h-[85vh] rounded-xl shadow-2xl border border-white/10"
                    onClick={(e) => e.stopPropagation()} // Prevent close on image click
                />
            </div>
        )}
    </>
  );
};

export default TransactionTable;
