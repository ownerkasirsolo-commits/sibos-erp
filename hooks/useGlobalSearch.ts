
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import {
    PieChart, ShoppingCart, CalendarDays, Ticket, ChefHat, MonitorPlay, Tv, Box,
    Warehouse, Calculator, Users, Globe, UserCog
} from 'lucide-react';

// Re-define menu items here or import from a shared constants file
const analyticsItem = { id: 'dashboard', label: 'Analitik', icon: PieChart };
const menuGroups = [
    { label: 'Front Office', items: [ { id: 'pos', label: 'Point of Sales', icon: ShoppingCart }, { id: 'reservations', label: 'Reservasi Meja', icon: CalendarDays }, { id: 'queue', label: 'Antrian (Queue)', icon: Ticket } ] },
    { label: 'Display & Dapur', items: [ { id: 'kds', label: 'Kitchen Display', icon: ChefHat }, { id: 'cds', label: 'Customer Display', icon: MonitorPlay }, { id: 'signage', label: 'Digital Signage', icon: Tv } ] },
    { label: 'Produk & Gudang', items: [ { id: 'products', label: 'Menu & Produk', icon: Box }, { id: 'irm', label: 'Stok & Bahan (IRM)', icon: Warehouse } ] },
    { label: 'Manajemen', items: [ { id: 'accounting', label: 'Akuntansi', icon: Calculator }, { id: 'crm', label: 'Pelanggan (CRM)', icon: Users }, { id: 'omnichannel', label: 'Omnichannel', icon: Globe }, { id: 'hrm', label: 'Pegawai (HRM)', icon: UserCog } ] }
];
const allMenuItems = [analyticsItem, ...menuGroups.flatMap(group => group.items)];

// FIX: Export SearchResultItem type so it can be imported by other components.
export type SearchResultItem = {
    type: 'page' | 'product' | 'ingredient' | 'customer' | 'order';
    id: string;
    label: string;
    description: string;
    icon: React.ElementType;
};

export const useGlobalSearch = (onSmartNavigate: (view: string, searchTerm?: string) => void) => {
    const { products, ingredients, customers, transactions } = useGlobalContext();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Keyboard Shortcut for Search (Ctrl/Cmd + K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(prev => !prev);
            }
            if (e.key === 'Escape' && isSearchOpen) {
                setIsSearchOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSearchOpen]);

    // Focus input when search opens
    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
        if (!isSearchOpen) {
            setSearchQuery('');
        }
    }, [isSearchOpen]);
    
    const searchResults = useMemo(() => {
        if (!searchQuery) return [];
        
        const lowerQuery = searchQuery.toLowerCase();
        
        const pages = allMenuItems
          .filter(item => item.label.toLowerCase().includes(lowerQuery))
          .map(item => ({ type: 'page' as const, id: item.id, label: item.label, description: "Navigasi ke Halaman", icon: item.icon }));
        
        const foundProducts = products
          .filter(p => p.name.toLowerCase().includes(lowerQuery))
          .map(p => ({ type: 'product' as const, id: p.id, label: p.name, description: `Produk • ${p.category}`, icon: Box }));
        
        const foundIngredients = ingredients
          .filter(i => i.name.toLowerCase().includes(lowerQuery))
          .map(i => ({ type: 'ingredient' as const, id: i.id, label: i.name, description: `Bahan Baku • ${i.category}`, icon: Warehouse }));
        
        const foundCustomers = customers
          .filter(c => c.name.toLowerCase().includes(lowerQuery))
          .map(c => ({ type: 'customer' as const, id: c.id, label: c.name, description: `Pelanggan • ${c.phone}`, icon: Users }));

        return [...pages, ...foundProducts, ...foundIngredients, ...foundCustomers];
    }, [searchQuery, allMenuItems, products, ingredients, customers]);


    const handleResultClick = (item: SearchResultItem) => {
        switch (item.type) {
            case 'page':
                onSmartNavigate(item.id);
                break;
            case 'product':
                onSmartNavigate('products', item.label);
                break;
            case 'ingredient':
                onSmartNavigate('irm', item.label);
                break;
            case 'customer':
                onSmartNavigate('crm', item.label);
                break;
            default:
                onSmartNavigate('dashboard');
        }
        setIsSearchOpen(false);
    };

    return {
        isSearchOpen,
        setIsSearchOpen,
        searchQuery,
        setSearchQuery,
        searchInputRef,
        searchResults,
        hasResults: searchResults.length > 0,
        handleResultClick
    };
};
