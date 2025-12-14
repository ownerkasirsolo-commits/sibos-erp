
import React, { useState, useEffect } from 'react';
import { PurchaseOrder, Ingredient } from '../types';
import POList from './procurement/POList';
import POCreateWizard from './procurement/POCreateWizard';
import POReceiveWizard from './procurement/POReceiveWizard';
import ProcurementDashboard from './procurement/ProcurementDashboard';
import DirectPurchase from './procurement/DirectPurchase';
import PODetailView from './procurement/PODetailView';

interface ProcurementProps {
    initialRestockItem?: Ingredient | null;
    onRestockComplete?: () => void;
}

const Procurement: React.FC<ProcurementProps> = ({ initialRestockItem, onRestockComplete }) => {
  const [viewMode, setViewMode] = useState<'dashboard' | 'list' | 'create' | 'receive' | 'direct' | 'detail'>('dashboard');
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);

  // Auto-switch to create mode if restock item is present
  useEffect(() => {
      if (initialRestockItem) {
          // We need a way to pass this item to POCreateWizard. 
          // POCreateWizard accepts `initialPo`. We can leverage that or create a new prop for it.
          // Or we can construct a partial PO.
          // Since `initialPo` expects full PO, let's stick with just opening 'create' 
          // and letting POCreateWizard handle the item via context/props if modified.
          // BUT `POCreateWizard` logic hook `usePOCreateLogic` needs to know about this item.
          // We'll update `POCreateWizard` to accept `initialItem`.
          setViewMode('create');
      }
  }, [initialRestockItem]);

  // --- NAVIGATION HANDLERS ---

  // 1. Masuk ke Create Mode
  const handleCreateNew = () => {
      setSelectedPo(null);
      setViewMode('create');
  };

  // 2. Lanjut Draft (masuk Create Mode dengan data)
  const handleContinueDraft = (po: PurchaseOrder) => {
      setSelectedPo(po);
      setViewMode('create');
  };

  // 3. Repeat Order (masuk Create Mode dengan data, ID baru)
  const handleRepeatOrder = (po: PurchaseOrder) => {
      const repeatPo = { ...po, id: '', status: 'draft' as const, items: po.items.map(i => ({...i, receivedQuantity: undefined})) };
      setSelectedPo(repeatPo);
      setViewMode('create');
  };

  // 4. Masuk Receive Mode (Harus dari Detail atau List)
  const handleOpenReceive = (po: PurchaseOrder) => {
      setSelectedPo(po);
      setViewMode('receive');
  };

  // 5. Lihat Detail
  const handleViewDetail = (po: PurchaseOrder) => {
      setSelectedPo(po);
      setViewMode('detail');
  }

  // --- SUCCESS HANDLERS ---

  // Setelah Create/Direct Purchase selesai -> Balik ke Dashboard
  const handleCreateSuccess = () => {
      setViewMode('dashboard');
      setSelectedPo(null);
      if (onRestockComplete) onRestockComplete();
  };

  // Setelah Receive barang selesai -> Balik ke Detail (agar user bisa review)
  const handleReceiveSuccess = () => {
      setViewMode('detail');
      // Jangan set selectedPo null, biarkan user melihat detail PO yang baru diupdate
  };
  
  // Update PO Local (In-place update for Detail View)
  const handlePOUpdate = (updatedPO: PurchaseOrder) => {
      setSelectedPo(updatedPO);
  };
  
  // --- BACK HANDLERS ---

  const handleBackToDashboard = () => {
      setSelectedPo(null);
      setViewMode('dashboard');
      if (onRestockComplete) onRestockComplete();
  };

  const handleBackToDetail = () => {
      if (selectedPo) {
          setViewMode('detail');
      } else {
          setViewMode('dashboard');
      }
  };

  const renderContent = () => {
      switch(viewMode) {
          case 'dashboard':
              return <ProcurementDashboard onNavigate={(view, po) => {
                  if (po) setSelectedPo(po);
                  setViewMode(view as any);
              }} />;
          
          case 'list':
              // Legacy list (Fallback)
              return (
                  <POList 
                      onCreate={handleCreateNew}
                      onContinueDraft={handleContinueDraft}
                      onRepeat={handleRepeatOrder}
                      onReceive={handleOpenReceive}
                      onViewDetail={handleViewDetail}
                      onBackToDashboard={handleBackToDashboard}
                  />
              );

          case 'detail':
              return selectedPo ? (
                  <PODetailView 
                      po={selectedPo}
                      onBack={handleBackToDashboard}
                      onReceive={handleOpenReceive}
                      onUpdate={handlePOUpdate}
                  />
              ) : (
                  // Fallback jika state hilang (refresh page dsb)
                  <ProcurementDashboard onNavigate={(view) => setViewMode(view)} />
              );

          case 'create':
              return (
                  <POCreateWizard 
                      onBack={handleBackToDashboard}
                      onSuccess={handleCreateSuccess}
                      initialPo={selectedPo}
                      // Pass the restock item to the wizard
                      // @ts-ignore
                      initialRestockItem={initialRestockItem}
                  />
              );

          case 'receive':
              return selectedPo ? (
                  <POReceiveWizard 
                      po={selectedPo}
                      onClose={handleBackToDetail} // Jika batal/tutup, balik ke detail
                      onSuccess={handleReceiveSuccess} // Jika sukses, balik ke detail
                  />
              ) : null;

          case 'direct':
              return (
                  <DirectPurchase 
                      onBack={handleBackToDashboard}
                      onSuccess={handleCreateSuccess}
                  />
              );

          default:
               return <ProcurementDashboard onNavigate={(view) => setViewMode(view)} />;
      }
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 w-full">
        {renderContent()}
    </div>
  );
};

export default Procurement;
