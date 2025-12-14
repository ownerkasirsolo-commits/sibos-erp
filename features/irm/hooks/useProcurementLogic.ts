import React, { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../services/db';
import { UnitType } from '../../../types';
import { PurchaseOrder, PurchaseOrderItem, Supplier, Ingredient, PurchaseRequest, CategoryBudget } from '../types';
import { useGlobalContext } from '../../../context/GlobalContext';
import { printPurchaseOrder } from '../../../utils/printService';
import { MOCK_PRODUCTS, MOCK_INGREDIENTS } from '../../../constants';
import { ActivityLog } from '../../../components/common/LiveLogPanel';

// CONSTANT: LIMIT BELANJA TANPA APPROVAL (5 JUTA)
const APPROVAL_LIMIT = 5000000;

// --- MOCK BUDGETS (Amplop Digital) ---
const MOCK_BUDGETS: CategoryBudget[] = [
    { category: 'Meat', limit: 15000000, spent: 0, percent: 0 }, 
    { category: 'Dry Goods', limit: 5000000, spent: 0, percent: 0 }, 
    { category: 'Vegetable', limit: 3000000, spent: 0, percent: 0 }, 
    { category: 'Dairy', limit: 4000000, spent: 0, percent: 0 }, 
];

// --- HOOK 1: PO LIST LOGIC (NOW INCLUDES PR) ---
export const usePOListLogic = () => {
    const { purchaseOrders, businessConfig } = useGlobalContext();
    const purchaseRequests = useLiveQuery(() => db.purchaseRequests.toArray(), []) || [];
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [activeTab, setActiveTab] = useState<'PO' | 'PR'>('PO');

    const draftPOs = purchaseOrders.filter(p => p.status === 'draft');
    
    const filteredActivePOs = useMemo(() => {
        let activePOs = purchaseOrders.filter(p => p.status !== 'draft');

        if (filterStatus !== 'All') {
            activePOs = activePOs.filter(po => po.status === filterStatus);
        }

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            activePOs = activePOs.filter(po => 
                po.supplierName.toLowerCase().includes(lowerSearch) ||
                po.id.toLowerCase().includes(lowerSearch)
            );
        }
        
        return activePOs;
    }, [purchaseOrders, filterStatus, searchTerm]);

    // PR Filtering
    const filteredPRs = useMemo(() => {
        return purchaseRequests.filter(pr => pr.status === 'pending').sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
    }, [purchaseRequests]);


    const getPoStatusDisplay = (status: string, isB2B?: boolean, paymentStatus?: string) => {
        if (status === 'draft') return { label: 'Draft', style: 'bg-gray-500/10 text-gray-400 border border-dashed border-gray-500/30' };
        if (status === 'cancelled') return { label: 'Batal', style: 'bg-red-500/10 text-red-400 border border-red-500/20' };
        
        // Approval Status
        if (status === 'pending_approval') return { label: 'Butuh Approval', style: 'bg-orange-500/10 text-orange-400 border border-orange-500/50 animate-pulse' };

        // B2B Specific Statuses
        if (status === 'pending' && isB2B) return { label: 'Menunggu Konfirmasi', style: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' };
        if (status === 'rejected' && isB2B) return { label: 'Ditolak Supplier', style: 'bg-red-500/10 text-red-400 border border-red-500/20' };
        
        if (status === 'processed') return { label: 'Diproses', style: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' };
        
        if (status === 'received') {
            if (paymentStatus === 'unpaid') return { label: 'Belum Bayar (Tempo)', style: 'bg-orange-500/10 text-orange-400 border border-orange-500/20' };
            return { label: 'Selesai', style: 'bg-green-500/10 text-green-400 border border-green-500/20' };
        }
        if (status === 'shipped') return { label: 'Dikirim', style: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' };
        
        // Conventional Status
        if (status === 'ordered') return { label: 'Menunggu Pengiriman', style: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' };
        
        return { label: 'Dipesan', style: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' };
    };

    const handlePrintPO = (po: PurchaseOrder) => {
        if(businessConfig) printPurchaseOrder(po, businessConfig);
    };

    return {
        draftPOs,
        activePOs: filteredActivePOs,
        purchaseRequests: filteredPRs,
        activeTab, setActiveTab,
        getPoStatusDisplay,
        handlePrintPO,
        searchTerm, setSearchTerm,
        filterStatus, setFilterStatus,
    };
};

// --- HOOK 2: PO CREATE WIZARD LOGIC (Handles PR Conversion & Budgeting) ---
export interface ItemSourceOption {
    sourceType: 'inventory' | 'b2b';
    supplierId: string;
    supplierName: string;
    price: number;
    isBestPrice: boolean;
    isNetwork: boolean;
    performanceScore: number;
    tags: string[]; // 'recommended', 'trusted', 'risk', 'best_price'
}

export interface SmartCatalogItem {
    id: string; // Ingredient ID
    name: string;
    category: string;
    currentStock: number;
    minStock: number;
    unit: UnitType;
    lastPurchasedPrice: number;
    lastSupplierName: string;
    options: ItemSourceOption[];
}

export const usePOCreateLogic = (initialPo?: PurchaseOrder | null, onSuccess?: () => void, initialRestockItem?: Ingredient | null) => {
    const { suppliers, ingredients, currentUser, activeOutlet, createPurchaseOrder, updatePurchaseOrder, purchaseOrders, addSupplier, addIngredient, getLastSupplierPrice } = useGlobalContext();

    const [poWizardStep, setPoWizardStep] = useState<1 | 2 | 3>(initialPo ? 2 : 1);
    const [poSupplierId, setPoSupplierId] = useState(initialPo?.supplierId || '');
    const [createMode, setCreateMode] = useState<'PO' | 'PR'>('PO'); // Default to PO
    const [poItems, setPoItems] = useState<PurchaseOrderItem[]>(() => {
        if (!initialPo) return [];
        return initialPo.items.map(item => ({
            ...item,
            // @ts-ignore
            supplierId: item.supplierId || initialPo.supplierId,
            // @ts-ignore
            supplierName: item.supplierName || initialPo.supplierName,
            // @ts-ignore
            isNetwork: item.isNetwork || initialPo.isB2B
        }));
    });
    
    // Auto-fill logic for "Restock from StockList"
    useEffect(() => {
        if (initialRestockItem && poItems.length === 0) {
            const defaultSupplierId = initialRestockItem.supplierId || 's1'; 
            const supplier = suppliers.find(s => s.id === defaultSupplierId);
            const price = initialRestockItem.avgCost || 0;
            
            // SMART FILL: Calculate qty to reach safe stock (e.g., 3x minStock)
            const targetStock = initialRestockItem.minStock * 3;
            let quantity = Math.ceil(Math.max(targetStock - initialRestockItem.stock, 1));
            if (quantity <= 0) quantity = 1;

            const newItem: PurchaseOrderItem = {
                ingredientId: initialRestockItem.id,
                ingredientName: initialRestockItem.name,
                quantity: quantity,
                unit: initialRestockItem.unit,
                cost: price,
                // @ts-ignore
                supplierId: defaultSupplierId,
                supplierName: supplier?.name || 'Unknown',
                isNetwork: supplier?.isSibosNetwork || false
            };

            setPoItems([newItem]);
            setSupplierSearchTerm(supplier?.name || ''); // Auto-select supplier in filter
        }
    }, [initialRestockItem]);

    // Calculate Budgets based on current month's POs
    const budgetStatus = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const monthlyPOs = purchaseOrders.filter(p => new Date(p.orderDate).getMonth() === currentMonth && p.status !== 'cancelled' && p.status !== 'rejected');
        
        const spendingMap: Record<string, number> = {};
        
        monthlyPOs.forEach(po => {
            po.items.forEach(item => {
                const ing = ingredients.find(i => i.id === item.ingredientId);
                const cat = ing?.category || 'Uncategorized';
                spendingMap[cat] = (spendingMap[cat] || 0) + (item.cost * item.quantity);
            });
        });

        return MOCK_BUDGETS.map(b => ({
            ...b,
            spent: spendingMap[b.category] || 0,
            percent: Math.min(((spendingMap[b.category] || 0) / b.limit) * 100, 100)
        }));
    }, [purchaseOrders, ingredients]);
    

    const [supplierSearchTerm, setSupplierSearchTerm] = useState(initialPo?.supplierName || '');
    const [expandedCatalogId, setExpandedCatalogId] = useState<string | null>(null);
    const [smartSearchQuery, setSmartSearchQuery] = useState('');

    // Quick Add Supplier State
    const [isQuickAddSupplierOpen, setIsQuickAddSupplierOpen] = useState(false);
    const [quickSupName, setQuickSupName] = useState('');

    // Item Input State (For Manual Mode)
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

    // Smart Price Lookup
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

    // --- SMART CATALOG LOGIC (AI FILTERED & RANKED) ---
    const smartCatalog: SmartCatalogItem[] = useMemo(() => {
        const catalog = ingredients
            .filter(ing => 
                !smartSearchQuery || 
                ing.name.toLowerCase().includes(smartSearchQuery.toLowerCase()) || 
                ing.category.toLowerCase().includes(smartSearchQuery.toLowerCase())
            )
            .map(ing => {
                const rawOptions: any[] = [];
                let lastSupName = '-';

                // 1. Existing Supplier (History)
                if (ing.supplierId) {
                    const sup = suppliers.find(s => s.id === ing.supplierId);
                    lastSupName = sup?.name || 'Unknown';
                    const score = sup?.performanceScore ?? 100;
                    
                    rawOptions.push({
                        sourceType: 'inventory',
                        supplierId: ing.supplierId,
                        supplierName: sup?.name || 'Langganan Lama',
                        price: ing.avgCost,
                        isNetwork: sup?.isSibosNetwork || false,
                        performanceScore: score
                    });
                }

                // 2. B2B Mock Check (Simulation)
                const b2bMatch = MOCK_PRODUCTS.find(p => p.name.toLowerCase().includes(ing.name.toLowerCase()) && p.businessType !== 'Kuliner (F&B)'); 
                if (b2bMatch) {
                    rawOptions.push({
                        sourceType: 'b2b',
                        supplierId: 's1', 
                        supplierName: 'SIBOS Mart (Official)',
                        price: b2bMatch.price, 
                        isNetwork: true,
                        performanceScore: 98 // High score for official network
                    });
                }

                // 3. Marketplace Simulation (Competitor / Bad Supplier Mock)
                if (rawOptions.length < 3) {
                     // Try find a "bad" supplier for demo purposes
                     const badSup = suppliers.find(s => s.performanceScore !== undefined && s.performanceScore < 60);
                     if (badSup) {
                         rawOptions.push({
                            sourceType: 'inventory',
                            supplierId: badSup.id,
                            supplierName: badSup.name,
                            price: ing.avgCost * 0.9, // Cheaper but bad
                            isNetwork: false,
                            performanceScore: badSup.performanceScore ?? 45
                        });
                     } else {
                         rawOptions.push({
                            sourceType: 'inventory',
                            supplierId: 's3', 
                            supplierName: 'Pasar Induk (Estimasi)',
                            price: ing.avgCost * 0.95, 
                            isNetwork: false,
                            performanceScore: 75
                        });
                     }
                }

                // --- AI RANKING ENGINE ---
                const processedOptions: ItemSourceOption[] = rawOptions.map(opt => {
                    const tags: string[] = [];
                    
                    if (opt.performanceScore >= 90) tags.push('trusted');
                    if (opt.performanceScore < 50) tags.push('risk');

                    // Weighted Price Algorithm (Invisible Cost Logic)
                    const weightedPrice = opt.price * (1 + (100 - opt.performanceScore) / 200); 

                    return {
                        ...opt,
                        weightedPrice, // Used for sorting
                        tags,
                        isBestPrice: false // Calculated next
                    };
                });

                // Determine Absolute Best Price
                const minPrice = Math.min(...processedOptions.map(o => o.price));
                processedOptions.forEach(o => { if(o.price === minPrice) o.tags.push('best_price'); });

                // Sort by Weighted Price (Smart Rank)
                processedOptions.sort((a: any, b: any) => a.weightedPrice - b.weightedPrice);

                // Tag the #1 as Recommended
                if (processedOptions.length > 0) {
                    processedOptions[0].tags.push('recommended');
                }

                return {
                    id: ing.id,
                    name: ing.name,
                    category: ing.category,
                    currentStock: ing.stock,
                    minStock: ing.minStock,
                    unit: ing.unit,
                    lastPurchasedPrice: ing.avgCost,
                    lastSupplierName: lastSupName,
                    options: processedOptions.slice(0, 3) 
                };
            });
            
        // Sort items by urgency (Low Stock First)
        return catalog.sort((a, b) => {
            const aRatio = a.currentStock / (a.minStock || 1);
            const bRatio = b.currentStock / (b.minStock || 1);
            return aRatio - bRatio;
        });

    }, [ingredients, suppliers, smartSearchQuery]);

    // --- SMART ADD HANDLER ---
    const handleSmartAdd = (item: SmartCatalogItem, option: ItemSourceOption, qty: number) => {
        if (qty === 0) return;

        const existingIdx = poItems.findIndex(i => i.ingredientId === item.id && (i as any).supplierId === option.supplierId);
        
        if (existingIdx >= 0) {
             const updated = [...poItems];
             const newQty = updated[existingIdx].quantity + qty;
             if (newQty <= 0) {
                 setPoItems(poItems.filter((_, i) => i !== existingIdx));
             } else {
                 updated[existingIdx].quantity = newQty;
                 setPoItems(updated);
             }
        } else {
            if (qty < 0) return;
            const newItem: PurchaseOrderItem & { supplierId: string, supplierName: string, isNetwork: boolean } = {
                ingredientId: item.id,
                ingredientName: item.name,
                quantity: qty,
                unit: item.unit,
                cost: option.price,
                supplierId: option.supplierId,
                supplierName: option.supplierName, 
                isNetwork: option.isNetwork
            };
            setPoItems(prev => [...prev, newItem]);
        }
    };

    // --- MANUAL ADD HANDLER (LEGACY MODE) ---
    const handleAddItemToPO = () => {
        if (!newItemId || !newItemQty || !newItemCost || !newItemUnit) return;
        const ingredient = ingredients.find(i => i.id === newItemId);
        if (!ingredient) return;
        
        const currentSupplier = suppliers.find(s => s.id === poSupplierId);
        
        const existingIdx = poItems.findIndex(i => i.ingredientId === newItemId); 
        if (existingIdx >= 0) {
            const updated = [...poItems];
            updated[existingIdx].quantity += parseFloat(newItemQty);
            setPoItems(updated);
        } else {
            const newItem: PurchaseOrderItem & { supplierId: string, supplierName: string } = {
                ingredientId: ingredient.id, 
                ingredientName: ingredient.name, 
                quantity: parseFloat(newItemQty), 
                unit: newItemUnit, 
                cost: parseFloat(newItemCost),
                supplierId: poSupplierId || ingredient.supplierId || 'unknown',
                supplierName: currentSupplier?.name || 'Unknown Supplier'
            };
            setPoItems([...poItems, newItem]);
        }
        setNewItemId(''); setNewItemQty(''); setNewItemCost(''); setNewItemUnit('');
    };

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

    const handleSaveQuickIngredient = () => {
        if (!quickIngName || !newItemCost) return;
        const newId = `ing-${Date.now()}`;
        const newIng: Ingredient = {
            id: newId, outletId: activeOutlet?.id || '', name: quickIngName, sku: `GEN-${Date.now().toString().slice(-4)}`, category: 'General', stock: 0, unit: quickIngUnit, minStock: 1, avgCost: parseFloat(newItemCost), supplierId: poSupplierId, lastUpdated: new Date().toISOString()
        };
        addIngredient(newIng);
        setNewItemId(newId); setNewItemUnit(quickIngUnit); setIsQuickAddingIng(false); setQuickIngName('');
    };

    const handleUpdateItemQty = (index: number, newQty: number) => {
        if (newQty <= 0) {
            setPoItems(poItems.filter((_, i) => i !== index));
        } else {
            const updated = [...poItems];
            updated[index].quantity = newQty;
            setPoItems(updated);
        }
    };

    const handleRemoveItem = (index: number) => {
        setPoItems(poItems.filter((_, i) => i !== index));
    };

    const handleSubmitPO = async (status: 'draft' | 'ordered' | 'request') => {
        if (poItems.length === 0 || !currentUser) return;

        // HANDLE PURCHASE REQUEST (PR)
        if (createMode === 'PR' || status === 'request') {
             const prId = `PR-${Date.now()}`;
             await db.purchaseRequests.add({
                 id: prId,
                 outletId: activeOutlet?.id || '',
                 requestedBy: currentUser.name,
                 items: poItems,
                 status: 'pending',
                 requestDate: new Date().toISOString(),
                 note: `Request dari ${currentUser.name}`
             });
             alert('Purchase Request (PR) berhasil diajukan!');
             if(onSuccess) onSuccess();
             return;
        }

        // HANDLE PO (Regular)
        const groupedItems: Record<string, PurchaseOrderItem[]> = {};
        
        poItems.forEach(item => {
            const castedItem = item as any;
            let supId = castedItem.supplierId;
            if (!supId) {
                supId = poSupplierId || 'unknown';
            }
            if (!groupedItems[supId]) groupedItems[supId] = [];
            groupedItems[supId].push(item);
        });

        let createdCount = 0;
        let needsApprovalCount = 0;

        for (const [supId, items] of Object.entries(groupedItems)) {
            const supplier = suppliers.find(s => s.id === supId);
            const total = items.reduce((acc, item) => acc + (item.quantity * item.cost), 0);
            const supplierName = supplier?.name || 'Supplier Umum'; 
            const isNetwork = supplier?.isSibosNetwork || false;
            
            let finalStatus: PurchaseOrder['status'] = status === 'draft' ? 'draft' : 'ordered';
            let distributorStatus: PurchaseOrder['distributorStatus'] = undefined;

            // APPROVAL LOGIC
            const isHighValue = total > APPROVAL_LIMIT;
            const isAuthorized = currentUser.role === 'Owner' || currentUser.role === 'Manager';

            if (status !== 'draft' && isHighValue && !isAuthorized) {
                finalStatus = 'pending_approval';
                needsApprovalCount++;
            } else if (status !== 'draft') {
                finalStatus = isNetwork ? 'pending' : 'ordered';
                distributorStatus = isNetwork ? 'pending' : undefined;
            }

            const poData: PurchaseOrder = {
                id: initialPo?.id && Object.keys(groupedItems).length === 1 ? initialPo.id : `PO-${Date.now().toString().slice(-6)}-${createdCount+1}`,
                outletId: activeOutlet?.id || '',
                supplierId: supId,
                supplierName: supplierName,
                items: items,
                totalEstimated: total,
                status: finalStatus,
                orderDate: new Date().toISOString(),
                createdBy: currentUser.name,
                createdById: currentUser.id,
                isB2B: isNetwork,
                distributorStatus: distributorStatus
            };
            
            if (initialPo && Object.keys(groupedItems).length === 1) {
                await updatePurchaseOrder(poData);
            } else {
                await createPurchaseOrder(poData);
            }
            createdCount++;
        }
        
        if (status === 'draft') {
            alert("Draft berhasil disimpan.");
        } else if (needsApprovalCount > 0) {
            alert(`${createdCount} PO dibuat. ${needsApprovalCount} diantaranya memerlukan APPROVAL Manager karena nominal > Rp 5 Juta.`);
        } else {
            alert(`${createdCount} Pesanan berhasil diproses!`);
        }
        
        if(onSuccess) onSuccess();
    };

    const totalEstimated = poItems.reduce((acc, i) => acc + (i.quantity * i.cost), 0);

    return {
        currentUser,
        poItems, 
        
        // Smart Mode
        smartSearchQuery, setSmartSearchQuery,
        smartCatalog,
        expandedCatalogId, setExpandedCatalogId,
        handleSmartAdd,
        handleUpdateItemQty,
        handleRemoveItem,

        // Manual Mode
        poWizardStep, setPoWizardStep,
        poSupplierId,
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
        
        handleSelectSupplier,
        handleSaveQuickSupplier,
        handleAddItemToPO,
        handleSaveQuickIngredient,

        handleSubmitPO,
        totalEstimated,
        approvalLimit: APPROVAL_LIMIT,
        allSuppliers: suppliers,

        // New Features
        createMode, setCreateMode,
        budgetStatus
    };
};

// --- HOOK 3: PO DETAIL & ACTIONS LOGIC (Expanded) ---
export const usePODetailLogic = (po: PurchaseOrder, onSuccess?: () => void) => {
    const { updatePurchaseOrder, currentUser } = useGlobalContext();

    const markAsShipped = async (trackingInfo?: string): Promise<PurchaseOrder | undefined> => {
        if (!currentUser) return;
        
        const updatedPO: PurchaseOrder = {
            ...po,
            status: 'shipped',
            distributorStatus: 'shipped' 
        };
        
        await updatePurchaseOrder(updatedPO);
        alert("Status diperbarui: Barang Sedang Dikirim!");
        if (onSuccess) onSuccess();
        
        return updatedPO;
    };

    return {
        markAsShipped
    }
}

// --- HOOK 4: PO RECEIVE WIZARD LOGIC ---
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

// --- HOOK 5: PROCUREMENT DASHBOARD LOGIC ---
export interface FilterState {
    status: string[];
    payment: string[];
    type: string[];
}

export interface DateFilterState {
    type: 'all' | 'today' | 'week' | 'month' | 'custom';
    start?: string; 
    end?: string; 
}

export interface AISuggestion {
    id: string;
    name: string;
    stock: number;
    unit: UnitType;
    dailyUsage: number; 
    daysLeft: number;
    suggestedQty: number;
    supplierId: string;
}

export const useProcurementDashboardLogic = () => {
    const { 
        createPurchaseOrder,
        updatePurchaseOrder,
        currentUser,
        activeBusinessId,
        activeOutletId,
        purchaseOrders,
        ingredients: outletIngredients,
        suppliers: allSuppliers 
    } = useGlobalContext();
    
    // Mocks for Global View (Replace with proper DB calls in real app)
    const allIngredients = MOCK_INGREDIENTS; // Should fetch from DB
    const allPOs = purchaseOrders; // Should fetch ALL from DB if Owner

    const isHqView = !activeOutletId || !activeBusinessId || activeBusinessId === null;
    const isManagerOrOwner = currentUser?.role === 'Owner' || currentUser?.role === 'Manager';

    const [dashboardSearch, setDashboardSearch] = useState('');
    const [activeFilters, setActiveFilters] = useState<FilterState>({ status: [], payment: [], type: [] });
    const [dateFilter, setDateFilter] = useState<DateFilterState>({ type: 'all' });
    const [selectedPoIds, setSelectedPoIds] = useState<string[]>([]);
    const [dashboardPage, setDashboardPage] = useState(1);
    
    // Live Log & Report Modal States
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isLiveLogOpen, setIsLiveLogOpen] = useState(false);

    const ITEMS_PER_PAGE = 10;

    const monthlyBudget = 50000000;

    // --- LIVE LOGS DERIVATION (NEW) ---
    const liveLogs: ActivityLog[] = useMemo(() => {
        const logs: ActivityLog[] = [];
        
        // From Purchase Orders
        allPOs.forEach(po => {
            // Created Log
            logs.push({
                id: `LOG-PO-CREATE-${po.id}`,
                type: 'info',
                message: `PO #${po.id} dibuat ke ${po.supplierName}`,
                user: po.createdBy,
                timestamp: po.orderDate,
                value: po.totalEstimated
            });

            // Status Updates
            if (po.status === 'ordered') {
                logs.push({
                    id: `LOG-PO-ORDER-${po.id}`,
                    type: 'success',
                    message: `PO #${po.id} diproses/dikirim`,
                    user: po.approvedBy || po.createdBy,
                    timestamp: po.orderDate // ideally should be update timestamp
                });
            } else if (po.status === 'rejected') {
                logs.push({
                    id: `LOG-PO-REJECT-${po.id}`,
                    type: 'danger',
                    message: `PO #${po.id} ditolak`,
                    user: po.approvedBy || 'System',
                    timestamp: po.orderDate // ideal update timestamp
                });
            } else if (po.status === 'received') {
                logs.push({
                    id: `LOG-PO-RECV-${po.id}`,
                    type: 'success',
                    message: `Barang PO #${po.id} diterima`,
                    user: po.receivedBy || 'Gudang',
                    timestamp: po.receivedDate || po.orderDate
                });
            }
        });

        // Sort descending
        return logs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 50);
    }, [allPOs]);

    // --- EXPORT CSV LOGIC (NEW) ---
    const handleExportCSV = () => {
        if (allPOs.length === 0) {
            alert("Tidak ada data untuk diexport.");
            return;
        }

        const headers = ['PO ID', 'Supplier', 'Tanggal', 'Total', 'Status', 'Dibuat Oleh'];
        const rows = allPOs.map(po => [
            po.id,
            `"${po.supplierName}"`,
            new Date(po.orderDate).toLocaleDateString(),
            po.totalEstimated,
            po.status,
            po.createdBy
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `SIBOS_Procurement_Export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- IMPORT CSV LOGIC (NEW - MOCK) ---
    const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
        // Mock implementation
        const file = event.target.files?.[0];
        if (!file) return;
        alert("Fitur Import PO sedang dalam pengembangan. (Mock: File diterima)");
        event.target.value = ''; // Reset
    };


    // --- BUDGET WIDGET LOGIC ---
    const budgetStats = useMemo(() => {
         const currentMonth = new Date().getMonth();
         const monthlyPOs = purchaseOrders.filter(p => new Date(p.orderDate).getMonth() === currentMonth && p.status !== 'cancelled');
         
         const totalSpending = monthlyPOs.reduce((acc, p) => acc + p.totalEstimated, 0);
         const usagePercent = Math.min((totalSpending / monthlyBudget) * 100, 100);

         return {
             limit: monthlyBudget,
             usagePercent,
             totalSpending
         }
    }, [purchaseOrders]);

    // --- AI STOCK VELOCITY CALCULATOR ---
    const aiSuggestions: AISuggestion[] = useMemo(() => {
        if (isHqView) return [];
        
        return outletIngredients
            .map(ing => {
                const dailyUsage = Math.random() * 4 + 0.5; 
                const daysLeft = ing.stock / dailyUsage;
                
                if (daysLeft < 4) {
                    return {
                        id: ing.id,
                        name: ing.name,
                        stock: ing.stock,
                        unit: ing.unit,
                        dailyUsage,
                        daysLeft,
                        suggestedQty: Math.ceil((dailyUsage * 7) - ing.stock),
                        supplierId: ing.supplierId || 'unknown'
                    };
                }
                return null;
            })
            .filter(Boolean) as AISuggestion[];
    }, [outletIngredients, isHqView]);

    // --- INTELLIGENT AUTO-ORDER HANDLER ---
    const handleCreateAutoPO = async (suggestion: AISuggestion) => {
        if (!currentUser) return;
        
        // 1. Find Current/Default Supplier info
        const defaultSupplier = allSuppliers.find(s => s.id === suggestion.supplierId);
        
        let targetSupplier = defaultSupplier;
        let aiNote = '';

        // 2. AI AUDIT: Check Supplier Score & Price
        const currentScore = defaultSupplier?.performanceScore ?? 100;
        
        if (currentScore < 70 && defaultSupplier) {
            // Find alternatives in same category with score > 80
            const candidates = allSuppliers.filter(s => 
                s.id !== defaultSupplier.id &&
                s.category === defaultSupplier.category &&
                (s.performanceScore ?? 0) > 80
            );

            candidates.sort((a, b) => (b.performanceScore ?? 0) - (a.performanceScore ?? 0));

            if (candidates.length > 0) {
                targetSupplier = candidates[0];
                aiNote = `\n\n🤖 AI SWITCH: Supplier default '${defaultSupplier.name}' memiliki skor rendah (${currentScore}). Dialihkan ke '${targetSupplier.name}' (Skor: ${targetSupplier.performanceScore}) untuk keamanan.`;
            }
        }

        if (!targetSupplier) {
             alert("Data supplier tidak valid.");
             return;
        }

        const cost = (outletIngredients.find(i => i.id === suggestion.id)?.avgCost || 0);

        const newPO: PurchaseOrder = {
            id: `PO-AI-${Date.now().toString().slice(-6)}`,
            outletId: activeOutletId || '',
            supplierId: targetSupplier.id,
            supplierName: targetSupplier.name,
            items: [{
                ingredientId: suggestion.id,
                ingredientName: suggestion.name,
                quantity: suggestion.suggestedQty,
                unit: suggestion.unit,
                cost: cost,
                // @ts-ignore
                supplierId: targetSupplier.id,
                // @ts-ignore
                supplierName: targetSupplier.name
            }],
            totalEstimated: suggestion.suggestedQty * cost,
            status: 'draft',
            orderDate: new Date().toISOString(),
            createdBy: 'SIBOS AI',
            createdById: 'system',
            isB2B: targetSupplier.isSibosNetwork
        };
        
        await createPurchaseOrder(newPO);
        alert(`Draft PO Otomatis berhasil dibuat!${aiNote}`);
    };

    const toggleFilter = (category: keyof FilterState, value: string) => {
        setActiveFilters(prev => {
            const current = prev[category];
            const updated = current.includes(value) 
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [category]: updated };
        });
        setDashboardPage(1);
        setSelectedPoIds([]); 
    };

    const clearFilters = () => {
        setActiveFilters({ status: [], payment: [], type: [] });
    };

    const handleDateFilterChange = (type: DateFilterState['type'], start?: string, end?: string) => {
        setDateFilter({ type, start, end });
        setDashboardPage(1);
        setSelectedPoIds([]);
    };

    const toggleSelectPO = (id: string) => {
        setSelectedPoIds(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]);
    };

    const handleSelectAll = (ids: string[]) => {
        if (selectedPoIds.length === ids.length) {
            setSelectedPoIds([]);
        } else {
            setSelectedPoIds(ids);
        }
    };

    const handleBulkAction = async (action: 'approve' | 'delete') => {
        if (selectedPoIds.length === 0) return;
        
        if (confirm(`Yakin ingin ${action === 'approve' ? 'memproses' : 'menghapus'} ${selectedPoIds.length} PO terpilih?`)) {
            for (const id of selectedPoIds) {
                const po = purchaseOrders.find(p => p.id === id);
                if (!po) continue;

                if (action === 'approve') {
                    if (po.status === 'draft') {
                        const newStatus = po.isB2B ? 'pending' : 'ordered';
                        await updatePurchaseOrder({ ...po, status: newStatus });
                    }
                } else if (action === 'delete') {
                    await updatePurchaseOrder({ ...po, status: 'cancelled' });
                }
            }
            alert("Aksi massal selesai!");
            setSelectedPoIds([]);
        }
    };

    // --- APPROVAL ACTIONS ---
    const handleApprovePO = async (po: PurchaseOrder) => {
        const newStatus = po.isB2B ? 'pending' : 'ordered';
        const distributorStatus = po.isB2B ? 'pending' : undefined;
        
        await updatePurchaseOrder({ 
            ...po, 
            status: newStatus,
            distributorStatus: distributorStatus,
            approvedBy: currentUser?.name
        });
        alert(`PO #${po.id} disetujui!`);
    };

    const handleRejectPO = async (po: PurchaseOrder) => {
        await updatePurchaseOrder({ 
            ...po, 
            status: 'rejected',
            approvedBy: currentUser?.name // Technically 'rejected by' but using same field for now
        });
        alert(`PO #${po.id} ditolak.`);
    };

    // --- Calculations ---
    const dashboardData = useMemo(() => {
        const targetPOs = isHqView ? allPOs : purchaseOrders;
        const targetIngredients = isHqView ? allIngredients : outletIngredients;

        // Pending Approval Count
        const pendingApprovalCount = targetPOs.filter(po => po.status === 'pending_approval').length;
        const pendingApprovalList = targetPOs.filter(po => po.status === 'pending_approval');

        const totalUnpaidPOValue = targetPOs
            .filter(po => po.status === 'received' && po.paymentStatus === 'unpaid')
            .reduce((sum, po) => sum + po.totalEstimated, 0);

        let processedPOs = [...targetPOs].sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

        if (dashboardSearch) {
            const lowerQuery = dashboardSearch.toLowerCase();
            processedPOs = processedPOs.filter(po => 
                po.id.toLowerCase().includes(lowerQuery) || 
                po.supplierName.toLowerCase().includes(lowerQuery) ||
                po.createdBy.toLowerCase().includes(lowerQuery)
            );
        }

        if (dateFilter.type !== 'all') {
            const now = new Date();
            processedPOs = processedPOs.filter(po => {
                const poDate = new Date(po.orderDate);
                const poDateString = poDate.toISOString().split('T')[0];
                const todayString = now.toISOString().split('T')[0];

                if (dateFilter.type === 'today') return poDateString === todayString;
                else if (dateFilter.type === 'week') {
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(now.getDate() - 7);
                    return poDate >= oneWeekAgo && poDate <= now;
                } else if (dateFilter.type === 'month') {
                    return poDate.getMonth() === now.getMonth() && poDate.getFullYear() === now.getFullYear();
                } else if (dateFilter.type === 'custom' && dateFilter.start && dateFilter.end) {
                    const start = new Date(dateFilter.start);
                    const end = new Date(dateFilter.end);
                    end.setHours(23, 59, 59, 999);
                    return poDate >= start && poDate <= end;
                }
                return true;
            });
        }

        if (activeFilters.status.length > 0) {
            processedPOs = processedPOs.filter(po => activeFilters.status.includes(po.status));
        }
        if (activeFilters.payment.length > 0) {
            processedPOs = processedPOs.filter(po => po.paymentStatus && activeFilters.payment.includes(po.paymentStatus));
        }
        if (activeFilters.type.length > 0) {
            processedPOs = processedPOs.filter(po => {
                if (activeFilters.type.includes('b2b') && po.isB2B) return true;
                if (activeFilters.type.includes('regular') && !po.isB2B) return true;
                return false;
            });
        }

        const searchSuggestions = Array.from(new Set([
            ...processedPOs.map(p => p.supplierName),
            ...processedPOs.map(p => p.createdBy)
        ])).slice(0, 5);

        const lowStockItems = targetIngredients.filter(i => i.stock <= i.minStock);

        const totalPages = Math.ceil(processedPOs.length / ITEMS_PER_PAGE);
        const paginatedPOs = processedPOs.slice((dashboardPage - 1) * ITEMS_PER_PAGE, dashboardPage * ITEMS_PER_PAGE);

        return {
            isHqView,
            isManagerOrOwner,
            kpis: { 
                totalUnpaidPOValue, 
                totalSpending: budgetStats.totalSpending, 
                lowStockCount: lowStockItems.length,
                pendingApprovalCount 
            },
            pendingApprovalList,
            budgetStats: {
                limit: budgetStats.limit,
                usagePercent: budgetStats.usagePercent
            },
            paginatedPOs,
            pagination: { currentPage: dashboardPage, totalPages, totalItems: processedPOs.length },
            searchSuggestions
        };
    }, [activeOutletId, activeBusinessId, isHqView, purchaseOrders, outletIngredients, dashboardSearch, activeFilters, dashboardPage, dateFilter, currentUser, budgetStats]);

    // Add getPoStatusDisplay definition here
    const getPoStatusDisplay = (status: string, isB2B?: boolean, paymentStatus?: string) => {
        if (status === 'draft') return { label: 'Draft', style: 'bg-gray-500/10 text-gray-400 border border-dashed border-gray-500/30' };
        if (status === 'cancelled') return { label: 'Batal', style: 'bg-red-500/10 text-red-400 border border-red-500/20' };
        
        // NEW: Approval Status
        if (status === 'pending_approval') return { label: 'Butuh Approval', style: 'bg-orange-500/10 text-orange-400 border border-orange-500/50 animate-pulse' };

        // B2B Specific Statuses
        if (status === 'pending' && isB2B) return { label: 'Menunggu Konfirmasi', style: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' };
        if (status === 'rejected' && isB2B) return { label: 'Ditolak Supplier', style: 'bg-red-500/10 text-red-400 border border-red-500/20' };
        
        if (status === 'processed') return { label: 'Diproses', style: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' };
        
        if (status === 'received') {
            if (paymentStatus === 'unpaid') return { label: 'Belum Bayar (Tempo)', style: 'bg-orange-500/10 text-orange-400 border border-orange-500/20' };
            return { label: 'Selesai', style: 'bg-green-500/10 text-green-400 border border-green-500/20' };
        }
        if (status === 'shipped') return { label: 'Dikirim', style: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' };
        
        // Conventional Status
        if (status === 'ordered') return { label: 'Menunggu Pengiriman', style: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' };
        
        return { label: 'Dipesan', style: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' };
    };

    const generateRecommendations = async () => {
         // Placeholder logic for now, using smart AI helper in real implementation
         alert("Menjalankan analisis stok... Draft PO akan dibuat untuk item kritis.");
    };

    return {
        ...dashboardData,
        allSuppliers, 
        dashboardSearch, setDashboardSearch,
        activeFilters, toggleFilter, clearFilters,
        setDashboardPage,
        generateRecommendations,
        getPoStatusDisplay,
        dateFilter, handleDateFilterChange,
        selectedPoIds, toggleSelectPO, handleSelectAll, handleBulkAction,
        handleApprovePO, handleRejectPO,
        aiSuggestions, handleCreateAutoPO,
        
        // NEW EXPORTS
        handleExportCSV,
        handleImportCSV,
        liveLogs,
        isReportModalOpen, setIsReportModalOpen,
        isLiveLogOpen, setIsLiveLogOpen
    };
}