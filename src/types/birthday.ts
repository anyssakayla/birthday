// Core birthday type - minimal fields that won't change
export interface Birthday {
  // Core fields (required)
  id: string;
  name: string;
  date: string; // ISO 8601 format: YYYY-MM-DD
  
  // Sync fields (required for architecture)
  synced_at?: string;
  updated_at: string;
  deleted_at?: string;
  
  // Optional fields (can be added later)
  notes?: string;
  photo_url?: string;
  
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
}

// For the sync queue
export interface BirthdayChange {
  id: string;
  operation: 'create' | 'update' | 'delete';
  data: Partial<Birthday>;
  timestamp: string;
}