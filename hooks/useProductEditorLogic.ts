
import { useState, useEffect, useMemo } from 'react';
// @FIX: Import Ingredient from its new location in features/irm/types.
import { UnitType } from '../types';
// @FIX: Product-related types moved to features/products/types.ts
import { Product, RecipeItem, WholesaleTier } from '../features/products/types';
import { Ingredient } from '../features/irm/types';
import { convertUnit } from '../utils/unitConversion';

// Hook props will be similar to the component's props
interface UseProductEditorLogicProps {
  product: Product;
  onUpdate: (p: Product) => void;
  ingredients: Ingredient[];
  addIngredient: (i: Ingredient) => void;
  activeOutletId: string;
}

export const useProductEditorLogic = ({ product, onUpdate, ingredients, addIngredient, activeOutletId }: UseProductEditorLogicProps) => {
  const [activeTab, setActiveTab] = useState<'info' | 'variants' | 'pricing' | 'recipe' | 'availability' | 'wholesale'>('info');
  const [editedProduct, setEditedProduct] = useState<Product>(product);

  // Recipe State
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

  // Re-sync state if the selected product prop changes
  useEffect(() => {
    setEditedProduct(JSON.parse(JSON.stringify(product)));
  }, [product]);

  const handleSaveChanges = () => {
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

  const calculateCogs = useMemo(() => {
    return (currentRecipe: RecipeItem[]) => {
      return currentRecipe.reduce((total, item) => {
        const ing = ingredients.find(i => i.id === item.ingredientId);
        if (!ing) return total;
        const qtyInBaseUnit = convertUnit(item.quantity, item.unit, ing.unit);
        return total + (ing.avgCost * qtyInBaseUnit); 
      }, 0);
    };
  }, [ingredients]);

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
      const newCogs = calculateCogs(updatedRecipe);

      setEditedProduct({ ...editedProduct, recipe: updatedRecipe, hasRecipe: true, cogs: newCogs });
      setNewIngredientId(''); setNewIngredientQty(''); setNewIngredientUnit('');
  };
  
  const handleRemoveIngredient = (ingId: string) => {
      const updatedRecipe = (editedProduct.recipe || []).filter(r => r.ingredientId !== ingId);
      const newCogs = calculateCogs(updatedRecipe);
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
    
    newIngredientId, setNewIngredientId,
    newIngredientQty, setNewIngredientQty,
    newIngredientUnit, setNewIngredientUnit,
    isQuickAddingIng, setIsQuickAddingIng,
    quickIngName, setQuickIngName,
    quickIngUnit, setQuickIngUnit,
    quickIngCost, setQuickIngCost,
    handleAddIngredient,
    handleRemoveIngredient,
    handleQuickIngSave,
    
    wholesaleMinQty, setWholesaleMinQty,
    wholesalePrice, setWholesalePrice,
    handleAddWholesaleTier,
    handleRemoveWholesaleTier,
    
    handleSaveChanges,
    handleFieldChange,
    handleChannelChange,
    calculateCogs,
  };
};
