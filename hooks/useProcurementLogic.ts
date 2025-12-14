import { useState, useEffect } from 'react';
// @FIX: Import moved types from their new location in features/irm/types.
import { UnitType } from '../types';
import { PurchaseOrder, PurchaseOrderItem, Supplier, Ingredient } from '../features/irm/types';
import { useGlobalContext } from '../context/GlobalContext';
import { printPurchaseOrder } from '../utils/printService';

// --- HOOK 1: PO LIST LOGIC ---
export const usePOListLogic = () => {
    const { purchaseOrders, businessConfig } = useGlobalContext();
    const draftPOs = purchaseOrders.filter(p => p.status === 'draft');
    const activePOs = purchaseOrders.filter(p => p.status !== 'draft');

    const getPoStatusDisplay = (status: string, isB2B?: boolean, paymentStatus?: string) => {
        if (status === 'draft') return { label: 'Draft', style: 'bg-gray-500/10 text-gray-400 border border-dashed border-gray-500/30' };
        if (status === 'cancelled') return { label: 'Batal', style: 'bg-red-500/10 text-red-400 border border-red-500/20' };
        if (status === 'received') {
            if (paymentStatus === 'unpaid') return { label: 'Belum Bayar (Tempo)', style: 'bg-orange-500/10 text-orange-400 border border-orange-500/20' };
            return { label: 'Selesai', style: 'bg-green-500/10 text-green-400 border border-green-500/20' };
        }
        if (status === 'shipped') return { label: 'Dikirim', style: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' };
        if (status === 'rejected') return { label: 'Ditolak', style: 'bg-red-500/10 text-red-400 border border-red-500/20' };
        if (status === 'pending') return { label: 'Menunggu', style: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' };
        return { label: 'Proses', style: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' };
    };

    const handlePrintPO = (po: PurchaseOrder) => {
        if(businessConfig) printPurchaseOrder(po, businessConfig);
    };

    return {
        draftPOs,
        activePOs,
        getPoStatusDisplay,
        handlePrintPO
    };
};

// --- HOOK 2: PO CREATE WIZARD LOGIC ---
export const usePOCreateLogic = (initialPo?: PurchaseOrder | null, onSuccess?: () => void) => {
    const { suppliers, ingredients, currentUser, activeOutlet, createPurchaseOrder, updatePurchaseOrder, getLastSupplierPrice, addSupplier, addIngredient } = useGlobalContext();

    const [poWizardStep, setPoWizardStep] = useState<1 | 2 | 3>(initialPo ? 2 : 1);
    const [poSupplierId, setPoSupplierId] = useState(initialPo?.supplierId || '');
    const [poItems, setPoItems] = useState<PurchaseOrderItem[]>(initialPo?.items || []);
    const [supplierSearchTerm, setSupplierSearchTerm] = useState(initialPo?.supplierName || '');
    
    // Quick Add Supplier State
    const [isQuickAddSupplierOpen, setIsQuickAddSupplierOpen] = useState(false);
    const [quickSupName, setQuickSupName] = useState('');

    // Item Input State
    const [newItemId, setNewItemId] = useState('');
    const [newItemQty, setNewItemQty] = useState('');
    const [newItemUnit, setNewItemUnit] = useState<UnitType | ''>(''); 
    const [newItemCost, setNewItemCost] = useState('');
    const [isQuickAddingIng, setIsQuickAddingIng] = useState(false);
    const [quickIngName, setQuickIngName] = useState('');
    const [quickIngUnit, setQuickIngUnit] = useState<UnitType>(UnitType.KG);

    const filteredSuppliers = suppliers.filter(s => 
        s.name.toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(supplierSearchTerm.toLowerCase())
    );

    // Smart Price Lookup & Unit Default
    useEffect(() => {
      const fetchPrice = async () => {
        if (newItemId) {
            const ing = ingredients.find(i => i.id === newItemId);
            if (ing) {
                setNewItemUnit(ing.unit);
                if (poSupplierId) {
                    const lastPrice = await getLastSupplierPrice(poSupplierId, newItemId);
                    setNewItemCost(lastPrice !== null ? lastPrice.toString() : ing.avgCost.toString());
                } else {
                    setNewItemCost(ing.avgCost.toString());
                }
            }
        }
      };
      fetchPrice();
    }, [newItemId, poSupplierId, ingredients, getLastSupplierPrice]);

    const handleSelectSupplier = (supplier: Supplier) => {
        setPoSupplierId(supplier.id);
        setSupplierSearchTerm(supplier.name);
        setPoWizardStep(2);
    };

    const handleSaveQuickSupplier = () => {
        if (!quickSupName) return;
        const newSupplier: Supplier = {
            id: `SUP-${Date.now()}`,
            name: quickSupName,
            contact: 'Admin', phone: '-', category: 'Umum', isSibosNetwork: false
        };
        addSupplier(newSupplier);
        setPoSupplierId(newSupplier.id);
        setSupplierSearchTerm(newSupplier.name);
        setIsQuickAddSupplierOpen(false);
        setPoWizardStep(2);
    };

    const handleAddItemToPO = () => {
        if (!newItemId || !newItemQty || !newItemCost || !newItemUnit) return;
        const ingredient = ingredients.find(i => i.id === newItemId);
        if (!ingredient) return;
        
        const existingIdx = poItems.findIndex(i => i.ingredientId === newItemId);
        if (existingIdx >= 0) {
            const updated = [...poItems];
            updated[existingIdx].quantity += parseFloat(newItemQty);
            setPoItems(updated);
        } else {
            const newItem: PurchaseOrderItem = {
                ingredientId: ingredient.id, ingredientName: ingredient.name, quantity: parseFloat(newItemQty), unit: newItemUnit, cost: parseFloat(newItemCost)
            };
            setPoItems([...poItems, newItem]);
        }
        setNewItemId(''); setNewItemQty(''); setNewItemCost(''); setNewItemUnit('');
    };

    const handleSaveQuickIngredient = () => {
        if (!quickIngName || !newItemCost) return;
        const newId = `ing-${Date.now()}`;
        const newIng: Ingredient = {
            id: newId, outletId: activeOutlet?.id || '', name: quickIngName, sku: `GEN-${Date.now().toString().slice(-4)}`, category: 'General', stock: 0, unit: quickIngUnit, minStock: 1, avgCost: parseFloat(newItemCost), supplierId: poSupplierId, lastUpdated: new Date().toISOString()
        };
        addIngredient(newIng);
        setNewItemId(newId); setNewItemUnit(quickIngUnit); setIsQuickAddingIng(false); setQuickIngName('');
    };

    const handleSubmitPO = (status: 'draft' | 'ordered') => {
        if (!poSupplierId || poItems.length === 0 || !currentUser) return;
        const supplier = suppliers.find(s => s.id === poSupplierId);
        const total = poItems.reduce((acc, item) => acc + (item.quantity * item.cost), 0);
        const poData: PurchaseOrder = {
            id: initialPo?.id || `PO-${Date.now().toString().slice(-6)}`,
            outletId: activeOutlet?.id || '', 
            supplierId: poSupplierId, 
            supplierName: supplier?.name || 'Unknown', 
            items: poItems, 
            totalEstimated: total, 
            status: status, 
            orderDate: new Date().toISOString(), 
            createdBy: currentUser.name, 
            createdById: currentUser.id, 
            isB2B: supplier?.isSibosNetwork, 
            distributorStatus: (status === 'ordered' && supplier?.isSibosNetwork) ? 'pending' : undefined
        };
        
        if (initialPo) updatePurchaseOrder(poData); else createPurchaseOrder(poData);
        alert(status === 'draft' ? "Draft Disimpan!" : "PO Berhasil Dibuat!"); 
        if(onSuccess) onSuccess();
    };

    const totalEstimated = poItems.reduce((acc, i) => acc + (i.quantity * i.cost), 0);

    return {
        currentUser,
        ingredients,
        poWizardStep, setPoWizardStep,
        poSupplierId,
        poItems, setPoItems,
        supplierSearchTerm, setSupplierSearchTerm,
        isQuickAddSupplierOpen, setIsQuickAddSupplierOpen,
        quickSupName, setQuickSupName,
        newItemId, setNewItemId,
        newItemQty, setNewItemQty,
        newItemUnit, setNewItemUnit,
        newItemCost, setNewItemCost,
        isQuickAddingIng, setIsQuickAddingIng,
        quickIngName, setQuickIngName,
        quickIngUnit, setQuickIngUnit,
        filteredSuppliers,
        totalEstimated,
        
        handleSelectSupplier,
        handleSaveQuickSupplier,
        handleAddItemToPO,
        handleSaveQuickIngredient,
        handleSubmitPO
    };
};

// --- HOOK 3: PO RECEIVE WIZARD LOGIC ---
export const usePOReceiveLogic = (po: PurchaseOrder, onSuccess?: () => void) => {
    const { receivePurchaseOrder } = useGlobalContext();
    const [receiveWizardStep, setReceiveWizardStep] = useState<1 | 2 | 3>(1);
    const [receivingItems, setReceivingItems] = useState<PurchaseOrderItem[]>(
        po.items.map(i => ({ 
            ...i, receivedQuantity: i.quantity, finalCost: i.cost, expiryDate: '', discrepancyReason: '', evidenceUrl: ''
        }))
    );
    const [receivePaymentMethod, setReceivePaymentMethod] = useState<'cash'|'transfer'|'tempo'>('cash');
    const [tempoDuration, setTempoDuration] = useState<number | ''>(30);
    const [selectedBank, setSelectedBank] = useState('BCA');

    const updateReceivingItem = (index: number, field: keyof PurchaseOrderItem, value: any) => {
        const updated = [...receivingItems];
        updated[index] = { ...updated[index], [field]: value };
        setReceivingItems(updated);
    };

    const calculateReceivingBill = () => {
        return receivingItems.reduce((acc, i) => {
            const qtyToPay = i.discrepancyReason === 'bonus' ? i.quantity : (i.receivedQuantity ?? 0);
            return acc + (qtyToPay * (i.finalCost ?? 0));
        }, 0);
    };

    const handleSubmitReceive = () => {
        const dueDate = new Date();
        if(receivePaymentMethod === 'tempo' && typeof tempoDuration === 'number') dueDate.setDate(dueDate.getDate() + tempoDuration);
        
        receivePurchaseOrder(po.id, receivingItems, {
            method: receivePaymentMethod,
            dueDate: receivePaymentMethod === 'tempo' ? dueDate.toISOString() : undefined,
            bankDetails: receivePaymentMethod === 'transfer' ? selectedBank : undefined
        });
        alert(`Penerimaan Selesai!`);
        if(onSuccess) onSuccess();
    };

    return {
        receiveWizardStep, setReceiveWizardStep,
        receivingItems, setReceivingItems,
        receivePaymentMethod, setReceivePaymentMethod,
        tempoDuration, setTempoDuration,
        selectedBank, setSelectedBank,
        updateReceivingItem,
        calculateReceivingBill,
        handleSubmitReceive
    };
};