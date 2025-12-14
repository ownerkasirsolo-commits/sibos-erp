export interface SignageContent {
    id: string;
    name: string;
    type: 'image' | 'video';
    url: string;
    duration: number; // in seconds
    active: boolean;
}
