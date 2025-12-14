import { useState, useMemo, useEffect } from 'react';
// @FIX: Import moved types from their new location in features/irm/types.
import { UnitType } from '../types';
import { Ingredient, StockAdjustment, InventoryHistoryItem } from '../features/irm/types';
import { useGlobalContext } from '../context/GlobalContext';

type SortKey = keyof Ingredient | '';

interface StockLogicProps {
  initialSearchTerm?: string;
}

export const useStockLogic = ({ initialSearchTerm }: StockLogicProps = {}) => {
  const { ingredients, adjustStock, getIngredientHistory, addIngredient, activeOutlet } = useGlobalContext();
  
  // Local State for Modals
  const [isOpnameModalOpen, setIsOpnameModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [opnameRealQty, setOpnameRealQty] = useState<number | ''>('');
  const [opnameReason, setOpnameReason] = useState<StockAdjustment['reason']>('Opname');
  const [opnameNote, setOpnameNote] = useState('');
  const [activeHistory, setActiveHistory] = useState<InventoryHistoryItem[]>([]);

  // State for List Management
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || '');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey, direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  const categories = useMemo(() => ['All', ...Array.from(new Set(ingredients.map(i => i.category)))], [ingredients]);

  const sortedAndFilteredIngredients = useMemo(() => {
    let filtered = ingredients;

    if (filterCategory !== 'All') {
      filtered = filtered.filter(ing => ing.category === filterCategory);
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(ing => 
        ing.name.toLowerCase().includes(lowerSearch) || 
        ing.sku.toLowerCase().includes(lowerSearch)
      );
    }
    
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Ingredient];
        const bValue = b[sortConfig.key as keyof Ingredient];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [ingredients, searchTerm, filterCategory, sortConfig]);

  const paginatedIngredients = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedAndFilteredIngredients.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedAndFilteredIngredients, currentPage]);

  const totalPages = Math.ceil(sortedAndFilteredIngredients.length / ITEMS_PER_PAGE);

  const handleSort = (key: SortKey) => {
    if(!key) return;
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Helpers
  const getStockStatus = (item: Ingredient) => {
    if (item.stock <= 0) return { label: 'Habis', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' };
    if (item.stock <= item.minStock) return { label: 'Kritis', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
    if (item.stock <= item.minStock * 2) return { label: 'Menipis', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
    return { label: 'Aman', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' };
  };

  const handleOpenOpname = (ing: Ingredient) => {
      setSelectedIngredient(ing);
      setOpnameRealQty(ing.stock);
      setOpnameReason('Opname');
      setOpnameNote('');
      setIsOpnameModalOpen(true);
  };

  const handleSubmitOpname = () => {
      if (!selectedIngredient || opnameRealQty === '') return;
      adjustStock(selectedIngredient.id, Number(opnameRealQty), opnameReason, opnameNote);
      setIsOpnameModalOpen(false);
      alert("Stok berhasil diperbarui!");
  };

  const handleOpenHistory = async (ing: Ingredient) => {
      setSelectedIngredient(ing);
      setActiveHistory([]); // Clear previous history while loading
      setIsHistoryModalOpen(true);
      const hist = await getIngredientHistory(ing.id);
      setActiveHistory(hist);
  };

  const handleAddIngredient = () => {
      const name = prompt("Nama Bahan Baru:");
      if(!name) return;
      const newId = `ing-${Date.now()}`;
      const newIng: Ingredient = {
          id: newId,
          outletId: activeOutlet?.id || '',
          name: name,
          sku: `GEN-${Date.now().toString().slice(-4)}`,
          category: 'General',
          stock: 0,
          unit: UnitType.KG,
          minStock: 1,
          avgCost: 0,
          supplierId: 's1',
          lastUpdated: new Date().toISOString()
      };
      addIngredient(newIng);
  };

  return {
    ingredients: paginatedIngredients,
    totalIngredientsCount: sortedAndFilteredIngredients.length,
    activeOutlet,
    isOpnameModalOpen, setIsOpnameModalOpen,
    isHistoryModalOpen, setIsHistoryModalOpen,
    selectedIngredient,
    opnameRealQty, setOpnameRealQty,
    opnameReason, setOpnameReason,
    opnameNote, setOpnameNote,
    activeHistory,
    searchTerm, setSearchTerm,
    filterCategory, setFilterCategory,
    sortConfig,
    currentPage, setCurrentPage,
    totalPages,
    categories,

    handleSort,
    getStockStatus,
    handleOpenOpname,
    handleSubmitOpname,
    handleOpenHistory,
    handleAddIngredient
  };
};