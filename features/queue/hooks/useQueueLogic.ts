import { useMemo } from 'react';
import { useGlobalContext } from '../../../context/GlobalContext';
import { QueueItem } from '../types';

export const useQueueLogic = () => {
    const { queue, updateQueueStatus, addQueueItem } = useGlobalContext();

    // Memoized calculations for performance
    const currentCalled = useMemo(() => queue.find(q => q.status === 'called'), [queue]);
    const waitingList = useMemo(() => queue.filter(q => q.status === 'waiting').sort((a,b) => new Date(a.joinTime).getTime() - new Date(b.joinTime).getTime()), [queue]);
    const historyList = useMemo(() => queue.filter(q => q.status === 'seated' || q.status === 'skipped').slice(0, 5), [queue]);

    const handleCall = async (id: string) => {
        // In a real scenario, you might want to ensure only one is 'called' at a time.
        // This logic handles that by seating the previous 'called' one.
        const previouslyCalled = queue.find(q => q.status === 'called');
        if (previouslyCalled) {
            await updateQueueStatus(previouslyCalled.id, 'seated');
        }
        await updateQueueStatus(id, 'called');
    };

    const handleSeat = (id: string) => {
        updateQueueStatus(id, 'seated');
    };

    const handleSkip = (id: string) => {
        updateQueueStatus(id, 'skipped');
    };

    const handleAddQueue = () => {
        const name = prompt("Nama Pelanggan:");
        if (!name) return;
        const newQueueItem: Omit<QueueItem, 'id'> = {
            number: `A-${Math.floor(Math.random() * 100) + 15}`, // Simplistic number generation
            customerName: name,
            pax: 2,
            type: 'dine-in',
            status: 'waiting',
            joinTime: new Date()
        };
        addQueueItem(newQueueItem);
    }

    return {
        queue,
        currentCalled,
        waitingList,
        historyList,
        handleCall,
        handleSeat,
        handleSkip,
        handleAddQueue
    };
};
