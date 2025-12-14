
import React from 'react';
import { Table, PauseCircle, History, DollarSign, Disc, Split, StickyNote, Trash2, FileText, CreditCard, QrCode, ArrowRight, Delete, Tag, PlusSquare } from 'lucide-react';
import { Shift } from '../../../types';
import { Employee } from '../../hrm/types';
import CompactNumber from '../../../components/common/CompactNumber';

interface POSActionPadProps {
  mode: 'culinary' | 'retail';
  total: number;
  cashReceived: number;
  change: number;
  numpadValue: string;
  setNumpadValue: (val: string) => void;
  handleNumpadInput: (key: string) => void;
  currentShift: Shift | null;
  currentUser: Employee | null;
  moneySuggestions: number[];
  selectedTable: string;
  onChangeTable: () => void;
  pendingCount: number;
  hasCart: boolean;
  onPendingAction: () => void;
  onHistory: () => void;
  onDrawer: () => void;
  onSplit: () => void;
  onClear: () => void;
  onCheckout: (method: string) => void;
  onPaymentModal: () => void;
  orderType: 'dine-in' | 'take-away';
}

const POSActionPad: React.FC<POSActionPadProps> = ({ 
  mode, total, cashReceived, change, handleNumpadInput, currentShift, currentUser,
  moneySuggestions, setNumpadValue, selectedTable, onChangeTable, pendingCount, hasCart,
  onPendingAction, onHistory, onDrawer, onSplit, onClear, onCheckout, onPaymentModal, orderType
}) => {
  return (
    <div className="w-[27%] flex flex-col bg-[#111827] border-l border-white/5 h-full">
      
      {/* Top Display */}
      <div className="shrink-0 bg-black/40 flex flex-col justify-center p-4 border-b border-white/5 relative gap-2">
          <div className="flex justify-between items-baseline">
              <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">TOTAL TAGIHAN</span>
                  {orderType === 'take-away' && mode === 'culinary' && <span className="text-[10px] bg-blue-500 text-white px-1.5 rounded font-bold">TAKEAWAY</span>}
              </div>
              <div className="text-4xl font-black text-white tracking-tight leading-none overflow-hidden max-w-full text-right">
                  <CompactNumber value={total} currency={false} />
              </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
              <div className="text-right">
                  <span className="text-[10px] text-gray-500 block uppercase">Diterima</span>
                  <span className={`text-xl font-bold truncate block ${cashReceived < total && cashReceived > 0 ? 'text-red-400' : 'text-gray-300'}`}>
                      {cashReceived ? <CompactNumber value={cashReceived} currency={false} /> : '-'}
                  </span>
              </div>
              <div className="text-right border-l border-white/10 pl-4">
                  <span className="text-[10px] text-gray-500 block uppercase">Kembalian</span>
                  <span className="text-xl font-bold text-green-400 truncate block">
                      {change > 0 ? <CompactNumber value={change} currency={false} /> : '0'}
                  </span>
              </div>
          </div>
          
           {/* Staff Info */}
           <div className="absolute bottom-1 left-2 text-[10px] text-gray-600 font-mono truncate max-w-[50%]">
               {currentShift ? `Kasir: ${currentShift.staffName}` : `Logged: ${currentUser?.name}`}
           </div>
      </div>

      {/* Smart Suggestions */}
      <div className="h-10 shrink-0 bg-[#1f2937] border-b border-white/5 flex items-center px-2 gap-2 overflow-x-auto no-scrollbar">
          {moneySuggestions.map((amt) => (
              <button 
                key={amt}
                onClick={() => setNumpadValue(amt.toString())}
                className="px-2 h-full bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white rounded text-xs font-bold border border-green-600/30 transition-all whitespace-nowrap flex-1"
              >
                  {amt / 1000}k
              </button>
          ))}
           <button onClick={() => setNumpadValue(total.toString())} className="px-2 h-full bg-orange-600/20 hover:bg-orange-600 text-orange-400 hover:text-white rounded text-xs font-bold border border-orange-600/30 transition-all whitespace-nowrap flex-1">
               Pas
           </button>
      </div>

      {/* Main Grid: Tools + Numpad */}
      <div className="flex-1 p-2 grid grid-cols-4 grid-rows-7 gap-1 h-full">
          
          {/* --- ROW 1: PRIMARY OPERATIONS --- */}
          {mode === 'culinary' ? (
              <button onClick={onChangeTable} className="col-span-1 bg-orange-500/20 hover:bg-orange-500 text-white border border-orange-500/30 rounded-lg font-bold text-xs flex flex-col items-center justify-center gap-0.5 h-full transition-all">
                  <Table size={16} className="text-white" /> <span className="text-[9px]">{selectedTable || 'Meja'}</span>
              </button>
          ) : (
              <button onClick={() => alert("Cek Stok Mode")} className="col-span-1 bg-blue-500/20 hover:bg-blue-500 text-white border border-blue-500/30 rounded-lg font-bold text-xs flex flex-col items-center justify-center gap-0.5 h-full transition-all">
                  <Tag size={16} className="text-white" /> <span className="text-[9px]">Cek Harga</span>
              </button>
          )}

          <button 
              onClick={onPendingAction}
              className={`col-span-1 bg-white/5 hover:bg-white/10 text-white border border-white/5 rounded-lg font-bold text-xs flex flex-col items-center justify-center gap-0.5 h-full transition-all ${pendingCount > 0 && !hasCart ? 'animate-pulse border-orange-400 text-orange-400' : ''}`}
          >
              <PauseCircle size={16} /> <span className="text-[9px]">{hasCart ? 'Pending' : `List (${pendingCount})`}</span>
          </button>

          <button onClick={onHistory} className="col-span-1 bg-white/5 hover:bg-white/10 text-white border border-white/5 rounded-lg font-bold text-xs flex flex-col items-center justify-center gap-0.5 h-full transition-all">
              <History size={16} /> <span className="text-[9px]">Riwayat</span>
          </button>

          <button onClick={onDrawer} className="col-span-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-600/30 rounded-lg font-bold text-xs flex flex-col items-center justify-center gap-0.5 h-full transition-all">
              <DollarSign size={16} /> <span className="text-[9px]">Laci</span>
          </button>

          {/* --- ROW 2: MODIFIERS & CUSTOM --- */}
          
          {/* NOTE BUTTON (Restored) */}
          <button onClick={() => alert("Fitur Catatan Global")} className="col-span-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg font-bold text-xs flex flex-col items-center justify-center gap-0.5 h-full transition-all">
              <StickyNote size={16} /> <span className="text-[9px]">Catatan</span>
          </button>

           <button onClick={() => alert("Disc Global")} className="col-span-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg font-bold text-xs flex flex-col items-center justify-center gap-0.5 h-full transition-all">
              <Disc size={16} /> <span className="text-[9px]">Diskon</span>
          </button>

          {/* SPLIT BILL */}
          <button onClick={onSplit} className="col-span-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg font-bold text-xs flex flex-col items-center justify-center gap-0.5 h-full transition-all">
              <Split size={16} /> <span className="text-[9px]">Split</span>
          </button>
          
          <button 
            onClick={onClear} 
            className="col-span-1 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-400 rounded-lg font-bold text-xs flex flex-col items-center justify-center gap-0.5 h-full transition-colors"
          >
              <Trash2 size={16} className="currentColor" /> <span className="text-[9px]">Reset</span>
          </button>
          
          {/* --- ROW 3: PAYMENT METHODS --- */}
          <button onClick={() => onCheckout('debt')} className="col-span-1 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-bold text-xs flex flex-col items-center justify-center gap-0.5 h-full">
              <FileText size={16} className="text-white" /> Bon
          </button>
          <button onClick={onPaymentModal} className="col-span-1 bg-blue-600/20 hover:bg-blue-600 text-white rounded-lg font-bold text-xs flex flex-col items-center justify-center gap-0.5 border border-blue-600/30 h-full">
              <CreditCard size={16} className="text-white" /> Kartu
          </button>
          <button onClick={() => onCheckout('qris')} className="col-span-2 bg-green-600/20 hover:bg-green-600 text-white rounded-lg font-bold text-xs flex flex-row items-center justify-center gap-2 border border-green-600/30 h-full">
              <QrCode size={18} className="text-white" /> QRIS
          </button>

          {/* --- NUMPAD (ROWS 4-7) --- */}
          {[7,8,9].map(n => <button key={n} onClick={() => handleNumpadInput(n.toString())} className="bg-gray-800 hover:bg-gray-700 text-white font-bold text-xl rounded-lg h-full">{n}</button>)}
          <button onClick={() => handleNumpadInput('Backspace')} className="bg-gray-800 hover:bg-red-900/50 text-white font-bold rounded-lg flex items-center justify-center h-full"><Delete size={20}/></button>

          {[4,5,6].map(n => <button key={n} onClick={() => handleNumpadInput(n.toString())} className="bg-gray-800 hover:bg-gray-700 text-white font-bold text-xl rounded-lg h-full">{n}</button>)}
          <button onClick={() => handleNumpadInput('C')} className="bg-gray-800 hover:bg-gray-700 text-red-400 hover:text-white font-bold text-lg rounded-lg h-full">C</button>

          {[1,2,3].map(n => <button key={n} onClick={() => handleNumpadInput(n.toString())} className="bg-gray-800 hover:bg-gray-700 text-white font-bold text-xl rounded-lg h-full">{n}</button>)}
          
           <button 
            onClick={() => onCheckout('cash')} 
            className={`row-span-2 text-white font-bold rounded-lg shadow-lg flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform h-full ${mode === 'retail' ? 'bg-gradient-to-br from-blue-600 to-indigo-600 hover:brightness-110' : 'bg-gradient-to-br from-orange-600 to-red-600 hover:brightness-110'}`}
          >
              <span className="text-[10px] uppercase tracking-widest opacity-80 text-white">BAYAR</span>
              <ArrowRight size={20} className="text-white" />
          </button>

          <button onClick={() => handleNumpadInput('0')} className="bg-gray-800 hover:bg-gray-700 text-white font-bold text-xl rounded-lg h-full">0</button>
          <button onClick={() => handleNumpadInput('000')} className="bg-gray-800 hover:bg-gray-700 text-white font-bold text-xl rounded-lg h-full">000</button>
          <button onClick={() => handleNumpadInput('.')} className="bg-gray-800 hover:bg-gray-700 text-white font-bold text-xl rounded-lg h-full">.</button>
          
      </div>
    </div>
  );
};

export default POSActionPad;
