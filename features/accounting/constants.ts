
// FIX: Corrected import paths for types from root and other features.
import { BusinessType, UnitType, BusinessEntity, Order } from "../../types";
import { CustomerDetail } from "../crm/types";
import { Ingredient, Supplier, PurchaseOrder, StockTransfer } from "../irm/types";
import { Product } from "../products/types";
import { Employee, Attendance, JobVacancy } from "../hrm/types";
import { Reservation } from "../reservations/types";
import { QueueItem } from "../queue/types";
import { SignageContent } from "../signage/types";
import { ChartOfAccount, BudgetPlan } from "./types";

export const APP_LOGO_URL = "https://picsum.photos/id/433/100/100";

// --- MULTI BUSINESS & OUTLET MOCK ---
export const MOCK_BUSINESSES: BusinessEntity[] = [
  { 
    id: 'biz1', 
    name: 'SIBOS Resto & Cafe', 
    type: BusinessType.CULINARY, 
    role: 'Owner', 
    active: true,
    logo: 'https://picsum.photos/id/433/100/100',
    outlets: [
        { id: '101', name: 'Outlet Utama (Pusat)', address: 'Jl. Merdeka No. 1', active: true },
        { id: '102', name: 'Cabang Sudirman', address: 'Jl. Jend. Sudirman No. 45', active: true },
    ]
  },
  { 
    id: 'biz2', 
    name: 'SIBOS Mart (Grosir)', 
    type: BusinessType.RETAIL, 
    role: 'Owner', 
    active: false,
    logo: 'https://picsum.photos/id/225/100/100',
    outlets: [
        { id: '201', name: 'Gudang Distribusi', address: 'Kawasan Industri Pulo Gadung', active: true },
        { id: '202', name: 'Toko Kelontong A', address: 'Pasar Minggu', active: false },
    ]
  },
];

// --- TRANSAKSI MOCK (UNTUK DASHBOARD) ---
export const MOCK_TRANSACTIONS: Order[] = [
    // --- OUTLET 101 (PUSAT) - RAMAI ---
    { id: 'ORD-101-01', outletId: '101', items: [{ id: 'c1', name: 'Nasi Goreng Spesial', quantity: 2, price: 35000 }], total: 70000, status: 'paid', type: 'dine-in', timestamp: new Date().toISOString(), paymentMethod: 'cash' },
    { id: 'ORD-101-02', outletId: '101', items: [{ id: 'c2', name: 'Kopi Susu Gula Aren', quantity: 5, price: 18000 }], total: 90000, status: 'paid', type: 'take-away', timestamp: new Date(Date.now() - 1000*60*30).toISOString(), paymentMethod: 'qris' },
    { id: 'ORD-101-03', outletId: '101', items: [{ id: 'c4', name: 'Ultimate Cheese Burger', quantity: 1, price: 45000 }], total: 45000, status: 'paid', type: 'dine-in', timestamp: new Date(Date.now() - 1000*60*60).toISOString(), paymentMethod: 'cash' },
    
    // --- OUTLET 102 (SUDIRMAN) - SEPI (BEDA DATA) ---
    { id: 'ORD-102-01', outletId: '102', items: [{ id: 'c2', name: 'Kopi Susu Gula Aren', quantity: 1, price: 18000 }], total: 18000, status: 'paid', type: 'take-away', timestamp: new Date().toISOString(), paymentMethod: 'cash' },
    { id: 'ORD-102-02', outletId: '102', items: [{ id: 'c3', name: 'Ayam Bakar Madu', quantity: 1, price: 45000 }], total: 45000, status: 'paid', type: 'dine-in', timestamp: new Date(Date.now() - 1000*60*120).toISOString(), paymentMethod: 'debit' },

    // --- OUTLET 201 (GUDANG/RITEL) - GROSIR ---
    { id: 'ORD-201-01', outletId: '201', items: [{ id: 'r1', name: 'Minyak Goreng Tropical 2L', quantity: 10, price: 37500 }], total: 375000, status: 'paid', type: 'take-away', timestamp: new Date().toISOString(), paymentMethod: 'transfer' },
    { id: 'ORD-201-02', outletId: '201', items: [{ id: 'r2', name: 'Indomie Goreng Special', quantity: 40, price: 3100 }], total: 124000, status: 'paid', type: 'take-away', timestamp: new Date(Date.now() - 1000*60*45).toISOString(), paymentMethod: 'cash' },
];

// --- HRM MOCK DATA (Segregated) ---
export const MOCK_EMPLOYEES: Employee[] = [
  // OWNER ACCOUNT (SUPER ADMIN)
  { id: 'owner1', name: "Big Boss Owner", role: "Owner", outletId: "101", outletName: "Global Access", status: "Active", joinDate: "01 Jan 2020", salary: "-", pin: '0000' },
  
  // STAFF OUTLET PUSAT (101)
  { id: 'emp1', name: "Budi Santoso", role: "Manager", outletId: "101", outletName: "Outlet Utama (Pusat)", status: "Active", joinDate: "12 Jan 2023", salary: "Rp 8.500.000", pin: '1234' },
  { id: 'emp2', name: "Siti Aminah", role: "Kasir", outletId: "101", outletName: "Outlet Utama (Pusat)", status: "Active", joinDate: "15 Mar 2023", salary: "Rp 4.200.000", pin: '1111' },
  { id: 'emp4', name: "Rina Nose", role: "Waitress", outletId: "101", outletName: "Outlet Utama (Pusat)", status: "Active", joinDate: "10 Apr 2024", salary: "Rp 3.800.000", pin: '3333' },
  
  // STAFF CABANG SUDIRMAN (102)
  { id: 'emp3', name: "Joko Anwar", role: "Kitchen", outletId: "102", outletName: "Cabang Sudirman", status: "On Leave", joinDate: "02 Feb 2024", salary: "Rp 4.500.000", pin: '2222' },
  { id: 'emp5', name: "Doni Tata", role: "Kasir", outletId: "102", outletName: "Cabang Sudirman", status: "Active", joinDate: "20 May 2024", salary: "Rp 4.200.000", pin: '4444' },
];

// --- GENERATE MOCK ATTENDANCE (LAST 5 DAYS) ---
const generateMockAttendance = (): Attendance[] => {
    const records: Attendance[] = [];
    const now = new Date();
    const employees = MOCK_EMPLOYEES.filter(e => e.status !== 'On Leave');

    // Last 5 days
    for (let i = 0; i < 5; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        employees.forEach(emp => {
            // Randomize clock in times (08:45 - 09:30)
            const randomMin = Math.floor(Math.random() * 45);
            const hour = 8;
            const minute = 45 + randomMin;
            
            // Adjust for late logic (e.g. late if > 09:00)
            let status: 'Present' | 'Late' | 'Absent' | 'On Leave' = 'Present';
            let finalHour = hour;
            let finalMinute = minute;

            if (minute >= 60) {
                finalHour += 1;
                finalMinute -= 60;
            }

            if (finalHour > 9 || (finalHour === 9 && finalMinute > 0)) {
                status = 'Late';
            }

            // Create Date objects for timestamp
            const clockInDate = new Date(date);
            clockInDate.setHours(finalHour, finalMinute, 0);

            const clockOutDate = new Date(date);
            clockOutDate.setHours(17 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 59), 0); // 17:00 - 20:00

            // Skip today's clockout if it's "today" (simulate ongoing shift)
            const isToday = i === 0;
            const finalClockOut = isToday ? undefined : clockOutDate.toISOString();

            records.push({
                id: `att-${emp.id}-${dateStr}`,
                employeeId: emp.id,
                outletId: emp.outletId,
                clockIn: clockInDate.toISOString(),
                clockOut: finalClockOut,
                status: status
            });
        });
    }
    return records;
};

export const MOCK_ATTENDANCE: Attendance[] = generateMockAttendance();

// --- IRM MOCK DATA (Defined first for recipe linking) ---
export const MOCK_SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'SIBOS Mart (Grosir)', contact: 'Admin Gudang', phone: '08123456789', category: 'Sembako', isSibosNetwork: true }, // SIBOS CONNECTED (Outlet 201)
  { id: 's2', name: 'PT. Fresh Meat Indonesia', contact: 'Bu Susi', phone: '08199988877', category: 'Daging & Ikan', isSibosNetwork: false },
  { id: 's3', name: 'Juragan Sayur Pasar Induk', contact: 'Kang Asep', phone: '08177766655', category: 'Sayuran', isSibosNetwork: false },
];

// Split Ingredients per Outlet
export const MOCK_INGREDIENTS: Ingredient[] = [
  // --- OUTLET PUSAT (101) - STOK AMAN ---
  { id: 'i1', outletId: '101', name: 'Biji Kopi House Blend', sku: 'RM-001', category: 'Dry Goods', stock: 25.5, unit: UnitType.KG, minStock: 2, avgCost: 180000, supplierId: 's1', lastUpdated: new Date().toISOString() },
  { id: 'i2', outletId: '101', name: 'Susu Fresh Milk', sku: 'RM-002', category: 'Dairy', stock: 40, unit: UnitType.LITER, minStock: 5, avgCost: 18000, supplierId: 's1', lastUpdated: new Date().toISOString() },
  { id: 'i3', outletId: '101', name: 'Daging Sapi Slice', sku: 'RM-003', category: 'Meat', stock: 15.3, unit: UnitType.KG, minStock: 5, avgCost: 110000, supplierId: 's2', lastUpdated: new Date().toISOString() },
  { id: 'i6', outletId: '101', name: 'Beras Pandan Wangi', sku: 'RM-006', category: 'Dry Goods', stock: 100, unit: UnitType.KG, minStock: 10, avgCost: 13000, supplierId: 's1', lastUpdated: new Date().toISOString() },
  { id: 'i7', outletId: '101', name: 'Telur Ayam', sku: 'RM-007', category: 'Dairy', stock: 200, unit: UnitType.PCS, minStock: 20, avgCost: 2000, supplierId: 's3', lastUpdated: new Date().toISOString() },
  { id: 'i4', outletId: '101', name: 'Gula Aren Cair', sku: 'RM-004', category: 'Dry Goods', stock: 20, unit: UnitType.LITER, minStock: 2, avgCost: 35000, supplierId: 's1', lastUpdated: new Date().toISOString() },

  // --- CABANG SUDIRMAN (102) - STOK TIPIS (Simulation) ---
  { id: 'i1_s', outletId: '102', name: 'Biji Kopi House Blend', sku: 'RM-001', category: 'Dry Goods', stock: 1.5, unit: UnitType.KG, minStock: 2, avgCost: 180000, supplierId: 's1', lastUpdated: new Date().toISOString() },
  { id: 'i2_s', outletId: '102', name: 'Susu Fresh Milk', sku: 'RM-002', category: 'Dairy', stock: 3, unit: UnitType.LITER, minStock: 5, avgCost: 18000, supplierId: 's1', lastUpdated: new Date().toISOString() },
  { id: 'i3_s', outletId: '102', name: 'Daging Sapi Slice', sku: 'RM-003', category: 'Meat', stock: 0.5, unit: UnitType.KG, minStock: 5, avgCost: 110000, supplierId: 's2', lastUpdated: new Date().toISOString() },
  { id: 'i5_s', outletId: '102', name: 'Bawang Merah', sku: 'RM-005', category: 'Vegetable', stock: 0.2, unit: UnitType.KG, minStock: 1, avgCost: 45000, supplierId: 's3', lastUpdated: new Date().toISOString() },
  { id: 'i6_s', outletId: '102', name: 'Beras Pandan Wangi', sku: 'RM-006', category: 'Dry Goods', stock: 5, unit: UnitType.KG, minStock: 10, avgCost: 13000, supplierId: 's1', lastUpdated: new Date().toISOString() },
];

// --- PROCUREMENT MOCK DATA ---
export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
  // PO PUSAT (101)
  {
    id: 'PO-20240521-009', 
    outletId: '101',
    supplierId: 's1',
    supplierName: 'SIBOS Mart (Grosir)',
    items: [
      { ingredientId: 'i6', ingredientName: 'Beras Pandan Wangi', quantity: 50, unit: UnitType.KG, cost: 12500 },
      { ingredientId: 'i4', ingredientName: 'Gula Aren Cair', quantity: 10, unit: UnitType.LITER, cost: 34000 }
    ],
    totalEstimated: 965000,
    status: 'ordered', 
    orderDate: new Date().toISOString(),
    createdBy: 'Budi Santoso', 
    isB2B: true, 
    distributorStatus: 'accepted' 
  },
  
  // PO SUDIRMAN (102)
  {
    id: 'PO-20240522-001',
    outletId: '102',
    supplierId: 's2',
    supplierName: 'PT. Fresh Meat Indonesia',
    items: [
      { ingredientId: 'i3_s', ingredientName: 'Daging Sapi Slice', quantity: 5, unit: UnitType.KG, cost: 110000 }
    ],
    totalEstimated: 550000,
    status: 'draft',
    orderDate: new Date().toISOString(),
    createdBy: 'Doni Tata',
    isB2B: false
  }
];

export const MOCK_STOCK_TRANSFERS: StockTransfer[] = [];

export const MOCK_PRODUCTS: Product[] = [
  // --- CULINARY PRODUCTS (RESTO) ---
  // Using 'i1' IDs, logic in Context will handle re-mapping or just using basic ID for recipe.
  // In real DB, recipe ingredientId would reference a global SKU/Catalog ID, not local Inventory ID.
  // For this demo, we assume product recipes link to the concept of the ingredient (e.g., matching name/SKU) or ID if we sync.
  {
    id: 'c1',
    name: 'Nasi Goreng Spesial SIBOS',
    sku: 'FD-001',
    price: 35000,
    category: 'Makanan Berat',
    businessType: BusinessType.CULINARY,
    image: 'https://picsum.photos/200/200?random=1',
    hasVariants: true,
    variants: [
        { id: 'v1', name: 'Pedas', price: 35000, combination: ['Pedas'], sku: 'FD-001-P', stock: 0, active: true },
        { id: 'v2', name: 'Sedang', price: 35000, combination: ['Sedang'], sku: 'FD-001-S', stock: 0, active: true },
        { id: 'v3', name: 'Tidak Pedas', price: 35000, combination: ['Tidak Pedas'], sku: 'FD-001-NP', stock: 0, active: true }
    ],
    modifierGroups: [],
    unit: UnitType.PORTION,
    cogs: 15000,
    hasRecipe: true,
    recipe: [
        { ingredientId: 'i6', quantity: 0.2, unit: UnitType.KG }, // 200gr Beras
        { ingredientId: 'i7', quantity: 1, unit: UnitType.PCS },   // 1 Telur
        // { ingredientId: 'i5', quantity: 0.05, unit: UnitType.KG } // 50gr Bawang (Removed to avoid error in 101 which doesn't have i5)
    ],
    channels: {
        dinein: { active: true, price: 35000 },
        gofood: { active: true, price: 42000, commission: 20 },
        grabfood: { active: true, price: 42000, commission: 20 },
        shopeefood: { active: true, price: 41000, commission: 20 }
    },
    outletAvailability: 'all',
    outletPricing: {}
  },
  {
    id: 'c2',
    name: 'Es Kopi Gula Aren',
    sku: 'BV-001',
    price: 18000,
    category: 'Minuman',
    businessType: BusinessType.CULINARY,
    image: 'https://picsum.photos/200/200?random=2',
    unit: UnitType.PCS,
    cogs: 8000,
    hasRecipe: true,
    hasVariants: false,
    variants: [],
    modifierGroups: [],
    recipe: [
        { ingredientId: 'i1', quantity: 0.018, unit: UnitType.KG }, // 18gr Kopi
        { ingredientId: 'i2', quantity: 0.15, unit: UnitType.LITER },  // 150ml Susu
        { ingredientId: 'i4', quantity: 0.03, unit: UnitType.LITER }   // 30ml Gula Aren
    ],
    channels: {
        dinein: { active: true, price: 18000 },
        gofood: { active: true, price: 22000, commission: 20 },
        grabfood: { active: true, price: 22500, commission: 20 }
    },
    outletAvailability: 'all',
    outletPricing: {}
  },
  {
    id: 'c3',
    name: 'Ayam Bakar Madu',
    sku: 'FD-002',
    price: 45000,
    category: 'Makanan Berat',
    businessType: BusinessType.CULINARY,
    image: 'https://picsum.photos/200/200?random=3',
    unit: UnitType.PORTION,
    cogs: 0, 
    hasRecipe: false,
    hasVariants: false,
    variants: [],
    modifierGroups: [],
    outletAvailability: 'all',
    outletPricing: {}
  },
  
  // --- RETAIL PRODUCTS (SIBOS MART) ---
  {
    id: 'r1',
    name: 'Minyak Goreng Tropical 2L',
    sku: 'GRO-001',
    barcode: '8991234567890',
    price: 38000,
    category: 'Sembako',
    businessType: BusinessType.RETAIL,
    image: 'https://picsum.photos/200/200?random=4',
    unit: UnitType.PCS,
    stock: 50,
    cogs: 32000,
    hasRecipe: false,
    hasVariants: false,
    variants: [],
    modifierGroups: [],
    wholesalePrices: [
        { minQty: 6, price: 37500 },  // 1/2 Dus
        { minQty: 12, price: 36000 }  // 1 Dus
    ],
    outletAvailability: 'all',
    outletPricing: {}
  },
  {
    id: 'r2',
    name: 'Indomie Goreng Special',
    sku: 'GRO-002',
    barcode: '8998765432100',
    price: 3500,
    category: 'Makanan Instan',
    businessType: BusinessType.RETAIL,
    image: 'https://picsum.photos/200/200?random=5',
    unit: UnitType.PCS,
    stock: 200,
    cogs: 2800,
    hasRecipe: false,
    hasVariants: false,
    variants: [],
    modifierGroups: [],
    wholesalePrices: [
        { minQty: 5, price: 3400 },
        { minQty: 40, price: 3100 } // 1 Dus (40 pcs)
    ],
    outletAvailability: 'all',
    outletPricing: {}
  },
  {
    id: 'r3',
    name: 'Rokok Sampoerna Mild 16',
    sku: 'TOK-001',
    barcode: '8999988877766',
    price: 32000,
    category: 'Rokok',
    businessType: BusinessType.RETAIL,
    image: 'https://picsum.photos/200/200?random=6',
    unit: UnitType.PCS,
    stock: 20,
    cogs: 29500,
    hasRecipe: false,
    hasVariants: false,
    variants: [],
    modifierGroups: [],
    wholesalePrices: [
        { minQty: 10, price: 31000 } // 1 Slop
    ],
    outletAvailability: 'all',
    outletPricing: {}
  }
];

// --- CRM MOCK DATA ---
export const MOCK_CUSTOMERS: CustomerDetail[] = [
  { id: 'cust1', name: 'Budi Santoso', phone: '081234567890', tier: 'Gold', points: 1250, totalSpend: 5400000, joinDate: '10 Jan 2024', lastVisit: '2 Hari lalu', favoriteMenu: 'Kopi Susu Gula Aren' },
  { id: 'cust2', name: 'Siti Aminah', phone: '08199887654321', tier: 'Silver', points: 450, totalSpend: 1200000, joinDate: '15 Feb 2024', lastVisit: '1 Minggu lalu', favoriteMenu: 'Nasi Goreng Spesial' },
  { id: 'cust3', name: 'Joko Anwar', phone: '085678901234', tier: 'Bronze', points: 50, totalSpend: 250000, joinDate: '01 Mar 2024', lastVisit: '1 Bulan lalu', favoriteMenu: 'Es Teh Manis' },
  { id: 'cust4', name: 'Rina Nose', phone: '081223344556', tier: 'Platinum', points: 5600, totalSpend: 15800000, joinDate: '01 Dec 2023', lastVisit: 'Hari ini', favoriteMenu: 'Steak Wagyu' },
];

// --- RESERVATION MOCK DATA ---
export const MOCK_RESERVATIONS: Reservation[] = [
  { id: 'res1', customerName: 'Pak Handoko', phone: '08111222333', date: '2025-05-20', time: '19:00', pax: 4, tableNumber: 'T-04', status: 'confirmed', notes: 'Non-smoking, Ultah', deposit: 100000 },
  { id: 'res2', customerName: 'Bu Clarissa', phone: '08122334455', date: '2025-05-20', time: '20:00', pax: 2, tableNumber: 'T-02', status: 'pending', notes: 'Dekat jendela' },
  { id: 'res3', customerName: 'PT. Maju Mundur', phone: '08199887766', date: '2025-05-21', time: '12:00', pax: 10, tableNumber: 'VIP-1', status: 'confirmed', notes: 'Meeting lunch, siapin proyektor' },
];

// --- QUEUE MOCK DATA ---
export const MOCK_QUEUE: QueueItem[] = [
  { id: 'q1', number: 'A-012', customerName: 'Fajar', pax: 2, type: 'dine-in', status: 'seated', joinTime: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: 'q2', number: 'A-013', customerName: 'Gita', pax: 4, type: 'dine-in', status: 'called', joinTime: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
  { id: 'q3', number: 'B-005', customerName: 'Ojol (Grab)', pax: 1, type: 'take-away', status: 'waiting', joinTime: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: 'q4', number: 'A-014', customerName: 'Rudi', pax: 2, type: 'dine-in', status: 'waiting', joinTime: new Date(Date.now() - 1000 * 60 * 2).toISOString() },
];

// --- SIGNAGE MOCK DATA ---
export const MOCK_SIGNAGE: SignageContent[] = [
  { id: 'sg1', name: 'Promo Ramadhan', type: 'image', url: 'https://picsum.photos/1920/1080?random=10', duration: 10, active: true },
  { id: 'sg2', name: 'Video Company Profile', type: 'video', url: 'https://example.com/video.mp4', duration: 30, active: true },
  { id: 'sg3', name: 'Menu Baru: Steak', type: 'image', url: 'https://picsum.photos/1920/1080?random=11', duration: 5, active: false },
];

// --- ACCOUNTING MOCKS ---
export const MOCK_ACCOUNTS: ChartOfAccount[] = [
    // 1. ASSETS (HARTA)
    { id: 'acc_cash', code: '1-1001', name: 'Kas Kecil (Petty Cash)', category: 'ASSET', subcategory: 'Lancar', isSystem: true, balance: 5000000 },
    { id: 'acc_bank_bca', code: '1-1002', name: 'Bank BCA', category: 'ASSET', subcategory: 'Lancar', isSystem: false, balance: 150000000 },
    { id: 'acc_ar', code: '1-1003', name: 'Piutang Usaha (AR)', category: 'ASSET', subcategory: 'Lancar', isSystem: true, balance: 2500000 },
    { id: 'acc_inventory', code: '1-1004', name: 'Persediaan Barang', category: 'ASSET', subcategory: 'Lancar', isSystem: true, balance: 45000000 },
    { id: 'acc_fixed_equip', code: '1-2001', name: 'Peralatan & Mesin', category: 'ASSET', subcategory: 'Tetap', isSystem: false, balance: 75000000 },
    
    // 2. LIABILITIES (KEWAJIBAN)
    { id: 'acc_ap', code: '2-1001', name: 'Hutang Usaha (AP)', category: 'LIABILITY', subcategory: 'Jangka Pendek', isSystem: true, balance: 12000000 },
    { id: 'acc_tax_payable', code: '2-1002', name: 'Hutang Pajak', category: 'LIABILITY', subcategory: 'Jangka Pendek', isSystem: true, balance: 1500000 },
    
    // 3. EQUITY (MODAL)
    { id: 'acc_capital', code: '3-1001', name: 'Modal Disetor', category: 'EQUITY', isSystem: true, balance: 200000000 },
    { id: 'acc_re', code: '3-1002', name: 'Laba Ditahan', category: 'EQUITY', isSystem: true, balance: 50000000 },
    
    // 4. REVENUE (PENDAPATAN)
    { id: 'acc_sales_food', code: '4-1001', name: 'Penjualan Makanan', category: 'REVENUE', isSystem: true, balance: 0 },
    { id: 'acc_sales_bev', code: '4-1002', name: 'Penjualan Minuman', category: 'REVENUE', isSystem: true, balance: 0 },
    { id: 'acc_sales_other', code: '4-1003', name: 'Pendapatan Lain-lain', category: 'REVENUE', isSystem: false, balance: 0 },
    
    // 5. EXPENSES (BEBAN)
    { id: 'acc_cogs', code: '5-1001', name: 'HPP (Cost of Goods Sold)', category: 'EXPENSE', isSystem: true, balance: 0 },
    { id: 'acc_exp_salary', code: '6-1001', name: 'Beban Gaji', category: 'EXPENSE', isSystem: false, balance: 0 },
    { id: 'acc_exp_rent', code: '6-1002', name: 'Beban Sewa', category: 'EXPENSE', isSystem: false, balance: 0 },
    { id: 'acc_exp_marketing', code: '6-1003', name: 'Beban Iklan & Promosi', category: 'EXPENSE', isSystem: false, balance: 0 },
    { id: 'acc_exp_utility', code: '6-1004', name: 'Listrik, Air & Internet', category: 'EXPENSE', isSystem: false, balance: 0 },
    { id: 'acc_exp_maintenance', code: '6-1005', name: 'Perbaikan & Pemeliharaan', category: 'EXPENSE', isSystem: false, balance: 0 },
    { id: 'acc_exp_admin', code: '6-1006', name: 'Beban Umum & Admin', category: 'EXPENSE', isSystem: false, balance: 0 },
];

export const MOCK_BUDGETS: BudgetPlan[] = [
    { id: 'bg1', accountId: 'acc_exp_marketing', accountName: 'Beban Iklan & Promosi', limit: 5000000, spent: 1200000, period: 'Monthly' },
    { id: 'bg2', accountId: 'acc_exp_utility', accountName: 'Listrik, Air & Internet', limit: 3000000, spent: 2500000, period: 'Monthly' },
    { id: 'bg3', accountId: 'acc_exp_salary', accountName: 'Beban Gaji', limit: 40000000, spent: 38000000, period: 'Monthly' },
];

export const MOCK_VACANCIES: JobVacancy[] = [
    { 
        id: 'vac1', 
        title: 'Senior Barista', 
        department: 'Front of House', 
        type: 'Full-time', 
        salaryRange: '3.5jt - 4.5jt', 
        status: 'Published', 
        description: 'Mencari barista berpengalaman minimal 2 tahun, menguasai manual brew dan latte art.',
        applicantsCount: 12,
        postedChannels: ['Instagram', 'Website'],
        publishDate: '2024-05-10'
    },
    { 
        id: 'vac2', 
        title: 'Kitchen Helper', 
        department: 'Back of House', 
        type: 'Part-time', 
        salaryRange: '2.5jt - 3jt', 
        status: 'Draft', 
        description: 'Membantu persiapan bahan makanan dan menjaga kebersihan dapur.',
        applicantsCount: 0,
        postedChannels: []
    }
];
