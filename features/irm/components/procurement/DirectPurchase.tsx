import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Camera, Save, ShoppingBag, Banknote, CreditCard, Store } from 'lucide-react';
import { useGlobalContext } from '../../../../context/GlobalContext';
import { UnitType } from '../../../../types';
import { PurchaseOrder, PurchaseOrderItem } from '../../types';
import GlassInput from '../../../../components/common/GlassInput';
import GlassPanel from '../../../../components/common/GlassPanel';
import Combobox from '../../../../components/common/Combobox';
import CompactNumber from '../../../../components/common/CompactNumber';
import { getCompatibleUnits } from '../../../../utils/unitConversion';

interface DirectPurchaseProps {
    onBack: () => void;
    onSuccess: () => void;
}

const DirectPurchase: React.FC<DirectPurchaseProps> = ({ onBack, onSuccess }) => {
    const { ingredients, currentUser, activeOutlet, createPurchaseOrder, receivePurchaseOrder } = useGlobalContext();

    // Form State
    const [supplierName, setSupplierName] = useState('Pasar / Umum');
    const [fundSource, setFundSource] = useState<'Petty Cash' | 'Kasir'>('Petty Cash');
    const [items, setItems] = useState<PurchaseOrderItem[]>([]);
    
    // Item Input State
    const [newItemId, setNewItemId] = useState('');
    const [newItemQty, setNewItemQty] = useState('');
    const [newItemUnit, setNewItemUnit] = useState<UnitType | ''>('');
    const [newItemPrice, setNewItemPrice] = useState('');

    const ingredientOptions = ingredients.map(ing => ({
        value: ing.id,
        label: ing.name,
        group: ing.category
    }));

    const handleAddItem = () => {
        if (!newItemId || !newItemQty || !newItemPrice || !newItemUnit) return;
        const ing = ingredients.find(i => i.id === newItemId);
        if (!ing) return;

        const newItem: PurchaseOrderItem = {
            ingredientId: ing.id,
            ingredientName: ing.name,
            quantity: parseFloat(newItemQty),
            unit: newItemUnit as UnitType,
            cost: parseFloat(newItemPrice),
            receivedQuantity: parseFloat(newItemQty), // Assume fully received in direct purchase
            finalCost: parseFloat(newItemPrice)
        };

        setItems(prev => [...prev, newItem]);
        setNewItemId(''); setNewItemQty(''); setNewItemPrice('');
        // Keep unit if convenient, or reset. Resetting for safety.
        setNewItemUnit('');
    };

    const handleRemoveItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        return items.reduce((acc, item) => acc + (item.quantity * item.cost), 0);
    };

    const handleSubmit = async () => {
        if (items.length === 0) {
            alert("Keranjang belanja masih kosong!");
            return;
        }
        if (!currentUser || !activeOutlet) return;

        // 1. Create a "Shadow" PO that is immediately fulfilled
        const poId = `DIR-${Date.now().toString().slice(-6)}`;
        const total = calculateTotal();

        const po: PurchaseOrder = {
            id: poId,
            outletId: activeOutlet.id,
            supplierId: 'market-general', // Virtual ID for direct purchase
            supplierName: supplierName,
            items: items,
            totalEstimated: total,
            status: 'received', // Skip to received
            orderDate: new Date().toISOString(),
            receivedDate: new Date().toISOString(),
            createdBy: currentUser.name,
            createdById: currentUser.id,
            receivedBy: currentUser.name,
            paymentStatus: 'paid', // Direct purchase implies immediate payment
            paymentMethod: 'cash',
            isB2B: false
        };

        await createPurchaseOrder(po);

        // 2. Trigger "Receive" Logic to update stock and log cash flow
        // The context's receivePurchaseOrder handles stock updates. 
        // We might need to handle cash flow explicitly if receivePurchaseOrder doesn't auto-deduct for 'cash' payment method yet, 
        // but assuming the global logic handles it or we'll add a note.
        // For this specific feature, we call receive directly.
        
        await receivePurchaseOrder(poId, items, {
            method: 'cash',
            // In a real app, we'd pass the specific fund source (Petty Cash vs Register)
        });

        alert("Belanja berhasil dicatat! Stok bertambah & Kas berkurang.");
        onSuccess();
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-white">Belanja Langsung</h2>
                    <p className="text-sm text-gray-400">Input belanja pasar tanpa PO.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT: INPUT FORM */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Settings Card */}
                    <GlassPanel className="p-6 rounded-3xl border border-teal-500/20 bg-teal-900/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-teal-300 uppercase tracking-wider mb-2 block">Lokasi Belanja / Supplier</label>
                                <div className="relative">
                                    <Store className="absolute left-3 top-3 text-teal-500" size={18} />
                                    <input 
                                        type="text" 
                                        className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-teal-500"
                                        value={supplierName}
                                        onChange={e => setSupplierName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-teal-300 uppercase tracking-wider mb-2 block">Sumber Dana</label>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setFundSource('Petty Cash')}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all flex items-center justify-center gap-2 ${fundSource === 'Petty Cash' ? 'bg-teal-600 text-white border-teal-500 shadow-lg' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}
                                    >
                                        <Banknote size={16} /> Kas Kecil
                                    </button>
                                    <button 
                                        onClick={() => setFundSource('Kasir')}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all flex items-center justify-center gap-2 ${fundSource === 'Kasir' ? 'bg-teal-600 text-white border-teal-500 shadow-lg' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}
                                    >
                                        <CreditCard size={16} /> Kasir
                                    </button>
                                </div>
                            </div>
                        </div>
                    </GlassPanel>

                    {/* Item Input */}
                    <div className="glass-panel p-6 rounded-3xl">
                        <h4 className="text-sm font-bold text-white mb-4">Input Barang Belanjaan</h4>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4 items-end">
                            <div className="md:col-span-5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Nama Bahan</label>
                                <Combobox 
                                    options={ingredientOptions} 
                                    value={newItemId} 
                                    onChange={(val) => {
                                        setNewItemId(val);
                                        const ing = ingredients.find(i => i.id === val);
                                        if(ing) setNewItemUnit(ing.unit);
                                    }}
                                    placeholder="Pilih bahan..."
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Jumlah</label>
                                <input type="number" className="w-full glass-input rounded-xl p-2.5 text-sm" placeholder="Qty" value={newItemQty} onChange={e => setNewItemQty(e.target.value)} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Satuan</label>
                                <select className="w-full glass-input rounded-xl p-2.5 text-sm appearance-none" value={newItemUnit} onChange={e => setNewItemUnit(e.target.value as UnitType)}>
                                    <option value="">Unit...</option>
                                    {newItemId ? getCompatibleUnits(ingredients.find(i => i.id === newItemId)?.unit || UnitType.KG).map(u => <option key={u} value={u} className="bg-gray-900">{u}</option>) : Object.values(UnitType).map(u => <option key={u} value={u} className="bg-gray-900">{u}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-3">
                                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Harga Total / Satuan</label>
                                <input type="number" className="w-full glass-input rounded-xl p-2.5 text-sm" placeholder="Rp per unit" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} />
                            </div>
                        </div>
                        <button 
                            onClick={handleAddItem}
                            disabled={!newItemId || !newItemQty || !newItemPrice}
                            className="w-full py-3 bg-white/10 hover:bg-teal-600 text-gray-300 hover:text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus size={18} /> Masukkan ke Keranjang
                        </button>
                    </div>
                </div>

                {/* RIGHT: CART & SUMMARY */}
                <div className="space-y-6">
                    <GlassPanel className="p-6 rounded-3xl h-full flex flex-col border-l-4 border-l-teal-500">
                        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                            <h3 className="font-bold text-white text-lg">Keranjang</h3>
                            <span className="text-xs bg-teal-500/20 text-teal-400 px-2 py-1 rounded font-bold">{items.length} Item</span>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 max-h-[400px]">
                            {items.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                                    <p className="text-sm">Belum ada barang.</p>
                                </div>
                            ) : (
                                items.map((item, idx) => (
                                    <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center group">
                                        <div>
                                            <p className="font-bold text-white text-sm">{item.ingredientName}</p>
                                            <p className="text-xs text-gray-400">{item.quantity} {item.unit} x <CompactNumber value={item.cost} /></p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <p className="font-bold text-white text-sm"><CompactNumber value={item.quantity * item.cost} /></p>
                                            <button onClick={() => handleRemoveItem(idx)} className="text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/10 space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-gray-400 font-bold text-sm">Total Belanja</span>
                                <span className="text-3xl font-bold text-teal-400"><CompactNumber value={calculateTotal()} /></span>
                            </div>
                            
                            <button className="w-full py-3 border border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-white/50 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all">
                                <Camera size={16} /> Upload Foto Struk
                            </button>

                            <button 
                                onClick={handleSubmit}
                                disabled={items.length === 0}
                                className="w-full py-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save size={20} /> Selesaikan Belanja
                            </button>
                        </div>
                    </GlassPanel>
                </div>
            </div>
        </div>
    );
};

export default DirectPurchase;