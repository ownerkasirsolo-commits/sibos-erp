
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import { Product, Promotion } from '../../features/products/types';
import { Ingredient, Supplier, PurchaseOrder, PurchaseOrderItem, StockTransfer, StockTransferItem, StockAdjustment, InventoryHistoryItem } from '../../features/irm/types';
import { B2BService } from '../../features/b2b/B2BService';
import { convertUnit } from '../../utils/unitConversion';

export const useProductSlice = (targetOutletIds: string[], currentUser: any, activeOutletId: string | null | undefined) => {
    
    // --- QUERIES ---
    const products = useLiveQuery(() => db.products.toArray(), []) || [];
    const ingredients = useLiveQuery(() => db.ingredients.where('outletId').anyOf(targetOutletIds).toArray(), [targetOutletIds]) || [];
    const suppliers = useLiveQuery(() => db.suppliers.toArray(), []) || [];
    const purchaseOrders = useLiveQuery(() => db.purchaseOrders.where('outletId').anyOf(targetOutletIds).toArray(), [targetOutletIds]) || [];
    const stockTransfers = useLiveQuery(() => db.stockTransfers.toArray(), []) || [];
    const stockAdjustments = useLiveQuery(() => db.stockAdjustments.toArray(), []) || [];
    const promotions = useLiveQuery(() => db.promotions.toArray(), []) || [];

    // --- ACTIONS: PRODUCTS ---
    const updateProduct = async (product: Product) => { await db.products.put(product); };
    
    const addPromotion = async (promo: Promotion) => { await db.promotions.add(promo); };
    const togglePromotion = async (id: string) => { const p = await db.promotions.get(id); if(p) await db.promotions.update(id, { active: !p.active }); };
    const deletePromotion = async (id: string) => { await db.promotions.delete(id); };

    // --- ACTIONS: IRM (INGREDIENTS & SUPPLIERS) ---
    const addIngredient = async (ingredient: Ingredient) => { await db.ingredients.add(ingredient); };
    const updateIngredient = async (ingredient: Ingredient) => { await db.ingredients.put(ingredient); };
    const addSupplier = async (supplier: Supplier) => { await db.suppliers.add(supplier); };

    const produceIngredient = async (ingredientId: string, quantityToProduce: number) => { 
        const target = await db.ingredients.get(ingredientId);
        if(!target || !target.recipe) return;
        await db['transaction']('rw', db.ingredients, db.stockAdjustments, async () => {
            for(const item of target.recipe!) {
                 const raw = await db.ingredients.get(item.ingredientId);
                 if(raw) {
                     const needed = convertUnit(item.quantity, item.unit, raw.unit) * quantityToProduce;
                     await db.ingredients.update(raw.id, { stock: raw.stock - needed });
                 }
            }
            await db.ingredients.update(target.id, { stock: target.stock + quantityToProduce });
        });
    };

    const adjustStock = async (ingredientId: string, realQty: number, reason: StockAdjustment['reason'], note?: string) => { 
        const ing = await db.ingredients.get(ingredientId);
        if(ing) {
            const variance = realQty - ing.stock;
            await db.ingredients.update(ingredientId, { stock: realQty });
            await db.stockAdjustments.add({
                id: `ADJ-${Date.now()}`,
                ingredientId,
                ingredientName: ing.name,
                oldStock: ing.stock,
                newStock: realQty,
                variance,
                reason,
                note,
                timestamp: new Date().toISOString(),
                staffName: currentUser?.name || 'System'
            });
        }
    };
    
    const getIngredientHistory = async (ingredientId: string): Promise<InventoryHistoryItem[]> => { return []; }; // Mock implementation
    const getLastSupplierPrice = async (supplierId: string, ingredientId: string): Promise<number | null> => { return null; }; // Mock implementation

    // --- ACTIONS: PROCUREMENT (PO) ---
    const createPurchaseOrder = async (po: PurchaseOrder) => { await db.purchaseOrders.add(po); if (po.isB2B && po.status === 'pending') await B2BService.sendOrderRequest(po); };
    const updatePurchaseOrder = async (po: PurchaseOrder) => { await db.purchaseOrders.put(po); if (po.isB2B && po.status === 'pending') await B2BService.sendOrderRequest(po); };
    
    const receivePurchaseOrder = async (poId: string, receivedItems: PurchaseOrderItem[], paymentInfo: any) => { 
        const po = await db.purchaseOrders.get(poId); 
        if (!po) return; 
        
        await db.purchaseOrders.update(poId, { status: 'received', items: receivedItems, paymentStatus: paymentInfo.method === 'tempo' ? 'unpaid' : 'paid', receivedBy: currentUser?.name, receivedDate: new Date().toISOString() }); 
        
        for (const item of receivedItems) {
            const ingredient = await db.ingredients.get(item.ingredientId);
            if (ingredient) {
                const qtyToAdd = item.receivedQuantity || item.quantity;
                await db.ingredients.update(item.ingredientId, { stock: ingredient.stock + qtyToAdd, avgCost: item.cost });
            }
        }
    };

    // --- ACTIONS: DISTRIBUTION ---
    const createStockTransfer = async (transfer: StockTransfer) => { await db.stockTransfers.add(transfer); };
    
    const shipStockTransfer = async (transferId: string, shippedItems: StockTransferItem[], driverInfo?: any) => {
         await db['transaction']('rw', db.stockTransfers, db.ingredients, async () => {
             await db.stockTransfers.update(transferId, { status: 'shipped', items: shippedItems, shipDate: new Date().toISOString(), driverName: driverInfo?.driver, plateNumber: driverInfo?.plate, shippedBy: currentUser?.name });
             
             const transfer = await db.stockTransfers.get(transferId);
             const senderId = transfer?.sourceOutletId || activeOutletId;

             if (senderId) {
                  for (const item of shippedItems) {
                      const sourceIngredients = await db.ingredients
                          .where('outletId').equals(senderId)
                          .filter(i => i.name === item.ingredientName)
                          .toArray();
                      const sourceIng = sourceIngredients[0];
                      if (sourceIng) {
                           const qtyToShip = item.quantityShipped || item.quantityRequested;
                           await db.ingredients.update(sourceIng.id, { stock: sourceIng.stock - qtyToShip });
                      }
                  }
             }
         });
    };

    const receiveStockTransfer = async (transferId: string, receivedItems: StockTransferItem[]) => { 
        await db['transaction']('rw', db.stockTransfers, db.ingredients, async () => {
             await db.stockTransfers.update(transferId, { status: 'received', items: receivedItems, receiveDate: new Date().toISOString(), receivedBy: currentUser?.name });
             
             for (const item of receivedItems) {
                 if (item.ingredientId) {
                     const ing = await db.ingredients.get(item.ingredientId);
                     if (ing) {
                         const qtyReceived = item.quantityReceived || item.quantityShipped || item.quantityRequested;
                         await db.ingredients.update(ing.id, { stock: ing.stock + qtyReceived });
                     }
                 }
             }
        });
    };

    return {
        products,
        ingredients,
        suppliers,
        purchaseOrders,
        stockTransfers,
        stockAdjustments,
        promotions,
        
        updateProduct,
        addPromotion, togglePromotion, deletePromotion,
        addIngredient, updateIngredient, addSupplier,
        produceIngredient, adjustStock,
        createPurchaseOrder, updatePurchaseOrder, receivePurchaseOrder,
        createStockTransfer, shipStockTransfer, receiveStockTransfer,
        getIngredientHistory, getLastSupplierPrice
    };
};
