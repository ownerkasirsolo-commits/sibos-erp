
export type ContactType = 'internal' | 'external'; // internal = SIBOS User, external = WA/Phone

export interface ChatContact {
    id: string;
    name: string;
    role: string; // e.g., "Supplier", "Manager", "Gold Member"
    type: ContactType;
    isOnline: boolean;
    avatar?: string; // Initial char or image URL
    phone?: string; // For external redirection
    category?: string; // Grouping (e.g. "Sembako", "Kitchen Staff")
}

export interface ChatMessage {
    id: string;
    sender: 'me' | 'them';
    text: string;
    timestamp: string;
    isRead?: boolean;
}
