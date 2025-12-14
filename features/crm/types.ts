// --- CRM TYPES ---
export interface CustomerDetail {
  id: string;
  name: string;
  phone: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  points: number;
  totalSpend: number;
  joinDate: string;
  lastVisit: string;
  favoriteMenu?: string;
}
