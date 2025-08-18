// Sync queue types for offline-first architecture
export interface SyncQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  table_name: string;
  record_id: string;
  data: string; // JSON stringified data
  created_at: string;
  retry_count?: number;
  last_error?: string;
}

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

export interface SyncState {
  status: SyncStatus;
  last_sync: string | null;
  pending_count: number;
  error?: string;
}

// For future: conflict resolution
export interface SyncConflict {
  local: any;
  remote: any;
  resolved?: any;
  resolution_type?: 'local' | 'remote' | 'manual';
}