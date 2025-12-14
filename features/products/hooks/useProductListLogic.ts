
import { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import { BusinessType } from '../../../types';
import { Ingredient } from '../../irm/types';
import { convertUnit } from '../../../utils/unitConversion';
import { ActivityLog } from '../../../components/common/LiveLogPanel';
import { useGlobalContext } from '../../../context/GlobalContext';

// Extend Type for UI
export interface AnalyzedProduct extends Product {
    calculatedYield: number;
    matrixCategory: 'Star' | 'Plowhorse' | 'Puzzle' | 'Dog' | 'New';
    salesVolume: number;
    margin: number;
}

interface ProductListLogicProps {
  products: Product[];
  ingredients: Ingredient[];
  initialSearchTerm?: string;
  businessType?: BusinessType;
}

export const useProductListLogic = ({ products, ingredients, initialSearchTerm, businessType }: ProductListLogicProps) => {
  const { updateProduct, transactions } = useGlobalContext(); // Add transactions
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'editor'>('list');
  
  // Update Filter Mode
  const [filterMode, setFilterMode] = useState<'all' | 'no-recipe' | 'low-stock' | 'star' | 'dog'>('all');
  
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || '');
  
  // Live Log State
  const [isLiveLogOpen, setIsLiveLogOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const isRetail = businessType === BusinessType.RETAIL;

  useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  // --- MENU ENGINEERING (BCG MATRIX) CALCULATION ---
  const matrixData = useMemo(() => {
      // 1. Calculate Individual Sales & Margin
      const salesMap: Record<string, number> = {};
      
      // Aggregate Sales Volume from Transactions
      transactions.forEach(t => {
          t.items.forEach(item => {
              // Note: item.id in transactions usually refers to product ID.
              salesMap[item.id] = (salesMap[item.id] || 0) + item.quantity;
          });
      });

      // 2. Calculate Global Averages (Thresholds)
      let totalVolume = 0;
      let totalMargin = 0;
      let activeProductCount = 0;

      const productsWithMetrics = products.map(p => {
          const volume = salesMap[p.id] || 0;
          const margin = p.price - (p.cogs || 0);
          
          if (p.category !== 'Bahan Baku') {
              totalVolume += volume;
              totalMargin += margin;
              activeProductCount++;
          }

          return { ...p, volume, margin };
      });

      const avgVolume = activeProductCount > 0 ? totalVolume / activeProductCount : 0;
      const avgMargin = activeProductCount > 0 ? totalMargin / activeProductCount : 0;

      return { productsWithMetrics, avgVolume, avgMargin };
  }, [products, transactions]);


  // --- YIELD CALCULATION ENGINE ---
  const getProductYield = (product: Product): number => {
      if (product.businessType === BusinessType.RETAIL || !product.hasRecipe) {
          return product.stock || 0;
      }
      
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
                  return 0;
              }
          }
          return hasIngredients && minYield !== Infinity ? minYield : 0;
      }
      return 0;
  };

  // --- MERGE & FILTER ---
  const visibleProducts = useMemo(() => {
    return matrixData.productsWithMetrics.map(p => {
        // Determine Matrix Category
        let matrixCategory: AnalyzedProduct['matrixCategory'] = 'New';
        
        if (p.volume > 0) {
            const isHighPop = p.volume >= matrixData.avgVolume;
            const isHighMargin = p.margin >= matrixData.avgMargin;

            if (isHighPop && isHighMargin) matrixCategory = 'Star';
            else if (isHighPop && !isHighMargin) matrixCategory = 'Plowhorse';
            else if (!isHighPop && isHighMargin) matrixCategory = 'Puzzle';
            else matrixCategory = 'Dog';
        }

        return {
            ...p,
            calculatedYield: getProductYield(p),
            matrixCategory,
            salesVolume: p.volume
        } as AnalyzedProduct;
    }).filter(p => {
      if (p.category === 'Bahan Baku' || p.category === 'Raw Material') return false;

      // Filter Logic
      if (filterMode === 'no-recipe' && p.businessType === BusinessType.CULINARY) return !p.hasRecipe;
      if (filterMode === 'low-stock') return p.calculatedYield < 10;
      if (filterMode === 'star') return p.matrixCategory === 'Star';
      if (filterMode === 'dog') return p.matrixCategory === 'Dog';
      
      if (searchTerm) {
        return p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    }).sort((a, b) => {
        // Smart Sorting
        if (filterMode === 'low-stock') return a.calculatedYield - b.calculatedYield;
        if (filterMode === 'star') return b.salesVolume - a.salesVolume;
        return a.name.localeCompare(b.name);
    });
  }, [matrixData, ingredients, filterMode, searchTerm]);

  // ... (Live Logs logic remains unchanged) ...
  const liveLogs: ActivityLog[] = useMemo(() => {
      const logs: ActivityLog[] = [];
      const now = Date.now();
      
      products.slice(0, 10).forEach((p, i) => {
          logs.push({
              id: `LOG-CREATE-${p.id}`,
              type: 'info',
              message: `Menu baru ditambahkan: ${p.name}`,
              user: 'Owner',
              timestamp: new Date(now - (100000000 * (i + 1))).toISOString(),
          });
      });

      return logs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [products]);

  const handleImportProduct = (newProduct: Product) => {
      updateProduct(newProduct);
      alert(`${newProduct.name} berhasil diimpor!`);
  };

  return {
    visibleProducts,
    isRetail,
    filterMode,
    setFilterMode,
    searchTerm,
    setSearchTerm,
    selectedProductId,
    setSelectedProductId,
    mobileView,
    setMobileView,
    isLiveLogOpen,
    setIsLiveLogOpen,
    liveLogs,
    isImportModalOpen,
    setIsImportModalOpen,
    handleImportProduct
  };
};
