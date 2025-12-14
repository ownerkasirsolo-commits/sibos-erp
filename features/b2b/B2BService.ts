

import { db } from '../../services/db';
import { PurchaseOrder, PurchaseOrderItem } from '../irm/types';
import { B2BRequest } from './types';
import { Order, BusinessType } from '../../types';
import { CashTransaction } from '../accounting/types';

export const B2BService = {
    // 1. SEND: Resto creates a request to Mart
    sendOrderRequest: async (po: PurchaseOrder) => {
        let targetOutletId = '';
        if (po.supplierId === 's1') targetOutletId = '201'; // Default to Gudang 201 for Demo
        
        if (!targetOutletId) return;

        const request: B2BRequest = {
            id: `REQ-${Date.now()}`,
            type: 'purchase_order',
            sourceBusinessId: 'biz1', 
            sourceOutletId: po.outletId,
            sourceName: 'SIBOS Resto (Partner)',
            targetOutletId: targetOutletId,
            originalPoId: po.id,
            items: po.items,
            totalAmount: po.totalEstimated,
            status: 'pending',
            paymentStatus: 'unpaid', // Default to unpaid/credit
            timestamp: new Date().toISOString()
        };

        await db.b2bRequests.add(request);
        console.log("SIBOS Nexus: Request Sent", request);
    },

    // 2. HELPER: Get Request Data
    getRequest: async (requestId: string) => {
        return await db.b2bRequests.get(requestId);
    },

    // 3. STEP A: ACCEPT (Terima Pesanan & Negosiasi)
    processOrder: async (requestId: string, actorName: string) => {
        console.log(`[B2B] Processing Order: ${requestId}`);
        const request = await db.b2bRequests.get(requestId);
        if (!request) throw new Error("Request not found");

        // Update Request Status locally
        await db.b2bRequests.update(requestId, { 
            status: 'processed',
            acceptedBy: actorName 
        });

        // Update Buyer PO Status (Remote simulation)
        const po = await db.purchaseOrders.get(request.originalPoId);
        if (po) {
            await db.purchaseOrders.update(request.originalPoId, { 
                status: 'processed', 
                distributorStatus: 'processed' 
            });
        }
        console.log("[B2B] Order marked as PROCESSED");
    },

    // 3.5. STEP A.1: UPDATE ITEMS (Partial Fulfillment / Negotiation)
    updateOrderQuantities: async (requestId: string, updatedItems: PurchaseOrderItem[]) => {
        const request = await db.b2bRequests.get(requestId);
        if (!request) throw new Error("Request not found");

        // Recalculate Total
        const newTotal = updatedItems.reduce((acc, item) => acc + (item.quantity * item.cost), 0);

        await db.b2bRequests.update(requestId, {
            items: updatedItems,
            totalAmount: newTotal
        });

        // Sync change to Buyer PO (Notify them order changed)
        const po = await db.purchaseOrders.get(request.originalPoId);
        if (po) {
            await db.purchaseOrders.update(request.originalPoId, {
                items: updatedItems,
                totalEstimated: newTotal
            });
        }
    },

    // 4. STEP B: SHIP (QC Checklist -> Generate Surat Jalan -> Potong Stok)
    shipOrder: async (
        requestId: string, 
        courierInfo: { driverName: string, plateNumber: string }, 
        staffName: string // Who performed QC and Shipping
    ) => {
        console.log(`[B2B] Shipping Order: ${requestId}`);
        
        // Use Transaction to ensure Stock Deduction and Order Update happen together
        // FIX: accessing transaction via bracket notation to avoid TS error on SibosDatabase type
        await db['transaction']('rw', db.b2bRequests, db.products, db.transactions, db.purchaseOrders, async () => {
            const request = await db.b2bRequests.get(requestId);
            if (!request) throw new Error("Request not found");

            const waybillId = `DO-${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;

            // A. Deduct Stock from Seller's Inventory
            for (const item of request.items) {
                // Try to find product by Name (Robust matching for B2B)
                // In real scenario, we would map SKU to SKU. Here we use Name as fallback.
                const product = await db.products
                    .where('name').equals(item.ingredientName)
                    .first();
                
                // If not found by exact name, try relaxed search (optional) or skip
                if (product) {
                    const currentStock = product.stock || 0;
                    
                    if (currentStock < item.quantity) {
                         throw new Error(`Stok tidak cukup untuk produk: ${product.name}. Tersedia: ${currentStock}, Diminta: ${item.quantity}`);
                    }

                    const newStock = currentStock - item.quantity;
                    
                    // Update DB
                    await db.products.update(product.id, { stock: newStock });
                    console.log(`[Stock Deducted] ${product.name}: ${currentStock} -> ${newStock}`);
                } else {
                    console.warn(`[Warning] Produk '${item.ingredientName}' tidak ditemukan di inventory penjual. Stok tidak terpotong.`);
                }
            }

            // B. Create Sales Transaction (Money In - UNPAID/PIUTANG)
            // This records the "Sale" for the Seller side
            const newOrder: Order = {
                id: `ORD-B2B-${request.originalPoId.slice(-6)}`,
                outletId: request.targetOutletId, // Seller's Outlet
                sourcePoId: request.originalPoId,
                customerName: request.sourceName,
                customerId: request.sourceBusinessId,
                items: request.items.map(item => ({
                    id: item.ingredientId, // Note: This might need mapping to local Product ID if strict relation needed
                    name: item.ingredientName,
                    price: item.cost,
                    quantity: item.quantity,
                    unit: item.unit,
                    category: 'Wholesale',
                    businessType: BusinessType.RETAIL
                })),
                total: request.totalAmount,
                status: 'shipped', // Barang keluar
                paymentStatus: 'unpaid', // PIUTANG (Invoice Open)
                type: 'delivery',
                paymentMethod: 'transfer',
                timestamp: new Date().toISOString(),
                staffName: staffName
            };
            await db.transactions.add(newOrder);

            // C. Update Request Status
            await db.b2bRequests.update(requestId, { 
                status: 'shipped',
                checkedBy: staffName,
                shippedBy: staffName,
                courierDetails: {
                    ...courierInfo,
                    waybillId: waybillId,
                    shippedAt: new Date().toISOString()
                },
                note: `Dikirim via Internal. Resi: ${waybillId}` 
            });

            // D. Update Buyer PO Status (Sync)
            const po = await db.purchaseOrders.get(request.originalPoId);
            if (po) {
                await db.purchaseOrders.update(request.originalPoId, { 
                    status: 'shipped',
                    distributorStatus: 'shipped'
                });
            }
        });

        console.log("[B2B] Order SHIPPED and Stock Deducted.");
    },

    // 5. STEP C: COMPLETE (Diterima Pembeli)
    completeOrder: async (originalPoId: string) => {
        // Find the request based on PO ID
        const request = await db.b2bRequests.where('originalPoId').equals(originalPoId).first();
        
        if (request) {
            await db.b2bRequests.update(request.id, { status: 'completed' });
            
            // Find transaction and mark as served (goods received)
            const transaction = await db.transactions.where('sourcePoId').equals(originalPoId).first();
            if (transaction) {
                await db.transactions.update(transaction.id, { status: 'served' });
            }
        }
    },

    // 6. STEP D: SETTLE PAYMENT (Keuangan)
    settlePayment: async (requestId: string, staffName: string) => {
        const request = await db.b2bRequests.get(requestId);
        if (!request) throw new Error("Request not found");

        // 1. Update Request Payment Status
        await db.b2bRequests.update(requestId, { paymentStatus: 'paid' });

        // 2. Find Transaction and Mark Paid
        const transaction = await db.transactions.where('sourcePoId').equals(request.originalPoId).first();
        if (transaction) {
            await db.transactions.update(transaction.id, { 
                paymentStatus: 'paid',
                status: transaction.status === 'shipped' ? 'served' : transaction.status 
            });

            // 3. Record Cash In (Real Money enters)
            const cashEntry: CashTransaction = {
                id: `CF-IN-${Date.now()}`,
                outletId: request.targetOutletId,
                type: 'in',
                amount: request.totalAmount,
                category: 'sales',
                note: `Pelunasan Invoice B2B #${request.originalPoId}`,
                timestamp: new Date(),
                staffName: staffName,
                debitAccountId: 'acc_bank_bca', // Assumed transfer for B2B
                creditAccountId: 'acc_ar' // Clearing AR
            };
            await db.cashFlow.add(cashEntry);
        }
    },

    // 7. REJECT
    rejectOrder: async (requestId: string, reason: string) => {
        const request = await db.b2bRequests.get(requestId);
        if (!request) return;

        await db.b2bRequests.update(requestId, { status: 'rejected', note: reason });
        
        const po = await db.purchaseOrders.get(request.originalPoId);
        if (po) {
            await db.purchaseOrders.update(request.originalPoId, { 
                status: 'rejected',
                distributorStatus: 'rejected'
            });
        }
    }
};