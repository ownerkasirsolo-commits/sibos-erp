
import { ClientTier } from "../../types";

export interface PartnerProfile {
    id: string;
    name: string;
    region: string;
    joinDate: string;
    status: 'Active' | 'Suspended';
    totalLoad: number; // 0-100%
    walletBalance: number;
}

export interface ManagedClient {
    id: string;
    businessName: string;
    ownerName: string;
    tier: ClientTier;
    joinDate: string;
    status: 'Active' | 'Pending Setup' | 'Maintenance' | 'Churned';
    lastServiceDate: string;
    nextServiceDue: string;
    location: string;
}

export interface ServiceInvoice {
    id: string;
    clientId: string;
    clientName: string;
    type: 'Instalasi' | 'Training' | 'Maintenance' | 'Visit';
    amount: number;
    sharePercentage: number; // Berapa % masuk ke Partner (misal 80%)
    netIncome: number; // amount * sharePercentage
    date: string;
    status: 'Paid' | 'Unpaid';
    description: string;
}
