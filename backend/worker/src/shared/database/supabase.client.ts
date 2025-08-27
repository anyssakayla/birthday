import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Env } from '../types/env';
import { Logger } from '../utils/logger';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          subscription: 'free' | 'premium';
          phone: string | null;
          phone_verified: boolean;
          recovery_password_hash: string | null;
          verification_code: string | null;
          verification_expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          subscription?: 'free' | 'premium';
          phone?: string | null;
          phone_verified?: boolean;
          recovery_password_hash?: string | null;
          verification_code?: string | null;
          verification_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          subscription?: 'free' | 'premium';
          phone?: string | null;
          phone_verified?: boolean;
          recovery_password_hash?: string | null;
          verification_code?: string | null;
          verification_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      birthdays: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          date: string;
          birth_year: number | null;
          phone: string | null;
          email: string | null;
          photo_url: string | null;
          relationship_type: 'family' | 'friend' | 'colleague' | 'other' | null;
          notes: string | null;
          metadata: any; // JSONB
          created_at: string;
          updated_at: string;
          synced_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id: string;
          user_id: string;
          name: string;
          date: string;
          birth_year?: number | null;
          phone?: string | null;
          email?: string | null;
          photo_url?: string | null;
          relationship_type?: 'family' | 'friend' | 'colleague' | 'other' | null;
          notes?: string | null;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
          synced_at?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          date?: string;
          birth_year?: number | null;
          phone?: string | null;
          email?: string | null;
          photo_url?: string | null;
          relationship_type?: 'family' | 'friend' | 'colleague' | 'other' | null;
          notes?: string | null;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
          synced_at?: string | null;
          deleted_at?: string | null;
        };
      };
      gift_suggestions_log: {
        Row: {
          id: string;
          user_id: string;
          birthday_id: string | null;
          prompt: string;
          suggestions: any; // JSONB
          tokens_used: number | null;
          cost: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          birthday_id?: string | null;
          prompt: string;
          suggestions: any;
          tokens_used?: number | null;
          cost?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          birthday_id?: string | null;
          prompt?: string;
          suggestions?: any;
          tokens_used?: number | null;
          cost?: number | null;
          created_at?: string;
        };
      };
      gift_transactions: {
        Row: {
          id: string;
          user_id: string;
          birthday_id: string | null;
          provider: string;
          transaction_type: 'gift_card' | 'affiliate_click' | 'affiliate_purchase';
          amount: number | null;
          commission: number | null;
          status: 'pending' | 'completed' | 'failed' | 'refunded';
          external_transaction_id: string | null;
          metadata: any; // JSONB
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          birthday_id?: string | null;
          provider: string;
          transaction_type: 'gift_card' | 'affiliate_click' | 'affiliate_purchase';
          amount?: number | null;
          commission?: number | null;
          status: 'pending' | 'completed' | 'failed' | 'refunded';
          external_transaction_id?: string | null;
          metadata?: any;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          birthday_id?: string | null;
          provider?: string;
          transaction_type?: 'gift_card' | 'affiliate_click' | 'affiliate_purchase';
          amount?: number | null;
          commission?: number | null;
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          external_transaction_id?: string | null;
          metadata?: any;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      message_templates: {
        Row: {
          id: string;
          user_id: string;
          birthday_id: string | null;
          relationship_type: 'family' | 'friend' | 'colleague' | 'other' | null;
          template_text: string;
          is_global: boolean;
          language: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          birthday_id?: string | null;
          relationship_type?: 'family' | 'friend' | 'colleague' | 'other' | null;
          template_text: string;
          is_global?: boolean;
          language?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          birthday_id?: string | null;
          relationship_type?: 'family' | 'friend' | 'colleague' | 'other' | null;
          template_text?: string;
          is_global?: boolean;
          language?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      sync_log: {
        Row: {
          id: string;
          user_id: string;
          device_id: string | null;
          operation: 'push' | 'pull' | 'conflict_resolution';
          table_name: string | null;
          records_affected: number;
          status: 'success' | 'partial' | 'failed';
          error_details: any | null; // JSONB
          sync_duration_ms: number | null;
          data_size_bytes: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          device_id?: string | null;
          operation: 'push' | 'pull' | 'conflict_resolution';
          table_name?: string | null;
          records_affected?: number;
          status: 'success' | 'partial' | 'failed';
          error_details?: any | null;
          sync_duration_ms?: number | null;
          data_size_bytes?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          device_id?: string | null;
          operation?: 'push' | 'pull' | 'conflict_resolution';
          table_name?: string | null;
          records_affected?: number;
          status?: 'success' | 'partial' | 'failed';
          error_details?: any | null;
          sync_duration_ms?: number | null;
          data_size_bytes?: number | null;
          created_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          setting_key: string;
          setting_value: any; // JSONB
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          setting_key: string;
          setting_value: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          setting_key?: string;
          setting_value?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      device_tokens: {
        Row: {
          id: string;
          user_id: string;
          token_hash: string;
          device_name: string | null;
          device_id: string | null;
          last_used: string;
          expires_at: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token_hash: string;
          device_name?: string | null;
          device_id?: string | null;
          last_used?: string;
          expires_at?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          token_hash?: string;
          device_name?: string | null;
          device_id?: string | null;
          last_used?: string;
          expires_at?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      verification_codes: {
        Row: {
          id: string;
          phone: string;
          code: string;
          attempts: number;
          used: boolean;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          phone: string;
          code: string;
          attempts?: number;
          used?: boolean;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          phone?: string;
          code?: string;
          attempts?: number;
          used?: boolean;
          expires_at?: string;
          created_at?: string;
        };
      };
    };
  };
}

export class SupabaseService {
  private client: SupabaseClient<Database>;
  private adminClient: SupabaseClient<Database>;
  private logger: Logger;

  constructor(private env: Env) {
    this.logger = new Logger('SupabaseService', env);

    // Public client for user operations (respects RLS)
    this.client = createClient<Database>(
      env.SUPABASE_URL,
      env.SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false, // Workers are stateless
          autoRefreshToken: false,
          detectSessionInUrl: false
        },
        global: {
          fetch: fetch.bind(globalThis) // Use Workers fetch
        }
      }
    );

    // Admin client for system operations (bypasses RLS)
    this.adminClient = createClient<Database>(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        },
        global: {
          fetch: fetch.bind(globalThis)
        }
      }
    );

    this.logger.debug('Supabase clients initialized', {
      url: env.SUPABASE_URL
    });
  }

  // Get client with user's JWT (for user operations)
  async getUserClient(jwt: string): Promise<SupabaseClient<Database>> {
    const { data: { user }, error } = await this.client.auth.getUser(jwt);
    
    if (error || !user) {
      throw new Error('Invalid JWT token');
    }

    // Set the session for RLS
    await this.client.auth.setSession({
      access_token: jwt,
      refresh_token: '', // Not used in Workers
    });

    return this.client;
  }

  // Get admin client (bypasses RLS)
  getAdminClient(): SupabaseClient<Database> {
    return this.adminClient;
  }

  // Test database connection
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.adminClient
        .from('users')
        .select('count()')
        .limit(1);

      if (error) {
        this.logger.error('Database connection test failed', error);
        return false;
      }

      this.logger.info('Database connection test successful');
      return true;
    } catch (error) {
      this.logger.error('Database connection test failed', error);
      return false;
    }
  }
}