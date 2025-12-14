

import React, { useState } from 'react';
// @FIX: Import PurchaseOrder from its new location in features/irm/types.
import { PurchaseOrder } from '../../features/irm/types';
import POList from './procurement/POList';
import POCreateWizard from './procurement/POCreateWizard';
import POReceiveWizard from './procurement/POReceiveWizard';

const Procurement: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'receive'>('list');
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);

  // Handlers
  const handleCreateNew = () => {
      setSelectedPo(null);
      setViewMode('create');
  };

  const handleContinueDraft = (po: PurchaseOrder) => {
      setSelectedPo(po);
      setViewMode('create');
  };

  const handleRepeatOrder = (po: PurchaseOrder) => {
      // Create a copy for repetition (reset ID and status)
      const repeatPo = { ...po, id: '', status: 'draft' as const, items: po.items.map(i => ({...i, receivedQuantity: undefined})) };
      setSelectedPo(repeatPo);
      setViewMode('create');
  };

  const handleOpenReceive = (po: PurchaseOrder) => {
      setSelectedPo(po);
      setViewMode('receive');
  };

  const handleSuccess = () => {
      setViewMode('list');
      setSelectedPo(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95">
        {viewMode === 'list' && (
            <POList 
                onCreate={handleCreateNew}
                onContinueDraft={handleContinueDraft}
                onRepeat={handleRepeatOrder}
                onReceive={handleOpenReceive}
            />
        )}

        {viewMode === 'create' && (
            <POCreateWizard 
                onBack={() => setViewMode('list')}
                onSuccess={handleSuccess}
                initialPo={selectedPo}
            />
        )}

        {viewMode === 'receive' && selectedPo && (
            <POReceiveWizard 
                po={selectedPo}
                onClose={() => setViewMode('list')}
                onSuccess={handleSuccess}
            />
        )}
    </div>
  );
};

export default Procurement;