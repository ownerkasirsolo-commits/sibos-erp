
import React, { useState, useMemo } from 'react';
import { Search, Globe, Plus, Check, DollarSign, Package } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import GlassInput from '../../../../components/common/GlassInput';
import { MOCK_GLOBAL_PRODUCTS } from '../../../../constants';
import { Product } from '../../types';
import { BusinessType, UnitType } from '../../../../types';

interface ImportGlobalProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (product: Product) => void;
    activeBusinessType: BusinessType;
}

const ImportGlobalProductModal: React.FC<ImportGlobalProductModalProps> = ({ 
    isOpen, onClose, onImport, activeBusinessType 
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGlobalItem, setSelectedGlobalItem] = useState<any | null>(null);
    const [buyPrice, setBuyPrice] = useState('');
    const [initialStock, setInitialStock] = useState('');
    const [sellPrice, setSellPrice] = useState('');

    const filteredItems = useMemo(() => {
        if (!searchQuery) return MOCK_GLOBAL_PRODUCTS.slice(0, 5); // Default show 5
        return MOCK_GLOBAL_PRODUCTS.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.sku.includes(searchQuery)
        );
    }, [searchQuery]);

    const handleSelect = (item: any) => {
        setSelectedGlobalItem(item);
        setBuyPrice('');
        setInitialStock('');
        setSellPrice('');
    };

    const handleConfirmImport = () => {
        if (!selectedGlobalItem) return;

        const newProduct: Product = {
            id: `PROD-${Date.now()}`,
            name: selectedGlobalItem.name,
            category: selectedGlobalItem.category,
            image: selectedGlobalItem.image,
            businessType: activeBusinessType,
            sku: selectedGlobalItem.sku,
            barcode: selectedGlobalItem.sku, // Use SKU as barcode default
            unit: selectedGlobalItem.unit,
            price: parseFloat(sellPrice) || 0,
            stock: parseFloat(initialStock) || 0,
            cogs: parseFloat(buyPrice) || 0,
            hasVariants: false,
            variants: [],
            modifierGroups: [],
            hasRecipe: false,
            outletAvailability: 'all',
            outletPricing: {}
        };

        onImport(newProduct);
        onClose();
        // Reset state
        setSelectedGlobalItem(null);
        setSearchQuery('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Import Produk Pabrikan" size="lg">
            <div className="space-y-6 min-h-[400px] flex flex-col">
                
                {/* Search Bar */}
                {!selectedGlobalItem && (
                    <div className="sticky top-0 z-10 bg-[#1e293b] pb-4">
                        <p className="text-sm text-gray-400 mb-4">Cari database produk global (Aqua, Indomie, Rokok, dll) untuk input cepat.</p>
                        <GlassInput 
                            icon={Search}
                            placeholder="Ketik nama produk atau scan barcode..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                )}

                {/* List or Detail Form */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {selectedGlobalItem ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right">
                            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                                <img src={selectedGlobalItem.image} alt={selectedGlobalItem.name} className="w-20 h-20 object-cover rounded-xl bg-white" />
                                <div>
                                    <h4 className="text-lg font-bold text-white">{selectedGlobalItem.name}</h4>
                                    <p className="text-sm text-gray-400">{selectedGlobalItem.category} • {selectedGlobalItem.sku}</p>
                                    <button onClick={() => setSelectedGlobalItem(null)} className="text-xs text-orange-400 font-bold mt-2 hover:underline">Ganti Produk</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Harga Beli (HPP)</label>
                                    <GlassInput 
                                        type="number" 
                                        placeholder="0" 
                                        icon={DollarSign}
                                        value={buyPrice}
                                        onChange={(e) => setBuyPrice(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Harga Jual</label>
                                    <GlassInput 
                                        type="number" 
                                        placeholder="0" 
                                        icon={DollarSign}
                                        value={sellPrice}
                                        onChange={(e) => setSellPrice(e.target.value)}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Stok Awal ({selectedGlobalItem.unit})</label>
                                    <GlassInput 
                                        type="number" 
                                        placeholder="0" 
                                        icon={Package}
                                        value={initialStock}
                                        onChange={(e) => setInitialStock(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredItems.map((item, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => handleSelect(item)}
                                    className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-orange-500/10 border border-white/5 hover:border-orange-500/30 cursor-pointer transition-all group"
                                >
                                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg bg-white shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <h5 className="font-bold text-white group-hover:text-orange-400 transition-colors">{item.name}</h5>
                                        <p className="text-xs text-gray-500">{item.sku}</p>
                                    </div>
                                    <button className="p-2 bg-white/10 rounded-lg text-gray-300 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                        <Plus size={16} />
                                    </button>
                                </div>
                            ))}
                            {filteredItems.length === 0 && (
                                <div className="text-center py-10 text-gray-500">
                                    <Globe size={32} className="mx-auto mb-2 opacity-30"/>
                                    <p>Produk tidak ditemukan di database global.</p>
                                    <p className="text-xs">Silakan input manual.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {selectedGlobalItem && (
                    <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                        <button onClick={() => setSelectedGlobalItem(null)} className="px-6 py-3 rounded-xl border border-white/10 text-gray-400 font-bold text-sm">Batal</button>
                        <button onClick={handleConfirmImport} className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl shadow-lg flex items-center gap-2">
                            <Check size={18} /> Simpan Produk
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ImportGlobalProductModal;
