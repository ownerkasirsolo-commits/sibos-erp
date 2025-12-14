
export interface WalletTransaction {
    id: string;
    type: 'credit' | 'debit'; // Masuk | Keluar
    amount: number;
    category: 'Top Up' | 'Subscription' | 'Add-On' | 'Refund' | 'Withdraw';
    status: 'Success' | 'Pending' | 'Failed';
    date: string;
    description: string;
    refId?: string; // ID Referensi (Misal No Tagihan)
}

export interface WalletBalance {
    amount: number;
    currency: string;
    lastUpdated: string;
    status: 'Active' | 'Frozen';
}

export interface PaymentMethod {
    id: string;
    name: string;
    accountNumber: string;
    type: 'Bank' | 'E-Wallet';
    logo: string;
}
