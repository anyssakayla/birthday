import { create } from 'zustand';
import NetInfo from '@react-native-community/netinfo';
import { SyncState, SyncStatus } from '../types';
import { syncQueueRepository } from '../database';

interface SyncStore extends SyncState {
  // Actions
  setStatus: (status: SyncStatus) => void;
  setSyncError: (error: string | null) => void;
  updateLastSync: () => void;
  updatePendingCount: () => Promise<void>;
  checkNetworkStatus: () => Promise<boolean>;
}

export const useSyncStore = create<SyncStore>((set, get) => ({
  // Initial state
  status: 'idle',
  last_sync: null,
  pending_count: 0,
  error: null,
  
  // Actions
  setStatus: (status) => set({ status }),
  
  setSyncError: (error) => set({ error, status: error ? 'error' : 'idle' }),
  
  updateLastSync: () => set({ last_sync: new Date().toISOString() }),
  
  updatePendingCount: async () => {
    const count = await syncQueueRepository.getPendingCount();
    set({ pending_count: count });
  },
  
  checkNetworkStatus: async () => {
    const netInfo = await NetInfo.fetch();
    const isConnected = netInfo.isConnected ?? false;
    
    if (!isConnected) {
      set({ status: 'offline' });
    }
    
    return isConnected;
  }
}));

// Network status listener
NetInfo.addEventListener(state => {
  const syncStore = useSyncStore.getState();
  if (!state.isConnected && syncStore.status !== 'offline') {
    syncStore.setStatus('offline');
  } else if (state.isConnected && syncStore.status === 'offline') {
    syncStore.setStatus('idle');
  }
});