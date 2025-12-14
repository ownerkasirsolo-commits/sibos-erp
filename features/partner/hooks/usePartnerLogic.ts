
import { useState, useMemo } from 'react';
import { ClientTier } from '../../../types';
import { PartnerProfile, ManagedClient, ServiceInvoice } from '../types';

export const usePartnerLogic = () => {
    // Mock Partner Data
    const partner: PartnerProfile = {
        id: 'PARTNER-001',
        name: 'Andi Techno Solution',
        region: 'Jakarta Selatan',
        joinDate: '2023-01-15',
        status: 'Active',
        totalLoad: 0, // Calculated below
        walletBalance: 15400000
    };

    // Mock Clients
    const [clients, setClients] = useState<ManagedClient[]>([
        { id: 'c1', businessName: 'Kopi Kenangan Mantan', ownerName: 'Budi', tier: ClientTier.MEDIUM, joinDate: '2024-01-10', status: 'Active', lastServiceDate: '2024-05-01', nextServiceDue: '2024-06-01', location: 'Kemang' },
        { id: 'c2', businessName: 'Warung Bu Susi', ownerName: 'Susi', tier: ClientTier.SMALL, joinDate: '2024-02-15', status: 'Active', lastServiceDate: '2024-04-20', nextServiceDue: '2024-07-20', location: 'Cilandak' },
        { id: 'c3', businessName: 'PT. Maju Mundur (Pabrik Roti)', ownerName: 'Pak Harto', tier: ClientTier.LARGE, joinDate: '2023-11-05', status: 'Maintenance', lastServiceDate: '2024-05-15', nextServiceDue: '2024-05-22', location: 'Cibubur' },
        // ... add more to test load
    ]);

    // Mock Invoices (Jasa)
    const [invoices, setInvoices] = useState<ServiceInvoice[]>([
        { id: 'INV-S-001', clientId: 'c3', clientName: 'PT. Maju Mundur', type: 'Maintenance', amount: 2500000, sharePercentage: 80, netIncome: 2000000, date: '2024-05-15', status: 'Paid', description: 'Perbaikan Jaringan LAN Kasir' },
        { id: 'INV-S-002', clientId: 'c1', clientName: 'Kopi Kenangan Mantan', type: 'Training', amount: 500000, sharePercentage: 90, netIncome: 450000, date: '2024-05-10', status: 'Paid', description: 'Training Kasir Baru' },
        { id: 'INV-S-003', clientId: 'c2', clientName: 'Warung Bu Susi', type: 'Instalasi', amount: 300000, sharePercentage: 90, netIncome: 270000, date: '2024-02-15', status: 'Paid', description: 'Setup Awal Tablet' },
    ]);

    // --- LOGIC: CAPACITY CALCULATION ---
    const calculateLoad = () => {
        let load = 0;
        clients.forEach(c => {
            if (c.status === 'Churned') return;
            switch(c.tier) {
                case ClientTier.SMALL: load += 2; break; // 50 max (100/2)
                case ClientTier.MEDIUM: load += 5; break; // 20 max (100/5)
                case ClientTier.LARGE: load += 20; break; // 5 max (100/20)
            }
        });
        return Math.min(load, 100);
    };

    const currentLoad = calculateLoad();
    const isOverloaded = currentLoad >= 100;

    // --- ACTIONS ---
    const createServiceInvoice = (clientId: string, type: ServiceInvoice['type'], amount: number, desc: string) => {
        const client = clients.find(c => c.id === clientId);
        if (!client) return;

        // Logic pembagian hasil (Contoh: SIBOS ambil 10-20% fee platform jasa)
        const share = type === 'Instalasi' ? 90 : 80; // Partner dapet lebih gede di instalasi
        
        const newInv: ServiceInvoice = {
            id: `INV-S-${Date.now()}`,
            clientId,
            clientName: client.businessName,
            type,
            amount,
            sharePercentage: share,
            netIncome: amount * (share / 100),
            date: new Date().toISOString(),
            status: 'Unpaid',
            description: desc
        };

        setInvoices(prev => [newInv, ...prev]);
        alert("Tagihan Jasa berhasil dibuat! Link pembayaran dikirim ke user.");
    };

    const transferClient = (clientId: string) => {
        // Logic untuk melempar klien ke partner lain jika overload
        setClients(prev => prev.filter(c => c.id !== clientId));
        alert("Klien dialihkan ke Pool Area Jakarta Selatan untuk diambil partner lain.");
    };

    return {
        partner: { ...partner, totalLoad: currentLoad },
        clients,
        invoices,
        isOverloaded,
        createServiceInvoice,
        transferClient
    };
};
