// Core birthday type - full schema matching backend
export interface Birthday {
  // Core fields (required)
  id: string;
  name: string;
  date: string; // ISO 8601 format: YYYY-MM-DD
  
  // Contact information
  phone?: string;
  email?: string;
  birth_year?: number;
  
  // Relationship and styling
  relationship_type: 'friend' | 'family' | 'colleague';
  theme_color_id: string;
  photo_url?: string;
  
  // Optional fields
  notes?: string;
  
  // Sync fields (required for architecture)
  synced_at?: string;
  updated_at: string;
  deleted_at?: string;
  
  // Flexible metadata for future extensions
  metadata?: Record<string, any>;
}

// Birthday with local sync status for UI
export interface BirthdayWithSync extends Birthday {
  sync_status: 'synced' | 'pending' | 'error';
  local_changes?: Partial<Birthday>;
}

// For creating new birthdays
export interface BirthdayInput {
  name: string;
  date: string;
  notes?: string;
  phone?: string;
  email?: string;
  birth_year?: number;
  relationship_type?: 'friend' | 'family' | 'colleague';
  theme_color_id?: string;
  photo_url?: string;
  metadata?: Record<string, any>;
}

// For the sync queue
export interface BirthdayChange {
  id: string;
  operation: 'create' | 'update' | 'delete';
  data: Partial<Birthday>;
  timestamp: string;
}

// Constants and utility types
export type RelationshipType = 'friend' | 'family' | 'colleague';

export const RELATIONSHIP_TYPES: Record<RelationshipType, { label: string; icon: string }> = {
  friend: { label: 'Friend', icon: '👥' },
  family: { label: 'Family', icon: '👨‍👩‍👧' },
  colleague: { label: 'Colleague', icon: '💼' },
} as const;

export const DEFAULT_THEME_COLOR_ID = '1';
export const DEFAULT_RELATIONSHIP_TYPE: RelationshipType = 'friend';

// Helper function to create birthday with defaults
export function createBirthdayInput(input: Partial<BirthdayInput> & Pick<BirthdayInput, 'name' | 'date'>): BirthdayInput {
  return {
    relationship_type: DEFAULT_RELATIONSHIP_TYPE,
    theme_color_id: DEFAULT_THEME_COLOR_ID,
    ...input,
  };
}