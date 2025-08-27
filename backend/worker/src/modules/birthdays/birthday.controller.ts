import { IRequest, json } from 'itty-router';
import { Logger } from '../../shared/utils/logger';
import { AppError } from '../../shared/utils/errors';
import { BirthdayService } from './birthday.service';
import { 
  CreateBirthdaySchema,
  UpdateBirthdaySchema,
  BirthdayQuerySchema,
  SyncQuerySchema,
  BatchOperationSchema,
  BatchResponse,
} from './birthday.types';
import { Env } from '../../shared/types/env';
import { AuthenticatedRequest } from '../auth/auth.middleware';

export class BirthdayController {
  private birthdayService: BirthdayService;
  private logger: Logger;

  constructor(env: Env) {
    this.birthdayService = new BirthdayService(env);
    this.logger = new Logger('BirthdayController', env);
  }

  async list(request: AuthenticatedRequest, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      const queryParams = Object.fromEntries(url.searchParams.entries());
      
      const validatedQuery = BirthdayQuerySchema.parse(queryParams);
      const result = await this.birthdayService.findAll(request.user.id, validatedQuery);

      return json(result);
    } catch (error: any) {
      this.logger.error('Failed to list birthdays', error);
      
      if (error.name === 'ZodError') {
        throw new AppError('VALIDATION_ERROR', 'Invalid query parameters', 400, { 
          details: error.errors 
        });
      }
      
      throw error;
    }
  }

  async getById(request: AuthenticatedRequest, env: Env): Promise<Response> {
    try {
      const id = request.params?.id;
      if (!id) {
        throw new AppError('VALIDATION_ERROR', 'Birthday ID is required', 400);
      }

      const birthday = await this.birthdayService.findById(request.user.id, id);
      if (!birthday) {
        throw new AppError('BIRTHDAY_NOT_FOUND', 'Birthday not found', 404);
      }

      return json({ birthday });
    } catch (error: any) {
      this.logger.error('Failed to get birthday by ID', error);
      throw error;
    }
  }

  async create(request: AuthenticatedRequest, env: Env): Promise<Response> {
    try {
      const body = await request.json();
      const validatedInput = CreateBirthdaySchema.parse(body);
      
      const birthday = await this.birthdayService.create(request.user.id, validatedInput);

      return json({ birthday }, { status: 201 });
    } catch (error: any) {
      this.logger.error('Failed to create birthday', error);
      
      if (error.name === 'ZodError') {
        throw new AppError('VALIDATION_ERROR', 'Invalid birthday data', 400, { 
          details: error.errors 
        });
      }
      
      throw error;
    }
  }

  async update(request: AuthenticatedRequest, env: Env): Promise<Response> {
    try {
      const id = request.params?.id;
      if (!id) {
        throw new AppError('VALIDATION_ERROR', 'Birthday ID is required', 400);
      }

      const body = await request.json();
      const validatedInput = UpdateBirthdaySchema.parse(body);
      
      const birthday = await this.birthdayService.update(request.user.id, id, validatedInput);

      return json({ birthday });
    } catch (error: any) {
      this.logger.error('Failed to update birthday', error);
      
      if (error.name === 'ZodError') {
        throw new AppError('VALIDATION_ERROR', 'Invalid birthday data', 400, { 
          details: error.errors 
        });
      }
      
      throw error;
    }
  }

  async delete(request: AuthenticatedRequest, env: Env): Promise<Response> {
    try {
      const id = request.params?.id;
      if (!id) {
        throw new AppError('VALIDATION_ERROR', 'Birthday ID is required', 400);
      }

      await this.birthdayService.delete(request.user.id, id);

      return json({ message: 'Birthday deleted successfully' });
    } catch (error: any) {
      this.logger.error('Failed to delete birthday', error);
      throw error;
    }
  }

  async sync(request: AuthenticatedRequest, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      const queryParams = Object.fromEntries(url.searchParams.entries());
      
      const validatedQuery = SyncQuerySchema.parse(queryParams);
      const result = await this.birthdayService.sync(request.user.id, validatedQuery);

      return json(result);
    } catch (error: any) {
      this.logger.error('Failed to sync birthdays', error);
      
      if (error.name === 'ZodError') {
        throw new AppError('VALIDATION_ERROR', 'Invalid sync parameters', 400, { 
          details: error.errors 
        });
      }
      
      throw error;
    }
  }

  async getUpcoming(request: AuthenticatedRequest, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      const days = parseInt(url.searchParams.get('days') || '30');
      
      if (days < 1 || days > 365) {
        throw new AppError('VALIDATION_ERROR', 'Days must be between 1 and 365', 400);
      }

      const birthdays = await this.birthdayService.getUpcoming(request.user.id, days);

      return json({ birthdays });
    } catch (error: any) {
      this.logger.error('Failed to get upcoming birthdays', error);
      throw error;
    }
  }

  async search(request: AuthenticatedRequest, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      const query = url.searchParams.get('q');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      
      if (!query || query.trim().length < 1) {
        throw new AppError('VALIDATION_ERROR', 'Search query is required', 400);
      }

      if (limit < 1 || limit > 100) {
        throw new AppError('VALIDATION_ERROR', 'Limit must be between 1 and 100', 400);
      }

      const result = await this.birthdayService.findAll(request.user.id, {
        search: query.trim(),
        limit,
        page: 1,
        sort_by: 'name',
        sort_order: 'asc',
        include_deleted: false,
      });

      return json({ birthdays: result.birthdays });
    } catch (error: any) {
      this.logger.error('Failed to search birthdays', error);
      throw error;
    }
  }

  async getStats(request: AuthenticatedRequest, env: Env): Promise<Response> {
    try {
      const stats = await this.birthdayService.getStats(request.user.id);
      return json(stats);
    } catch (error: any) {
      this.logger.error('Failed to get birthday stats', error);
      throw error;
    }
  }

  async batchOperation(request: AuthenticatedRequest, env: Env): Promise<Response> {
    try {
      const body = await request.json();
      const validatedInput = BatchOperationSchema.parse(body);
      
      const response: BatchResponse = {
        errors: [],
      };

      switch (validatedInput.operation) {
        case 'create':
          if (!validatedInput.birthdays) {
            throw new AppError('VALIDATION_ERROR', 'Birthdays array is required for create operation', 400);
          }

          response.birthdays = [];
          for (let i = 0; i < validatedInput.birthdays.length; i++) {
            try {
              const birthday = await this.birthdayService.create(request.user.id, validatedInput.birthdays[i]);
              response.birthdays.push(birthday);
            } catch (error: any) {
              response.errors.push({
                index: i,
                error: error.message || 'Failed to create birthday',
              });
            }
          }
          break;

        case 'update':
          if (!validatedInput.updates) {
            throw new AppError('VALIDATION_ERROR', 'Updates array is required for update operation', 400);
          }

          response.birthdays = [];
          for (let i = 0; i < validatedInput.updates.length; i++) {
            try {
              const update = validatedInput.updates[i];
              const birthday = await this.birthdayService.update(request.user.id, update.id, update.data);
              response.birthdays.push(birthday);
            } catch (error: any) {
              response.errors.push({
                index: i,
                error: error.message || 'Failed to update birthday',
              });
            }
          }
          break;

        case 'delete':
          if (!validatedInput.ids) {
            throw new AppError('VALIDATION_ERROR', 'IDs array is required for delete operation', 400);
          }

          response.deleted_ids = [];
          for (let i = 0; i < validatedInput.ids.length; i++) {
            try {
              await this.birthdayService.delete(request.user.id, validatedInput.ids[i]);
              response.deleted_ids.push(validatedInput.ids[i]);
            } catch (error: any) {
              response.errors.push({
                index: i,
                error: error.message || 'Failed to delete birthday',
              });
            }
          }
          break;

        default:
          throw new AppError('VALIDATION_ERROR', 'Invalid batch operation', 400);
      }

      return json(response);
    } catch (error: any) {
      this.logger.error('Failed to perform batch operation', error);
      
      if (error.name === 'ZodError') {
        throw new AppError('VALIDATION_ERROR', 'Invalid batch operation data', 400, { 
          details: error.errors 
        });
      }
      
      throw error;
    }
  }
}