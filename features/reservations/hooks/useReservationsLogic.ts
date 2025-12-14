import { useState, useMemo } from 'react';
import { useGlobalContext } from '../../../context/GlobalContext';
import { Reservation } from '../types';

export const useReservationsLogic = () => {
    const { reservations, updateReservationStatus } = useGlobalContext();
    
    // Get today's date in YYYY-MM-DD format for default filter
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    const todayString = today.toISOString().split('T')[0];
    
    const [filterDate, setFilterDate] = useState(todayString);

    const handleStatusChange = (id: string, status: Reservation['status']) => {
        updateReservationStatus(id, status);
    };

    const filteredReservations = useMemo(() => {
        return reservations.filter(res => res.date === filterDate)
          .sort((a,b) => a.time.localeCompare(b.time));
    }, [reservations, filterDate]);

    return {
        reservations,
        filterDate,
        setFilterDate,
        filteredReservations,
        handleStatusChange,
    };
};
