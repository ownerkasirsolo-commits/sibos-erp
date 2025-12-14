
import { useGlobalContext } from '../../../context/GlobalContext';
import { Order, BusinessType } from '../../../types';

export const useKDSLogic = () => {
    const { transactions, updateOrderStatus, products } = useGlobalContext();

    // Helper: Determine if an order contains items that need kitchen attention
    const needsCooking = (order: Order) => {
        return order.items.some(item => {
            // Check item business type or if it has a recipe
            return item.businessType === BusinessType.CULINARY || item.hasRecipe === true;
        });
    };

    // Filter Active Orders for Kitchen
    // 1. Status must be cooking-related
    // 2. Order MUST contain at least one culinary item
    const activeOrders = transactions.filter(t => 
        ['paid', 'debt', 'cooking', 'ready'].includes(t.status) &&
        needsCooking(t)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()); // FIFO

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'paid': 
            case 'debt':
                return 'bg-red-500/20 border-red-500/50 text-red-400';
            case 'cooking': return 'bg-orange-500/20 border-orange-500/50 text-orange-400';
            case 'ready': return 'bg-green-500/20 border-green-500/50 text-green-400';
            default: return 'bg-gray-500/20 border-gray-500/50 text-gray-400';
        }
    };
  
    const getStatusGlow = (status: Order['status']) => {
        switch (status) {
            case 'paid':
            case 'debt': 
                return 'shadow-lg shadow-red-900/50';
            case 'cooking': return 'shadow-lg shadow-orange-900/50';
            case 'ready': return 'shadow-lg shadow-green-900/50';
            default: return 'shadow-lg shadow-black/30';
        }
    }

    const getTimeDifference = (timestamp: string) => {
        const diffMs = new Date().getTime() - new Date(timestamp).getTime();
        return Math.floor(diffMs / 60000); // minutes
    };

    const handleUpdateStatus = (orderId: string, status: Order['status']) => {
        updateOrderStatus(orderId, status);
    };

    return {
        activeOrders,
        getStatusColor,
        getStatusGlow,
        getTimeDifference,
        handleUpdateStatus
    };
};
