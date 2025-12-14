
import { useGlobalContext } from '../../../context/GlobalContext';
import { BusinessType } from '../../../types';
import { Product } from '../../products/types';

export const useDashboardLogic = () => {
    const { products, transactions, customers, ingredients, activeOutlet, activeBusiness } = useGlobalContext();

    // 1. Determine Context
    const isRetail = activeBusiness?.type === BusinessType.RETAIL;
    const isCulinary = activeBusiness?.type === BusinessType.CULINARY; // Default fallback if undefined

    // 2. Filter Data based on Active Business Type
    // Although GlobalContext usually filters by Outlet, we double ensure here for safety
    const relevantProducts = products.filter(p => p.businessType === activeBusiness?.type);

    const getStats = () => {
        const today = new Date().toLocaleDateString();
        // Filter transactions for current context
        const todaysTx = transactions.filter(t => 
            new Date(t.timestamp).toLocaleDateString() === today &&
            (t.outletId === activeOutlet?.id || activeBusiness?.outlets.some(o => o.id === t.outletId))
        );

        const todaySales = todaysTx.reduce((acc, curr) => acc + curr.total, 0);
        const totalOrders = todaysTx.length;
        
        const productCounts: Record<string, number> = {};
        todaysTx.forEach(t => t.items.forEach(i => { productCounts[i.name] = (productCounts[i.name] || 0) + i.quantity; }));
        const topProduct = Object.keys(productCounts).reduce((a, b) => productCounts[a] > productCounts[b] ? a : b, '-');
        
        // Stock Alert: Count based on filtered ingredients for this outlet/business
        const lowStockCount = ingredients.filter(i => i.stock <= i.minStock).length;
        
        // RETAIL SPECIFIC: Low Margin Count (< 15%)
        const lowMarginCount = relevantProducts.filter(p => {
             if (!p.cogs || p.price === 0) return false;
             const margin = (p.price - p.cogs) / p.price;
             return margin < 0.15;
        }).length;
  
        return { todaySales, totalOrders, topProduct, lowStockCount, lowMarginCount };
    };

    const statsData = getStats();
    
    // F&B SPECIFIC: Missing Recipe
    const productsMissingRecipe = relevantProducts.filter(p => p.businessType === BusinessType.CULINARY && !p.hasRecipe);

    return {
        products: relevantProducts,
        customers,
        activeOutlet,
        activeBusiness,
        statsData,
        productsMissingRecipe,
        isRetail,
        isCulinary
    };
};
