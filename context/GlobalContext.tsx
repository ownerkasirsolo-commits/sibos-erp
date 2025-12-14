
import React, { createContext, useContext, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

// Import Types
import { Order, BusinessType, BusinessEntity, Outlet } from '../types';
import { CustomerDetail } from '../features/crm/types';
import { Product, CartItem, Promotion } from '../features/products/types';
import { Ingredient, PurchaseOrder, PurchaseOrderItem, Supplier, StockTransfer, StockTransferItem, StockAdjustment, InventoryHistoryItem, BusinessConfig } from '../features/irm/types';
import { CashTransaction } from '../features/accounting/types';
import { Employee, Attendance, JobVacancy, Payroll } from '../features/hrm/types'; 
import { Reservation } from '../features/reservations/types';
import { QueueItem } from '../features/queue/types';
import { SignageContent } from '../features/signage/types';
import { BlogPost, GalleryItem } from '../features/website/types'; 
import { MarketingPost } from '../features/marketing/types'; 
import { WalletBalance, WalletTransaction } from '../features/wallet/types';

// Import Atomic Slices
import { useAuthSlice } from './slices/useAuthSlice';
import { useProductSlice } from './slices/useProductSlice';
import { useWalletSlice } from './slices/useWalletSlice';
import { convertUnit } from '../utils/unitConversion';

// --- Types ---
interface GlobalContextType {
  // Data (Aggregated from Slices)
  currentUser: Employee | null;
  isLoadingContext: boolean; // NEW: Global Loading State
  products: Product[];
  ingredients: Ingredient[];
  customers: CustomerDetail[];
  transactions: Order[];
  purchaseOrders: PurchaseOrder[];
  suppliers: Supplier[];
  stockTransfers: StockTransfer[];
  cashFlow: CashTransaction[];
  employees: Employee[];
  stockAdjustments: StockAdjustment[];
  attendance: Attendance[];
  reservations: Reservation[];
  queue: QueueItem[];
  signage: SignageContent[];
  promotions: Promotion[];
  vacancies: JobVacancy[];
  articles: BlogPost[]; 
  gallery: GalleryItem[]; 
  marketingPosts: MarketingPost[]; 
  payrolls: Payroll[]; 
  businessConfig: BusinessConfig | null;

  // Wallet Data
  walletBalance: WalletBalance;
  walletTransactions: WalletTransaction[];

  // Multi-Business & Outlet State
  availableBusinesses: BusinessEntity[];
  activeBusinessId: string | null | undefined;
  activeOutletId: string | null | undefined;
  activeBusiness: BusinessEntity | undefined;
  activeOutlet: Outlet | undefined;
  switchOutlet: (businessId: string | null, outletId: string | null) => Promise<void>;

  // Auth Actions
  login: (employeeId: string, pin: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setBusinessInfo: (name: string, type: BusinessType) => Promise<void>;

  // Wallet Actions
  processWalletPayment: (amount: number, description: string, category: WalletTransaction['category']) => Promise<boolean>;
  topUpWallet: (amount: number, method: string) => Promise<void>;

  // Async Operational Actions
  processTransaction: (order: Order) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  updateIngredient: (ingredient: Ingredient) => Promise<void>;
  addIngredient: (ingredient: Ingredient) => Promise<void>;
  addCustomer: (customer: CustomerDetail) => Promise<void>;
  addSupplier: (supplier: Supplier) => Promise<void>;
  addPromotion: (promo: Promotion) => Promise<void>;
  togglePromotion: (id: string) => Promise<void>;
  deletePromotion: (id: string) => Promise<void>;
  createPurchaseOrder: (po: PurchaseOrder) => Promise<void>;
  updatePurchaseOrder: (po: PurchaseOrder) => Promise<void>;
  receivePurchaseOrder: (poId: string, receivedItems: PurchaseOrderItem[], paymentInfo: { method: 'cash' | 'transfer' | 'tempo', dueDate?: string, bankDetails?: string }) => Promise<void>;
  updateReservationStatus: (id: string, status: Reservation['status']) => Promise<void>;
  updateQueueStatus: (id: string, status: QueueItem['status']) => Promise<void>;
  updateSignageContent: (id: string, changes: Partial<SignageContent>) => Promise<void>;
  addQueueItem: (item: Omit<QueueItem, 'id'>) => Promise<void>;

  // Sub-Recipe / Production
  produceIngredient: (ingredientId: string, quantity: number) => Promise<void>;

  // Distribution Actions
  createStockTransfer: (transfer: StockTransfer) => Promise<void>;
  shipStockTransfer: (transferId: string, shippedItems: StockTransferItem[], driverInfo?: { driver: string, plate: string }) => Promise<void>;
  receiveStockTransfer: (transferId: string, receivedItems: StockTransferItem[]) => Promise<void>;

  // Inventory Tools
  adjustStock: (ingredientId: string, realQty: number, reason: StockAdjustment['reason'], note?: string) => Promise<void>;
  getIngredientHistory: (ingredientId: string) => Promise<InventoryHistoryItem[]>;
  getLastSupplierPrice: (supplierId: string, ingredientId: string) => Promise<number | null>;

  // HRM Actions
  clockIn: (employeeId: string) => Promise<void>;
  clockOut: (employeeId: string) => Promise<void>;
  addVacancy: (vacancy: JobVacancy) => Promise<void>;
  processPayroll: (payroll: Payroll, method: 'cash' | 'transfer') => Promise<void>;

  // Website Actions
  addArticle: (article: BlogPost) => Promise<void>;
  addGalleryItem: (item: GalleryItem) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  deleteGalleryItem: (id: string) => Promise<void>;
  
  // Marketing Actions
  addMarketingPost: (post: MarketingPost) => Promise<void>;
  updateMarketingPost: (post: MarketingPost) => Promise<void>;
  deleteMarketingPost: (id: string) => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
};

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. ATOMIC SLICES - Load specialized logic
  const authSlice = useAuthSlice();
  const walletSlice = useWalletSlice();
  const productSlice = useProductSlice(authSlice.targetOutletIds, authSlice.currentUser, authSlice.activeOutletId);

  // 2. REMAINING GLOBAL QUERIES (To be atomized later)
  const transactions = useLiveQuery(() => db.transactions.where('outletId').anyOf(authSlice.targetOutletIds).toArray(), [authSlice.targetOutletIds]) || [];
  const cashFlow = useLiveQuery(() => db.cashFlow.where('outletId').anyOf(authSlice.targetOutletIds).toArray(), [authSlice.targetOutletIds]) || [];
  const attendance = useLiveQuery(() => db.attendance.where('outletId').anyOf(authSlice.targetOutletIds).toArray(), [authSlice.targetOutletIds]) || [];
  
  const customers = useLiveQuery(() => db.customers.toArray(), []) || [];
  const reservations = useLiveQuery(() => db.reservations.toArray(), []) || [];
  const queue = useLiveQuery(() => db.queue.toArray(), []) || [];
  const signage = useLiveQuery(() => db.signage.toArray(), []) || [];
  const vacancies = useLiveQuery(() => db.vacancies.toArray(), []) || [];
  const articles = useLiveQuery(() => db.articles.toArray(), []) || []; 
  const gallery = useLiveQuery(() => db.gallery.toArray(), []) || [];
  const marketingPosts = useLiveQuery(() => db.marketingPosts.toArray(), []) || []; 
  const payrolls = useLiveQuery(() => db.payrolls.toArray(), []) || []; 

  // --- FILTERED EMPLOYEES ---
  const employees = useMemo(() => authSlice.allEmployees.filter(e => authSlice.targetOutletIds.includes(e.outletId) || e.role === 'Owner'), [authSlice.allEmployees, authSlice.targetOutletIds]);


  // --- REMAINING ACTIONS (That bridge multiple domains) ---
  
  // THE GOLDEN TRIANGLE INTEGRATION (POS -> IRM -> ACCOUNTING)
  const processTransaction = async (order: Order) => {
      try {
        await db['transaction']('rw', db.transactions, db.products, db.ingredients, db.cashFlow, db.accounts, async () => {
            // 1. Save Transaction History
            await db.transactions.add(order);

            // 2. IRM INTEGRATION: Deduct Inventory
            for (const item of order.items) {
                if (item.businessType === BusinessType.CULINARY && item.hasRecipe && item.recipe) {
                    for (const recipeItem of item.recipe) {
                        const ingredient = await db.ingredients.get(recipeItem.ingredientId);
                        if (ingredient) {
                            const qtyUsed = convertUnit(recipeItem.quantity, recipeItem.unit, ingredient.unit) * item.quantity;
                            const newStock = ingredient.stock - qtyUsed;
                            await db.ingredients.update(ingredient.id, { 
                                stock: newStock,
                                lastUpdated: new Date().toISOString()
                            });
                        }
                    }
                }
                else if (item.businessType === BusinessType.RETAIL || !item.hasRecipe) {
                     const product = await db.products.get(item.id);
                     if (product && product.stock !== undefined) {
                         const newStock = product.stock - item.quantity;
                         await db.products.update(product.id, { stock: newStock });
                     }
                }
            }

            // 3. ACCOUNTING INTEGRATION: Record Revenue
            if (order.paymentStatus === 'paid') {
                const targetAccountId = order.paymentMethod === 'cash' ? 'acc_cash' : 'acc_bank_bca';
                const accountName = order.paymentMethod === 'cash' ? 'Kas Kecil' : 'Bank BCA';
                const revenueAccountId = 'acc_sales_food'; // Default revenue account for now
                
                const cashEntry: CashTransaction = {
                    id: `CF-INC-${Date.now()}`,
                    outletId: order.outletId || authSlice.activeOutletId || 'unknown',
                    type: 'in',
                    amount: order.total,
                    category: 'sales',
                    timestamp: new Date().toISOString(),
                    note: `Penjualan #${order.id.slice(-6)}`,
                    staffName: order.staffName || 'System',
                    refId: order.id,
                    accountId: targetAccountId,
                    accountName: accountName,
                    debitAccountId: targetAccountId,
                    creditAccountId: revenueAccountId
                };
                await db.cashFlow.add(cashEntry);

                const account = await db.accounts.get(targetAccountId);
                if (account) {
                    await db.accounts.update(targetAccountId, { balance: account.balance + order.total });
                }
                
                const revAccount = await db.accounts.get(revenueAccountId);
                if (revAccount) {
                    await db.accounts.update(revenueAccountId, { balance: revAccount.balance + order.total });
                }
            }
        });
        console.log("Transaction Processed: POS -> IRM -> Accounting Synced.");
      } catch (error) {
          console.error("Transaction Processing Error:", error);
          alert("Gagal memproses transaksi. Cek log console.");
      }
  };

  // --- HRM PAYROLL INTEGRATION ---
  const processPayroll = async (payroll: Payroll, method: 'cash' | 'transfer') => {
    try {
        await db['transaction']('rw', db.payrolls, db.cashFlow, db.accounts, async () => {
             // 1. Save Payroll Record as PAID
             await db.payrolls.put({ ...payroll, status: 'paid' });

             // 2. Determine Source Account
             const accountId = method === 'cash' ? 'acc_cash' : 'acc_bank_bca';
             const accountName = method === 'cash' ? 'Kas Kecil' : 'Bank BCA';
             const expenseAccId = 'acc_exp_salary';

             // 3. Create Cash Flow Expense
             const cashEntry: CashTransaction = {
                 id: `CF-EXP-PAY-${payroll.id}`,
                 outletId: authSlice.activeOutletId || 'unknown',
                 type: 'out',
                 amount: payroll.netSalary,
                 category: 'salary',
                 timestamp: new Date().toISOString(),
                 note: `Gaji Periode ${payroll.period}`,
                 staffName: authSlice.currentUser?.name || 'HR Admin',
                 refId: payroll.id,
                 accountId: accountId,
                 accountName: accountName,
                 debitAccountId: expenseAccId,
                 creditAccountId: accountId
             };
             await db.cashFlow.add(cashEntry);

             // 4. Update Account Balance
             const account = await db.accounts.get(accountId);
             if (account) {
                 await db.accounts.update(accountId, { balance: account.balance - payroll.netSalary });
             }

             // 5. Update Expense Account (Beban Gaji)
             const expAccount = await db.accounts.get(expenseAccId);
             if(expAccount) {
                 await db.accounts.update(expenseAccId, { balance: expAccount.balance + payroll.netSalary });
             }
        });
        console.log("Payroll Processed: HRM -> Accounting Synced");
    } catch (error) {
        console.error("Payroll Error:", error);
        throw error;
    }
  };

  // --- SIMPLE CRUD WRAPPERS ---
  const addCustomer = async (customer: CustomerDetail) => { await db.customers.add(customer); };
  const addVacancy = async (vacancy: JobVacancy) => { await db.vacancies.add(vacancy); };
  const addArticle = async (article: BlogPost) => { await db.articles.add(article); };
  const addGalleryItem = async (item: GalleryItem) => { await db.gallery.add(item); };
  const deleteArticle = async (id: string) => { await db.articles.delete(id); };
  const deleteGalleryItem = async (id: string) => { await db.gallery.delete(id); };
  const addMarketingPost = async (post: MarketingPost) => { await db.marketingPosts.add(post); };
  const updateMarketingPost = async (post: MarketingPost) => { await db.marketingPosts.put(post); };
  const deleteMarketingPost = async (id: string) => { await db.marketingPosts.delete(id); };
  const updateReservationStatus = async (id: string, status: Reservation['status']) => { await db.reservations.update(id, { status }); };
  const updateQueueStatus = async (id: string, status: QueueItem['status']) => { await db.queue.update(id, { status }); };
  const addQueueItem = async (item: Omit<QueueItem, 'id'>) => { await db.queue.add({ ...item, id: `Q-${Date.now()}` }); };
  const updateSignageContent = async (id: string, changes: Partial<SignageContent>) => { await db.signage.update(id, changes); };
  const clockIn = async (employeeId: string) => { await db.attendance.add({ id: `ATT-${Date.now()}`, employeeId, outletId: authSlice.activeOutletId || '', clockIn: new Date().toISOString(), status: 'Present' }); };
  const clockOut = async (employeeId: string) => { /* ... */ };
  const updateOrderStatus = async (orderId: string, status: Order['status']) => { await db.transactions.update(orderId, { status }); };


  // --- ASSEMBLY ---
  const memoizedValue = useMemo(() => ({
    // Auth & Config
    ...authSlice,
    
    // Core Data
    transactions,
    cashFlow,
    employees,
    attendance,
    customers,
    reservations,
    queue,
    signage,
    vacancies,
    articles,
    gallery,
    marketingPosts,
    payrolls,
    
    // Sub-Slices
    ...productSlice,
    ...walletSlice,
    
    // Bridge Actions
    processTransaction,
    processPayroll,
    
    // CRUD
    addCustomer,
    addVacancy,
    addArticle,
    addGalleryItem,
    deleteArticle,
    deleteGalleryItem,
    addMarketingPost,
    updateMarketingPost,
    deleteMarketingPost,
    updateReservationStatus,
    updateQueueStatus,
    addQueueItem,
    updateSignageContent,
    clockIn,
    clockOut,
    updateOrderStatus
  }), [
    authSlice, walletSlice, productSlice,
    transactions, cashFlow, employees, attendance, customers, reservations, queue, signage, vacancies, articles, gallery, marketingPosts, payrolls
  ]);

  return (
    <GlobalContext.Provider value={memoizedValue}>
      {children}
    </GlobalContext.Provider>
  );
};
