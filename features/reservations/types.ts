export interface Reservation {
    id: string;
    customerName: string;
    phone: string;
    date: string;
    time: string;
    pax: number;
    tableNumber?: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'seated';
    notes?: string;
    deposit?: number;
}
