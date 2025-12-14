
import React, { useState, useEffect } from 'react';
import { UnitType } from '../../../../types';
import { Ingredient } from '../../types';
import { RecipeItem } from '../../../products/types';
import Modal from '../../../../components/common/Modal';
import GlassInput from '../../../../components/common/GlassInput';
import GlassPanel from '../../../../components/common/GlassPanel';
import Combobox from '../../../../components/common/Combobox';
import { Save, FlaskConical, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useGlobalContext } from '../../../../context/GlobalContext';
import { getCompatibleUnits } from '../../../../utils/unitConversion';

interface AddIngredientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<Ingredient, 'id' | 'lastUpdated'>) => void;
    activeOutletId: string;
    initialData?: Ingredient | null;
}

const AddIngredientModal: React.FC<AddIngredientModalProps> = ({ isOpen, onClose, onSave, activeOutletId, initialData }) => {
    const { ingredients } = useGlobalContext();
    
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [stock, setStock] = useState<number | ''>('');
    const [unit, setUnit] = useState<UnitType>(UnitType.KG);
    const [minStock, setMinStock] = useState<number | ''>(5);
    const [avgCost, setAvgCost] = useState<number | ''>('');
    const [sku, setSku] = useState('');
    
    // Sub-Recipe State
    const [type, setType] = useState<'raw' | 'semi_finished'>('raw');
    const [recipe, setRecipe] = useState<RecipeItem[]>([]);
    
    // Recipe Builder State
    const [newRecId, setNewRecId] = useState('');
    const [newRecQty, setNewRecQty] = useState('');
    const [newRecUnit, setNewRecUnit] = useState<UnitType | ''>('');

    // Populate form when initialData changes
    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setCategory(initialData.category);
            setStock(initialData.stock);
            setUnit(initialData.unit);
            setMinStock(initialData.minStock);
            setAvgCost(initialData.avgCost);
            setSku(initialData.sku);
            setType(initialData.type || 'raw');
            // @ts-ignore
            setRecipe(initialData.recipe || []);
        } else {
            // Reset for new entry
            setName('');
            setCategory('');
            setStock('');
            setUnit(UnitType.KG);
            setMinStock(5);
            setAvgCost('');
            setSku('');
            setType('raw');
            setRecipe([]);
        }
    }, [initialData, isOpen]);

    const handleAddRecipeItem = () => {
        if(!newRecId || !newRecQty || !newRecUnit) return;
        const newItem: RecipeItem = {
            ingredientId: newRecId,
            quantity: parseFloat(newRecQty),
            unit: newRecUnit as UnitType
        };
        setRecipe([...recipe, newItem]);
        setNewRecId(''); setNewRecQty(''); setNewRecUnit('');
    };

    const handleRemoveRecipeItem = (index: number) => {
        setRecipe(recipe.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || stock === '' || avgCost === '') return;

        onSave({
            outletId: activeOutletId,
            name,
            sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
            category: category || 'Umum',
            stock: Number(stock),
            unit,
            minStock: Number(minStock),
            avgCost: Number(avgCost),
            supplierId: initialData?.supplierId || 's1',
            type,
            recipe: type === 'semi_finished' ? recipe : undefined
        });
        
        onClose();
    };

    const ingredientOptions = ingredients
        .filter(i => i.id !== initialData?.id) // Prevent self-reference
        .map(i => ({ value: i.id, label: i.name, group: i.category }));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Bahan Baku" : "Tambah Bahan Baku Baru"} size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Nama Bahan</label>
                        <GlassInput 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            placeholder="Contoh: Beras Premium"
                            autoFocus
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Kategori</label>
                        <GlassInput 
                            value={category} 
                            onChange={e => setCategory(e.target.value)} 
                            placeholder="Contoh: Sembako"
                        />
                    </div>
                    
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">SKU (Opsional)</label>
                        <GlassInput 
                            value={sku} 
                            onChange={e => setSku(e.target.value)} 
                            placeholder="Auto-generated"
                        />
                    </div>
                </div>

                {/* Metrics */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Stok Saat Ini</label>
                        <input 
                            type="number" 
                            className="w-full glass-input rounded-lg p-2.5 text-white"
                            value={stock}
                            onChange={e => setStock(parseFloat(e.target.value))}
                            required
                            disabled={type === 'semi_finished'} // Auto calc for semi-finished usually, but manual override allowed for opening stock
                        />
                         {type === 'semi_finished' && <p className="text-[9px] text-gray-500 mt-1 italic">*Stok akan bertambah otomatis dari menu Produksi</p>}
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Satuan</label>
                        <select 
                            className="w-full glass-input rounded-lg p-2.5 text-white appearance-none cursor-pointer"
                            value={unit}
                            onChange={e => setUnit(e.target.value as UnitType)}
                        >
                            {Object.values(UnitType).map(u => (
                                <option key={u} value={u} className="bg-gray-900">{u}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Min. Stok (Alert)</label>
                        <input 
                            type="number" 
                            className="w-full glass-input rounded-lg p-2.5 text-white"
                            value={minStock}
                            onChange={e => setMinStock(parseFloat(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Harga Rata2 / Unit</label>
                        <input 
                            type="number" 
                            className="w-full glass-input rounded-lg p-2.5 text-white"
                            value={avgCost}
                            onChange={e => setAvgCost(parseFloat(e.target.value))}
                            required
                             disabled={type === 'semi_finished'} // Auto calc
                        />
                        {type === 'semi_finished' && <p className="text-[9px] text-gray-500 mt-1 italic">*Otomatis dari HPP resep</p>}
                    </div>
                </div>

                {/* Sub-Recipe Configuration */}
                <div className="border-t border-white/10 pt-4">
                     <div className="flex items-center justify-between mb-4">
                        <div>
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                <FlaskConical size={16} className="text-orange-500" /> Tipe Bahan
                            </h4>
                            <p className="text-xs text-gray-400">Apakah bahan ini diproduksi sendiri?</p>
                        </div>
                        <div className="flex bg-black/40 p-1 rounded-lg">
                            <button 
                                type="button" 
                                onClick={() => setType('raw')}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${type === 'raw' ? 'bg-white/10 text-white' : 'text-gray-400'}`}
                            >
                                Beli Jadi (Raw)
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setType('semi_finished')}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${type === 'semi_finished' ? 'bg-orange-600 text-white' : 'text-gray-400'}`}
                            >
                                Olahan (Semi)
                            </button>
                        </div>
                     </div>

                     {type === 'semi_finished' && (
                         <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                             <div className="glass-panel p-4 rounded-xl bg-black/20">
                                 <p className="text-xs text-gray-400 mb-3">Definisikan komposisi untuk membuat <b>1 {unit} {name || 'Item Ini'}</b></p>
                                 
                                 {/* Add Form */}
                                 <div className="flex gap-2 items-end mb-3">
                                     <div className="flex-1">
                                         <label className="text-[10px] text-gray-500 font-bold mb-1 block">Pilih Bahan Baku</label>
                                         <Combobox 
                                            options={ingredientOptions} 
                                            value={newRecId}
                                            onChange={(val) => {
                                                setNewRecId(val);
                                                const ing = ingredients.find(i => i.id === val);
                                                if(ing) setNewRecUnit(ing.unit);
                                            }}
                                            placeholder="Cari..."
                                         />
                                     </div>
                                     <div className="w-20">
                                         <label className="text-[10px] text-gray-500 font-bold mb-1 block">Jml</label>
                                         <input type="number" className="w-full glass-input rounded-lg p-2 text-sm text-center" value={newRecQty} onChange={e => setNewRecQty(e.target.value)} />
                                     </div>
                                     <div className="w-24">
                                          <label className="text-[10px] text-gray-500 font-bold mb-1 block">Satuan</label>
                                          <select className="w-full glass-input rounded-lg p-2 text-sm" value={newRecUnit} onChange={e => setNewRecUnit(e.target.value as any)}>
                                              {newRecId && getCompatibleUnits(ingredients.find(i => i.id === newRecId)?.unit || UnitType.KG).map(u => <option key={u} value={u} className="bg-gray-900">{u}</option>)}
                                          </select>
                                     </div>
                                     <button type="button" onClick={handleAddRecipeItem} className="h-9 w-9 bg-green-600 hover:bg-green-500 text-white rounded-lg flex items-center justify-center"><Plus size={18}/></button>
                                 </div>

                                 {/* List */}
                                 <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                     {recipe.map((item, idx) => {
                                         const ing = ingredients.find(i => i.id === item.ingredientId);
                                         return (
                                             <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-white/5 border border-white/5">
                                                 <span className="text-sm font-bold text-gray-200">{ing?.name}</span>
                                                 <div className="flex items-center gap-3">
                                                     <span className="text-xs text-gray-400">{item.quantity} {item.unit}</span>
                                                     <button type="button" onClick={() => handleRemoveRecipeItem(idx)} className="text-red-400 hover:text-white"><Trash2 size={14}/></button>
                                                 </div>
                                             </div>
                                         )
                                     })}
                                     {recipe.length === 0 && <p className="text-center text-xs text-gray-500 py-4 italic">Belum ada bahan.</p>}
                                 </div>
                             </div>
                         </div>
                     )}
                </div>

                <div className="pt-2 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 text-sm font-bold transition-colors">Batal</button>
                    <button type="submit" className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl shadow-lg font-bold flex items-center gap-2 transition-colors">
                        <Save size={18} /> {initialData ? 'Update Data' : 'Simpan Data'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddIngredientModal;
