
import React, { useState } from 'react';
import { ChannelProduct } from '../../types';
import { useGlobalContext } from '../../../../context/GlobalContext';
import { Link, Search, Wand2, ArrowRight, CheckCircle2, AlertCircle, ShoppingBag, Bike } from 'lucide-react';
import GlassPanel from '../../../../components/common/GlassPanel';
import GlassInput from '../../../../components/common/GlassInput';
import CompactNumber from '../../../../components/common/CompactNumber';

interface ProductMappingViewProps {
    unlinkedProducts: ChannelProduct[];
    onLink: (channelProductId: string, masterProductId: string) => void;
    onAutoMap: () => void;
}

const ProductMappingView: React.FC<ProductMappingViewProps> = ({ unlinkedProducts, onLink, onAutoMap }) => {
    const { products } = useGlobalContext();
    const [selectedChannelProd, setSelectedChannelProd] = useState<ChannelProduct | null>(null);
    const [selectedMasterProd, setSelectedMasterProd] = useState<string | null>(null);
    const [channelSearch, setChannelSearch] = useState('');
    const [masterSearch, setMasterSearch] = useState('');

    // Filtering
    const filteredChannelProds = unlinkedProducts.filter(p => 
        p.productName.toLowerCase().includes(channelSearch.toLowerCase())
    );

    const filteredMasterProds = products.filter(p => 
        p.name.toLowerCase().includes(masterSearch.toLowerCase()) || 
        p.category.toLowerCase().includes(masterSearch.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(masterSearch.toLowerCase()))
    );

    const handleConfirmLink = () => {
        if (selectedChannelProd && selectedMasterProd) {
            onLink(selectedChannelProd.id, selectedMasterProd);
            setSelectedChannelProd(null);
            setSelectedMasterProd(null);
        }
    };

    const getPlatformIcon = (id: string) => {
        if (id.includes('food')) return <Bike size={14} />;
        return <ShoppingBag size={14} />;
    };

    const getPlatformColor = (id: string) => {
        if (id.includes('go')) return 'text-green-400 bg-green-500/10 border-green-500/20';
        if (id.includes('grab')) return 'text-green-500 bg-green-600/10 border-green-600/20';
        if (id.includes('shopee')) return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
        if (id.includes('tokopedia')) return 'text-green-400 bg-green-500/10 border-green-500/20';
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    };

    const autoMappableCount = unlinkedProducts.filter(p => p.similarityScore && p.similarityScore > 75).length;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 h-[calc(100vh-200px)] flex flex-col">
            
            {/* Header / Toolbar */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Link size={20} className="text-blue-500" /> Smart Product Mapping
                    </h3>
                    <p className="text-xs text-gray-400">Hubungkan produk dari channel luar ke Database Master agar stok sinkron.</p>
                </div>
                
                {autoMappableCount > 0 && (
                    <button 
                        onClick={onAutoMap}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold shadow-lg shadow-blue-500/20 animate-pulse"
                    >
                        <Wand2 size={16} /> Auto-Link ({autoMappableCount} Item)
                    </button>
                )}
            </div>

            {/* SPLIT VIEW AREA */}
            <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                
                {/* LEFT: CHANNEL PRODUCTS (UNLINKED) */}
                <GlassPanel className="flex flex-col p-0 rounded-2xl overflow-hidden border border-white/5 h-full">
                    <div className="p-4 border-b border-white/5 bg-white/5">
                        <h4 className="text-sm font-bold text-white mb-3 flex justify-between items-center">
                            <span>Inbox Channel</span>
                            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-md border border-red-500/20">{unlinkedProducts.length} Unlinked</span>
                        </h4>
                        <GlassInput 
                            icon={Search}
                            placeholder="Cari produk channel..."
                            value={channelSearch}
                            onChange={e => setChannelSearch(e.target.value)}
                            className="py-2 text-xs"
                        />
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                        {filteredChannelProds.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 text-xs">
                                <CheckCircle2 size={32} className="mx-auto mb-2 opacity-50" />
                                <p>Semua produk sudah terhubung!</p>
                            </div>
                        ) : (
                            filteredChannelProds.map(prod => (
                                <div 
                                    key={prod.id}
                                    onClick={() => {
                                        setSelectedChannelProd(prod);
                                        // Auto-search master if logic suggests
                                        if (prod.suggestedMasterId) setSelectedMasterProd(prod.suggestedMasterId);
                                        else setMasterSearch(prod.productName.split(' ')[0]);
                                    }}
                                    className={`p-3 rounded-xl border cursor-pointer transition-all relative ${
                                        selectedChannelProd?.id === prod.id 
                                        ? 'bg-blue-600/20 border-blue-500' 
                                        : 'bg-white/5 border-transparent hover:bg-white/10'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${getPlatformColor(prod.channelId)}`}>
                                            {getPlatformIcon(prod.channelId)} {prod.channelName}
                                        </div>
                                        {prod.similarityScore && prod.similarityScore > 70 && (
                                            <span className="text-[9px] text-green-400 flex items-center gap-1 font-bold">
                                                <Wand2 size={10} /> {prod.similarityScore}% Match
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm font-bold text-white leading-snug">{prod.productName}</p>
                                    <p className="text-xs text-orange-400 font-mono mt-1"><CompactNumber value={prod.price} /></p>
                                    
                                    {selectedChannelProd?.id === prod.id && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-500 text-white p-1 rounded-full shadow-lg animate-in slide-in-from-left-2">
                                            <ArrowRight size={16} />
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </GlassPanel>

                {/* RIGHT: MASTER DATABASE */}
                <GlassPanel className={`flex flex-col p-0 rounded-2xl overflow-hidden border border-white/5 h-full transition-all ${selectedChannelProd ? 'opacity-100' : 'opacity-60 grayscale'}`}>
                    <div className="p-4 border-b border-white/5 bg-white/5">
                         <h4 className="text-sm font-bold text-white mb-3">Database SIBOS</h4>
                         <GlassInput 
                            icon={Search}
                            placeholder="Cari master produk..."
                            value={masterSearch}
                            onChange={e => setMasterSearch(e.target.value)}
                            className="py-2 text-xs"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                        {filteredMasterProds.map(prod => (
                            <div 
                                key={prod.id}
                                onClick={() => selectedChannelProd && setSelectedMasterProd(prod.id)}
                                className={`p-3 rounded-xl border cursor-pointer transition-all flex gap-3 items-center ${
                                    selectedMasterProd === prod.id 
                                    ? 'bg-green-600/20 border-green-500' 
                                    : 'bg-white/5 border-transparent hover:bg-white/10'
                                }`}
                            >
                                <div className="w-10 h-10 bg-gray-800 rounded-lg overflow-hidden shrink-0 border border-white/10">
                                    <img src={prod.image} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{prod.name}</p>
                                    <div className="flex justify-between items-center mt-0.5">
                                        <span className="text-[10px] text-gray-500">{prod.sku || 'No SKU'}</span>
                                        <span className="text-xs text-orange-400 font-bold"><CompactNumber value={prod.price} /></span>
                                    </div>
                                </div>
                                {selectedMasterProd === prod.id && (
                                    <CheckCircle2 size={20} className="text-green-500" />
                                )}
                            </div>
                        ))}
                    </div>
                </GlassPanel>

                {/* FLOATING ACTION BAR */}
                {selectedChannelProd && selectedMasterProd && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#0f172a] border border-orange-500/30 p-2 pr-4 pl-4 rounded-2xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-6 z-20">
                         <div className="flex items-center gap-4">
                             <div className="text-right">
                                 <p className="text-[9px] text-gray-400 uppercase font-bold">Channel</p>
                                 <p className="text-xs font-bold text-white truncate max-w-[120px]">{selectedChannelProd.productName}</p>
                             </div>
                             <div className="bg-white/10 p-1 rounded-full">
                                <ArrowRight size={14} className="text-gray-400" />
                             </div>
                             <div>
                                 <p className="text-[9px] text-gray-400 uppercase font-bold">Master</p>
                                 <p className="text-xs font-bold text-white truncate max-w-[120px]">
                                     {products.find(p => p.id === selectedMasterProd)?.name}
                                 </p>
                             </div>
                         </div>
                         <button 
                            onClick={handleConfirmLink}
                            className="bg-gradient-to-r from-orange-600 to-red-600 hover:brightness-110 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                            <Link size={14} /> Hubungkan
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ProductMappingView;
