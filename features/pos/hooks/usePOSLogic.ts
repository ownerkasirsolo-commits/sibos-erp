
import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { UnitType, BusinessType, Shift, Order } from '../../../types';
import { CustomerDetail } from '../../crm/types';
import { Product, CartItem, Promotion } from '../../products/types';
import { useGlobalContext } from '../../../context/GlobalContext';
import { db } from '../../../services/db'; 
import { printReceipt } from '../../../utils/printService';
import { convertUnit } from '../../../utils/unitConversion';
import { formatCurrencyInput } from '../../../utils/formatters';

export const usePOSLogic = (businessType: BusinessType) => {
  const { products, transactions, processTransaction, currentUser, businessConfig, activeOutlet, promotions, ingredients, customers } = useGlobalContext();

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

  // --- REALTIME NOTIFICATIONS ---
  const pendingRequests = useLiveQuery(() => 
      activeOutlet 
      ? db.b2bRequests.where({ targetOutletId: activeOutlet.id }).filter(r => r.status === 'pending').toArray()
      : Promise.resolve([]), 
  [activeOutlet]);

  const [notifications, setNotifications] = useState<any[]>([]);
  
  // --- TIME CLOCK FOR SCHEDULING ---
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    // Update 'now' every minute to refresh scheduled menu items
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
      if (!pendingRequests) return;
      const mappedNotifs = pendingRequests.map(req => ({
          id: req.id,
          type: 'delivery',
          platform: 'B2B Network',
          orderId: req.originalPoId,
          items: `${req.items.length} SKU (Total: Rp ${req.totalAmount.toLocaleString()})`,
          total: req.totalAmount,
          time: new Date(req.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          isB2B: true,
          status: req.status
      }));
      setNotifications(mappedNotifs);
  }, [pendingRequests]);

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

  // --- STOCK & YIELD CALCULATION (THE INTEGRATION CORE) ---
  const getProductAvailability = useCallback((product: Product) => {
      // 1. Retail Product / No Recipe -> Use direct stock
      if (product.businessType === BusinessType.RETAIL || !product.hasRecipe) {
          return product.stock || 0;
      }
      
      // 2. Culinary Product -> Calculate Yield based on Recipe
      if (product.recipe && product.recipe.length > 0) {
          let minYield = Infinity;
          let hasIngredients = false;

          for (const item of product.recipe) {
              const ingredient = ingredients.find(i => i.id === item.ingredientId);
              if (ingredient) {
                  hasIngredients = true;
                  const stockInRecipeUnit = convertUnit(ingredient.stock, ingredient.unit, item.unit);
                  
                  if (item.quantity > 0) {
                      const possiblePortions = Math.floor(stockInRecipeUnit / item.quantity);
                      if (possiblePortions < minYield) {
                          minYield = possiblePortions;
                      }
                  }
              } else {
                  // Ingredient missing from DB, assume 0 yield to be safe
                  return 0; 
              }
          }
          return hasIngredients && minYield !== Infinity ? minYield : 0;
      }

      return 0; // Default fallback
  }, [ingredients]);

  // --- FILTERED & PROCESSED PRODUCTS ---
  const filteredProducts = products.map(p => ({
      ...p,
      maxYield: getProductAvailability(p) // Attach real-time stock capability
  })).filter(p => {
    // 1. Basic Filters
    // HYBRID LOGIC: If businessType matches OR if category is 'All', showing everything.
    // However, usually we filter by 'businessType' passed to the hook.
    // For a hybrid store, we might want to relax this, but strictly speaking,
    // POSRetail should ideally show Retail items and POSCulinary show Culinary.
    // If a user is Hybrid, they might want to see both.
    // Current implementation: Shows products matching the POS Mode.
    // TODO: Add toggle in UI to "Show All Products" for hybrid stores if needed.
    
    const matchType = p.businessType === businessType;
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(filterQuery.toLowerCase()) || p.sku?.toLowerCase().includes(filterQuery.toLowerCase());
    
    // 2. Schedule Filter (Dayparting)
    let isScheduledActive = true;
    if (p.availabilitySchedule && p.availabilitySchedule.enabled) {
        const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const currentDayStr = daysMap[now.getDay()];
        const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        // Check Day
        if (!p.availabilitySchedule.days.includes(currentDayStr)) {
            isScheduledActive = false;
        } else {
            // Check Time
            const { timeStart, timeEnd } = p.availabilitySchedule;
            if (currentTimeStr < timeStart || currentTimeStr > timeEnd) {
                isScheduledActive = false;
            }
        }
    }

    return matchType && matchCat && matchSearch && isScheduledActive;
  });

  const categories = ['All', ...Array.from(new Set(products.filter(p => p.businessType === businessType).map(p => p.category)))];

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.11;
  const total = Math.ceil(subtotal + tax);
  
  const cashReceived = numpadValue ? parseFloat(numpadValue) : 0;
  const change = cashReceived > total ? cashReceived - total : 0;

  const getMoneySuggestions = (amount: number) => {
    if (amount <= 0) return [];
    const suggestions = [];
    if (amount < 10000) suggestions.push(10000);
    if (amount < 20000) suggestions.push(20000);
    if (amount < 50000) suggestions.push(50000);
    if (amount < 100000) suggestions.push(100000);
    
    const nextTen = Math.ceil(amount / 10000) * 10000;
    if (!suggestions.includes(nextTen) && nextTen !== amount) suggestions.push(nextTen);
    
    const nextFifty = Math.ceil(amount / 50000) * 50000;
    if (!suggestions.includes(nextFifty) && nextFifty !== nextTen) suggestions.push(nextFifty);

    return suggestions.sort((a,b) => a-b).slice(0, 4);
  };
  const moneySuggestions = getMoneySuggestions(total);

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

  const handleClearCart = () => {
      if (cart.length === 0) return;
      if (window.confirm("Hapus semua item?")) {
          setCart([]);
          setNumpadValue('');
          setInputMode('money');
      }
  };

  // --- HYBRID PRICING LOGIC ---
  const calculateItemPrice = (product: Product, quantity: number): number => {
      // Logic Update: Check the PRODUCT's type, not the App's BusinessType.
      // Even in Resto mode, if we sell a Retail product (e.g. Cigarettes/Snacks) with wholesale price, apply it.
      if (product.businessType === BusinessType.RETAIL && product.wholesalePrices && product.wholesalePrices.length > 0) {
          const sortedTiers = [...product.wholesalePrices].sort((a, b) => b.minQty - a.minQty);
          // Find the highest tier where quantity >= minQty
          const tier = sortedTiers.find(t => quantity >= t.minQty);
          return tier ? tier.price : product.price;
      }
      return product.price; 
  }

  // --- DYNAMIC PROMOTION ENGINE ---
  const applyPromotions = (currentCart: CartItem[]): CartItem[] => {
      // 1. Separate regular items from existing bonuses
      let baseItems = currentCart.filter(item => !item.isPromoBonus);
      let bonusItems: CartItem[] = [];

      // 2. Iterate through Active Promotions
      const activePromos = promotions.filter(p => p.active);

      activePromos.forEach(promo => {
          if (promo.type === 'bogo') {
              // Find trigger items in cart
              const triggerItems = baseItems.filter(i => i.id === promo.buyProductId);
              const totalTriggerQty = triggerItems.reduce((acc, i) => acc + i.quantity, 0);

              if (totalTriggerQty >= promo.buyQuantity) {
                  const sets = Math.floor(totalTriggerQty / promo.buyQuantity);
                  const bonusQty = sets * promo.getQuantity;
                  
                  // Find Bonus Product Detail
                  const bonusProduct = products.find(p => p.id === promo.getProductId);
                  
                  if (bonusProduct && bonusQty > 0) {
                      bonusItems.push({
                          ...bonusProduct,
                          quantity: bonusQty,
                          price: 0,
                          finalPrice: 0,
                          isPromoBonus: true,
                          promoLabel: promo.name
                      });
                  }
              }
          }
      });

      return [...baseItems, ...bonusItems];
  };

  // --- ACTIONS: CART ---
  
  // UPDATED: addToCart now accepts an optional quantityOverride to handle manual items properly
  const addToCart = (product: Product, quantityOverride?: number) => {
    // STOCK CHECK
    const maxStock = getProductAvailability(product);
    const itemInCart = cart.find(c => c.id === product.id);
    const currentQtyInCart = itemInCart ? itemInCart.quantity : 0;
    
    let quantityToAdd = 1;

    // Manual quantity override logic
    if (quantityOverride !== undefined) {
        quantityToAdd = quantityOverride;
    } else if (numpadValue && parseFloat(numpadValue) > 0) {
        quantityToAdd = parseFloat(numpadValue);
        setNumpadValue('');
        setInputMode('money'); 
    }

    // Validation: Don't allow adding more than available stock (unless it's a custom manual item without stock tracking)
    if (!product.id.startsWith('custom-') && (currentQtyInCart + quantityToAdd > maxStock)) {
        alert(`Stok tidak mencukupi! Hanya tersedia ${maxStock} unit.`);
        return;
    }

    setCart(prev => {
      const userItems = prev.filter(i => !i.isPromoBonus);
      const existing = userItems.find(item => item.id === product.id && !item.isPromoBonus); 
      let newUserItems = [];

      // Logic fix for Custom Items: Always add new entry if it's a custom item to avoid merging different prices
      if (existing && !product.id.startsWith('custom-')) {
        const newQty = existing.quantity + quantityToAdd;
        const newPrice = calculateItemPrice(product, newQty);
        newUserItems = userItems.map(item => item.id === product.id ? { ...item, quantity: newQty, price: newPrice, appliedWholesale: newPrice < product.price } : item);
      } else {
        const finalPrice = calculateItemPrice(product, quantityToAdd);
        newUserItems = [...userItems, { ...product, quantity: quantityToAdd, price: finalPrice, finalPrice: finalPrice, appliedWholesale: finalPrice < product.price }];
      }

      return applyPromotions(newUserItems);
    });
  };

  // NEW LOGIC: MANUAL CUSTOM ITEM
  const addCustomItem = () => {
      let price = parseFloat(numpadValue);
      
      // Logic Fix: Treat Numpad Value as PRICE, not Qty.
      // If no value on numpad, ask user via prompt.
      if (!price || isNaN(price) || price <= 0) {
          const manualInput = prompt("Masukkan Harga Item Manual:");
          if (!manualInput) return;
          price = parseFloat(manualInput);
          if (isNaN(price) || price <= 0) return;
      }

      const customProduct: Product = {
          id: `custom-${Date.now()}`,
          name: "Item Manual",
          price: price,
          category: "Manual",
          businessType: businessType, // Follows current POS mode
          unit: UnitType.PCS,
          hasVariants: false,
          variants: [],
          modifierGroups: [],
          outletAvailability: 'all',
          outletPricing: {}
      };

      // Force quantity to 1 because the numpad value was consumed as Price.
      addToCart(customProduct, 1); 
      setNumpadValue(''); // Clear input after adding
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
        const targetItem = prev.find(i => i.id === id);
        if (targetItem?.isPromoBonus) return prev; // Cannot edit bonus directly
        
        // Stock Check on Increase
        if (delta > 0 && !id.startsWith('custom-')) {
            const product = products.find(p => p.id === id);
            if (product) {
                const maxStock = getProductAvailability(product);
                if (targetItem && targetItem.quantity + delta > maxStock) {
                    alert(`Stok mentok! Maksimal ${maxStock} unit.`);
                    return prev;
                }
            }
        }

        const userItems = prev.filter(i => !i.isPromoBonus);
        
        const updatedUserItems = userItems.map(item => {
          if (item.id === id) {
             let actualDelta = delta;
             if (Math.abs(delta) === 1 && (item.unit === UnitType.KG || item.unit === UnitType.LITER || item.unit === UnitType.METER)) {
                 actualDelta = delta * 0.1;
             }
            const newQty = parseFloat((item.quantity + actualDelta).toFixed(2)); 
            if (newQty <= 0) return null; 

            const originalProduct = products.find(p => p.id === id);
            let newPrice = item.price;
            let appliedWholesale = false;

            // Only recalculate wholesale if it's a real product, not custom
            if (originalProduct && !id.startsWith('custom-')) {
                newPrice = calculateItemPrice(originalProduct, newQty);
                appliedWholesale = newPrice < originalProduct.price;
            }

            return { ...item, quantity: newQty, price: newPrice, appliedWholesale };
          }
          return item;
        }).filter(Boolean) as CartItem[];

        return applyPromotions(updatedUserItems);
    });
  };

  // ... (rest of the actions remain same) ...
  const handleItemClick = (item: CartItem) => {
      if (item.isPromoBonus) return; 
      
      // Allow renaming custom items
      if (item.id.startsWith('custom-')) {
          const newName = prompt("Ubah Nama Item:", item.name);
          if (newName) {
              setCart(prev => prev.map(i => i.id === item.id ? { ...i, name: newName } : i));
          }
          return;
      }

      setEditingItemId(item.id);
      setIsItemOptionModalOpen(true);
      setNumpadValue('');
      setInputMode('qty');
  }

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

  // --- ACTIONS: DELIVERY ---
  const handleAcceptDelivery = (notifId: number) => {
      const notif = notifications.find(n => n.id === notifId);
      if (!notif) return;
      // Mock logic: add items to cart or process directly
      // For now, auto process
      alert(`Order ${notif.orderId} diterima dan diproses!`);
      setNotifications(prev => prev.filter(n => n.id !== notifId));
  };

  return {
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
    filteredProducts, 
    categories,
    subtotal,
    tax,
    total,
    cashReceived,
    change,
    moneySuggestions,
    handleNumpadInput,
    toggleOrderType,
    handleClearCart,
    addToCart,
    updateQuantity,
    handleItemClick,
    handlePendingAction,
    handleCheckout,
    openShift,
    transactions,
    currentUser,
    activeOutlet,
    businessConfig,
    addCustomItem,
    handleAcceptDelivery,
    customers
  };
};
