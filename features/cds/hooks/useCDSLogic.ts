import { useState, useEffect } from 'react';
import { MOCK_SIGNAGE } from '../../../constants';

// Mock Cart for CDS, now encapsulated within the hook
const DEMO_CART = [
    { name: 'Nasi Goreng Spesial', qty: 2, price: 35000, total: 70000 },
    { name: 'Es Teh Manis', qty: 2, price: 5000, total: 10000 },
    { name: 'Kerupuk', qty: 1, price: 2000, total: 2000 },
];

export const useCDSLogic = () => {
    const [currentAdIndex, setCurrentAdIndex] = useState(0);
    const activeAds = MOCK_SIGNAGE.filter(s => s.active);

    // Auto rotate ads
    useEffect(() => {
        if (activeAds.length === 0) return;
        const interval = setInterval(() => {
            setCurrentAdIndex((prev) => (prev + 1) % activeAds.length);
        }, 5000); // Ad rotation every 5 seconds
        return () => clearInterval(interval);
    }, [activeAds.length]);

    const currentAd = activeAds[currentAdIndex];
    
    // Derived data from cart
    const totalAmount = DEMO_CART.reduce((acc, item) => acc + item.total, 0);
    const tax = totalAmount * 0.11;
    const grandTotal = totalAmount + tax;

    return {
        cartItems: DEMO_CART,
        totalAmount,
        tax,
        grandTotal,
        currentAd,
        currentAdIndex,
        activeAdsCount: activeAds.length
    };
};
