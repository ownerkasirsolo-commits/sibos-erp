
import { UnitType, BusinessType, PrinterPaperSize } from '../../types';

// --- CONFIG TYPES ---
export type ModuleId = 'pos' | 'kds' | 'cds' | 'reservations' | 'queue' | 'crm' | 'irm' | 'hrm' | 'accounting' | 'omnichannel' | 'marketing' | 'website';

export interface BusinessConfig {
  name: string;
  type: BusinessType;
  currency: 'IDR' | 'USD';
  address?: string;
  phone?: string;
  footerMessage?: string;
  printerPaperSize?: PrinterPaperSize;
  
  // NEW: Module Management
  activeModules?: ModuleId[]; // List modul yang diaktifkan user
  defaultPosMode?: 'retail' | 'culinary'; // Tampilan default saat buka POS
}

// --- IRM-SPECIFIC TYPES ---
export interface Ingredient {
  id: string;
  outletId: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  unit: UnitType;
  minStock: number;
  avgCost: number;
  supplierId?: string;
  lastUpdated: string;
  
  // --- SUB-RECIPE FIELDS ---
  type?: 'raw' | 'semi_finished'; // raw = beli jadi, semi_finished = olah sendiri
  recipe?: {
      ingredientId: string;
      quantity: number;
      unit: UnitType;
  }[];
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  category: string;
  isSibosNetwork: boolean;
  performanceScore?: number; // 0 - 100
  totalCompletedOrders?: number;
}

export interface PurchaseOrderItem {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: UnitType;
  cost: number;
  // Fields for receiving
  receivedQuantity?: number;
  finalCost?: number;
  expiryDate?: string;
  discrepancyReason?: 'bonus' | 'damaged' | 'missing' | '';
  evidenceUrl?: string;
  // Dynamic fields for Cart display logic
  supplierId?: string;
  supplierName?: string;
  isNetwork?: boolean;
}

export interface POHistoryLog {
    timestamp: string;
    action: 'created' | 'updated' | 'sent' | 'viewed' | 'received' | 'cancelled' | 'rejected' | 'approved' | 'converted';
    actor: string;
    note?: string;
}

export interface PurchaseOrder {
  id: string;
  outletId: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  totalEstimated: number;
  status: 'draft' | 'pending_approval' | 'ordered' | 'processed' | 'shipped' | 'received' | 'cancelled' | 'rejected' | 'pending';
  orderDate: string;
  receivedDate?: string;
  createdBy: string;
  createdById?: string;
  receivedBy?: string;
  approvedBy?: string;
  isB2B?: boolean;
  distributorStatus?: 'pending' | 'accepted' | 'rejected' | 'shipped';
  paymentMethod?: 'cash' | 'transfer' | 'tempo';
  paymentStatus?: 'paid' | 'unpaid' | 'partial';
  dueDate?: string;
  history?: POHistoryLog[];
}

// NEW: Purchase Request (PR)
export interface PurchaseRequest {
  id: string;
  outletId: string;
  requestedBy: string;
  items: PurchaseOrderItem[];
  status: 'pending' | 'approved' | 'rejected' | 'converted';
  requestDate: string;
  note?: string;
  convertedPoId?: string;
}

// NEW: Budget Configuration
export interface CategoryBudget {
    category: string;
    limit: number;
    spent: number;
    percent: number; // Derived
}

export interface StockTransferItem {
  ingredientId: string;
  ingredientName: string;
  unit: UnitType;
  quantityRequested: number;
  quantityShipped?: number;
  quantityReceived?: number;
}

export interface StockTransfer {
  id: string;
  sourceOutletId: string;
  targetOutletId: string;
  targetOutletName: string;
  items: StockTransferItem[];
  status: 'pending' | 'shipped' | 'received' | 'cancelled';
  requestDate: string;
  shipDate?: string;
  receiveDate?: string;
  requestedBy: string;
  shippedBy?: string;
  receivedBy?: string;
  driverName?: string;
  plateNumber?: string;
}

export interface StockAdjustment {
  id: string;
  ingredientId: string;
  ingredientName: string;
  oldStock: number;
  newStock: number;
  variance: number;
  reason: 'Opname' | 'Rusak' | 'Hilang' | 'Expired' | 'Koreksi' | 'Produksi';
  note?: string;
  timestamp: string;
  staffName: string;
}

export interface InventoryHistoryItem {
    id: string;
    date: string;
    type: 'PO' | 'Sale' | 'Transfer In' | 'Transfer Out' | 'Adjustment' | 'Production';
    referenceId: string;
    quantityChange: number;
    currentStock: number;
    notes?: string;
}
