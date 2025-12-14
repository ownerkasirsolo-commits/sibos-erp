
import { useState } from 'react';
import { PaymentMethod } from '../types';
import { useGlobalContext } from '../../../context/GlobalContext';

export const useWalletLogic = () => {
    // Consume data from Global Context
    const { walletBalance, walletTransactions, topUpWallet } = useGlobalContext();

    const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState<number | ''>('');
    const [selectedMethod, setSelectedMethod] = useState<string>('bca');

    const paymentMethods: PaymentMethod[] = [
        { id: 'bca', name: 'BCA Virtual Account', accountNumber: '8800 1234 5678', type: 'Bank', logo: 'BCA' },
        { id: 'mandiri', name: 'Mandiri Bill', accountNumber: '9000 9876 5432', type: 'Bank', logo: 'MANDIRI' },
        { id: 'qris', name: 'QRIS Instant', accountNumber: '', type: 'E-Wallet', logo: 'QRIS' },
    ];

    const handleTopUp = () => {
        if (!topUpAmount || topUpAmount < 10000) {
            alert("Minimal top up Rp 10.000");
            return;
        }

        const method = paymentMethods.find(m => m.id === selectedMethod)?.name || 'Unknown';
        topUpWallet(Number(topUpAmount), method);

        setIsTopUpModalOpen(false);
        setTopUpAmount('');
        alert("Top Up Berhasil!");
    };

    return {
        balance: walletBalance,
        transactions: walletTransactions,
        isTopUpModalOpen, setIsTopUpModalOpen,
        topUpAmount, setTopUpAmount,
        selectedMethod, setSelectedMethod,
        paymentMethods,
        handleTopUp
    };
};
