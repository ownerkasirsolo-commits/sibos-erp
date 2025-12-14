

import React from 'react';
// @FIX: Import CashTransaction from its correct location in features/accounting/types.
import { CashTransaction } from '../../features/accounting/types';
import CompactNumber from '../common/CompactNumber';
import GlassPanel from '../common/GlassPanel';

interface TransactionTableProps {
    transactions: CashTransaction[];
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  return (
    <GlassPanel className="p-6 rounded-3xl">
        <h3 className="text-lg font-bold text-white mb-4">Transaksi Terakhir</h3>
        <div className="space-y-3">
            {transactions.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Belum ada data.</p>
            ) : (
                transactions.map(tx => (
                    <div key={tx.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                        <div>
                            <p className="font-bold text-white text-sm">{tx.note}</p>
                            <p className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleString()}</p>
                        </div>
                        <div className={`font-mono font-bold flex items-center gap-1 ${tx.type === 'in' ? 'text-green-400' : 'text-red-400'}`}>
                            <span>{tx.type === 'in' ? '+' : '-'}</span>
                            <CompactNumber value={tx.amount} />
                        </div>
                    </div>
                ))
            )}
        </div>
    </GlassPanel>
  );
};

export default TransactionTable;