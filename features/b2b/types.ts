
import { PurchaseOrderItem } from "../irm/types";

// The payload that travels between businesses
export interface B2BRequest {
    id: string;
    type: 'purchase_order'; // Expandable for other types later
    
    // Sender Info
    sourceBusinessId: string;
    sourceOutletId: string;
    sourceName: string; // Resto Name
    
    // Receiver Info
    targetBusinessId?: string; // Optional if targeting specific outlet
    targetOutletId: string; // The "Inbox" ID (e.g., SIBOS Mart Gudang)
    
    // Data Payload
    originalPoId: string; // ID of the PO in sender's DB
    items: PurchaseOrderItem[];
    totalAmount: number;
    
    // Status
    status: 'pending' | 'processed' | 'shipped' | 'rejected' | 'accepted' | 'completed';
    paymentStatus: 'paid' | 'unpaid'; // FINANCIAL STATUS
    
    // Logistics & Tracking
    courierDetails?: {
        driverName: string;
        plateNumber: string;
        waybillId: string; // Surat Jalan ID
        shippedAt: string;
    };
    
    // Audit Trail (Who did what)
    acceptedBy?: string; // Who clicked "Terima"
    checkedBy?: string; // Who did QC Checklist
    shippedBy?: string; // Who issued Waybill
    
    timestamp: string;
    note?: string; // For tracking info or rejection reason
}
