

import { useState } from 'react';
// @FIX: Import moved types from their new location in features/irm/types.
import { StockTransfer, StockTransferItem } from '../features/irm/types';
import { useGlobalContext } from '../context/GlobalContext';

// --- HOOK 1: BRANCH DISTRIBUTION LOGIC (Requesting) ---
export const useBranchDistributionLogic = () => {
    const { stockTransfers, createStockTransfer, receiveStockTransfer, currentUser, activeOutlet, ingredients } = useGlobalContext();
    
    const [isRequestingStock, setIsRequestingStock] = useState(false);
    const [reqItems, setReqItems] = useState<StockTransferItem[]>([]);
    
    // Input State
    const [newItemId, setNewItemId] = useState('');
    const [newItemQty, setNewItemQty] = useState('');
    const [newItemUnit, setNewItemUnit] = useState('');

    const filteredStockTransfers = stockTransfers.filter(trf => trf.targetOutletId === activeOutlet?.id);

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
        const transfer: StockTransfer = {
            id: `TRF-${Date.now().toString().slice(-6)}`,
            sourceOutletId: 'central', // Assuming central is always the source for now
            targetOutletId: activeOutlet.id,
            targetOutletName: activeOutlet.name,
            items: reqItems,
            status: 'pending',
            requestDate: new Date().toISOString(),
            requestedBy: currentUser.name
        };
        createStockTransfer(transfer);
        alert(`Request stok dikirim!`);
        setReqItems([]); setIsRequestingStock(false);
    };

    const handleReceiveShipment = (transfer: StockTransfer) => {
        const receivedItems = transfer.items.map(i => ({...i, quantityReceived: i.quantityShipped}));
        receiveStockTransfer(transfer.id, receivedItems);
        alert("Barang diterima!");
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
        handleReceiveShipment
    };
};

// --- HOOK 2: CENTRAL DISTRIBUTION LOGIC (Shipping) ---
export const useCentralDistributionLogic = () => {
    const { stockTransfers, shipStockTransfer, activeOutlet } = useGlobalContext();
    
    const [selectedTransfer, setSelectedTransfer] = useState<StockTransfer | null>(null);
    const [isTransferDetailOpen, setIsTransferDetailOpen] = useState(false);
    const [shippingItems, setShippingItems] = useState<StockTransferItem[]>([]);

    const filteredStockTransfers = stockTransfers.filter(trf => trf.sourceOutletId === 'central' || trf.sourceOutletId === activeOutlet?.id);

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
        alert("Status update: Dikirim");
        setIsTransferDetailOpen(false);
    };

    return {
        filteredStockTransfers,
        selectedTransfer,
        isTransferDetailOpen, setIsTransferDetailOpen,
        shippingItems,
        handleOpenShipmentModal,
        updateShippingQty,
        handleProcessShipment
    };
};