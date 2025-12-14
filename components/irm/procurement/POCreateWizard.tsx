

import React from 'react';
// @FIX: Import PurchaseOrder from its new location in features/irm/types.
import { UnitType } from '../../../types';
import { PurchaseOrder } from '../../../features/irm/types';
import { ChevronLeft, ChevronUp, Plus, X, Trash2, CheckCircle2 } from 'lucide-react';
import { usePOCreateLogic } from '../../../hooks/useProcurementLogic';
import { formatCompactNumber } from '../../../utils/formatters';
import { getCompatibleUnits } from '../../../utils/unitConversion';

interface POCreateWizardProps {
    onBack: () => void;
    onSuccess: () => void;
    initialPo?: PurchaseOrder | null;
}

const POCreateWizard: React.FC<POCreateWizardProps> = ({ onBack, onSuccess, initialPo }) => {
    const {
        currentUser,
        ingredients,
        poWizardStep, setPoWizardStep,
        poSupplierId,
        poItems, setPoItems,
        supplierSearchTerm, setSupplierSearchTerm,
        isQuickAddSupplierOpen, setIsQuickAddSupplierOpen,
        quickSupName, setQuickSupName,
        newItemId, setNewItemId,
        newItemQty, setNewItemQty,
        newItemUnit, setNewItemUnit,
        newItemCost, setNewItemCost,
        isQuickAddingIng, setIsQuickAddingIng,
        quickIngName, setQuickIngName,
        quickIngUnit, setQuickIngUnit,
        filteredSuppliers,
        totalEstimated,
        handleSelectSupplier,
        handleSaveQuickSupplier,
        handleAddItemToPO,
        handleSaveQuickIngredient,
        handleSubmitPO
    } = usePOCreateLogic(initialPo, onSuccess);

    return (
        <div className="glass-panel p-6 rounded-3xl border border-orange-500/30 min-h-[500px] flex flex-col">
            {/* Wizard Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <button onClick={() => { if(poWizardStep > 1) setPoWizardStep((prev) => prev - 1 as any); else onBack(); }} className="p-2 rounded-lg bg-white/5 hover:bg-white/10"><ChevronLeft/></button>
                    <div>
                        <h3 className="text-xl font-bold text-white">{initialPo ? 'Edit PO' : 'Buat PO Baru'}</h3>
                        <p className="text-xs text-gray-400">Dibuat oleh: <span className="text-white font-bold">{currentUser?.name}</span></p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3].map(step => (
                        <div key={step} className={`w-3 h-3 rounded-full ${poWizardStep >= step ? 'bg-orange-500' : 'bg-gray-700'}`}></div>
                    ))}
                </div>
            </div>

            {/* STEP 1: PILIH SUPPLIER */}
            {poWizardStep === 1 && (
                <div className="flex-1 animate-in fade-in slide-in-from-right-4">
                    <h4 className="text-lg font-bold text-white mb-4">Pilih Supplier</h4>
                    <input 
                        type="text" 
                        className="w-full glass-input rounded-xl p-4 text-white text-lg mb-4 focus:border-orange-500"
                        placeholder="Cari nama supplier..."
                        value={supplierSearchTerm}
                        onChange={(e) => setSupplierSearchTerm(e.target.value)}
                        autoFocus
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {filteredSuppliers.map(s => (
                            <div key={s.id} onClick={() => handleSelectSupplier(s)} className="p-4 rounded-xl bg-white/5 hover:bg-orange-600/20 hover:border-orange-500 border border-white/5 cursor-pointer transition-all flex justify-between items-center group">
                                <div>
                                    <h5 className="font-bold text-white group-hover:text-orange-400">{s.name}</h5>
                                    <p className="text-xs text-gray-400">{s.category}</p>
                                </div>
                                <ChevronUp className="rotate-90 text-gray-500 group-hover:text-orange-500"/>
                            </div>
                        ))}
                        {filteredSuppliers.length === 0 && (
                            <div className="col-span-full text-center py-8">
                                <p className="text-gray-500 mb-4">Supplier tidak ditemukan.</p>
                                <button onClick={() => { setIsQuickAddSupplierOpen(true); setQuickSupName(supplierSearchTerm); }} className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-bold">Tambah Supplier Baru</button>
                            </div>
                        )}
                    </div>
                    {/* Quick Add Supplier Modal Overlay */}
                    {isQuickAddSupplierOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsQuickAddSupplierOpen(false)} />
                            <div className="glass-panel w-full max-w-sm p-6 rounded-3xl relative z-10 animate-in zoom-in-95">
                                <h3 className="text-lg font-bold text-white mb-4">Supplier Baru</h3>
                                <input type="text" className="w-full glass-input rounded-xl p-3 mb-4" value={quickSupName} onChange={e => setQuickSupName(e.target.value)} placeholder="Nama Supplier" autoFocus />
                                <button onClick={handleSaveQuickSupplier} className="w-full py-3 bg-orange-600 font-bold rounded-xl text-white">Simpan</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* STEP 2: PILIH BARANG */}
            {poWizardStep === 2 && (
                <div className="flex-1 animate-in fade-in slide-in-from-right-4 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-bold text-white">Input Barang <span className="text-gray-500 text-sm font-normal">({poItems.length} item)</span></h4>
                        <span className="text-orange-400 font-bold text-sm bg-orange-500/10 px-3 py-1 rounded-lg border border-orange-500/20">{supplierSearchTerm}</span>
                    </div>
                    
                    {/* Input Form */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 mb-4 relative">
                        {isQuickAddingIng ? (
                            <div className="animate-in zoom-in-95">
                                <div className="flex justify-between mb-2">
                                    <h5 className="text-sm font-bold text-orange-400">Tambah Bahan Baru</h5>
                                    <button onClick={() => setIsQuickAddingIng(false)}><X size={16}/></button>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <input type="text" placeholder="Nama Bahan" className="glass-input rounded-lg p-2 text-sm" value={quickIngName} onChange={e => setQuickIngName(e.target.value)} autoFocus />
                                    <select className="glass-input rounded-lg p-2 text-sm" value={quickIngUnit} onChange={e => setQuickIngUnit(e.target.value as any)}>
                                        {Object.values(UnitType).map(u => <option key={u} value={u} className="bg-gray-900">{u}</option>)}
                                    </select>
                                </div>
                                <input type="number" placeholder="Harga Estimasi" className="glass-input rounded-lg p-2 text-sm w-full mb-3" value={newItemCost} onChange={e => setNewItemCost(e.target.value)} />
                                <button onClick={handleSaveQuickIngredient} className="w-full bg-green-600 hover:bg-green-500 text-white rounded-lg py-2 text-sm font-bold">Simpan Bahan</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3">
                                <div className="md:col-span-4">
                                    <select className="w-full glass-input rounded-lg p-2.5 text-sm cursor-pointer" value={newItemId} onChange={e => {
                                        if (e.target.value === 'ADD_NEW') { setIsQuickAddingIng(true); return; }
                                        setNewItemId(e.target.value);
                                    }}>
                                        <option value="">Pilih Bahan...</option>
                                        <optgroup label="Langganan (Pernah Diorder)">
                                            {ingredients.filter(i => i.supplierId === poSupplierId).map(i => <option key={i.id} value={i.id} className="bg-gray-900">{i.name}</option>)}
                                        </optgroup>
                                        <optgroup label="Bahan Lain">
                                            {ingredients.filter(i => i.supplierId !== poSupplierId).map(i => <option key={i.id} value={i.id} className="bg-gray-900">{i.name}</option>)}
                                        </optgroup>
                                        <option value="ADD_NEW" className="bg-orange-900 text-orange-200 font-bold">+ Tambah Bahan Baru</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2"><input type="number" placeholder="Qty" className="w-full glass-input rounded-lg p-2.5 text-sm" value={newItemQty} onChange={e => setNewItemQty(e.target.value)} /></div>
                                <div className="md:col-span-2">
                                    <select className="w-full glass-input rounded-lg p-2.5 text-sm" value={newItemUnit} onChange={e => setNewItemUnit(e.target.value as any)}>
                                        <option value="">Unit...</option>
                                        {getCompatibleUnits(newItemUnit as any || UnitType.PCS).map(u => <option key={u} value={u} className="bg-gray-900">{u}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-3"><input type="number" placeholder="Harga Satuan" className="w-full glass-input rounded-lg p-2.5 text-sm" value={newItemCost} onChange={e => setNewItemCost(e.target.value)} /></div>
                                <div className="md:col-span-1"><button onClick={handleAddItemToPO} disabled={!newItemId} className="w-full h-10 bg-white/10 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors"><Plus size={20}/></button></div>
                            </div>
                        )}
                    </div>

                    {/* Items List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 mb-4 bg-black/20 rounded-xl p-2">
                        {poItems.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">Belum ada barang dipilih.</div>
                        ) : (
                            poItems.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                                    <div><p className="font-bold text-white text-sm">{item.ingredientName}</p><p className="text-xs text-gray-500">{item.quantity} {item.unit} x {formatCompactNumber(item.cost)}</p></div>
                                    <div className="flex items-center gap-4"><p className="font-mono text-white font-bold">{formatCompactNumber(item.quantity * item.cost)}</p><button onClick={() => setPoItems(poItems.filter((_, i) => i !== idx))}><Trash2 size={16} className="text-red-400 hover:text-red-300"/></button></div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    <div className="flex justify-end pt-4 border-t border-white/10">
                        <div className="flex gap-3 w-full md:w-auto">
                            <button onClick={() => setPoWizardStep(1)} className="flex-1 md:flex-none px-6 py-3 rounded-xl border border-white/10 text-gray-400">Kembali</button>
                            <button onClick={() => setPoWizardStep(3)} disabled={poItems.length === 0} className="flex-1 md:flex-none px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl disabled:opacity-50">Lanjut</button>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 3: REVIEW & CONFIRM */}
            {poWizardStep === 3 && (
                <div className="flex-1 animate-in fade-in slide-in-from-right-4 flex flex-col">
                    <h4 className="text-lg font-bold text-white mb-4">Review Pesanan</h4>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-6 space-y-4">
                        <div className="flex justify-between border-b border-white/10 pb-4">
                            <span className="text-gray-400">Supplier</span>
                            <span className="font-bold text-white text-lg">{supplierSearchTerm}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/10 pb-4">
                            <span className="text-gray-400">Total Item</span>
                            <span className="font-bold text-white">{poItems.length} Jenis</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Total Estimasi</span>
                            <span className="font-bold text-orange-500 text-3xl">Rp {totalEstimated.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-auto">
                        <button onClick={() => setPoWizardStep(2)} className="px-6 py-3 rounded-xl border border-white/10 text-gray-400">Kembali</button>
                        <button onClick={() => handleSubmitPO('draft')} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/10">Draft</button>
                        <button onClick={() => handleSubmitPO('ordered')} className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2">
                            <CheckCircle2 size={20} /> Proses
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default POCreateWizard;