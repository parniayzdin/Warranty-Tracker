export const categories = ['Appliances', 'Electronics', 'Vehicles', 'Baby products', 'Home equipment', 'Other'] as const;
export type Category = typeof categories[number];
export interface Asset { id: number; name: string; category: Category; manufacturer: string; modelNumber: string; modelYear?: number | null; serialNumber?: string; location?: string; purchaseDate?: string | null; purchasePrice?: number | null; notes?: string }
export interface Warranty { id: number; provider: string; startDate: string; endDate: string; coverage?: string; reminderDays: number; status: string; receiptName?: string | null; asset: Asset }
export interface Maintenance { id: number; title: string; nextDueDate: string; lastCompletedDate?: string; intervalDays?: number | null; completed: boolean; status: string; notes?: string; asset: Asset }
export interface Recall { id: number; title: string; source: string; sourceId?: string; sourceUrl?: string; description?: string; recallDate?: string; status: string; asset: Asset }
export interface Part { id: number; name: string; partNumber?: string; supplier?: string; url?: string; notes?: string; asset: Asset }
export interface Reminder { id: number; type: 'Warranty' | 'Maintenance'; asset: Asset; title: string; dueDate: string; status: string }
export interface Dashboard { assetCount: number; protectedCount: number; maintenanceCount: number; recallCount: number; categories: Record<string, number>; recentAssets: Asset[]; reminders: Reminder[]; recalls: Recall[] }
export interface RecallLookup { available: boolean; source: string; message: string; results: Recall[] }
export type RecordKind = 'warranties' | 'maintenance' | 'recalls' | 'parts';

