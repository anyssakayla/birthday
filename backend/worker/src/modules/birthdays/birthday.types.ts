import { z } from 'zod';

// Input validation schemas
export const CreateBirthdaySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  notes: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  birth_year: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  relationship_type: z.enum(['friend', 'family', 'colleague']).default('friend'),
  theme_color_id: z.string().default('1'),
  photo_url: z.string().url('Invalid photo URL').optional().or(z.literal('')),
  metadata: z.record(z.any()).optional(),
});

export const UpdateBirthdaySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  notes: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  birth_year: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  relationship_type: z.enum(['friend', 'family', 'colleague']).optional(),
  theme_color_id: z.string().optional(),
  photo_url: z.string().url('Invalid photo URL').optional().or(z.literal('')),
  metadata: z.record(z.any()).optional(),
});

export const BirthdayQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sort_by: z.enum(['name', 'date', 'created_at']).default('date'),
  sort_order: z.enum(['asc', 'desc']).default('asc'),
  include_deleted: z.coerce.boolean().default(false),
});

export const SyncQuerySchema = z.object({
  since: z.string().optional(),
  include_deleted: z.coerce.boolean().default(false),
});

export const BatchOperationSchema = z.object({
  operation: z.enum(['create', 'update', 'delete']),
  birthdays: z.array(CreateBirthdaySchema).optional(),
  updates: z.array(z.object({
    id: z.string().uuid(),
    data: UpdateBirthdaySchema,
  })).optional(),
  ids: z.array(z.string().uuid()).optional(),
});

// Type definitions
export type CreateBirthdayInput = z.infer<typeof CreateBirthdaySchema>;
export type UpdateBirthdayInput = z.infer<typeof UpdateBirthdaySchema>;
export type BirthdayQuery = z.infer<typeof BirthdayQuerySchema>;
export type SyncQuery = z.infer<typeof SyncQuerySchema>;
export type BatchOperation = z.infer<typeof BatchOperationSchema>;

// Database types - matching PostgreSQL schema
export interface BirthdayRow {
  id: string;
  user_id: string;
  name: string;
  date: string;
  notes?: string;
  phone?: string;
  email?: string;
  birth_year?: number;
  relationship_type: 'friend' | 'family' | 'colleague';
  theme_color_id: string;
  photo_url?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// Response types
export interface BirthdayResponse {
  birthday: BirthdayRow;
}

export interface BirthdaysListResponse {
  birthdays: BirthdayRow[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface BirthdaysSyncResponse {
  birthdays: BirthdayRow[];
  deleted_ids: string[];
  last_sync_at: string;
}

export interface BatchResponse {
  birthdays?: BirthdayRow[];
  deleted_ids?: string[];
  errors: Array<{
    index: number;
    error: string;
  }>;
}