import { SupabaseService } from '../../shared/database/supabase.client';
import { Logger } from '../../shared/utils/logger';
import { AppError } from '../../shared/utils/errors';
import { nanoid } from 'nanoid/non-secure';
import {
  CreateBirthdayInput,
  UpdateBirthdayInput,
  BirthdayQuery,
  SyncQuery,
  BirthdayRow,
  BirthdaysListResponse,
  BirthdaysSyncResponse,
} from './birthday.types';
import { Env } from '../../shared/types/env';

export class BirthdayService {
  private supabase: SupabaseService;
  private logger: Logger;

  constructor(env: Env) {
    this.supabase = new SupabaseService(env);
    this.logger = new Logger('BirthdayService', env);
  }

  async create(userId: string, input: CreateBirthdayInput): Promise<BirthdayRow> {
    this.logger.info('Creating birthday', { userId, name: input.name });

    const id = nanoid();
    const now = new Date().toISOString();

    const birthdayData = {
      id,
      user_id: userId,
      name: input.name,
      date: input.date,
      notes: input.notes || null,
      phone: input.phone || null,
      email: input.email || null,
      birth_year: input.birth_year || null,
      relationship_type: input.relationship_type || 'friend',
      theme_color_id: input.theme_color_id || '1',
      photo_url: input.photo_url || null,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await this.supabase.client
      .from('birthdays')
      .insert(birthdayData)
      .select()
      .single();

    if (error) {
      this.logger.error('Failed to create birthday', error);
      throw new AppError('BIRTHDAY_CREATE_FAILED', 'Failed to create birthday', 500, { error });
    }

    this.logger.info('Birthday created successfully', { id: data.id });
    return this.formatBirthdayRow(data);
  }

  async findById(userId: string, id: string): Promise<BirthdayRow | null> {
    const { data, error } = await this.supabase.client
      .from('birthdays')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      this.logger.error('Failed to find birthday', error);
      throw new AppError('BIRTHDAY_FETCH_FAILED', 'Failed to fetch birthday', 500, { error });
    }

    return data ? this.formatBirthdayRow(data) : null;
  }

  async findAll(userId: string, query: BirthdayQuery): Promise<BirthdaysListResponse> {
    this.logger.info('Finding birthdays', { userId, query });

    let supabaseQuery = this.supabase.client
      .from('birthdays')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Apply filters
    if (!query.include_deleted) {
      supabaseQuery = supabaseQuery.is('deleted_at', null);
    }

    if (query.search) {
      supabaseQuery = supabaseQuery.ilike('name', `%${query.search}%`);
    }

    // Apply sorting
    const ascending = query.sort_order === 'asc';
    supabaseQuery = supabaseQuery.order(query.sort_by, { ascending });

    // Apply pagination
    const from = (query.page - 1) * query.limit;
    const to = from + query.limit - 1;
    supabaseQuery = supabaseQuery.range(from, to);

    const { data, error, count } = await supabaseQuery;

    if (error) {
      this.logger.error('Failed to find birthdays', error);
      throw new AppError('BIRTHDAYS_FETCH_FAILED', 'Failed to fetch birthdays', 500, { error });
    }

    const total = count || 0;
    const hasMore = (query.page * query.limit) < total;

    return {
      birthdays: data ? data.map(row => this.formatBirthdayRow(row)) : [],
      total,
      page: query.page,
      limit: query.limit,
      has_more: hasMore,
    };
  }

  async update(userId: string, id: string, input: UpdateBirthdayInput): Promise<BirthdayRow> {
    this.logger.info('Updating birthday', { userId, id, updates: Object.keys(input) });

    const now = new Date().toISOString();
    const updateData: any = {
      ...input,
      updated_at: now,
    };

    // Handle metadata serialization
    if (input.metadata !== undefined) {
      updateData.metadata = input.metadata ? JSON.stringify(input.metadata) : null;
    }

    const { data, error } = await this.supabase.client
      .from('birthdays')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .select()
      .single();

    if (error && error.code === 'PGRST116') {
      throw new AppError('BIRTHDAY_NOT_FOUND', 'Birthday not found', 404);
    }

    if (error) {
      this.logger.error('Failed to update birthday', error);
      throw new AppError('BIRTHDAY_UPDATE_FAILED', 'Failed to update birthday', 500, { error });
    }

    this.logger.info('Birthday updated successfully', { id });
    return this.formatBirthdayRow(data);
  }

  async delete(userId: string, id: string): Promise<void> {
    this.logger.info('Deleting birthday', { userId, id });

    const now = new Date().toISOString();

    const { data, error } = await this.supabase.client
      .from('birthdays')
      .update({ 
        deleted_at: now,
        updated_at: now,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .select()
      .single();

    if (error && error.code === 'PGRST116') {
      throw new AppError('BIRTHDAY_NOT_FOUND', 'Birthday not found', 404);
    }

    if (error) {
      this.logger.error('Failed to delete birthday', error);
      throw new AppError('BIRTHDAY_DELETE_FAILED', 'Failed to delete birthday', 500, { error });
    }

    this.logger.info('Birthday deleted successfully', { id });
  }

  async getUpcoming(userId: string, days: number = 30): Promise<BirthdayRow[]> {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Build SQL query for upcoming birthdays (handles year wraparound)
    const { data, error } = await this.supabase.client
      .rpc('get_upcoming_birthdays', {
        user_id_param: userId,
        days_param: days,
      });

    if (error) {
      this.logger.error('Failed to get upcoming birthdays', error);
      throw new AppError('UPCOMING_BIRTHDAYS_FAILED', 'Failed to get upcoming birthdays', 500, { error });
    }

    return data ? data.map((row: any) => this.formatBirthdayRow(row)) : [];
  }

  async sync(userId: string, query: SyncQuery): Promise<BirthdaysSyncResponse> {
    this.logger.info('Syncing birthdays', { userId, since: query.since });

    let supabaseQuery = this.supabase.client
      .from('birthdays')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: true });

    // Get changes since timestamp
    if (query.since) {
      supabaseQuery = supabaseQuery.gt('updated_at', query.since);
    }

    const { data, error } = await supabaseQuery;

    if (error) {
      this.logger.error('Failed to sync birthdays', error);
      throw new AppError('BIRTHDAY_SYNC_FAILED', 'Failed to sync birthdays', 500, { error });
    }

    // Separate active and deleted birthdays
    const activeBirthdays: BirthdayRow[] = [];
    const deletedIds: string[] = [];

    if (data) {
      data.forEach(row => {
        if (row.deleted_at && query.include_deleted) {
          deletedIds.push(row.id);
        } else if (!row.deleted_at) {
          activeBirthdays.push(this.formatBirthdayRow(row));
        }
      });
    }

    return {
      birthdays: activeBirthdays,
      deleted_ids: deletedIds,
      last_sync_at: new Date().toISOString(),
    };
  }

  async getStats(userId: string): Promise<{
    total_count: number;
    this_month_count: number;
    upcoming_count: number;
    recent_additions: number;
  }> {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await this.supabase.client
      .rpc('get_birthday_stats', {
        user_id_param: userId,
        current_month_param: currentMonth,
        thirty_days_ago_param: thirtyDaysAgo,
      });

    if (error) {
      this.logger.error('Failed to get birthday stats', error);
      throw new AppError('BIRTHDAY_STATS_FAILED', 'Failed to get birthday stats', 500, { error });
    }

    return data || {
      total_count: 0,
      this_month_count: 0,
      upcoming_count: 0,
      recent_additions: 0,
    };
  }

  private formatBirthdayRow(row: any): BirthdayRow {
    return {
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      date: row.date,
      notes: row.notes,
      phone: row.phone,
      email: row.email,
      birth_year: row.birth_year,
      relationship_type: row.relationship_type,
      theme_color_id: row.theme_color_id,
      photo_url: row.photo_url,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
      created_at: row.created_at,
      updated_at: row.updated_at,
      deleted_at: row.deleted_at,
    };
  }
}