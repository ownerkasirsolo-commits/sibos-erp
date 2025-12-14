
export enum BusinessType {
  CULINARY = 'Kuliner (F&B)',
  RETAIL = 'Ritel (Toko/Swalayan)',
  SERVICE = 'Jasa',
  FASHION = 'Fashion',
  ELECTRONIC = 'Elektronik & Gadget',
  PHARMACY = 'Apotek/Farmasi',
  MANUFACTURING = 'Pabrik/Manufaktur',
  CONSTRUCTION = 'Konstruksi',
  MINING = 'Pertambangan'
}

export enum Role {
  OWNER = 'Owner',
  MANAGER = 'Manager',
  CASHIER = 'Kasir',
  CHEF = 'Koki/Dapur',
  WAITER = 'Pelayan',
  CUSTOMER = 'Pelanggan',
  PARTNER = 'Partner / Agen' // Added Partner Role
}

export enum ClientTier {
  SMALL = 'Small (UMKM)',   // Beban: 2%
  MEDIUM = 'Medium (Menengah)', // Beban: 5%
  LARGE = 'Large (Enterprise)'  // Beban: 20%
}

export enum UnitType {
  PCS = 'Pcs',
  KG = 'Kg',
  LITER = 'Liter',
  METER = 'Meter',
  BOX = 'Box',
  PORTION = 'Porsi',
  GRAM = 'Gram',
  ML = 'ML',
  TBS = 'Sdm (15ml)', // Tablespoon
  TSP = 'Sdt (5ml)',   // Teaspoon
  CARTON = 'Karton/Dus',
  PACK = 'Pack/Bungkus'
}

export type PrinterPaperSize = '58mm' | '80mm' | 'A4' | 'DotMatrix-76mm' | 'DotMatrix-Continuous';

// --- BUSINESS & OUTLET STRUCTURE ---
export interface Outlet {
  id: string; 
  name: string;
  address: string;
  active: boolean;
}

export interface BusinessEntity {
  id: string; 
  name: string;
  type: BusinessType;
  role: string;
  active: boolean;
  logo: string;
  outlets: Outlet[];
  tier?: ClientTier; // Added tier to business
  partnerId?: string; // Linked Partner
}

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
}

export interface Order {
  id: string;
  outletId?: string; 
  items: any[]; // Kept as any[] for now to avoid circular dependency, should be CartItem from products
  total: number;
  status: 'pending' | 'cooking' | 'ready' | 'served' | 'paid' | 'debt' | 'shipped'; 
  paymentStatus?: 'paid' | 'unpaid' | 'partial';
  type: 'dine-in' | 'take-away' | 'delivery';
  tableNumber?: string;
  timestamp: string; 
  customerName?: string;
  customerId?: string; 
  isSplitBill?: boolean;
  paymentMethod?: string;
  staffId?: string; 
  staffName?: string;
  sourcePoId?: string; // NEW: Link to original PO for B2B
}

export interface Shift {
  id: string;
  outletId: string;
  staffId: string;
  staffName: string;
  startTime: Date;
  endTime?: Date;
  startCash: number;
  endCash?: number;
  totalSalesCash: number;
  totalSalesNonCash: number;
  transactions: Order[];
  status: 'open' | 'closed';
}
