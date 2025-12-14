
import { useState } from 'react';
import { WalletBalance, WalletTransaction } from '../../features/wallet/types';

export const useWalletSlice = () => {
    // --- WALLET STATE (Mock) ---
    const [walletBalance, setWalletBalance] = useState<WalletBalance>({
          amount: 2500000,
          currency: 'IDR',
          lastUpdated: new Date().toISOString(),
          status: 'Active'
    });
    
    const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([
          { id: 'TRX-001', type: 'credit', amount: 5000000, category: 'Top Up', status: 'Success', date: '2024-05-01T10:00:00', description: 'Top Up via BCA Virtual Account' },
          { id: 'TRX-002', type: 'debit', amount: 250000, category: 'Subscription', status: 'Success', date: '2024-05-01T10:05:00', description: 'Paket Juragan (Bulanan)' },
    ]);

    const processWalletPayment = async (amount: number, description: string, category: WalletTransaction['category']): Promise<boolean> => {
        if (walletBalance.amount < amount) return false;
        
        const newTrx: WalletTransaction = {
            id: `TRX-${Date.now()}`,
            type: 'debit',
            amount: amount,
            category: category,
            status: 'Success',
            date: new Date().toISOString(),
            description: description
        };

        setWalletTransactions(prev => [newTrx, ...prev]);
        setWalletBalance(prev => ({
            ...prev,
            amount: prev.amount - amount,
            lastUpdated: new Date().toISOString()
        }));
        return true;
    };

    const topUpWallet = async (amount: number, method: string) => {
         const newTrx: WalletTransaction = {
            id: `TRX-${Date.now()}`,
            type: 'credit',
            amount: amount,
            category: 'Top Up',
            status: 'Success',
            date: new Date().toISOString(),
            description: `Top Up via ${method}`
        };
        setWalletTransactions(prev => [newTrx, ...prev]);
        setWalletBalance(prev => ({
            ...prev,
            amount: prev.amount + amount,
            lastUpdated: new Date().toISOString()
        }));
    };

    return {
        walletBalance,
        walletTransactions,
        processWalletPayment,
        topUpWallet
    };
};
