
import React from 'react';
import { BusinessType } from '../../../types';
import { Lock, Printer } from 'lucide-react';
import { printReceipt } from '../../../utils/printService';
import { formatCurrencyInput } from '../../../utils/formatters';
import { usePOSLogic } from '../hooks/usePOSLogic';

// Atomic Components
import POSHeader from './POSHeader';
import POSProductGrid from './POSProductGrid';
import POSCart from './POSCart';
import POSActionPad from './POSActionPad';
import Modal from '../../../components/common/Modal';
import GlassPanel from '../../../components/common/GlassPanel';
import GlassInput from '../../../components/common/GlassInput';
import GlassButton from '../../../components/common/GlassButton';

interface POSCulinaryProps {
  onExit?: () => void;
  onNavigate?: (view: string, searchTerm?: string) => void;
  onSwitchMode?: () => void; // New Prop
}

const POSCulinary: React.FC<POSCulinaryProps> = ({ onExit, onNavigate, onSwitchMode }) => {
  const {
    // State
    cart, selectedCategory, setSelectedCategory, filterQuery, setFilterQuery,
    orderType, isOnline, currentShift, selectedCustomer, setSelectedCustomer,
    selectedTable, setSelectedTable, localPendingOrders, numpadValue, setNumpadValue,
    
    // Modals State
    isShiftModalOpen, setIsShiftModalOpen,
    isMemberModalOpen, setIsMemberModalOpen,
    isPaymentMethodModalOpen, setIsPaymentMethodModalOpen,
    isSplitBillModalOpen, setIsSplitBillModalOpen,
    isCashDrawerModalOpen, setIsCashDrawerModalOpen,
    isHistoryModalOpen, setIsHistoryModalOpen,
    isNotificationOpen, toggleNotification,
    
    // Forms
    startCashInput, setStartCashInput, notifications,

    // Derived
    filteredProducts, categories, subtotal, tax, total,
    cashReceived, change, moneySuggestions,

    // Actions
    handleNumpadInput, toggleOrderType, handleClearCart,
    addToCart, updateQuantity, handleItemClick, handlePendingAction, handleCheckout,
    openShift, addCustomItem,

    // Context Data
    transactions, currentUser, businessConfig, activeOutlet
  } = usePOSLogic(BusinessType.CULINARY);

  const handleProcessOrderBridge = (requestId: string) => {
      if (onNavigate) {
          onNavigate('irm', requestId);
      } else {
          alert(`Fitur navigasi belum tersedia. Silakan buka modul IRM -> Penjualan B2B untuk memproses order ${requestId}.`);
      }
  };

  return (
    <div className="flex h-screen bg-[#0f172a] overflow-hidden">
      
      {/* 50% LEFT: PRODUCT CATALOG (RESTO STYLE) */}
      <div className="w-[50%] flex flex-col border-r border-white/5 bg-[#0f172a] relative">
          <POSHeader 
            mode="culinary"
            filterQuery={filterQuery}
            setFilterQuery={setFilterQuery}
            isOnline={isOnline}
            onExit={onExit}
            notifications={notifications}
            isNotificationOpen={isNotificationOpen}
            toggleNotification={toggleNotification}
            onProcessOrder={handleProcessOrderBridge}
            onSwitchMode={onSwitchMode}
          />
          <POSProductGrid 
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            products={filteredProducts}
            cart={cart}
            addToCart={addToCart}
          />
      </div>

      {/* 23% MIDDLE: CART */}
      <POSCart 
        mode="culinary"
        cart={cart}
        selectedCustomer={selectedCustomer}
        onMemberClick={() => setIsMemberModalOpen(true)}
        orderType={orderType}
        toggleOrderType={toggleOrderType}
        clearCart={handleClearCart}
        updateQuantity={updateQuantity}
        onItemClick={handleItemClick}
        totals={{ subtotal, tax, total }}
        onAddCustomItem={addCustomItem} 
      />

      {/* 27% RIGHT: ACTION PAD */}
      <POSActionPad 
        mode="culinary"
        total={total}
        cashReceived={cashReceived}
        change={change}
        numpadValue={numpadValue}
        setNumpadValue={setNumpadValue}
        handleNumpadInput={handleNumpadInput}
        currentShift={currentShift}
        currentUser={currentUser}
        moneySuggestions={moneySuggestions}
        selectedTable={selectedTable}
        onChangeTable={() => { const t = prompt("No Meja:", selectedTable); if(t) setSelectedTable(t); }}
        pendingCount={localPendingOrders.length}
        hasCart={cart.length > 0}
        onPendingAction={handlePendingAction}
        onHistory={() => setIsHistoryModalOpen(true)}
        onDrawer={() => setIsCashDrawerModalOpen(true)}
        onSplit={() => setIsSplitBillModalOpen(true)}
        onClear={handleClearCart}
        onCheckout={handleCheckout}
        onPaymentModal={() => setIsPaymentMethodModalOpen(true)}
        orderType={orderType}
      />
      
      {/* SHIFT MODAL */}
      <Modal isOpen={(!currentShift || currentShift.status === 'closed') && isShiftModalOpen} onClose={() => {}} title="Buka Shift Restoran">
           <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-500">
               <Lock size={32} />
           </div>
           <div className="space-y-4 text-left mt-6">
               <GlassPanel className="p-4 rounded-xl border border-white/10">
                   <label className="text-xs font-bold text-gray-500 uppercase">Kasir / Waiter</label>
                   <p className="text-lg font-bold text-white mt-1">{currentUser?.name}</p>
               </GlassPanel>

               <div>
                   <label className="text-xs font-bold text-gray-500 uppercase">Modal Awal (Petty Cash)</label>
                   <div className="relative mt-1">
                       <span className="absolute left-3 top-3 text-white font-bold">Rp</span>
                       <GlassInput 
                           value={startCashInput} 
                           onChange={(e) => setStartCashInput(formatCurrencyInput(e.target.value))}
                           onKeyDown={(e) => e.key === 'Enter' && openShift()} 
                           className="pl-10 text-lg font-bold" 
                           placeholder="0"
                           autoFocus
                       />
                   </div>
               </div>
               <GlassButton 
                variant="primary"
                className="w-full py-3"
                onClick={openShift} 
               >
                   Buka Kasir
               </GlassButton>
           </div>
      </Modal>

      {/* HISTORY MODAL */}
      <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} title="Riwayat Pesanan" size="lg">
           <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
               {transactions.length === 0 ? (
                   <div className="text-center text-gray-500 py-10">Belum ada pesanan hari ini</div>
               ) : (
                   transactions.map(order => (
                       <div key={order.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                           <div>
                               <p className="font-bold text-white">#{order.id.slice(-6)} <span className="text-gray-400 font-normal">| {new Date(order.timestamp).toLocaleTimeString()}</span></p>
                               <p className="text-xs text-gray-400">Total: Rp {order.total.toLocaleString()}</p>
                           </div>
                           <button 
                              onClick={() => businessConfig && printReceipt(order, businessConfig)}
                              className="p-2 bg-white/5 hover:bg-orange-500 text-gray-400 hover:text-white rounded-lg transition-colors"
                              title="Cetak Ulang Struk"
                           >
                               <Printer size={18} />
                           </button>
                       </div>
                   ))
               )}
           </div>
      </Modal>

    </div>
  );
};

export default POSCulinary;
