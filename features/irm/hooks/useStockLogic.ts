
import React, { useState, useMemo, useEffect } from 'react';
// @FIX: Import moved types from their new location in features/irm/types.
import { UnitType } from '../../../types';
import { Ingredient, StockAdjustment, InventoryHistoryItem, PurchaseOrder, PurchaseOrderItem } from '../types';
import { useGlobalContext } from '../../../context/GlobalContext';
import { ActivityLog } from '../../../components/common/LiveLogPanel';

type SortKey = keyof Ingredient | '';

interface StockLogicProps {
  initialSearchTerm?: string;
}

export const useStockLogic = ({ initialSearchTerm }: StockLogicProps = {}) => {
  const { 
      ingredients, 
      adjustStock, 
      getIngredientHistory, 
      addIngredient, 
      updateIngredient, 
      activeOutlet, 
      purchaseOrders, 
      suppliers, 
      createPurchaseOrder, 
      currentUser,
      transactions,
      stockAdjustments,
      produceIngredient // Imported
  } = useGlobalContext();
  
  // Local State for Modals
  const [isOpnameModalOpen, setIsOpnameModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); 
  const [isLiveLogOpen, setIsLiveLogOpen] = useState(false); 
  const [isReportModalOpen, setIsReportModalOpen] = useState(false); 
  const [isProductionModalOpen, setIsProductionModalOpen] = useState(false); // NEW

  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null); 

  const [opnameRealQty, setOpnameRealQty] = useState<number | ''>('');
  const [opnameReason, setOpnameReason] = useState<StockAdjustment['reason']>('Opname');
  const [opnameNote, setOpnameNote] = useState('');
  const [activeHistory, setActiveHistory] = useState<InventoryHistoryItem[]>([]);

  // State for List Management & Filters
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || '');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Critical' | 'Warning' | 'Safe'>('All'); 
  const [filterSupplier, setFilterSupplier] = useState('All'); 
  
  const [sortConfig, setSortConfig] = useState<{ key: SortKey, direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  const categories = useMemo(() => ['All', ...Array.from(new Set(ingredients.map(i => i.category)))], [ingredients]);
  const supplierList = useMemo(() => ['All', ...Array.from(new Set(suppliers.map(s => s.name)))], [suppliers]);

  // --- ADVANCED FILTERING ---
  const sortedAndFilteredIngredients = useMemo(() => {
    let filtered = ingredients;

    // 1. Category Filter
    if (filterCategory !== 'All') {
      filtered = filtered.filter(ing => ing.category === filterCategory);
    }

    // 2. Supplier Filter 
    if (filterSupplier !== 'All') {
        const targetSup = suppliers.find(s => s.name === filterSupplier);
        if (targetSup) {
            filtered = filtered.filter(ing => ing.supplierId === targetSup.id);
        }
    }

    // 3. Stock Status Filter 
    if (filterStatus !== 'All') {
        filtered = filtered.filter(ing => {
            if (filterStatus === 'Critical') return ing.stock <= ing.minStock;
            if (filterStatus === 'Warning') return ing.stock > ing.minStock && ing.stock <= ing.minStock * 2;
            if (filterStatus === 'Safe') return ing.stock > ing.minStock * 2;
            return true;
        });
    }

    // 4. Search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(ing => 
        ing.name.toLowerCase().includes(lowerSearch) || 
        ing.sku.toLowerCase().includes(lowerSearch)
      );
    }
    
    // 5. Sorting
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
  }, [ingredients, searchTerm, filterCategory, filterStatus, filterSupplier, sortConfig, suppliers]);

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
  
  // --- HELPERS ---
  const getStockStatus = (item: Ingredient) => {
    if (item.stock <= 0) return { label: 'Habis', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' };
    if (item.stock <= item.minStock) return { label: 'Kritis', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
    if (item.stock <= item.minStock * 2) return { label: 'Menipis', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
    return { label: 'Aman', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' };
  };

  const getStockVelocity = (item: Ingredient) => {
      const estimatedDailyUsage = item.minStock / 2; 
      if (estimatedDailyUsage === 0) return 99; 
      return item.stock / estimatedDailyUsage;
  };

  const getIncomingStock = (ingredientId: string) => {
      const activePOs = purchaseOrders.filter(po => 
          ['ordered', 'shipped', 'pending_approval', 'processed'].includes(po.status)
      );
      let totalIncoming = 0;
      activePOs.forEach(po => {
          po.items.forEach(item => {
              if (item.ingredientId === ingredientId) {
                  totalIncoming += item.quantity;
              }
          });
      });
      return totalIncoming;
  };

  // --- LIVE LOGS (AUDIT TRAIL) ---
  const liveLogs: ActivityLog[] = useMemo(() => {
      const logs: ActivityLog[] = [];

      // 1. Stock Adjustments (Manual Opname)
      stockAdjustments.forEach(adj => {
          logs.push({
              id: adj.id,
              type: adj.reason === 'Produksi' ? 'success' : 'warning', 
              message: `${adj.ingredientName}: Stok diubah dari ${adj.oldStock} ke ${adj.newStock} (${adj.reason})`,
              user: adj.staffName,
              timestamp: adj.timestamp,
              value: Math.abs(adj.variance * (ingredients.find(i => i.id === adj.ingredientId)?.avgCost || 0))
          });
      });

      // 2. Receiving POs (Restock)
      purchaseOrders.filter(po => po.status === 'received').forEach(po => {
          logs.push({
              id: `LOG-PO-${po.id}`,
              type: 'success', 
              message: `Terima Barang PO #${po.id} dari ${po.supplierName}`,
              user: po.receivedBy || 'Gudang',
              timestamp: po.receivedDate || po.orderDate,
              value: po.totalEstimated
          });
      });

      // 3. Sort Descending
      return logs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 50); // Last 50 items
  }, [stockAdjustments, purchaseOrders, ingredients]);


  // --- IMPORT / EXPORT CSV ---
  
  const handleExportCSV = () => {
      if (ingredients.length === 0) {
          alert("Tidak ada data untuk diexport.");
          return;
      }

      const headers = ['ID', 'Name', 'SKU', 'Category', 'Stock', 'Unit', 'MinStock', 'AvgCost'];
      const rows = ingredients.map(i => [
          i.id, `"${i.name}"`, i.sku, i.category, i.stock, i.unit, i.minStock, i.avgCost
      ]);

      const csvContent = [
          headers.join(','),
          ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `SIBOS_Stock_Export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          const text = e.target?.result as string;
          const lines = text.split('\n');
          // Skip header
          const dataRows = lines.slice(1).filter(line => line.trim() !== '');
          
          let importedCount = 0;
          dataRows.forEach(row => {
              const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Split CSV respecting quotes
              if (cols.length >= 7) {
                  const name = cols[1].replace(/"/g, ''); // Remove quotes
                  const sku = cols[2];
                  // Simple check if exists by SKU
                  const existing = ingredients.find(i => i.sku === sku);
                  
                  if (existing) {
                      // Update
                      updateIngredient({
                          ...existing,
                          stock: Number(cols[4]),
                          avgCost: Number(cols[7]),
                          lastUpdated: new Date().toISOString()
                      });
                  } else {
                      // Create
                      const newIng: Ingredient = {
                          id: `IMP-${Date.now()}-${Math.random()}`,
                          outletId: activeOutlet?.id || '',
                          name: name,
                          sku: sku,
                          category: cols[3],
                          stock: Number(cols[4]),
                          unit: cols[5] as UnitType,
                          minStock: Number(cols[6]),
                          avgCost: Number(cols[7]),
                          supplierId: 's1', // Default
                          lastUpdated: new Date().toISOString()
                      };
                      addIngredient(newIng);
                  }
                  importedCount++;
              }
          });
          alert(`Berhasil mengimpor/update ${importedCount} data bahan!`);
      };
      reader.readAsText(file);
      // Reset input
      event.target.value = '';
  };

  // --- BULK RESTOCK LOGIC ---
  const criticalItems = useMemo(() => ingredients.filter(i => i.stock <= i.minStock), [ingredients]);

  const handleBulkAutoRestock = async () => {
      try {
        if (criticalItems.length === 0) {
            alert("Tidak ada item yang stoknya kritis saat ini.");
            return;
        }
        
        const userId = currentUser ? currentUser.id : 'system';
        
        if (!confirm(`Sistem akan membuat Draft PO otomatis untuk ${criticalItems.length} item kritis. Lanjutkan?`)) return;

        const itemsBySupplier: Record<string, PurchaseOrderItem[]> = {};

        criticalItems.forEach(item => {
            const supplierId = item.supplierId || 's1'; 
            const targetQty = Math.ceil(Math.max((item.minStock * 3) - item.stock, 1));
            
            if (!itemsBySupplier[supplierId]) itemsBySupplier[supplierId] = [];
            
            itemsBySupplier[supplierId].push({
                ingredientId: item.id,
                ingredientName: item.name,
                quantity: targetQty,
                unit: item.unit,
                cost: item.avgCost,
            });
        });

        let poCount = 0;
        for (const [supId, items] of Object.entries(itemsBySupplier)) {
            const supplier = suppliers.find(s => s.id === supId);
            const totalEst = items.reduce((acc, i) => acc + (i.quantity * i.cost), 0);

            const poData: PurchaseOrder = {
                id: `PO-AUTO-${Date.now().toString().slice(-6)}-${poCount}`,
                outletId: activeOutlet?.id || '101',
                supplierId: supId,
                supplierName: supplier?.name || 'Unknown Supplier',
                items: items,
                totalEstimated: totalEst,
                status: 'draft',
                orderDate: new Date().toISOString(),
                createdBy: 'SIBOS Auto-Restock',
                createdById: userId,
                isB2B: supplier?.isSibosNetwork
            };

            await createPurchaseOrder(poData);
            poCount++;
        }

        alert(`${poCount} Draft PO berhasil dibuat!`);
      } catch (error) {
          console.error("Auto Restock Error:", error);
          alert("Gagal memproses auto-restock.");
      }
  };

  // --- MODAL HANDLERS ---
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
      setActiveHistory([]); 
      setIsHistoryModalOpen(true);
      const hist = await getIngredientHistory(ing.id);
      setActiveHistory(hist);
  };

  const handleAddIngredient = () => {
      setEditingIngredient(null);
      setIsAddModalOpen(true);
  };

  const handleEditIngredient = (ing: Ingredient) => {
      setEditingIngredient(ing);
      setIsAddModalOpen(true);
  };

  const handleSaveIngredient = (data: Omit<Ingredient, 'id' | 'lastUpdated'>) => {
      if (editingIngredient) {
          const updatedIng: Ingredient = {
              ...data,
              id: editingIngredient.id,
              lastUpdated: new Date().toISOString()
          };
          updateIngredient(updatedIng);
          alert("Data bahan berhasil diperbarui!");
      } else {
          const newIng: Ingredient = {
              ...data,
              id: `ing-${Date.now()}`,
              lastUpdated: new Date().toISOString()
          };
          addIngredient(newIng);
          alert("Bahan baku berhasil ditambahkan!");
      }
      setIsAddModalOpen(false);
      setEditingIngredient(null);
  };
  
  // NEW: Open Production Modal
  const handleOpenProduction = (ing: Ingredient) => {
      if(ing.type !== 'semi_finished') return;
      setSelectedIngredient(ing);
      setIsProductionModalOpen(true);
  }

  // NEW: Process Production
  const handleProduce = async (qty: number) => {
      if(!selectedIngredient) return;
      try {
          await produceIngredient(selectedIngredient.id, qty);
          setIsProductionModalOpen(false);
          alert(`Berhasil memproduksi ${qty} ${selectedIngredient.unit} ${selectedIngredient.name}. Stok bahan baku telah dipotong.`);
      } catch (err: any) {
          alert(`Gagal produksi: ${err.message}`);
      }
  }

  return {
    ingredients: paginatedIngredients,
    totalIngredientsCount: sortedAndFilteredIngredients.length,
    activeOutlet,
    currentUser,
    
    // Modals
    isOpnameModalOpen, setIsOpnameModalOpen,
    isHistoryModalOpen, setIsHistoryModalOpen,
    isAddModalOpen, setIsAddModalOpen, 
    isLiveLogOpen, setIsLiveLogOpen,
    isReportModalOpen, setIsReportModalOpen, 
    isProductionModalOpen, setIsProductionModalOpen, // NEW
    
    selectedIngredient,
    editingIngredient,
    
    opnameRealQty, setOpnameRealQty,
    opnameReason, setOpnameReason,
    opnameNote, setOpnameNote,
    activeHistory,
    
    // Filter State
    searchTerm, setSearchTerm,
    filterCategory, setFilterCategory,
    filterStatus, setFilterStatus,
    filterSupplier, setFilterSupplier,
    
    sortConfig,
    currentPage, setCurrentPage,
    totalPages,
    categories,
    supplierList,

    handleSort,
    getStockStatus,
    getStockVelocity,
    getIncomingStock,
    handleOpenOpname,
    handleSubmitOpname,
    handleOpenHistory,
    handleAddIngredient,
    handleEditIngredient,
    handleSaveIngredient,
    
    // Import/Export
    handleExportCSV,
    handleImportCSV,
    
    // Logs
    liveLogs,
    
    criticalItemsCount: criticalItems.length,
    handleBulkAutoRestock,
    
    // Sub-Recipe
    handleOpenProduction,
    handleProduce
  };
};
