
import React, { useState } from 'react';
import Modal from '../../../../components/common/Modal';
import { Ingredient } from '../../types';
import { useGlobalContext } from '../../../../context/GlobalContext';
import { convertUnit } from '../../../../utils/unitConversion';
import CompactNumber from '../../../../components/common/CompactNumber';
import { FlaskConical, ArrowRight, AlertTriangle } from 'lucide-react';

interface ProductionModalProps {
    isOpen: boolean;
    onClose: () => void;
    ingredient: Ingredient;
    onProduce: (qty: number) => void;
}

const ProductionModal: React.FC<ProductionModalProps> = ({ isOpen, onClose, ingredient, onProduce }) => {
    const { ingredients } = useGlobalContext();
    const [quantity, setQuantity] = useState<number | ''>('');

    if (!ingredient.recipe || ingredient.recipe.length === 0) return null;

    const qtyNum = Number(quantity) || 0;
    
    // Calculate Requirements & Cost
    let totalCost = 0;
    let sufficientStock = true;
    const requirements = ingredient.recipe.map(req => {
        const rawIng = ingredients.find(i => i.id === req.ingredientId);
        if (!rawIng) return null;

        const needed = convertUnit(req.quantity, req.unit, rawIng.unit) * qtyNum;
        const cost = needed * rawIng.avgCost;
        totalCost += cost;
        
        const hasStock = rawIng.stock >= needed;
        if (!hasStock) sufficientStock = false;

        return {
            name: rawIng.name,
            needed,
            current: rawIng.stock,
            unit: rawIng.unit,
            hasStock
        };
    }).filter(Boolean);

    const unitCost = qtyNum > 0 ? totalCost / qtyNum : 0;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Produksi: ${ingredient.name}`}>
            <div className="space-y-6">
                
                {/* Input */}
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Jumlah Produksi ({ingredient.unit})</label>
                    <input 
                        type="number" 
                        className="w-full glass-input rounded-xl p-4 text-2xl font-bold text-white text-center focus:border-orange-500" 
                        placeholder="0"
                        value={quantity}
                        onChange={(e) => setQuantity(parseFloat(e.target.value))}
                        autoFocus
                    />
                </div>

                {/* Bill of Materials */}
                <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
                    <div className="p-3 border-b border-white/5 flex justify-between items-center bg-white/5">
                        <span className="text-xs font-bold text-gray-400 uppercase">Kebutuhan Bahan</span>
                        <span className="text-xs text-orange-400 font-bold">{requirements.length} Item</span>
                    </div>
                    <div className="p-2 space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                        {requirements.map((req, i) => (
                            req && (
                                <div key={i} className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5 transition-colors">
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-white">{req.name}</p>
                                        <p className="text-[10px] text-gray-500">Stok: {req.current.toFixed(2)} {req.unit}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-mono text-sm font-bold ${req.hasStock ? 'text-white' : 'text-red-500'}`}>
                                            {req.needed.toFixed(2)} {req.unit}
                                        </p>
                                        {!req.hasStock && <p className="text-[9px] text-red-400 font-bold">Kurang!</p>}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>
                
                {/* Cost Estimation */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Total Biaya</p>
                        <p className="text-lg font-bold text-white"><CompactNumber value={totalCost} /></p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-[10px] text-gray-500 uppercase font-bold">HPP Baru / Unit</p>
                        <p className="text-lg font-bold text-green-400"><CompactNumber value={unitCost} /></p>
                    </div>
                </div>

                {!sufficientStock && qtyNum > 0 && (
                     <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                         <AlertTriangle size={20} className="text-red-500 shrink-0" />
                         <p className="text-xs text-red-200">Stok bahan baku tidak mencukupi untuk jumlah produksi ini.</p>
                     </div>
                )}

                <div className="flex gap-3 pt-2">
                    <button onClick={onClose} className="flex-1 py-3 border border-white/10 text-gray-400 font-bold rounded-xl hover:bg-white/5 transition-colors">Batal</button>
                    <button 
                        onClick={() => onProduce(qtyNum)} 
                        disabled={!sufficientStock || qtyNum <= 0}
                        className="flex-[2] py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FlaskConical size={18} /> Proses Produksi
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ProductionModal;
