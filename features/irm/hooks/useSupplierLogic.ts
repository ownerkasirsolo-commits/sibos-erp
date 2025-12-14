
import React, { useState, useMemo } from 'react';
import { Supplier } from '../types';
import { useGlobalContext } from '../../../context/GlobalContext';
import { ActivityLog } from '../../../components/common/LiveLogPanel';

type SortKey = keyof Supplier | '';

export const useSupplierLogic = () => {
    const { suppliers, addSupplier, availableBusinesses, activeBusinessId, purchaseOrders } = useGlobalContext();

    // -- STATE --
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterType, setFilterType] = useState<'All' | 'Network' | 'Regular'>('All');
    const [filterScore, setFilterScore] = useState<'All' | 'Excellent' | 'Good' | 'Poor'>('All'); // NEW FILTER
    
    const [sortConfig, setSortConfig] = useState<{ key: SortKey, direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Modals
    const [isQuickAddSupplierOpen, setIsQuickAddSupplierOpen] = useState(false);
    const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isLiveLogOpen, setIsLiveLogOpen] = useState(false);

    // -- DATA PROCESSING --
    const categories = useMemo(() => ['All', ...Array.from(new Set(suppliers.map(s => s.category)))], [suppliers]);

    const sortedAndFilteredSuppliers = useMemo(() => {
        let filtered = suppliers;

        // 1. Filter Category
        if (filterCategory !== 'All') {
            filtered = filtered.filter(s => s.category === filterCategory);
        }

        // 2. Filter Type (B2B Network vs Regular)
        if (filterType !== 'All') {
            if (filterType === 'Network') filtered = filtered.filter(s => s.isSibosNetwork);
            if (filterType === 'Regular') filtered = filtered.filter(s => !s.isSibosNetwork);
        }

        // 3. Filter Score (NEW)
        if (filterScore !== 'All') {
            filtered = filtered.filter(s => {
                const score = s.performanceScore || 0;
                if (filterScore === 'Excellent') return score >= 90;
                if (filterScore === 'Good') return score >= 70 && score < 90;
                if (filterScore === 'Poor') return score < 70;
                return true;
            });
        }

        // 4. Search
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(s => 
                s.name.toLowerCase().includes(lowerSearch) || 
                s.contact.toLowerCase().includes(lowerSearch) ||
                s.category.toLowerCase().includes(lowerSearch)
            );
        }

        // 5. Sort
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                // Handle optional properties
                const aVal = a[sortConfig.key as keyof Supplier] ?? '';
                const bVal = b[sortConfig.key as keyof Supplier] ?? '';

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [suppliers, searchTerm, filterCategory, filterType, filterScore, sortConfig]);

    const paginatedSuppliers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedAndFilteredSuppliers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedAndFilteredSuppliers, currentPage]);

    const totalPages = Math.ceil(sortedAndFilteredSuppliers.length / ITEMS_PER_PAGE);

    // -- HANDLERS --
    const handleSort = (key: SortKey) => {
        if (!key) return;
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // -- IMPORT / EXPORT --
    const handleExportCSV = () => {
        if (suppliers.length === 0) {
            alert("Tidak ada data untuk diexport.");
            return;
        }
        const headers = ['ID', 'Nama', 'Kategori', 'Kontak', 'Telepon', 'Network', 'Skor'];
        const rows = suppliers.map(s => [
            s.id, `"${s.name}"`, s.category, s.contact, `"${s.phone}"`, s.isSibosNetwork ? 'Yes' : 'No', s.performanceScore || 0
        ]);
        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `SIBOS_Suppliers_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        // Mock import logic
        alert("Simulasi: Data berhasil diimpor. (Fitur parsing CSV real akan diimplementasikan di backend)");
        event.target.value = '';
    };

    // -- LIVE LOGS --
    const liveLogs: ActivityLog[] = useMemo(() => {
        const logs: ActivityLog[] = [];
        
        // Generate logs from recent POs linked to suppliers
        purchaseOrders.forEach(po => {
            if (po.status === 'received') {
                logs.push({
                    id: `LOG-SUP-RECV-${po.id}`,
                    type: 'success',
                    message: `Pesanan selesai dari supplier ${po.supplierName}`,
                    user: po.receivedBy || 'System',
                    timestamp: po.receivedDate || po.orderDate,
                    value: po.totalEstimated
                });
            } else if (po.status === 'ordered') {
                logs.push({
                    id: `LOG-SUP-ORD-${po.id}`,
                    type: 'info',
                    message: `Mengirim PO baru ke ${po.supplierName}`,
                    user: po.createdBy,
                    timestamp: po.orderDate
                });
            }
        });

        // Add dummy logs for "Supplier Added"
        suppliers.slice(0, 3).forEach(s => {
             logs.push({
                id: `LOG-SUP-ADD-${s.id}`,
                type: 'neutral',
                message: `Supplier baru ditambahkan: ${s.name}`,
                user: 'Admin',
                timestamp: new Date().toISOString()
            });
        });

        return logs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 50);
    }, [purchaseOrders, suppliers]);

    // -- STATS FOR WIDGETS --
    const stats = {
        total: suppliers.length,
        network: suppliers.filter(s => s.isSibosNetwork).length,
        offline: suppliers.filter(s => !s.isSibosNetwork).length,
        top5: [...suppliers].sort((a,b) => (b.performanceScore || 0) - (a.performanceScore || 0)).slice(0, 5)
    };

    return {
        // Data
        suppliers: paginatedSuppliers,
        totalSuppliersCount: sortedAndFilteredSuppliers.length,
        categories,
        availableBusinesses,
        activeBusinessId,
        stats,
        
        // State
        searchTerm, setSearchTerm,
        filterCategory, setFilterCategory,
        filterType, setFilterType,
        filterScore, setFilterScore,
        sortConfig,
        currentPage, setCurrentPage,
        totalPages,

        // Modals
        isQuickAddSupplierOpen, setIsQuickAddSupplierOpen,
        isDirectoryOpen, setIsDirectoryOpen,
        isReportModalOpen, setIsReportModalOpen,
        isLiveLogOpen, setIsLiveLogOpen,
        liveLogs,

        // Handlers
        handleSort,
        handleExportCSV,
        handleImportCSV,
        addSupplier // Re-export for component use
    };
};
