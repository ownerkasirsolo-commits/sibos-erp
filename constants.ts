
import { BusinessType, UnitType, BusinessEntity } from "./types";
import { CustomerDetail } from "./features/crm/types";
import { Ingredient, Supplier, PurchaseOrder, StockTransfer } from "./features/irm/types";
import { Product } from "./features/products/types";
import { Employee, Attendance, JobVacancy } from "./features/hrm/types";
import { Reservation } from "./features/reservations/types";
import { QueueItem } from "./features/queue/types";
import { SignageContent } from "./features/signage/types";
import { ChartOfAccount, BudgetPlan } from "./features/accounting/types";

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

// --- GLOBAL PRODUCT DATABASE (MOCK FOR IMPORT) ---
export const MOCK_GLOBAL_PRODUCTS = [
    { name: 'Aqua Mineral 600ml', category: 'Minuman', unit: UnitType.PCS, sku: '899277001', image: 'https://assets.klikindomaret.com/products/10003531/10003531_2.jpg' },
    { name: 'Aqua Mineral 1500ml', category: 'Minuman', unit: UnitType.PCS, sku: '899277002', image: 'https://assets.klikindomaret.com/products/10003534/10003534_2.jpg' },
    { name: 'Indomie Goreng Spesial', category: 'Makanan Instan', unit: UnitType.PCS, sku: '899886610', image: 'https://assets.klikindomaret.com/products/10000010/10000010_1.jpg' },
    { name: 'Indomie Ayam Bawang', category: 'Makanan Instan', unit: UnitType.PCS, sku: '899886620', image: 'https://assets.klikindomaret.com/products/10000018/10000018_1.jpg' },
    { name: 'Rokok Sampoerna Mild 16', category: 'Rokok', unit: UnitType.PCS, sku: '899123456', image: 'https://assets.klikindomaret.com/products/20000732/20000732_1.jpg' },
    { name: 'Rokok Gudang Garam Filter 12', category: 'Rokok', unit: UnitType.PCS, sku: '899123457', image: 'https://assets.klikindomaret.com/products/20002931/20002931_1.jpg' },
    { name: 'Teh Pucuk Harum 350ml', category: 'Minuman', unit: UnitType.PCS, sku: '899123458', image: 'https://assets.klikindomaret.com/products/20042079/20042079_1.jpg' },
    { name: 'Minyak Goreng Bimoli 2L', category: 'Sembako', unit: UnitType.PCS, sku: '899123459', image: 'https://assets.klikindomaret.com/products/10004523/10004523_1.jpg' },
    { name: 'Gula Pasir Gulaku 1Kg', category: 'Sembako', unit: UnitType.KG, sku: '899123460', image: 'https://assets.klikindomaret.com/products/10036611/10036611_1.jpg' },
];

// --- ACCOUNTING MOCK DATA (SAK COMPLIANT) ---
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

// --- HRM MOCK DATA ---
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

export const MOCK_EMPLOYEES: Employee[] = [
  // Management Level
  { id: 'owner1', name: "Big Boss Owner", role: "Owner", outletId: "101", outletName: "Global Access", status: "Active", joinDate: "01 Jan 2020", salary: "-", pin: '0000' },
  { id: 'emp1', name: "Budi Santoso", role: "Manager", outletId: "101", outletName: "Outlet Utama (Pusat)", status: "Active", joinDate: "12 Jan 2023", salary: "Rp 8.500.000", pin: '1234' },
  
  // Front of House
  { id: 'emp2', name: "Siti Aminah", role: "Kasir", outletId: "101", outletName: "Outlet Utama (Pusat)", status: "Active", joinDate: "15 Mar 2023", salary: "Rp 4.200.000", pin: '1111' },
  { id: 'emp3', name: "Rara Sekar", role: "Barista", outletId: "101", outletName: "Outlet Utama (Pusat)", status: "Active", joinDate: "20 Jun 2023", salary: "Rp 3.800.000", pin: '2323' },
  { id: 'emp4', name: "Susi Susanti", role: "Waitress", outletId: "101", outletName: "Outlet Utama (Pusat)", status: "On Leave", joinDate: "15 Aug 2023", salary: "Rp 3.200.000", pin: '3434' },
  { id: 'emp5', name: "Doni Tata", role: "Waiter", outletId: "101", outletName: "Outlet Utama (Pusat)", status: "Active", joinDate: "01 Sep 2023", salary: "Rp 3.200.000", pin: '5656' },

  // Back of House (Kitchen)
  { id: 'emp6', name: "Junaedi (Chef Juna)", role: "Head Chef", outletId: "101", outletName: "Outlet Utama (Pusat)", status: "Active", joinDate: "10 Feb 2023", salary: "Rp 7.500.000", pin: '5555' },
  { id: 'emp7', name: "Anto Wijaya", role: "Kitchen Staff", outletId: "101", outletName: "Outlet Utama (Pusat)", status: "Active", joinDate: "12 Dec 2023", salary: "Rp 3.500.000", pin: '7777' },
  { id: 'emp8', name: "Bambang Pamungkas", role: "Dishwasher", outletId: "101", outletName: "Outlet Utama (Pusat)", status: "Active", joinDate: "01 Jan 2024", salary: "Rp 2.800.000", pin: '8888' },

  // Operational / Support
  { id: 'emp9', name: "Ujang Suherman", role: "Security", outletId: "101", outletName: "Outlet Utama (Pusat)", status: "Active", joinDate: "01 Jan 2022", salary: "Rp 3.200.000", pin: '9999' },
  { id: 'emp10', name: "Dian Sastro", role: "Admin", outletId: "101", outletName: "Outlet Utama (Pusat)", status: "Active", joinDate: "05 May 2024", salary: "Rp 4.500.000", pin: '1010' },

  // Cabang Sudirman Staff
  { id: 'emp11', name: "Joko Anwar", role: "SPV Outlet", outletId: "102", outletName: "Cabang Sudirman", status: "Active", joinDate: "02 Feb 2024", salary: "Rp 5.500.000", pin: '2222' },
  { id: 'emp12', name: "Clarissa Putri", role: "Kasir", outletId: "102", outletName: "Cabang Sudirman", status: "Active", joinDate: "10 Mar 2024", salary: "Rp 4.200.000", pin: '3333' },
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


// --- IRM MOCK DATA ---
export const MOCK_SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'SIBOS Mart (Grosir)', contact: 'Admin Gudang', phone: '08123456789', category: 'Sembako', isSibosNetwork: true, performanceScore: 98, totalCompletedOrders: 150 },
  { id: 's2', name: 'PT. Fresh Meat Indonesia', contact: 'Bu Susi', phone: '08199988877', category: 'Daging & Ikan', isSibosNetwork: false, performanceScore: 88, totalCompletedOrders: 45 },
  { id: 's3', name: 'Bakery Supplier', contact: 'Pak Roti', phone: '0811223344', category: 'Roti & Kue', isSibosNetwork: false, performanceScore: 92, totalCompletedOrders: 20 },
];

export const MOCK_INGREDIENTS: Ingredient[] = [
  { id: 'i1', outletId: '101', name: 'Biji Kopi House Blend', sku: 'RM-001', category: 'Dry Goods', stock: 25.5, unit: UnitType.KG, minStock: 2, avgCost: 180000, supplierId: 's1', lastUpdated: new Date().toISOString() },
  { id: 'i2', outletId: '101', name: 'Susu Fresh Milk', sku: 'RM-002', category: 'Dairy', stock: 40, unit: UnitType.LITER, minStock: 5, avgCost: 18000, supplierId: 's1', lastUpdated: new Date().toISOString() },
  { id: 'i6', outletId: '101', name: 'Beras Pandan Wangi', sku: 'RM-006', category: 'Dry Goods', stock: 100, unit: UnitType.KG, minStock: 10, avgCost: 13000, supplierId: 's1', lastUpdated: new Date().toISOString() },
  { id: 'i7', outletId: '101', name: 'Telur Ayam', sku: 'RM-007', category: 'Dairy', stock: 200, unit: UnitType.PCS, minStock: 20, avgCost: 2000, supplierId: 's3', lastUpdated: new Date().toISOString() },
  // Burger Ingredients
  { id: 'i_bun', outletId: '101', name: 'Roti Burger Premium', sku: 'RM-BUN', category: 'Bakery', stock: 50, unit: UnitType.PCS, minStock: 10, avgCost: 3500, supplierId: 's3', lastUpdated: new Date().toISOString() },
  { id: 'i_patty', outletId: '101', name: 'Beef Patty 150g', sku: 'RM-PATTY', category: 'Meat', stock: 45, unit: UnitType.PCS, minStock: 10, avgCost: 12000, supplierId: 's2', lastUpdated: new Date().toISOString() },
  { id: 'i_cheese', outletId: '101', name: 'Keju Slice Cheddar', sku: 'RM-CHEESE', category: 'Dairy', stock: 100, unit: UnitType.PCS, minStock: 20, avgCost: 1500, supplierId: 's1', lastUpdated: new Date().toISOString() },
  { id: 'i_lettuce', outletId: '101', name: 'Selada Iceberg', sku: 'RM-VEG01', category: 'Vegetable', stock: 5, unit: UnitType.KG, minStock: 1, avgCost: 25000, supplierId: 's3', lastUpdated: new Date().toISOString() },
];

export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [];
export const MOCK_STOCK_TRANSFERS: StockTransfer[] = [];

// --- PRODUCT CATALOG RESTRUCTURED ---
export const MOCK_PRODUCTS: Product[] = [
  
  // 1. MENU BIASA (Simple Product)
  {
    id: 'c1',
    name: 'Nasi Goreng Spesial',
    sku: 'FD-001',
    price: 35000,
    category: 'Makanan Berat',
    businessType: BusinessType.CULINARY,
    image: 'https://picsum.photos/200/200?random=1',
    unit: UnitType.PORTION,
    hasVariants: false,
    variants: [],
    modifierGroups: [],
    hasRecipe: true,
    recipe: [
        { ingredientId: 'i6', quantity: 0.2, unit: UnitType.KG },
        { ingredientId: 'i7', quantity: 1, unit: UnitType.PCS },
    ],
    description: "Nasi goreng dengan bumbu rahasia SIBOS, lengkap dengan telur mata sapi.",
    cogs: 15000,
    outletAvailability: 'all',
    outletPricing: {}
  },

  // 2. MENU DENGAN VARIAN (Variable Product)
  {
    id: 'c2',
    name: 'Kopi Susu Gula Aren',
    sku: 'BV-001',
    price: 0, // Base price ignored if hasVariants is true
    category: 'Minuman',
    businessType: BusinessType.CULINARY,
    image: 'https://picsum.photos/200/200?random=2',
    unit: UnitType.PCS,
    hasVariants: true,
    variants: [
        { id: 'v1', name: 'Regular (12oz)', price: 18000, sku: 'BV-001-R', combination: ['Regular'], stock: 0, active: true },
        { id: 'v2', name: 'Large (16oz)', price: 24000, sku: 'BV-001-L', combination: ['Large'], stock: 0, active: true }
    ],
    modifierGroups: [],
    hasRecipe: true,
    recipe: [],
    description: "Espresso house blend dengan susu segar dan gula aren asli.",
    cogs: 8000,
    outletAvailability: 'all',
    outletPricing: {}
  },

  // 3. MENU LENGKAP DENGAN RESEP (Ultimate Burger)
  {
    id: 'c4',
    name: 'Ultimate Cheese Burger',
    sku: 'FD-005',
    price: 45000,
    category: 'Western',
    businessType: BusinessType.CULINARY,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60',
    unit: UnitType.PORTION,
    hasVariants: false,
    variants: [],
    modifierGroups: [
         {
            id: 'mg1',
            name: 'Extra Topping',
            required: false,
            selectionType: 'multiple',
            options: [
                { id: 'opt1', name: 'Extra Cheese', price: 5000 },
                { id: 'opt2', name: 'Extra Patty', price: 15000 },
                { id: 'opt3', name: 'Telur', price: 4000 }
            ]
        }
    ],
    hasRecipe: true,
    recipe: [
        { ingredientId: 'i_bun', quantity: 1, unit: UnitType.PCS },
        { ingredientId: 'i_patty', quantity: 1, unit: UnitType.PCS },
        { ingredientId: 'i_cheese', quantity: 1, unit: UnitType.PCS },
        { ingredientId: 'i_lettuce', quantity: 0.02, unit: UnitType.KG }, // 20 gram
    ],
    description: "Burger premium dengan 100% daging sapi asli, keju cheddar meleleh, dan sayuran segar.",
    cogs: 17500, // (3500 + 12000 + 1500 + 500)
    outletAvailability: 'all',
    outletPricing: {}
  },

  // 4. PRODUK RITEL / NON-MENU (Simple Product + Stock + Barcode)
  {
    id: 'r1',
    name: 'Air Mineral Aqua 600ml',
    sku: 'RTL-001',
    barcode: '8991234567890',
    price: 5000,
    category: 'Minuman Kemasan',
    businessType: BusinessType.RETAIL, // Bisa juga CULINARY tapi dijual eceran
    image: 'https://picsum.photos/200/200?random=4',
    unit: UnitType.PCS,
    stock: 48,
    hasVariants: false,
    variants: [],
    modifierGroups: [],
    cogs: 3500,
    outletAvailability: 'all',
    outletPricing: {}
  },
  {
    id: 'r2',
    name: 'Rokok Sampoerna Mild 16',
    sku: 'RTL-002',
    barcode: '8998877665544',
    price: 32000,
    category: 'Rokok',
    businessType: BusinessType.RETAIL,
    image: 'https://picsum.photos/200/200?random=5',
    unit: UnitType.PCS, // Bungkus
    stock: 25,
    hasVariants: false,
    variants: [],
    modifierGroups: [],
    cogs: 29000,
    wholesalePrices: [
        { minQty: 10, price: 31000 } // Harga Slop
    ],
    outletAvailability: 'all',
    outletPricing: {}
  }
];

// --- CRM MOCK DATA (EXPANDED) ---
export const MOCK_CUSTOMERS: CustomerDetail[] = [
  { id: 'cust1', name: 'Budi Santoso', phone: '081234567890', tier: 'Gold', points: 1250, totalSpend: 5400000, joinDate: '10 Jan 2024', lastVisit: '2 Hari lalu', favoriteMenu: 'Kopi Susu Gula Aren' },
  { id: 'cust2', name: 'Siti Aminah', phone: '08199887654321', tier: 'Silver', points: 450, totalSpend: 1200000, joinDate: '15 Feb 2024', lastVisit: '1 Minggu lalu', favoriteMenu: 'Nasi Goreng Spesial' },
  { id: 'cust3', name: 'Joko Anwar', phone: '085678901234', tier: 'Bronze', points: 50, totalSpend: 250000, joinDate: '01 Mar 2024', lastVisit: '1 Bulan lalu', favoriteMenu: 'Es Teh Manis' },
  { id: 'cust4', name: 'Rina Nose', phone: '081223344556', tier: 'Platinum', points: 5600, totalSpend: 15800000, joinDate: '01 Dec 2023', lastVisit: 'Hari ini', favoriteMenu: 'Steak Wagyu' },
  { id: 'cust5', name: 'Dewi Persik', phone: '081776655443', tier: 'Gold', points: 2100, totalSpend: 7500000, joinDate: '20 Nov 2023', lastVisit: '3 Hari lalu', favoriteMenu: 'Ultimate Cheese Burger' },
  { id: 'cust6', name: 'Raffi Ahmad', phone: '081112223334', tier: 'Platinum', points: 15000, totalSpend: 45000000, joinDate: '10 Jan 2023', lastVisit: 'Kemarin', favoriteMenu: 'VVIP Package' },
  { id: 'cust7', name: 'Deddy Corbuzier', phone: '081998877665', tier: 'Silver', points: 800, totalSpend: 1800000, joinDate: '05 Apr 2024', lastVisit: '2 Minggu lalu', favoriteMenu: 'Black Coffee' },
  { id: 'cust8', name: 'Luna Maya', phone: '081234512345', tier: 'Bronze', points: 10, totalSpend: 50000, joinDate: 'Hari ini', lastVisit: 'Hari ini', favoriteMenu: 'Mineral Water' },
  { id: 'cust9', name: 'Andre Taulany', phone: '081334455667', tier: 'Gold', points: 1800, totalSpend: 6200000, joinDate: '14 Feb 2024', lastVisit: '5 Hari lalu', favoriteMenu: 'Sop Buntut' },
];

export const MOCK_RESERVATIONS: Reservation[] = [];
export const MOCK_QUEUE: QueueItem[] = [];
export const MOCK_SIGNAGE: SignageContent[] = [];
