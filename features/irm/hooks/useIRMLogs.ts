
import { useState, useMemo } from 'react';
import { useGlobalContext } from '../../../context/GlobalContext';
import { ActivityLog } from '../../../components/common/LiveLogPanel';

export const useIRMLogs = () => {
    const { 
        stockAdjustments, 
        purchaseOrders, 
        stockTransfers, 
        suppliers,
        ingredients
    } = useGlobalContext();

    const [activeTab, setActiveTab] = useState<'All' | 'Stock' | 'Procurement' | 'Distribution' | 'Supplier'>('All');
    const [searchTerm, setSearchTerm] = useState('');

    const aggregatedLogs: ActivityLog[] = useMemo(() => {
        const logs: ActivityLog[] = [];

        // 1. Stock Logs (Adjustments)
        stockAdjustments.forEach(adj => {
            logs.push({
                id: adj.id,
                type: 'warning',
                message: `Stok Adjusted: ${adj.ingredientName} (${adj.oldStock} -> ${adj.newStock})`,
                user: adj.staffName,
                timestamp: adj.timestamp,
                value: Math.abs(adj.variance * (ingredients.find(i => i.id === adj.ingredientId)?.avgCost || 0)),
                // Add a category property for filtering (custom extension of ActivityLog logic in memory)
                // @ts-ignore
                category: 'Stock'
            });
        });

        // 2. Procurement Logs (POs)
        purchaseOrders.forEach(po => {
            if (po.status === 'ordered') {
                logs.push({
                    id: `PO-ORD-${po.id}`,
                    type: 'info',
                    message: `PO #${po.id} Dipesan ke ${po.supplierName}`,
                    user: po.createdBy,
                    timestamp: po.orderDate,
                    value: po.totalEstimated,
                    // @ts-ignore
                    category: 'Procurement'
                });
            } else if (po.status === 'received') {
                logs.push({
                    id: `PO-RECV-${po.id}`,
                    type: 'success',
                    message: `PO #${po.id} Diterima dari ${po.supplierName}`,
                    user: po.receivedBy || 'System',
                    timestamp: po.receivedDate || po.orderDate,
                    value: po.totalEstimated,
                    // @ts-ignore
                    category: 'Procurement'
                });
            } else if (po.status === 'rejected') {
                logs.push({
                    id: `PO-REJ-${po.id}`,
                    type: 'danger',
                    message: `PO #${po.id} Ditolak`,
                    user: po.approvedBy || 'Manager',
                    timestamp: po.orderDate, // Fallback timestamp
                    // @ts-ignore
                    category: 'Procurement'
                });
            }
        });

        // 3. Distribution Logs (Transfers)
        stockTransfers.forEach(trf => {
            logs.push({
                id: `TRF-REQ-${trf.id}`,
                type: 'info',
                message: `Request Distribusi #${trf.id} dari ${trf.targetOutletName}`,
                user: trf.requestedBy,
                timestamp: trf.requestDate,
                // @ts-ignore
                category: 'Distribution'
            });

            if (trf.status === 'shipped') {
                logs.push({
                    id: `TRF-SHIP-${trf.id}`,
                    type: 'warning',
                    message: `Distribusi #${trf.id} Dikirim ke ${trf.targetOutletName}`,
                    user: trf.shippedBy || 'Gudang',
                    timestamp: trf.shipDate || trf.requestDate,
                    // @ts-ignore
                    category: 'Distribution'
                });
            } else if (trf.status === 'received') {
                logs.push({
                    id: `TRF-RECV-${trf.id}`,
                    type: 'success',
                    message: `Distribusi #${trf.id} Diterima di Outlet`,
                    user: trf.receivedBy || 'Outlet',
                    timestamp: trf.receiveDate || trf.requestDate,
                    // @ts-ignore
                    category: 'Distribution'
                });
            }
        });

        // 4. Supplier Logs (New Additions)
        // Note: In real app, we'd have a 'createdAt' field on suppliers. 
        // For mock, we skip or use a fixed recent date if needed, or filter POs for supplier interactions.
        
        return logs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [stockAdjustments, purchaseOrders, stockTransfers, ingredients]);

    // Filtering
    const visibleLogs = useMemo(() => {
        return aggregatedLogs.filter(log => {
            // Filter by Tab
            // @ts-ignore
            if (activeTab !== 'All' && log.category !== activeTab) return false;

            // Filter by Search
            if (searchTerm) {
                const lower = searchTerm.toLowerCase();
                return (
                    log.message.toLowerCase().includes(lower) || 
                    log.user.toLowerCase().includes(lower) ||
                    log.id.toLowerCase().includes(lower)
                );
            }
            return true;
        });
    }, [aggregatedLogs, activeTab, searchTerm]);

    return {
        activeTab, setActiveTab,
        searchTerm, setSearchTerm,
        visibleLogs,
        totalLogs: aggregatedLogs.length
    };
};
