
import { useState, useMemo } from 'react';
import { useGlobalContext } from '../../../context/GlobalContext';
import { generateBusinessAdvice } from '../services/geminiService';
import { Product } from '../../products/types';

export const useBossLogic = () => {
    const { transactions, products, ingredients, customers, activeOutlet } = useGlobalContext();
    
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [briefing, setBriefing] = useState<string>('');
    const [strategy, setStrategy] = useState<string>('');

    // --- 1. DATA AGGREGATION (THE BRAIN) ---
    const stats = useMemo(() => {
        const today = new Date();
        const last30Days = transactions.filter(t => {
            const date = new Date(t.timestamp);
            const diffTime = Math.abs(today.getTime() - date.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 30;
        });

        const totalRevenue = last30Days.reduce((acc, t) => acc + t.total, 0);
        const avgDailyRevenue = totalRevenue / 30;
        const totalTx = last30Days.length;
        
        // Product Performance
        const productStats: Record<string, { qty: number, revenue: number }> = {};
        last30Days.forEach(t => {
            t.items.forEach(item => {
                if (!productStats[item.id]) productStats[item.id] = { qty: 0, revenue: 0 };
                productStats[item.id].qty += item.quantity;
                productStats[item.id].revenue += (item.quantity * item.price);
            });
        });

        return { totalRevenue, avgDailyRevenue, totalTx, productStats };
    }, [transactions]);

    // --- 2. ZOMBIE MENU DETECTOR ---
    // Criteria: High Stock (Availability), Low Sales (Volume), Low Margin (Optional)
    const zombieProducts = useMemo(() => {
        const zombies: any[] = [];
        products.forEach(p => {
            const stat = stats.productStats[p.id];
            const salesVolume = stat ? stat.qty : 0;
            
            // Logic: Sales < 5 in 30 days AND Stock > 10 (Available)
            // Or simply very low sales compared to others
            if (salesVolume < 5 && p.stock && p.stock > 10) {
                const margin = p.cogs ? ((p.price - p.cogs) / p.price) * 100 : 0;
                zombies.push({
                    ...p,
                    salesVolume,
                    margin,
                    reason: 'Stok numpuk, penjualan rendah'
                });
            }
        });
        return zombies.slice(0, 4); // Top 4 Zombies
    }, [products, stats]);

    // --- 3. AI ACTIONS ---
    
    const generateMorningBriefing = async () => {
        setIsAnalyzing(true);
        try {
            const context = `
                Omset 30 hari: Rp ${stats.totalRevenue.toLocaleString()}.
                Rata-rata harian: Rp ${stats.avgDailyRevenue.toLocaleString()}.
                Total Transaksi: ${stats.totalTx}.
                Outlet Aktif: ${activeOutlet?.name || 'Semua'}.
                Zombie Products (Gak laku): ${zombieProducts.map(p => p.name).join(', ')}.
            `;
            const prompt = `Berikan "Morning Briefing" untuk Owner bisnis ini.
            Gunakan gaya bahasa seorang konsultan bisnis profesional tapi santai.
            Struktur:
            1. Highlight Performa (Puji jika bagus, warning jika turun).
            2. Fokus Masalah (Sebutkan menu zombie).
            3. Satu saran prioritas hari ini.
            Maksimal 100 kata.`;
            
            const result = await generateBusinessAdvice(prompt, context);
            setBriefing(result);
        } catch (e) {
            setBriefing("Gagal menghubungi server kecerdasan buatan.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const generateMarketingStrategy = async () => {
        setIsAnalyzing(true);
        try {
            const context = `Customer Base: ${customers.length} orang. Top Tier (Loyal): ${customers.filter(c => c.tier === 'Gold' || c.tier === 'Platinum').length}.`;
            const prompt = `Buatkan 3 ide strategi marketing taktis untuk minggu depan.
            Fokus pada meningkatkan repeat order dari pelanggan loyal dan menghabiskan stok produk yang kurang laku.
            Berikan judul promo yang catchy.`;
            
            const result = await generateBusinessAdvice(prompt, context);
            setStrategy(result);
        } catch (e) {
            setStrategy("Gagal meracik strategi.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return {
        stats,
        zombieProducts,
        isAnalyzing,
        briefing,
        strategy,
        generateMorningBriefing,
        generateMarketingStrategy
    };
};
