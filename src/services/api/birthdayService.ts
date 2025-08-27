import { apiClient, ApiResponse } from './apiClient';
import { Birthday, BirthdayInput } from '@/types/birthday';

export interface BirthdaysListResponse {
  birthdays: Birthday[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface BirthdayResponse {
  birthday: Birthday;
}

export interface BirthdaysSyncResponse {
  birthdays: Birthday[];
  deleted_ids: string[];
  last_sync_at: string;
}

export interface BirthdaysListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: 'name' | 'date' | 'created_at';
  sort_order?: 'asc' | 'desc';
  include_deleted?: boolean;
}

export interface BirthdaysSyncParams {
  since?: string; // ISO timestamp
  include_deleted?: boolean;
}

export class BirthdayService {
  async list(params: BirthdaysListParams = {}): Promise<ApiResponse<BirthdaysListResponse>> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.sort_by) searchParams.append('sort_by', params.sort_by);
    if (params.sort_order) searchParams.append('sort_order', params.sort_order);
    if (params.include_deleted) searchParams.append('include_deleted', 'true');

    const queryString = searchParams.toString();
    const endpoint = `/api/birthdays${queryString ? `?${queryString}` : ''}`;

    return apiClient.get<BirthdaysListResponse>(endpoint, { requireAuth: true });
  }

  async getById(id: string): Promise<ApiResponse<BirthdayResponse>> {
    return apiClient.get<BirthdayResponse>(`/api/birthdays/${id}`, { requireAuth: true });
  }

  async create(input: BirthdayInput): Promise<ApiResponse<BirthdayResponse>> {
    return apiClient.post<BirthdayResponse>('/api/birthdays', input, { requireAuth: true });
  }

  async update(id: string, updates: Partial<BirthdayInput>): Promise<ApiResponse<BirthdayResponse>> {
    return apiClient.put<BirthdayResponse>(`/api/birthdays/${id}`, updates, { requireAuth: true });
  }

  async delete(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`/api/birthdays/${id}`, { requireAuth: true });
  }

  // Sync operations for offline-first architecture
  async sync(params: BirthdaysSyncParams = {}): Promise<ApiResponse<BirthdaysSyncResponse>> {
    const searchParams = new URLSearchParams();
    
    if (params.since) searchParams.append('since', params.since);
    if (params.include_deleted) searchParams.append('include_deleted', 'true');

    const queryString = searchParams.toString();
    const endpoint = `/api/birthdays/sync${queryString ? `?${queryString}` : ''}`;

    return apiClient.get<BirthdaysSyncResponse>(endpoint, { requireAuth: true });
  }

  // Batch operations for sync
  async batchCreate(birthdays: BirthdayInput[]): Promise<ApiResponse<{ birthdays: Birthday[]; errors: any[] }>> {
    return apiClient.post('/api/birthdays/batch', { 
      operation: 'create',
      birthdays 
    }, { requireAuth: true });
  }

  async batchUpdate(updates: Array<{ id: string; data: Partial<BirthdayInput> }>): Promise<ApiResponse<{ birthdays: Birthday[]; errors: any[] }>> {
    return apiClient.post('/api/birthdays/batch', { 
      operation: 'update',
      updates 
    }, { requireAuth: true });
  }

  async batchDelete(ids: string[]): Promise<ApiResponse<{ deleted_ids: string[]; errors: any[] }>> {
    return apiClient.post('/api/birthdays/batch', { 
      operation: 'delete',
      ids 
    }, { requireAuth: true });
  }

  // Get upcoming birthdays
  async getUpcoming(days: number = 30): Promise<ApiResponse<{ birthdays: Birthday[] }>> {
    return apiClient.get<{ birthdays: Birthday[] }>(`/api/birthdays/upcoming?days=${days}`, { requireAuth: true });
  }

  // Search functionality
  async search(query: string, limit: number = 20): Promise<ApiResponse<{ birthdays: Birthday[] }>> {
    const searchParams = new URLSearchParams({
      q: query,
      limit: limit.toString(),
    });

    return apiClient.get<{ birthdays: Birthday[] }>(`/api/birthdays/search?${searchParams}`, { requireAuth: true });
  }

  // Statistics
  async getStats(): Promise<ApiResponse<{
    total_count: number;
    this_month_count: number;
    upcoming_count: number;
    recent_additions: number;
  }>> {
    return apiClient.get('/api/birthdays/stats', { requireAuth: true });
  }
}

// Create singleton instance
export const birthdayService = new BirthdayService();