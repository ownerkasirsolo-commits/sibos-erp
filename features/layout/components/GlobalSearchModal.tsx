import React from 'react';
import { Search, Command } from 'lucide-react';
import { useGlobalSearch, SearchResultItem } from '../hooks/useGlobalSearch';

interface GlobalSearchModalProps {
    isSearchOpen: boolean;
    setIsSearchOpen: (state: boolean) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    searchInputRef: React.RefObject<HTMLInputElement>;
    searchResults: SearchResultItem[];
    hasResults: boolean;
    handleSearchResultClick: (item: SearchResultItem) => void;
}

const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
    isSearchOpen, setIsSearchOpen, searchQuery, setSearchQuery, searchInputRef,
    searchResults, hasResults, handleSearchResultClick
}) => {
    if (!isSearchOpen) return null;

    const groupedResults = searchResults.reduce((acc, item) => {
        const key = item.type;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(item);
        return acc;
    }, {} as Record<string, SearchResultItem[]>);

    const groupOrder: (keyof typeof groupedResults)[] = ['page', 'product', 'ingredient', 'customer', 'order'];
    const groupHeaders = {
        page: "Navigasi",
        product: "Menu & Produk",
        ingredient: "Bahan Baku",
        customer: "Pelanggan",
        order: "Transaksi"
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in" onClick={() => setIsSearchOpen(false)}></div>
            <div className="w-full max-w-3xl bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[70vh]">
                <div className="p-4 border-b border-white/5 flex items-center gap-4">
                    <Search className="text-orange-500" size={24} />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Cari menu, pelanggan, transaksi, atau halaman..."
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-lg font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-mono bg-white/5 px-2 py-1 rounded">ESC</span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20">
                    {!searchQuery && (
                        <div className="p-12 text-center text-gray-500">
                            <Command size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-medium">Cari apa saja di SIBOS</p>
                        </div>
                    )}
                    {searchQuery && !hasResults && (
                        <div className="p-12 text-center text-gray-500">
                            <Search size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="text-lg">Tidak ditemukan hasil untuk "{searchQuery}"</p>
                        </div>
                    )}
                    {hasResults && (
                        <div className="p-4 space-y-4">
                            {groupOrder.map(groupKey => {
                                const items = groupedResults[groupKey];
                                if (!items || items.length === 0) return null;
                                const Icon = items[0].icon;
                                return (
                                    <div key={groupKey}>
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2 flex items-center gap-2">
                                            <Icon size={12}/> {groupHeaders[groupKey as keyof typeof groupHeaders]}
                                        </h4>
                                        <div className="space-y-1">
                                            {items.map(item => (
                                                <button 
                                                    key={item.id} 
                                                    onClick={() => handleSearchResultClick(item)} 
                                                    className="w-full text-left flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 hover:bg-orange-500/10 border border-white/5 hover:border-orange-500/30 text-gray-300 hover:text-white transition-all group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                      <item.icon size={16} className="text-gray-500 group-hover:text-orange-500" />
                                                      <span className="font-medium text-sm">{item.label}</span>
                                                    </div>
                                                    <span className="text-xs text-gray-500">{item.description}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
                <div className="p-3 bg-black/40 border-t border-white/5 text-[10px] text-gray-500 flex justify-between px-6">
                    <span>Pro Tip: Gunakan <strong>Cmd + K</strong> untuk membuka search kapan saja.</span>
                </div>
            </div>
        </div>
    );
};

export default GlobalSearchModal;