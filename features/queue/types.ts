export interface QueueItem {
    id: string;
    number: string;
    customerName: string;
    pax: number;
    type: 'dine-in' | 'take-away';
    status: 'waiting' | 'called' | 'seated' | 'skipped';
    joinTime: Date | string; // Allow string for mock, convert to Date on seed
}
