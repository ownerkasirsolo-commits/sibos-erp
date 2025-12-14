
import { useState, useEffect } from 'react';
// @FIX: Product-related types moved to features/products/types.ts
import { UnitType, BusinessType, Shift, Order } from '../types';
// @FIX: 'CustomerDetail' type has been moved to its own feature module.
import { CustomerDetail } from '../features/crm/types';
import { Product, CartItem } from '../features/products/types';
import { useGlobalContext } from '../context/GlobalContext';
import { printReceipt } from '../utils/printService';
import { formatCurrencyInput } from '../utils/formatters';

export const usePOSLogic = (businessType: BusinessType) => {
  const { products, customers, transactions, processTransaction, currentUser, businessConfig, activeOutlet } = useGlobalContext();

  // --- STATE: CART & PRODUCT ---
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterQuery, setFilterQuery] = useState('');
  const [orderType, setOrderType] = useState<'dine-in' | 'take-away'>('dine-in');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // --- STATE: SESSION & CONTEXT ---
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>('');
  
  // --- STATE: LOCAL STORAGE PENDING ---
  const [localPendingOrders, setLocalPendingOrders] = useState<{id: string, items: CartItem[], customer: CustomerDetail | null, table: string, time: Date}[]>([]);

  // --- STATE: INPUT & NUMPAD ---
  const [numpadValue, setNumpadValue] = useState('');
  const [inputMode, setInputMode] = useState<'money' | 'qty' | 'disc'>('money'); 
  const [editingItemId, setEditingItemId] = useState<string | null>(null); 

  // --- STATE: MODALS ---
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(true); 
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false); 
  const [isSplitBillModalOpen, setIsSplitBillModalOpen] = useState(false);
  const [isCashDrawerModalOpen, setIsCashDrawerModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false); 
  const [isPendingListOpen, setIsPendingListOpen] = useState(false); 
  const [isItemOptionModalOpen, setIsItemOptionModalOpen] = useState(false); 
  const [isNotificationOpen, setIsNotificationOpen] = useState(false); 

  // --- STATE: FORMS ---
  const [startCashInput, setStartCashInput] = useState('');

  // --- MOCK NOTIFICATIONS ---
  const [notifications, setNotifications] = useState([
      { id: 1, type: 'delivery', platform: 'GoFood', orderId: 'GF-8821', items: '2x Nasi Goreng', total: 70000, time: 'Baru saja' },
      { id: 2, type: 'system', message: 'Stok Beras Menipis', time: '5 menit lalu' }
  ]);

  // --- EFFECTS ---
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // --- DERIVED DATA ---
  const filteredProducts = products.filter(p => {
    const matchType = p.businessType === businessType;
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(filterQuery.toLowerCase()) || p.sku?.toLowerCase().includes(filterQuery.toLowerCase());
    return matchType && matchCat && matchSearch;
  });

  const categories = ['All', ...Array.from(new Set(products.filter(p => p.businessType === businessType).map(p => p.category)))];

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.11;
  const total = Math.ceil(subtotal + tax);
  
  const cashReceived = numpadValue ? parseFloat(numpadValue) : 0;
  const change = cashReceived > total ? cashReceived - total : 0;

  // Smart Money Suggestions
  const getMoneySuggestions = (amount: number) => {
    if (amount <= 0) return [];
    const suggestions = [];
    if (amount < 10000) suggestions.push(10000);
    if (amount < 20000) suggestions.push(20000);
    if (amount < 50000) suggestions.push(50000);
    if (amount < 100000) suggestions.push(100000);
    
    // Add exact + next round
    const nextTen = Math.ceil(amount / 10000) * 10000;
    if (!suggestions.includes(nextTen) && nextTen !== amount) suggestions.push(nextTen);
    
    const nextFifty = Math.ceil(amount / 50000) * 50000;
    if (!suggestions.includes(nextFifty) && nextFifty !== nextTen) suggestions.push(nextFifty);

    return suggestions.sort((a,b) => a-b).slice(0, 4);
  };
  const moneySuggestions = getMoneySuggestions(total);

  // Numpad Handling
  const handleNumpadInput = (key: string) => {
    if (key === 'C') {
        setNumpadValue('');
        setInputMode('money');
    } else if (key === 'Backspace') {
        setNumpadValue(prev => prev.slice(0, -1));
    } else if (key === '.') {
        if (!numpadValue.includes('.')) {
             setNumpadValue(prev => prev + '.');
        }
    } else {
        setNumpadValue(prev => {
            if (prev.length > 12) return prev; 
            return prev + key;
        });
    }
  };

  const toggleOrderType = () => {
      setOrderType(prev => prev === 'dine-in' ? 'take-away' : 'dine-in');
  };

  // --- SAFETY ACTIONS ---
  const handleClearCart = () => {
      if (cart.length === 0) return;
      if (window.confirm("Hapus semua item?")) {
          setCart([]);
          setNumpadValue('');
          setInputMode('money');
      }
  };

  // --- WHOLESALE PRICE LOGIC ---
  const calculateItemPrice = (product: Product, quantity: number): number => {
      if (businessType !== BusinessType.RETAIL || !product.wholesalePrices || product.wholesalePrices.length === 0) {
          return product.price; 
      }
      const sortedTiers = [...product.wholesalePrices].sort((a, b) => b.minQty - a.minQty);
      const tier = sortedTiers.find(t => quantity >= t.minQty);
      return tier ? tier.price : product.price;
  }

  // --- ACTIONS: DELIVERY ---
  const handleAcceptDelivery = (notifId: number) => {
      const notif = notifications.find(n => n.id === notifId);
      if (!notif) return;

      const newOrder: Order = {
          id: `ORD-${Date.now().toString().slice(-6)}`,
          items: [
              { 
                id: 'c1', 
                name: 'Nasi Goreng Spesial', 
                price: 35000, 
                quantity: 2, 
                unit: UnitType.PORTION, 
                businessType: BusinessType.CULINARY,
                category: 'Makanan Berat'
              }
          ], 
          total: notif.total || 0,
          status: 'paid', 
          paymentStatus: 'paid',
          type: 'delivery',
          timestamp: new Date().toISOString(),
          customerName: `${notif.platform} - ${notif.orderId}`,
          paymentMethod: 'online',
          staffName: currentShift?.staffName, 
          staffId: currentShift?.staffId,
          outletId: activeOutlet?.id
      };

      processTransaction(newOrder);
      setNotifications(prev => prev.filter(n => n.id !== notifId));
      alert(`Order ${notif.orderId} diterima!`);
  };

  // --- ACTIONS: CART ---
  const addToCart = (product: Product) => {
    let quantityToAdd = 1;
    if (numpadValue && parseFloat(numpadValue) > 0) {
        quantityToAdd = parseFloat(numpadValue);
        setNumpadValue('');
        setInputMode('money'); 
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      let newQty = quantityToAdd;
      
      if (existing) {
        newQty = existing.quantity + quantityToAdd;
        const newPrice = calculateItemPrice(product, newQty);
        return prev.map(item => item.id === product.id ? { ...item, quantity: newQty, price: newPrice, appliedWholesale: newPrice < product.price } : item);
      }
      
      const finalPrice = calculateItemPrice(product, newQty);
      return [...prev, { ...product, quantity: newQty, price: finalPrice, appliedWholesale: finalPrice < product.price }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
         let actualDelta = delta;
         if (Math.abs(delta) === 1 && (item.unit === UnitType.KG || item.unit === UnitType.LITER || item.unit === UnitType.METER)) {
             actualDelta = delta * 0.1;
         }
        const newQty = parseFloat((item.quantity + actualDelta).toFixed(2)); 
        if (newQty <= 0) return item;

        const originalProduct = products.find(p => p.id === id);
        let newPrice = item.price;
        let appliedWholesale = false;

        if (originalProduct) {
            newPrice = calculateItemPrice(originalProduct, newQty);
            appliedWholesale = newPrice < originalProduct.price;
        }

        return { ...item, quantity: newQty, price: newPrice, appliedWholesale };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleItemClick = (item: CartItem) => {
      setEditingItemId(item.id);
      setIsItemOptionModalOpen(true);
      setNumpadValue('');
      setInputMode('qty');
  }

  // --- ACTIONS: PENDING ---
  const handlePendingAction = () => {
      if (cart.length > 0) {
          const newPending = {
              id: `PEND-${Date.now()}`,
              items: [...cart],
              customer: selectedCustomer,
              table: selectedTable,
              time: new Date()
          };
          setLocalPendingOrders(prev => [...prev, newPending]);
          setCart([]);
          setSelectedCustomer(null);
          setSelectedTable('');
          setNumpadValue('');
          alert("Disimpan ke Pending List!");
      } 
      else {
          setIsPendingListOpen(true);
      }
  };

  // --- ACTIONS: CHECKOUT ---
  const handleCheckout = (method: string) => {
    if (!currentShift) { alert("Buka shift dulu!"); return; }
    if (cart.length === 0) { alert("Keranjang kosong!"); return; }

    if (method === 'debt' && !selectedCustomer) {
        alert("Pilih member dulu!");
        return;
    }

    if (method === 'cash') {
        const cashGiven = numpadValue ? parseFloat(numpadValue) : 0;
        if (cashGiven < total && cashGiven !== 0) {
            alert("Uang kurang!");
            return;
        }
    }

    const newOrder: Order = {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        items: cart,
        total: total,
        status: 'paid', 
        paymentStatus: method === 'debt' ? 'unpaid' : 'paid',
        type: orderType === 'take-away' ? 'take-away' : 'dine-in',
        tableNumber: orderType === 'dine-in' ? selectedTable : undefined,
        timestamp: new Date().toISOString(),
        customerName: selectedCustomer ? selectedCustomer.name : (orderType === 'dine-in' && selectedTable ? `Meja ${selectedTable}` : 'Walk-in'),
        customerId: selectedCustomer?.id,
        paymentMethod: method,
        staffName: currentShift.staffName, 
        staffId: currentShift.staffId,      
        outletId: activeOutlet?.id 
    };

    processTransaction(newOrder);

    if (window.confirm("Cetak Struk?")) {
        if(businessConfig) printReceipt(newOrder, businessConfig);
    }

    setTimeout(() => {
        if (method === 'cash') {
             setCurrentShift({ ...currentShift, totalSalesCash: currentShift.totalSalesCash + total });
        } else if (method !== 'debt') {
             setCurrentShift({ ...currentShift, totalSalesNonCash: currentShift.totalSalesNonCash + total });
        }
        
        setCart([]);
        setNumpadValue('');
        setSelectedTable('');
        setSelectedCustomer(null);
        setIsPaymentMethodModalOpen(false);
    }, 300);
  };

  // --- ACTION: OPEN SHIFT ---
  const openShift = () => {
      if (!startCashInput) { alert("Isi modal awal!"); return; }
      if (!currentUser) { alert("Sesi habis."); return; }
      const newShift: Shift = {
          id: `SHIFT-${Date.now()}`,
          outletId: activeOutlet?.id || '',
          staffName: currentUser.name,
          staffId: currentUser.id,
          startTime: new Date(),
          startCash: parseInt(startCashInput.replace(/\./g, '')),
          totalSalesCash: 0,
          totalSalesNonCash: 0,
          transactions: [],
          status: 'open'
      };
      setCurrentShift(newShift);
      setIsShiftModalOpen(false);
  }

  return {
    // State & Setters
    cart, setCart,
    selectedCategory, setSelectedCategory,
    filterQuery, setFilterQuery,
    orderType, 
    isOnline,
    currentShift, setCurrentShift,
    selectedCustomer, setSelectedCustomer,
    selectedTable, setSelectedTable,
    localPendingOrders, 
    numpadValue, setNumpadValue,
    inputMode, 
    editingItemId, 
    
    // Modals
    isShiftModalOpen, setIsShiftModalOpen,
    isMemberModalOpen, setIsMemberModalOpen,
    isPaymentMethodModalOpen, setIsPaymentMethodModalOpen,
    isSplitBillModalOpen, setIsSplitBillModalOpen,
    isCashDrawerModalOpen, setIsCashDrawerModalOpen,
    isHistoryModalOpen, setIsHistoryModalOpen,
    isPendingListOpen, setIsPendingListOpen,
    isItemOptionModalOpen, setIsItemOptionModalOpen,
    isNotificationOpen, setIsNotificationOpen, toggleNotification: () => setIsNotificationOpen(prev => !prev),

    startCashInput, setStartCashInput,
    notifications,

    // Derived
    filteredProducts,
    categories,
    subtotal,
    tax,
    total,
    cashReceived,
    change,
    moneySuggestions,

    // Actions
    handleNumpadInput,
    toggleOrderType,
    handleClearCart,
    handleAcceptDelivery,
    addToCart,
    updateQuantity,
    handleItemClick,
    handlePendingAction,
    handleCheckout,
    openShift,
    
    // Context Data
    transactions,
    currentUser,
    activeOutlet,
    businessConfig
  };
};