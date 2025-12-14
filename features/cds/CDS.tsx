import React from 'react';
import { ShoppingCart, QrCode, X } from 'lucide-react';
import { useCDSLogic } from './hooks/useCDSLogic';

interface CDSProps {
    onExit?: () => void;
}

const CDS: React.FC<CDSProps> = ({ onExit }) => {
  const {
    cartItems,
    totalAmount,
    tax,
    grandTotal,
    currentAd,
    currentAdIndex,
    activeAdsCount
  } = useCDSLogic();

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex overflow-hidden font-sans">
       
       {onExit && (
           <button 
             onClick={onExit}
             className="absolute top-4 right-4 z-[110] bg-black/50 hover:bg-red-600/80 text-white/50 hover:text-white p-2 rounded-full transition-all"
           >
               <X size={20} />
           </button>
       )}

       {/* LEFT: Transaction Details */}
       <div className="w-1/3 h-full bg-[#0f172a] border-r border-white/10 flex flex-col p-6 shadow-2xl relative z-10">
           <div className="mb-6 border-b border-white/10 pb-4">
               <h1 className="text-2xl font-bold text-orange-500 tracking-tight">SIBOS Resto</h1>
               <p className="text-sm text-gray-400">Selamat Menikmati Hidangan</p>
           </div>

           {/* Cart Items */}
           <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
               {cartItems.map((item, i) => (
                   <div key={i} className="flex justify-between items-start animate-in slide-in-from-left duration-300" style={{animationDelay: `${i*100}ms`}}>
                       <div>
                           <p className="font-medium text-lg text-white">{item.name}</p>
                           <p className="text-sm text-gray-400">{item.qty} x Rp {item.price.toLocaleString()}</p>
                       </div>
                       <p className="font-bold text-white">Rp {item.total.toLocaleString()}</p>
                   </div>
               ))}
           </div>

           {/* Totals */}
           <div className="mt-auto pt-6 border-t border-white/10 space-y-2">
               <div className="flex justify-between text-gray-400">
                   <span>Subtotal</span>
                   <span>Rp {totalAmount.toLocaleString()}</span>
               </div>
               <div className="flex justify-between text-gray-400">
                   <span>Pajak (11%)</span>
                   <span>Rp {tax.toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center text-3xl font-bold text-white mt-4 bg-white/5 p-4 rounded-xl border border-white/10">
                   <span>Total</span>
                   <span className="text-orange-400">Rp {grandTotal.toLocaleString()}</span>
               </div>
           </div>

           {/* QR Payment */}
           <div className="mt-6 flex items-center gap-4 bg-white p-4 rounded-xl text-black">
               <div className="w-20 h-20 bg-gray-200 shrink-0">
                   <QrCode size={80} />
               </div>
               <div>
                   <p className="font-bold text-sm uppercase">Scan to Pay</p>
                   <p className="text-xs text-gray-600">GoPay, OVO, Dana, BCA</p>
               </div>
           </div>
       </div>

       {/* RIGHT: Digital Signage / Ads */}
       <div className="flex-1 h-full relative bg-gray-900 overflow-hidden">
           {activeAdsCount > 0 && currentAd ? (
               <>
                   {currentAd.type === 'image' ? (
                       <img 
                         src={currentAd.url} 
                         alt={currentAd.name} 
                         className="w-full h-full object-cover animate-in fade-in duration-1000"
                         key={currentAd.id} // Force re-render for animation
                       />
                   ) : (
                        <div className="w-full h-full flex items-center justify-center bg-black">
                            <p className="text-gray-500">Video Playback Placeholder</p>
                        </div>
                   )}
                   
                   <div className="absolute bottom-10 left-10 max-w-lg bg-black/60 backdrop-blur-md p-6 rounded-3xl border border-white/10">
                       <h2 className="text-3xl font-bold text-white mb-2">{currentAd.name}</h2>
                       <p className="text-gray-200">Nikmati promo spesial hari ini. Penawaran terbatas!</p>
                   </div>
               </>
           ) : (
               <div className="w-full h-full flex items-center justify-center text-gray-600">
                   <p>No Active Ads</p>
               </div>
           )}

           {/* Progress Bar */}
           <div className="absolute top-0 left-0 w-full h-1 bg-white/20">
               <div className="h-full bg-orange-500 transition-all duration-500" style={{width: `${((currentAdIndex + 1) / activeAdsCount) * 100}%`}}></div>
           </div>
       </div>
    </div>
  );
};

export default CDS;
