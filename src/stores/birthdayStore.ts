import { create } from 'zustand';
import { Birthday, BirthdayInput, BirthdayWithSync } from '../types';
import { birthdayRepository, syncQueueRepository } from '../database';

interface BirthdayStore {
  // State
  birthdays: BirthdayWithSync[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadBirthdays: () => Promise<void>;
  addBirthday: (input: BirthdayInput) => Promise<void>;
  updateBirthday: (id: string, updates: Partial<BirthdayInput>) => Promise<void>;
  deleteBirthday: (id: string) => Promise<void>;
  refreshSyncStatus: () => Promise<void>;
}

export const useBirthdayStore = create<BirthdayStore>((set, get) => ({
  birthdays: [],
  isLoading: false,
  error: null,
  
  loadBirthdays: async () => {
    set({ isLoading: true, error: null });
    try {
      const birthdays = await birthdayRepository.findAll();
      const pendingIds = await getPendingBirthdayIds();
      
      // Add sync status to each birthday
      const birthdaysWithSync: BirthdayWithSync[] = birthdays.map(birthday => ({
        ...birthday,
        sync_status: pendingIds.includes(birthday.id) ? 'pending' : 'synced'
      }));
      
      set({ birthdays: birthdaysWithSync, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  addBirthday: async (input: BirthdayInput) => {
    try {
      const birthday = await birthdayRepository.create(input);
      
      // Add to sync queue
      await syncQueueRepository.add('create', 'birthdays', birthday.id, birthday);
      
      // Update UI optimistically
      const birthdayWithSync: BirthdayWithSync = {
        ...birthday,
        sync_status: 'pending'
      };
      
      set(state => ({
        birthdays: [...state.birthdays, birthdayWithSync]
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
  
  updateBirthday: async (id: string, updates: Partial<BirthdayInput>) => {
    try {
      const updated = await birthdayRepository.update(id, updates);
      if (!updated) return;
      
      // Add to sync queue
      await syncQueueRepository.add('update', 'birthdays', id, updates);
      
      // Update UI optimistically
      set(state => ({
        birthdays: state.birthdays.map(b => 
          b.id === id 
            ? { ...b, ...updates, sync_status: 'pending' as const }
            : b
        )
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
  
  deleteBirthday: async (id: string) => {
    try {
      await birthdayRepository.delete(id);
      
      // Add to sync queue
      await syncQueueRepository.add('delete', 'birthdays', id, { deleted_at: new Date().toISOString() });
      
      // Remove from UI
      set(state => ({
        birthdays: state.birthdays.filter(b => b.id !== id)
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
  
  refreshSyncStatus: async () => {
    const pendingIds = await getPendingBirthdayIds();
    
    set(state => ({
      birthdays: state.birthdays.map(birthday => ({
        ...birthday,
        sync_status: pendingIds.includes(birthday.id) ? 'pending' : 'synced'
      }))
    }));
  }
}));

// Helper to get IDs of birthdays with pending changes
async function getPendingBirthdayIds(): Promise<string[]> {
  const queue = await syncQueueRepository.getAll();
  return queue
    .filter(item => item.table_name === 'birthdays')
    .map(item => item.record_id);
}