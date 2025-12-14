
import { useState, useMemo } from 'react';
import { UnitType } from '../../../types';
import { StockTransfer, StockTransferItem } from '../types';
import { useGlobalContext } from '../../../context/GlobalContext';
import { ActivityLog } from '../../../components/common/LiveLogPanel';

// --- HOOK 1: BRANCH DISTRIBUTION LOGIC (Requesting) ---
export const useBranchDistributionLogic = () => {
    const { stockTransfers, createStockTransfer, receiveStockTransfer, currentUser, activeOutlet, ingredients } = useGlobalContext();
    
    const [isRequestingStock, setIsRequestingStock] = useState(false);
    const [reqItems, setReqItems] = useState<StockTransferItem[]>([]);
    
    // Live Log State
    const [isLiveLogOpen, setIsLiveLogOpen] = useState(false);

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'All' | 'pending' | 'shipped' | 'received'>('All');

    // Input State
    const [newItemId, setNewItemId] = useState('');
    const [newItemQty, setNewItemQty] = useState('');
    const [newItemUnit, setNewItemUnit] = useState<UnitType | ''>('');

    const filteredStockTransfers = useMemo(() => {
        let list = stockTransfers.filter(trf => trf.targetOutletId === activeOutlet?.id);
        
        if (searchTerm) {
            list = list.filter(trf => trf.id.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        
        if (filterStatus !== 'All') {
            list = list.filter(trf => trf.status === filterStatus);
        }
        
        return list.reverse();
    }, [stockTransfers, activeOutlet, searchTerm, filterStatus]);

    // Calculate Stats for Widget
    const stats = useMemo(() => {
        const total = stockTransfers.filter(trf => trf.targetOutletId === activeOutlet?.id).length;
        const pending = stockTransfers.filter(trf => trf.targetOutletId === activeOutlet?.id && trf.status === 'pending').length;
        const shipped = stockTransfers.filter(trf => trf.targetOutletId === activeOutlet?.id && trf.status === 'shipped').length;
        return { total, pending, shipped };
    }, [stockTransfers, activeOutlet]);

    // --- LIVE LOGS GENERATION ---
    const liveLogs: ActivityLog[] = useMemo(() => {
        const logs: ActivityLog[] = [];
        const outletTransfers = stockTransfers.filter(trf => trf.targetOutletId === activeOutlet?.id);

        outletTransfers.forEach(trf => {
            // Log 1: Created
            logs.push({
                id: `LOG-TRF-REQ-${trf.id}`,
                type: 'info',
                message: `Request stok #${trf.id} dibuat (${trf.items.length} item)`,
                user: trf.requestedBy,
                timestamp: trf.requestDate
            });

            // Log 2: Shipped (Incoming)
            if (trf.status === 'shipped' || trf.status === 'received') {
                logs.push({
                    id: `LOG-TRF-SHIP-${trf.id}`,
                    type: 'warning', // Warning as attention needed
                    message: `Barang #${trf.id} dikirim dari Pusat`,
                    user: trf.shippedBy || 'Gudang',
                    timestamp: trf.shipDate || trf.requestDate
                });
            }

            // Log 3: Received
            if (trf.status === 'received') {
                logs.push({
                    id: `LOG-TRF-RECV-${trf.id}`,
                    type: 'success',
                    message: `Stok #${trf.id} diterima masuk inventory`,
                    user: trf.receivedBy || 'Staff',
                    timestamp: trf.receiveDate || trf.requestDate
                });
            }
        });

        return logs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 50);
    }, [stockTransfers, activeOutlet]);

    const handleAddItemToRequest = () => {
        if (!newItemId || !newItemQty || !newItemUnit) return;
        const ingredient = ingredients.find(i => i.id === newItemId);
        if (!ingredient) return;
        const newItem: StockTransferItem = {
            ingredientId: ingredient.id,
            ingredientName: ingredient.name,
            quantityRequested: parseFloat(newItemQty),
            unit: ingredient.unit
        };
        setReqItems([...reqItems, newItem]);
        setNewItemId(''); setNewItemQty(''); setNewItemUnit('');
    };

    const handleSubmitRequest = () => {
        if (reqItems.length === 0 || !currentUser || !activeOutlet) return;
        // Use fixed ID for central/gudang logic in this ecosystem demo (ID: 201 is Gudang Distribusi in mocks)
        // In real app, this would be a config selection
        const centralOutletId = '201'; 

        const transfer: StockTransfer = {
            id: `TRF-${Date.now().toString().slice(-6)}`,
            sourceOutletId: centralOutletId, 
            targetOutletId: activeOutlet.id,
            targetOutletName: activeOutlet.name,
            items: reqItems,
            status: 'pending',
            requestDate: new Date().toISOString(),
            requestedBy: currentUser.name
        };
        createStockTransfer(transfer);
        alert(`Request stok dikirim ke Pusat!`);
        setReqItems([]); setIsRequestingStock(false);
    };

    const handleReceiveShipment = (transfer: StockTransfer) => {
        const receivedItems = transfer.items.map(i => ({...i, quantityReceived: i.quantityShipped}));
        receiveStockTransfer(transfer.id, receivedItems);
        alert("Stok masuk berhasil! Inventory cabang bertambah.");
    };

    return {
        ingredients,
        isRequestingStock, setIsRequestingStock,
        reqItems, setReqItems,
        newItemId, setNewItemId,
        newItemQty, setNewItemQty,
        newItemUnit, setNewItemUnit,
        filteredStockTransfers,
        handleAddItemToRequest,
        handleSubmitRequest,
        handleReceiveShipment,
        
        // New Exports
        searchTerm, setSearchTerm,
        filterStatus, setFilterStatus,
        stats,
        isLiveLogOpen, setIsLiveLogOpen,
        liveLogs
    };
};

// --- HOOK 2: CENTRAL DISTRIBUTION LOGIC (Shipping) ---
export const useCentralDistributionLogic = () => {
    const { stockTransfers, shipStockTransfer, activeOutlet, currentUser } = useGlobalContext();
    
    const [selectedTransfer, setSelectedTransfer] = useState<StockTransfer | null>(null);
    const [isTransferDetailOpen, setIsTransferDetailOpen] = useState(false);
    const [shippingItems, setShippingItems] = useState<StockTransferItem[]>([]);
    
    // Live Log State
    const [isLiveLogOpen, setIsLiveLogOpen] = useState(false);

    // Search & Filter
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'All' | 'pending' | 'shipped' | 'received'>('pending'); // Default to pending tasks

    const filteredStockTransfers = useMemo(() => {
        // Filter transfers where Source is this Active Outlet (Central/Gudang)
        // OR generic 'central' tag if simulated
        let list = stockTransfers.filter(trf => 
            trf.sourceOutletId === activeOutlet?.id || 
            trf.sourceOutletId === 'central' ||
            trf.sourceOutletId === '201' // Matches the ID used in Branch logic
        );
        
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            list = list.filter(trf => 
                trf.id.toLowerCase().includes(lowerSearch) || 
                trf.targetOutletName.toLowerCase().includes(lowerSearch)
            );
        }

        if (filterStatus !== 'All') {
            list = list.filter(trf => trf.status === filterStatus);
        }

        return list.reverse();
    }, [stockTransfers, activeOutlet, searchTerm, filterStatus]);

    // Stats for Widget
    const stats = useMemo(() => {
        const allCentral = stockTransfers.filter(trf => trf.sourceOutletId === activeOutlet?.id || trf.sourceOutletId === '201');
        const pending = allCentral.filter(t => t.status === 'pending').length;
        const shippedToday = allCentral.filter(t => t.status === 'shipped' && new Date(t.shipDate || '').toDateString() === new Date().toDateString()).length;
        return { pending, shippedToday };
    }, [stockTransfers, activeOutlet]);

    // --- LIVE LOGS GENERATION ---
    const liveLogs: ActivityLog[] = useMemo(() => {
        const logs: ActivityLog[] = [];
        const centralTransfers = stockTransfers.filter(trf => trf.sourceOutletId === activeOutlet?.id || trf.sourceOutletId === '201');

        centralTransfers.forEach(trf => {
            // Log 1: Incoming Request
            logs.push({
                id: `LOG-CENTRAL-REQ-${trf.id}`,
                type: 'info',
                message: `Request Masuk #${trf.id} dari ${trf.targetOutletName}`,
                user: trf.requestedBy,
                timestamp: trf.requestDate
            });

            // Log 2: Shipped Out
            if (trf.status === 'shipped' || trf.status === 'received') {
                logs.push({
                    id: `LOG-CENTRAL-SHIP-${trf.id}`,
                    type: 'success',
                    message: `Mengirim barang #${trf.id} ke ${trf.targetOutletName}`,
                    user: trf.shippedBy || 'Admin',
                    timestamp: trf.shipDate || trf.requestDate
                });
            }
        });

        return logs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 50);
    }, [stockTransfers, activeOutlet]);

    const handleOpenShipmentModal = (trf: StockTransfer) => {
        setSelectedTransfer(trf);
        const initialShipItems = trf.items.map(i => ({
            ...i,
            quantityShipped: i.quantityRequested 
        }));
        setShippingItems(initialShipItems);
        setIsTransferDetailOpen(true);
    };

    const updateShippingQty = (index: number, val: number) => {
        const updated = [...shippingItems];
        updated[index].quantityShipped = val;
        setShippingItems(updated);
    };

    const handleProcessShipment = () => {
        if(!selectedTransfer) return;
        shipStockTransfer(selectedTransfer.id, shippingItems, {driver: 'Pak Ujang', plate: 'B 1234 CD'});
        alert("Barang dikirim! Stok gudang telah dipotong.");
        setIsTransferDetailOpen(false);
    };

    return {
        filteredStockTransfers,
        selectedTransfer,
        isTransferDetailOpen, setIsTransferDetailOpen,
        shippingItems,
        handleOpenShipmentModal,
        updateShippingQty,
        handleProcessShipment,
        
        // New Exports
        searchTerm, setSearchTerm,
        filterStatus, setFilterStatus,
        stats,
        isLiveLogOpen, setIsLiveLogOpen,
        liveLogs
    };
};
