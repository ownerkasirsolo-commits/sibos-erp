
import React, { useState, useEffect, useMemo } from 'react';
// @FIX: Import Ingredient from its new location in features/irm/types.
import { UnitType } from '../../../types';
// @FIX: Product-related types moved to features/products/types.ts
import { Product, RecipeItem, WholesaleTier, ProductAttribute, ProductVariant, BundleItem, ProductSchedule } from '../types';
import { Ingredient } from '../../irm/types';
import { convertUnit } from '../../../utils/unitConversion';
import { useGlobalContext } from '../../../context/GlobalContext';

// Hook props will be similar to the component's props
interface UseProductEditorLogicProps {
  product: Product;
  onUpdate: (p: Product) => void;
  ingredients: Ingredient[];
  addIngredient: (i: Ingredient) => void;
  activeOutletId: string;
}

export const useProductEditorLogic = ({ product, onUpdate, ingredients, addIngredient, activeOutletId }: UseProductEditorLogicProps) => {
  const { availableBusinesses, activeBusinessId, products } = useGlobalContext(); // Need products context for bundle selection

  const [activeTab, setActiveTab] = useState<'info' | 'recipe' | 'variants' | 'pricing' | 'modifiers' | 'bundle' | 'schedule' | 'wholesale'>('info');
  const [editedProduct, setEditedProduct] = useState<Product>(product);

  // Variant Matrix State
  const [newAttrName, setNewAttrName] = useState('');
  
  // UI State
  const [isAddIngredientModalOpen, setIsAddIngredientModalOpen] = useState(false);
  
  // VARIANT RECIPE MODAL STATE
  const [isVariantRecipeModalOpen, setIsVariantRecipeModalOpen] = useState(false);
  const [activeVariantId, setActiveVariantId] = useState<string | null>(null);
  const [tempVariantRecipe, setTempVariantRecipe] = useState<RecipeItem[]>([]);

  // Bundle State
  const [selectedBundleProduct, setSelectedBundleProduct] = useState('');

  // Recipe State (Legacy/Manual)
  const [newIngredientId, setNewIngredientId] = useState('');
  const [newIngredientQty, setNewIngredientQty] = useState('');
  const [newIngredientUnit, setNewIngredientUnit] = useState<UnitType | ''>('');
  const [isQuickAddingIng, setIsQuickAddingIng] = useState(false);
  const [quickIngName, setQuickIngName] = useState('');
  const [quickIngUnit, setQuickIngUnit] = useState<UnitType>(UnitType.KG);
  const [quickIngCost, setQuickIngCost] = useState('');

  // Wholesale State
  const [wholesaleMinQty, setWholesaleMinQty] = useState('');
  const [wholesalePrice, setWholesalePrice] = useState('');

  // Derived: All outlets for current business
  const currentBusinessOutlets = useMemo(() => {
      const biz = availableBusinesses.find(b => b.id === activeBusinessId);
      return biz ? biz.outlets : [];
  }, [availableBusinesses, activeBusinessId]);

  // Re-sync state
  useEffect(() => {
    setEditedProduct(JSON.parse(JSON.stringify(product)));
  }, [product]);

  // --- IMAGE UPLOAD LOGIC ---
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setEditedProduct(prev => ({ ...prev, image: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  // --- OUTLET CONFIG LOGIC ---
  const toggleOutletAvailability = (outletId: string) => {
      let current = editedProduct.outletAvailability === 'all' 
        ? currentBusinessOutlets.map(o => o.id) // Convert 'all' to explicit array first
        : (editedProduct.outletAvailability || []);

      if (current.includes(outletId)) {
          current = current.filter(id => id !== outletId);
      } else {
          current = [...current, outletId];
      }
      
      // Check if all selected again
      if (current.length === currentBusinessOutlets.length) {
          setEditedProduct(prev => ({ ...prev, outletAvailability: 'all' }));
      } else {
          setEditedProduct(prev => ({ ...prev, outletAvailability: current }));
      }
  };

  const handleOutletPriceChange = (outletId: string, price: number) => {
      setEditedProduct(prev => ({
          ...prev,
          outletPricing: {
              ...(prev.outletPricing || {}),
              [outletId]: price
          }
      }));
  };
  
  const handleVariantOutletPriceChange = (variantId: string, outletId: string, price: number) => {
      const updatedVariants = editedProduct.variants.map(v => {
          if (v.id === variantId) {
              return {
                  ...v,
                  outletPricing: {
                      ...(v.outletPricing || {}),
                      [outletId]: price
                  }
              };
          }
          return v;
      });
      setEditedProduct(prev => ({ ...prev, variants: updatedVariants }));
  };

  const handleApplyBasePriceToAll = () => {
      const newPricing: Record<string, number> = {};
      currentBusinessOutlets.forEach(o => {
          newPricing[o.id] = editedProduct.price;
      });
      setEditedProduct(prev => ({ ...prev, outletPricing: newPricing }));
  };

  // --- SCHEDULING LOGIC ---
  const handleToggleSchedule = (enabled: boolean) => {
      setEditedProduct(prev => ({
          ...prev,
          availabilitySchedule: {
              enabled,
              days: prev.availabilitySchedule?.days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              timeStart: prev.availabilitySchedule?.timeStart || '00:00',
              timeEnd: prev.availabilitySchedule?.timeEnd || '23:59'
          }
      }));
  };

  const handleDayToggle = (day: string) => {
      const currentDays = editedProduct.availabilitySchedule?.days || [];
      let newDays;
      if (currentDays.includes(day)) {
          newDays = currentDays.filter(d => d !== day);
      } else {
          newDays = [...currentDays, day];
      }
      setEditedProduct(prev => ({
          ...prev,
          availabilitySchedule: {
              ...prev.availabilitySchedule!,
              days: newDays
          }
      }));
  };

  const handleTimeChange = (field: 'timeStart' | 'timeEnd', value: string) => {
      setEditedProduct(prev => ({
          ...prev,
          availabilitySchedule: {
              ...prev.availabilitySchedule!,
              [field]: value
          }
      }));
  };

  // --- CALCULATIONS ---
  const calculateCostFromRecipe = (recipeItems: RecipeItem[]): number => {
      return recipeItems.reduce((total, item) => {
        const ing = ingredients.find(i => i.id === item.ingredientId);
        if (!ing) return total;
        const qtyInBaseUnit = convertUnit(item.quantity, item.unit, ing.unit);
        return total + (ing.avgCost * qtyInBaseUnit); 
      }, 0);
  };
  
  // Calculate Bundle Cost (Sum of member COGS)
  const calculateBundleCost = (): number => {
      if (!editedProduct.isBundle || !editedProduct.bundleItems) return 0;
      return editedProduct.bundleItems.reduce((acc, item) => {
          const prod = products.find(p => p.id === item.productId);
          return acc + ((prod?.cogs || 0) * item.quantity);
      }, 0);
  }

  // Calculate Bundle Normal Price (Sum of member selling prices)
  const calculateBundleNormalPrice = (): number => {
      if (!editedProduct.isBundle || !editedProduct.bundleItems) return 0;
      return editedProduct.bundleItems.reduce((acc, item) => {
          const prod = products.find(p => p.id === item.productId);
          return acc + ((prod?.price || 0) * item.quantity);
      }, 0);
  }

  const getProductStock = (variantId?: string) => {
      // Stock calculation logic based on available ingredients (simplified)
      // In real app, this should calculate min possible yield from ingredients
      return 0; // Placeholder
  };

  const getProductCost = (variantId?: string) => {
      const baseCost = calculateCostFromRecipe(editedProduct.recipe || []);
      
      if (variantId) {
          const variant = editedProduct.variants.find(v => v.id === variantId);
          const specificCost = calculateCostFromRecipe(variant?.recipe || []);
          return baseCost + specificCost;
      }
      return baseCost;
  };

  const handleSaveChanges = () => {
    // Recalculate COGS if bundle
    if (editedProduct.isBundle) {
        editedProduct.cogs = calculateBundleCost();
    }
    onUpdate(editedProduct);
    alert('Produk disimpan!');
  };
  
  const handleFieldChange = (field: keyof Product, value: any) => {
      setEditedProduct(prev => ({...prev, [field]: value}));
  };
  
  const handleChannelChange = (channelKey: string, field: string, value: any) => {
      setEditedProduct(prev => {
          const channels = prev.channels || {};
          // @ts-ignore
          const channelData = channels[channelKey] || { active: false, price: 0, commission: 0 };
          return {
              ...prev,
              channels: {
                  ...channels,
                  [channelKey]: {
                      ...channelData,
                      [field]: value
                  }
              }
          }
      });
  };

  // --- BUNDLE LOGIC ---
  const handleAddBundleItem = () => {
      if (!selectedBundleProduct) return;
      
      // Prevent recursive bundling (Bundle inside Bundle) - optional check
      // For this check we assume products contains the edited product too if it exists, or check ID
      if (selectedBundleProduct === editedProduct.id) {
          alert("Tidak bisa menambahkan produk ini sendiri ke dalam paket.");
          return;
      }

      const existingItem = editedProduct.bundleItems?.find(i => i.productId === selectedBundleProduct);
      if (existingItem) {
          // Increment
          const updatedItems = editedProduct.bundleItems?.map(i => i.productId === selectedBundleProduct ? {...i, quantity: i.quantity + 1} : i) || [];
          setEditedProduct(prev => ({ ...prev, bundleItems: updatedItems }));
      } else {
          // Add new
          const newItem: BundleItem = { productId: selectedBundleProduct, quantity: 1 };
          setEditedProduct(prev => ({ ...prev, bundleItems: [...(prev.bundleItems || []), newItem] }));
      }
      setSelectedBundleProduct('');
  };

  const handleRemoveBundleItem = (index: number) => {
      const updatedItems = (editedProduct.bundleItems || []).filter((_, i) => i !== index);
      setEditedProduct(prev => ({ ...prev, bundleItems: updatedItems }));
  };

  const handleUpdateBundleItemQty = (index: number, newQty: number) => {
      if (newQty < 1) return;
      const updatedItems = [...(editedProduct.bundleItems || [])];
      updatedItems[index].quantity = newQty;
      setEditedProduct(prev => ({ ...prev, bundleItems: updatedItems }));
  };

  // --- MATRIX VARIANT LOGIC ---
  const handleAddAttribute = () => {
      if (!newAttrName) return;
      const newAttr: ProductAttribute = { id: `attr-${Date.now()}`, name: newAttrName, values: [] };
      const updatedAttributes = [...(editedProduct.attributes || []), newAttr];
      setEditedProduct(prev => ({ ...prev, attributes: updatedAttributes, hasVariants: true }));
      setNewAttrName('');
  };

  const handleRemoveAttribute = (index: number) => {
      const updatedAttributes = (editedProduct.attributes || []).filter((_, i) => i !== index);
      if (updatedAttributes.length === 0) {
          setEditedProduct(prev => ({ ...prev, attributes: [], variants: [], hasVariants: false }));
      } else {
          setEditedProduct(prev => ({ ...prev, attributes: updatedAttributes }));
          generateVariants(updatedAttributes);
      }
  };

  const handleAddAttrValue = (attrIndex: number, value: string) => {
      if (!value) return;
      const updatedAttributes = [...(editedProduct.attributes || [])];
      if (updatedAttributes[attrIndex].values.includes(value)) return;
      updatedAttributes[attrIndex].values.push(value);
      setEditedProduct(prev => ({ ...prev, attributes: updatedAttributes }));
      generateVariants(updatedAttributes);
  };

  const handleRemoveAttrValue = (attrIndex: number, valueIndex: number) => {
      const updatedAttributes = [...(editedProduct.attributes || [])];
      updatedAttributes[attrIndex].values = updatedAttributes[attrIndex].values.filter((_, i) => i !== valueIndex);
      setEditedProduct(prev => ({ ...prev, attributes: updatedAttributes }));
      generateVariants(updatedAttributes);
  };

  const generateVariants = (attributes: ProductAttribute[]) => {
      if (attributes.length === 0) return;
      const cartesian = (args: string[][]): string[][] => {
          const r: string[][] = [];
          const max = args.length - 1;
          function helper(arr: string[], i: number) {
              for (let j = 0, l = args[i].length; j < l; j++) {
                  const a = arr.slice(0);
                  a.push(args[i][j]);
                  if (i === max) r.push(a);
                  else helper(a, i + 1);
              }
          }
          helper([], 0);
          return r;
      };
      const args = attributes.map(a => a.values);
      if (args.some(v => v.length === 0)) return;

      const combinations = cartesian(args);
      const oldVariants = editedProduct.variants || [];
      
      const newVariants: ProductVariant[] = combinations.map(combo => {
          const name = combo.join(' - ');
          const existing = oldVariants.find(v => JSON.stringify(v.combination) === JSON.stringify(combo));
          if (existing) return existing; 

          return {
              id: `var-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: name,
              combination: combo,
              price: editedProduct.price,
              sku: `${editedProduct.sku || 'SKU'}-${combo.map(s => s.substring(0,3).toUpperCase()).join('')}`,
              stock: 0,
              active: true,
              recipe: [] 
          };
      });
      setEditedProduct(prev => ({ ...prev, variants: newVariants }));
  };

  const handleUpdateVariantMatrix = (index: number, field: keyof ProductVariant, value: any) => {
      const updatedVariants = [...editedProduct.variants];
      updatedVariants[index] = { ...updatedVariants[index], [field]: value };
      setEditedProduct(prev => ({ ...prev, variants: updatedVariants }));
  };

  // --- MODIFIERS ---
  const handleAddModifierGroup = () => {
      const newGroup: any = { id: `grp-${Date.now()}`, name: '', required: false, selectionType: 'single', options: [] };
      setEditedProduct(prev => ({ ...prev, modifierGroups: [...(prev.modifierGroups || []), newGroup] }));
  };
  const handleUpdateModifierGroup = (index: number, field: string, value: any) => {
      const updatedGroups = [...editedProduct.modifierGroups];
      // @ts-ignore
      updatedGroups[index] = { ...updatedGroups[index], [field]: value };
      setEditedProduct(prev => ({ ...prev, modifierGroups: updatedGroups }));
  };
  const handleRemoveModifierGroup = (index: number) => {
      const updatedGroups = editedProduct.modifierGroups.filter((_, i) => i !== index);
      setEditedProduct(prev => ({ ...prev, modifierGroups: updatedGroups }));
  };
  const handleAddModifierOption = (groupIndex: number) => {
      const newOption = { id: `opt-${Date.now()}`, name: '', price: 0 };
      const updatedGroups = [...editedProduct.modifierGroups];
      updatedGroups[groupIndex].options.push(newOption);
      setEditedProduct(prev => ({ ...prev, modifierGroups: updatedGroups }));
  };
  const handleUpdateModifierOption = (groupIndex: number, optionIndex: number, field: string, value: any) => {
      const updatedGroups = [...editedProduct.modifierGroups];
      // @ts-ignore
      updatedGroups[groupIndex].options[optionIndex] = { ...updatedGroups[groupIndex].options[optionIndex], [field]: value };
      setEditedProduct(prev => ({ ...prev, modifierGroups: updatedGroups }));
  };
  const handleRemoveModifierOption = (groupIndex: number, optionIndex: number) => {
      const updatedGroups = [...editedProduct.modifierGroups];
      updatedGroups[groupIndex].options = updatedGroups[groupIndex].options.filter((_, i) => i !== optionIndex);
      setEditedProduct(prev => ({ ...prev, modifierGroups: updatedGroups }));
  };

  // --- BASE RECIPE MANAGEMENT ---
  const handleAddIngredientToBaseRecipe = (ingredientId: string) => {
      const ing = ingredients.find(i => i.id === ingredientId);
      if (!ing) return;
      if (editedProduct.recipe?.some(r => r.ingredientId === ingredientId)) {
          alert("Bahan ini sudah ada di resep dasar.");
          return;
      }
      const newRecipeItem: RecipeItem = { ingredientId: ing.id, quantity: 1, unit: ing.unit };
      const updatedRecipe = [...(editedProduct.recipe || []), newRecipeItem];
      setEditedProduct({ ...editedProduct, recipe: updatedRecipe, hasRecipe: true });
  };

  const handleUpdateBaseRecipeItem = (index: number, field: keyof RecipeItem, value: any) => {
      const updatedRecipe = [...(editedProduct.recipe || [])];
      updatedRecipe[index] = { ...updatedRecipe[index], [field]: value };
      setEditedProduct({ ...editedProduct, recipe: updatedRecipe });
  };
  
  const handleRemoveBaseIngredient = (ingId: string) => {
      const updatedRecipe = (editedProduct.recipe || []).filter(r => r.ingredientId !== ingId);
      setEditedProduct({ ...editedProduct, recipe: updatedRecipe, hasRecipe: updatedRecipe.length > 0 });
  };

  // --- VARIANT RECIPE MODAL LOGIC ---
  const handleOpenVariantRecipe = (variant: ProductVariant) => {
      setActiveVariantId(variant.id);
      setTempVariantRecipe(variant.recipe ? [...variant.recipe] : []);
      setIsVariantRecipeModalOpen(true);
  };

  const handleCloseVariantRecipe = () => {
      setIsVariantRecipeModalOpen(false);
      setActiveVariantId(null);
      setTempVariantRecipe([]);
  };

  const handleAddIngredientToVariant = (ingredientId: string) => {
      const ing = ingredients.find(i => i.id === ingredientId);
      if (!ing) return;
      if (tempVariantRecipe.some(r => r.ingredientId === ingredientId)) {
          alert("Bahan ini sudah ada di daftar tambahan.");
          return;
      }
      const newRecipeItem: RecipeItem = { ingredientId: ing.id, quantity: 1, unit: ing.unit };
      setTempVariantRecipe([...tempVariantRecipe, newRecipeItem]);
  };

  const handleUpdateVariantRecipeItem = (index: number, field: keyof RecipeItem, value: any) => {
      const updated = [...tempVariantRecipe];
      updated[index] = { ...updated[index], [field]: value };
      setTempVariantRecipe(updated);
  };

  const handleRemoveVariantIngredient = (index: number) => {
      setTempVariantRecipe(tempVariantRecipe.filter((_, i) => i !== index));
  };

  const handleSaveVariantRecipe = () => {
      if (!activeVariantId) return;
      const updatedVariants = editedProduct.variants.map(v => {
          if (v.id === activeVariantId) {
              return { ...v, recipe: tempVariantRecipe };
          }
          return v;
      });
      setEditedProduct({ ...editedProduct, variants: updatedVariants });
      handleCloseVariantRecipe();
  };

  const handleSaveNewIngredient = (data: Omit<Ingredient, 'id' | 'lastUpdated'>) => {
      const newId = `ing-${Date.now()}`;
      const newIng: Ingredient = {
          ...data,
          id: newId,
          lastUpdated: new Date().toISOString()
      };
      addIngredient(newIng);
  };

  // --- LEGACY/MANUAL RECIPE HANDLERS (for backwards compatibility if needed) ---
  const handleAddIngredient = () => {
      if (!newIngredientId || !newIngredientQty || !newIngredientUnit) return;
      const qty = parseFloat(newIngredientQty);
      if (qty <= 0) return;

      const newRecipeItem: RecipeItem = {
          ingredientId: newIngredientId,
          quantity: qty,
          unit: newIngredientUnit
      };

      const updatedRecipe = [...(editedProduct.recipe || []), newRecipeItem];
      const newCogs = calculateCostFromRecipe(updatedRecipe);

      setEditedProduct({ ...editedProduct, recipe: updatedRecipe, hasRecipe: true, cogs: newCogs });
      setNewIngredientId(''); setNewIngredientQty(''); setNewIngredientUnit('');
  };
  
  const handleRemoveIngredient = (ingId: string) => {
      const updatedRecipe = (editedProduct.recipe || []).filter(r => r.ingredientId !== ingId);
      const newCogs = calculateCostFromRecipe(updatedRecipe);
      setEditedProduct({ ...editedProduct, recipe: updatedRecipe, hasRecipe: updatedRecipe.length > 0, cogs: newCogs });
  };
  
  const handleQuickIngSave = () => {
      if (!quickIngName || !quickIngCost) return;
      const newId = `ing-${Date.now()}`;
      const newIng: Ingredient = {
          id: newId, outletId: activeOutletId, name: quickIngName, sku: `GEN-${Date.now().toString().slice(-4)}`, category: 'General', stock: 0, unit: quickIngUnit, minStock: 1, avgCost: parseFloat(quickIngCost), supplierId: 's1', lastUpdated: new Date().toISOString()
      };
      addIngredient(newIng);
      setIsQuickAddingIng(false); setNewIngredientId(newId); setNewIngredientUnit(quickIngUnit); setQuickIngName(''); setQuickIngCost('');
  };

  // --- WHOLESALE LOGIC ---
  const handleAddWholesaleTier = () => {
      const qty = parseInt(wholesaleMinQty);
      const price = parseFloat(wholesalePrice);
      if (qty <= 1 || price <= 0) return;
      const newTier: WholesaleTier = { minQty: qty, price: price };
      const updatedTiers = [...(editedProduct.wholesalePrices || []).filter(t => t.minQty !== qty), newTier].sort((a,b) => a.minQty - b.minQty);
      setEditedProduct({ ...editedProduct, wholesalePrices: updatedTiers });
      setWholesaleMinQty(''); setWholesalePrice('');
  };

  const handleRemoveWholesaleTier = (minQty: number) => {
      const updatedTiers = (editedProduct.wholesalePrices || []).filter(t => t.minQty !== minQty);
      setEditedProduct({ ...editedProduct, wholesalePrices: updatedTiers });
  };


  return {
    activeTab, setActiveTab,
    editedProduct,
    currentBusinessOutlets,
    products, 
    
    // UI
    isAddIngredientModalOpen, setIsAddIngredientModalOpen,
    handleSaveNewIngredient,
    handleImageUpload,
    
    // Outlet Logic
    toggleOutletAvailability,
    handleOutletPriceChange,
    handleVariantOutletPriceChange, 
    handleApplyBasePriceToAll,

    // Scheduling Logic
    handleToggleSchedule,
    handleDayToggle,
    handleTimeChange,

    // Variant Modal UI
    isVariantRecipeModalOpen,
    activeVariantId,
    tempVariantRecipe,
    handleOpenVariantRecipe,
    handleCloseVariantRecipe,
    handleAddIngredientToVariant,
    handleUpdateVariantRecipeItem,
    handleRemoveVariantIngredient,
    handleSaveVariantRecipe,

    // Matrix
    newAttrName, setNewAttrName,
    handleAddAttribute,
    handleRemoveAttribute,
    handleAddAttrValue,
    handleRemoveAttrValue,
    handleUpdateVariantMatrix,
    
    // Base Recipe Logic
    handleAddIngredientToBaseRecipe,
    handleUpdateBaseRecipeItem,
    handleRemoveBaseIngredient,
    
    // Bundle Logic
    selectedBundleProduct, setSelectedBundleProduct,
    handleAddBundleItem,
    handleRemoveBundleItem,
    handleUpdateBundleItemQty,
    calculateBundleCost,
    calculateBundleNormalPrice,

    // Modifiers
    handleAddModifierGroup,
    handleUpdateModifierGroup,
    handleRemoveModifierGroup,
    handleAddModifierOption,
    handleUpdateModifierOption,
    handleRemoveModifierOption,
    
    // Wholesale Logic
    wholesaleMinQty, setWholesaleMinQty,
    wholesalePrice, setWholesalePrice,
    handleAddWholesaleTier,
    handleRemoveWholesaleTier,

    // Recipe manual add (if used)
    newIngredientId, setNewIngredientId,
    newIngredientQty, setNewIngredientQty,
    newIngredientUnit, setNewIngredientUnit,
    handleAddIngredient,
    handleRemoveIngredient,
    isQuickAddingIng, setIsQuickAddingIng,
    quickIngName, setQuickIngName,
    quickIngUnit, setQuickIngUnit,
    quickIngCost, setQuickIngCost,
    handleQuickIngSave,
    
    // Calculations
    getProductStock,
    getProductCost,
    calculateCostFromRecipe,
    
    handleSaveChanges,
    handleFieldChange,
    handleChannelChange,
  };
};
