
import Dexie, { Table } from 'dexie';
import { 
    Order, 
    BusinessEntity
} from '../types';
import { CustomerDetail } from '../features/crm/types';
import { Employee, Attendance, JobVacancy, Payroll } from '../features/hrm/types';
import { Product, Promotion } from '../features/products/types';
import { Reservation } from '../features/reservations/types';
import { QueueItem } from '../features/queue/types';
import { 
    Ingredient, Supplier, PurchaseOrder, 
    StockTransfer, 
    StockAdjustment, BusinessConfig, PurchaseRequest
} from '../features/irm/types';
import { CashTransaction, ChartOfAccount, BudgetPlan } from '../features/accounting/types';
import { SignageContent } from '../features/signage/types';
import { B2BRequest } from '../features/b2b/types';
import { BlogPost, GalleryItem } from '../features/website/types'; 
import { MarketingPost } from '../features/marketing/types'; 
import { 
    MOCK_PRODUCTS, MOCK_INGREDIENTS, MOCK_CUSTOMERS, 
    MOCK_PURCHASE_ORDERS, MOCK_EMPLOYEES, MOCK_SUPPLIERS, MOCK_BUSINESSES,
    MOCK_RESERVATIONS, MOCK_QUEUE, MOCK_SIGNAGE,
    MOCK_STOCK_TRANSFERS, MOCK_ACCOUNTS, MOCK_BUDGETS, MOCK_ATTENDANCE, MOCK_VACANCIES,
    MOCK_TRANSACTIONS // Imported
} from '../features/accounting/constants';

class SibosDatabase extends Dexie {
    products!: Table<Product, string>;
    ingredients!: Table<Ingredient, string>;
    customers!: Table<CustomerDetail, string>;
    transactions!: Table<Order, string>;
    purchaseOrders!: Table<PurchaseOrder, string>;
    purchaseRequests!: Table<PurchaseRequest, string>;
    employees!: Table<Employee, string>;
    suppliers!: Table<Supplier, string>;
    stockTransfers!: Table<StockTransfer, string>;
    cashFlow!: Table<CashTransaction, string>;
    accounts!: Table<ChartOfAccount, string>; 
    budgets!: Table<BudgetPlan, string>; 
    businessEntities!: Table<BusinessEntity, string>;
    stockAdjustments!: Table<StockAdjustment, string>;
    attendance!: Table<Attendance, string>;
    reservations!: Table<Reservation, string>;
    queue!: Table<QueueItem, string>;
    signage!: Table<SignageContent, string>;
    promotions!: Table<Promotion, string>; 
    b2bRequests!: Table<B2BRequest, string>;
    vacancies!: Table<JobVacancy, string>;
    articles!: Table<BlogPost, string>;
    gallery!: Table<GalleryItem, string>;
    marketingPosts!: Table<MarketingPost, string>; 
    payrolls!: Table<Payroll, string>; // NEW TABLE
    config!: Table<{ key: string, value: any }, string>;

    constructor() {
        super('sibosDB');
        this['version'](11).stores({ // Bump version to 11
            products: 'id, name, category, sku, businessType',
            ingredients: 'id, outletId, name, sku, category',
            customers: 'id, name, phone, tier',
            transactions: 'id, outletId, status, timestamp, customerId, staffId',
            purchaseOrders: 'id, outletId, supplierId, status, orderDate',
            purchaseRequests: 'id, outletId, status, requestDate', 
            employees: 'id, outletId, name, role',
            suppliers: 'id, name, category',
            stockTransfers: 'id, sourceOutletId, targetOutletId, status',
            cashFlow: 'id, outletId, type, category, timestamp, accountId',
            accounts: 'id, code, category',
            budgets: 'id, accountId',
            businessEntities: 'id, name, type',
            stockAdjustments: 'id, ingredientId, timestamp, reason',
            attendance: 'id, employeeId, outletId, clockIn',
            reservations: 'id, date, status',
            queue: 'id, status, number',
            signage: 'id, name, type, active',
            promotions: 'id, active', 
            b2bRequests: 'id, targetOutletId, status, type',
            vacancies: 'id, status',
            articles: 'id, status, date',
            gallery: 'id, type',
            marketingPosts: 'id, status, date, type',
            payrolls: 'id, employeeId, period, status', // New Index
            config: 'key',
        });
    }
}

export const db = new SibosDatabase();

// --- SEEDING LOGIC ---
export async function seedDatabase() {
  const seedKey = 'isSeeded_v19_multi_outlet_transactions'; // Updated Key
  const isSeeded = await db.config.get(seedKey); 
  
  if (isSeeded) {
    return;
  }

  console.log('Seeding database with Multi-Outlet Transaction data...');

  try {
    await db['transaction']('rw', db['tables'], async () => {
      // Clear old data
      await db.products.clear();
      await db.ingredients.clear();
      await db.businessEntities.clear();
      await db.suppliers.clear();
      await db.purchaseOrders.clear();
      await db.purchaseRequests.clear(); 
      await db.stockTransfers.clear(); 
      await db.promotions.clear(); 
      await db.employees.clear(); 
      await db.attendance.clear(); 
      await db.customers.clear();
      await db.accounts.clear();
      await db.budgets.clear();
      await db.vacancies.clear();
      await db.articles.clear(); 
      await db.gallery.clear(); 
      await db.marketingPosts.clear();
      await db.payrolls.clear();
      await db.transactions.clear(); // Clear transactions to re-seed properly

      await db.products.bulkAdd(MOCK_PRODUCTS);
      await db.ingredients.bulkAdd(MOCK_INGREDIENTS);
      await db.customers.bulkAdd(MOCK_CUSTOMERS);
      await db.purchaseOrders.bulkAdd(MOCK_PURCHASE_ORDERS);
      await db.employees.bulkAdd(MOCK_EMPLOYEES);
      await db.attendance.bulkAdd(MOCK_ATTENDANCE);
      await db.suppliers.bulkAdd(MOCK_SUPPLIERS);
      await db.businessEntities.bulkAdd(MOCK_BUSINESSES);
      await db.reservations.bulkAdd(MOCK_RESERVATIONS);
      await db.queue.bulkAdd(MOCK_QUEUE.map(q => ({...q, joinTime: new Date(q.joinTime)})));
      await db.signage.bulkAdd(MOCK_SIGNAGE);
      await db.stockTransfers.bulkAdd(MOCK_STOCK_TRANSFERS);
      await db.accounts.bulkAdd(MOCK_ACCOUNTS);
      await db.budgets.bulkAdd(MOCK_BUDGETS);
      await db.vacancies.bulkAdd(MOCK_VACANCIES);
      await db.transactions.bulkAdd(MOCK_TRANSACTIONS); // Add transactions
      
      const defaultBusiness = MOCK_BUSINESSES[0];
      const defaultConfig: BusinessConfig = {
          name: defaultBusiness.name,
          type: defaultBusiness.type,
          currency: 'IDR'
      };
      await db.config.put({ key: 'businessConfig', value: defaultConfig });
      await db.config.put({ key: 'activeBusinessId', value: MOCK_BUSINESSES[0].id });
      await db.config.put({ key: 'activeOutletId', value: MOCK_BUSINESSES[0].outlets[0].id });
      
      await db.config.put({ key: seedKey, value: true });
    });
    console.log('Database seeding successful!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();
