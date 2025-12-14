
import { useState, useEffect, useRef } from 'react';
import { useGlobalContext } from '../../../../context/GlobalContext';
import {
    PieChart, ShoppingCart, CalendarDays, Ticket, ChefHat, MonitorPlay, Tv, Box,
    Warehouse, Calculator, Users, Globe, UserCog, Laptop, MapPin
} from 'lucide-react';

// Re-define menu items here or import from a shared constants file
const analyticsItem = { id: 'dashboard', label: 'Analitik', icon: PieChart };
const menuGroups = [
    { label: 'Front Office', items: [ { id: 'pos', label: 'Point of Sales', icon: ShoppingCart }, { id: 'reservations', label: 'Reservasi Meja', icon: CalendarDays }, { id: 'queue', label: 'Antrian (Queue)', icon: Ticket } ] },
    { label: 'Display & Dapur', items: [ { id: 'kds', label: 'Kitchen Display', icon: ChefHat }, { id: 'cds', label: 'Customer Display', icon: MonitorPlay }, { id: 'signage', label: 'Digital Signage', icon: Tv } ] },
    { label: 'Produk & Gudang', items: [ { id: 'products', label: 'Menu & Produk', icon: Box }, { id: 'irm', label: 'Stok & Bahan (IRM)', icon: Warehouse } ] },
    { label: 'Manajemen', items: [ { id: 'accounting', label: 'Akuntansi', icon: Calculator }, { id: 'crm', label: 'Pelanggan (CRM)', icon: Users }, { id: 'hrm', label: 'Pegawai (HRM)', icon: UserCog } ] },
    { label: 'Ekspansi', items: [ { id: 'website', label: 'Website Usaha', icon: Laptop }, { id: 'google', label: 'Google Business', icon: MapPin } ] }
];
const allMenuItems = [analyticsItem, ...menuGroups.flatMap(group => group.items)];


export const useGlobalSearch = (onNavigate: (view: string) => void) => {
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
    
    const getSearchResults = () => {
        if (!searchQuery) return { pages: [], products: [], ingredients: [], customers: [], orders: [] };
        
        const lowerQuery = searchQuery.toLowerCase();
        
        const pages = allMenuItems.filter(item => item.label.toLowerCase().includes(lowerQuery));
        const foundProducts = products.filter(p => p.name.toLowerCase().includes(lowerQuery) || p.category.toLowerCase().includes(lowerQuery) || p.sku?.toLowerCase().includes(lowerQuery));
        const foundIngredients = ingredients.filter(i => i.name.toLowerCase().includes(lowerQuery) || i.sku.toLowerCase().includes(lowerQuery));
        const foundCustomers = customers.filter(c => c.name.toLowerCase().includes(lowerQuery) || c.phone.includes(lowerQuery));
        const foundOrders = transactions.filter(t => t.id.toLowerCase().includes(lowerQuery) || t.customerName?.toLowerCase().includes(lowerQuery));

        return { pages, products: foundProducts, ingredients: foundIngredients, customers: foundCustomers, orders: foundOrders };
    };

    const searchResults = getSearchResults();
    const hasResults = Object.values(searchResults).some(arr => arr.length > 0);

    const handleSearchResultClick = (view: string) => {
        onNavigate(view);
        setIsSearchOpen(false);
    };

    return {
        isSearchOpen,
        setIsSearchOpen,
        searchQuery,
        setSearchQuery,
        searchInputRef,
        searchResults,
        hasResults,
        handleSearchResultClick
    };
};
