
import { BusinessType, UnitType } from '../../types';

// --- PROMOTION TYPES ---
export interface Promotion {
    id: string;
    name: string; // e.g., "Buy 2 Get 1 Kopi"
    type: 'bogo'; // Buy X Get Y
    buyProductId: string;
    buyQuantity: number;
    getProductId: string;
    getQuantity: number;
    active: boolean;
}

// --- MATRIX VARIANT TYPES ---
export interface ProductAttribute {
    id: string;
    name: string; // e.g. "Rasa", "Ukuran", "Sugar Level"
    values: string[]; // e.g. ["Coklat", "Vanilla"], ["Large", "Small"]
}

export interface ProductVariant {
    id: string;
    name: string; // Generated Name: "Coklat - Large"
    combination: string[]; // ["Coklat", "Large"] - Must match attribute order
    price: number;
    sku: string;
    stock: number;
    active: boolean; // To disable specific impossible combinations
    recipe?: RecipeItem[]; // NEW: Specific recipe items for this variant
    outletPricing?: Record<string, number>; // NEW: Specific price per outlet { 'outletId': 15000 }
}

// --- MODIFIERS / TOPPINGS ---
export interface ModifierOption {
    id: string;
    name: string; // e.g., "Keju Parut", "Telur Dadar"
    price: number; // Additional price
}

export interface ModifierGroup {
    id: string;
    name: string; // e.g., "Pilih Toping", "Level Gula"
    required: boolean; // Must select at least one?
    selectionType: 'single' | 'multiple'; // Radio vs Checkbox
    min?: number;
    max?: number;
    options: ModifierOption[];
}

// --- RECIPE & BUNDLE ---
export interface RecipeItem {
    ingredientId: string;
    quantity: number; 
    unit: UnitType;   
}

export interface BundleItem {
    productId: string;
    quantity: number;
}

// --- WHOLESALE (Grosir) ---
export interface WholesaleTier {
    minQty: number; 
    price: number;  
}

// --- SCHEDULING (NEW) ---
export interface ProductSchedule {
    enabled: boolean;
    days: string[]; // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    timeStart: string; // "00:00"
    timeEnd: string;   // "23:59"
}

export interface Product {
  id: string;
  name: string;
  category: string;
  image?: string;
  businessType: BusinessType;
  description?: string;
  unit: UnitType;
  
  // --- PRICING & STOCK STRATEGY ---
  hasVariants: boolean; 
  price: number; // Base price (Default/Reference)
  stock?: number; 
  sku?: string;
  barcode?: string;
  cogs?: number; // Base HPP

  // --- MULTI OUTLET CONFIG ---
  outletAvailability: 'all' | string[]; // 'all' or array of Outlet IDs
  isGlobalPrice?: boolean; // NEW: Toggle to force same price everywhere
  outletPricing: Record<string, number>; // Map: { 'outletId': price }

  // --- MATRIX VARIANTS ---
  attributes?: ProductAttribute[]; // Definition of dimensions
  variants: ProductVariant[]; // The generated matrix rows

  // --- OMNICHANNEL STRATEGY ---
  isOmnichannel?: boolean; 
  channels?: Record<string, { active: boolean; price: number; commission?: number }>;

  // --- COMPLEX STRUCTURES ---
  modifierGroups: ModifierGroup[];
  
  // --- FEATURES ---
  isRecommended?: boolean;
  hasRecipe?: boolean; 
  recipe?: RecipeItem[];
  
  // --- BUNDLING ---
  isBundle?: boolean;
  bundleItems?: BundleItem[];
  
  // --- SCHEDULING (NEW) ---
  availabilitySchedule?: ProductSchedule;

  // --- RETAIL SPECIFIC ---
  wholesalePrices?: WholesaleTier[];
  
  // Calculated on runtime
  calculatedYield?: number; 
  maxYield?: number; // For POS Display
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariant?: ProductVariant; // The chosen variant combination
  selectedModifiers?: ModifierOption[]; // The chosen modifiers
  note?: string;
  appliedWholesale?: boolean;
  finalPrice: number; // Calculated price (Variant + Modifiers)
  
  // --- PROMOTION FIELDS ---
  isPromoBonus?: boolean; 
  promoLabel?: string; 
}
