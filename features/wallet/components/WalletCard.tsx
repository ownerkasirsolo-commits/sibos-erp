
import React from 'react';
import { WalletBalance } from '../types';
import { Plus, Wifi, Layers, ArrowUpRight } from 'lucide-react';

interface WalletCardProps {
    balance: WalletBalance;
    onTopUp: () => void;
}

const WalletCard: React.FC<WalletCardProps> = ({ balance, onTopUp }) => {
    return (
        <div className="group relative w-full aspect-[1.586/1] rounded-3xl p-5 sm:p-6 overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer
            shadow-[0_20px_50px_-12px_rgba(234,88,12,0.6)] 
            hover:shadow-[0_30px_80px_-15px_rgba(249,115,22,0.8)]
            border border-white/10
        ">
            
            {/* --- LAYOUT BACKGROUND & FX --- */}
            
            {/* 1. Base Gradient (Deep Rich Colors) */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#f97316] via-[#b91c1c] to-[#4c0519] z-0"></div>
            
            {/* 2. Texture Overlay (Subtle Noise/Carbon) */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay z-0"></div>
            
            {/* 3. Lighting/Glow FX (Animated) */}
            <div className="absolute -top-[50%] -left-[50%] w-[100%] h-[100%] bg-gradient-to-br from-yellow-300/40 to-transparent rounded-full blur-[80px] mix-blend-overlay animate-pulse duration-[3000ms]"></div>
            <div className="absolute -bottom-[30%] -right-[30%] w-[80%] h-[80%] bg-blue-500/30 rounded-full blur-[80px] mix-blend-color-dodge"></div>
            
            {/* 4. Glass Reflection Line */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50 z-0 pointer-events-none"></div>

            {/* --- CARD CONTENT --- */}
            <div className="relative z-10 flex flex-col justify-between h-full text-white">
                
                {/* TOP ROW: CHIP & LOGO */}
                <div className="flex justify-between items-start">
                    {/* Realistic EMV Chip */}
                    <div className="w-10 h-8 sm:w-12 sm:h-9 rounded-lg bg-gradient-to-br from-[#fbbf24] to-[#b45309] border border-yellow-200/40 shadow-inner flex items-center justify-center relative overflow-hidden">
                         <div className="absolute inset-0 border-[0.5px] border-black/10 opacity-50 rounded-lg"></div>
                         <div className="w-full h-[1px] bg-black/20 absolute top-1/2"></div>
                         <div className="w-full h-[1px] bg-black/20 absolute top-1/3"></div>
                         <div className="w-full h-[1px] bg-black/20 absolute bottom-1/3"></div>
                         <div className="h-full w-[1px] bg-black/20 absolute left-1/3"></div>
                         <div className="h-full w-[1px] bg-black/20 absolute right-1/3"></div>
                         <div className="w-6 h-5 border border-black/20 rounded-md absolute"></div>
                    </div>
                    
                    {/* Brand Logo with Glow */}
                    <div className="text-right">
                         <div className="font-black italic text-lg sm:text-xl tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                            SIBOS<span className="text-orange-200 font-light">Pay</span>
                         </div>
                         <div className="flex items-center justify-end gap-1 mt-0.5 opacity-80">
                             <Wifi className="rotate-90 drop-shadow-md" size={16} strokeWidth={3} />
                             <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-orange-100">Enterprise</span>
                         </div>
                    </div>
                </div>

                {/* MIDDLE ROW: CARD NUMBER (EMBOSSED LOOK) */}
                <div className="flex items-center gap-6 my-auto pl-1">
                    <p className="font-mono text-lg sm:text-2xl tracking-[0.15em] text-white/95 drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)] font-medium" style={{textShadow: "0px 2px 3px rgba(0,0,0,0.5)"}}>
                        •••• •••• 8821
                    </p>
                </div>

                {/* BOTTOM ROW: BALANCE & ACTION */}
                <div className="flex justify-between items-end gap-2">
                    <div className="min-w-0">
                        <p className="text-[9px] text-orange-100 uppercase tracking-wider mb-0.5 font-bold opacity-80 drop-shadow-sm">Total Saldo</p>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-baseline gap-1 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] truncate">
                            <span className="text-sm font-bold opacity-80">Rp</span> 
                            {balance.amount.toLocaleString('id-ID')}
                        </h2>
                    </div>
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); onTopUp(); }}
                        className="group/btn relative pl-3 pr-4 py-2 bg-white text-orange-600 hover:text-orange-700 rounded-xl font-bold text-[10px] flex items-center gap-1.5 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.5)] transition-all transform hover:scale-105 active:scale-95 overflow-hidden shrink-0"
                    >
                        {/* Button Shine Effect */}
                        <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 group-hover/btn:animate-[shimmer_1s_infinite]"></div>
                        
                        <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-md">
                            <Plus size={12} strokeWidth={4} />
                        </div>
                        <span className="tracking-wide">ISI SALDO</span>
                    </button>
                </div>
            </div>
            
        </div>
    );
};

export default WalletCard;
