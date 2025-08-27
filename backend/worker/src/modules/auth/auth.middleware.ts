import { IRequest } from 'itty-router';
import { Env } from '@/shared/types/env';
import { Logger } from '@/shared/utils/logger';
import { UnauthorizedError } from '@/shared/utils/errors';
import { AuthService } from './auth.service';
import { User, TokenExpiredError } from './auth.types';

// Extended request interface with user info
export interface AuthenticatedRequest extends IRequest {
  user: User;
  deviceToken: string;
}

export class AuthMiddleware {
  private logger: Logger;
  private authService: AuthService;

  constructor(private env: Env) {
    this.logger = new Logger('AuthMiddleware', env);
    this.authService = new AuthService(env);
  }

  /**
   * Middleware to verify device token and attach user to request
   */
  async verifyToken(request: IRequest): Promise<AuthenticatedRequest> {
    try {
      // Extract token from Authorization header
      const authHeader = request.headers.get('Authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('Missing or invalid authorization header');
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      if (!token) {
        throw new UnauthorizedError('Device token required');
      }

      // Verify token and get user
      const user = await this.authService.verifyDeviceToken(token);

      // Attach user and token to request
      (request as any).user = user;
      (request as any).deviceToken = token;

      this.logger.debug('Token verified successfully', { userId: user.id });

      return request as AuthenticatedRequest;
    } catch (error) {
      this.logger.warn('Token verification failed', { error: error.message });
      
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedError('Device token expired');
      }
      
      throw new UnauthorizedError('Invalid device token');
    }
  }

  /**
   * Optional middleware - doesn't throw if no token provided
   */
  async optionalAuth(request: IRequest): Promise<IRequest> {
    try {
      return await this.verifyToken(request);
    } catch (error) {
      // Continue without auth if token verification fails
      this.logger.debug('Optional auth failed, continuing without user');
      return request;
    }
  }
}

// Helper function to create auth middleware
export function createAuthMiddleware(env: Env) {
  const authMiddleware = new AuthMiddleware(env);

  return {
    // Required authentication
    required: async (request: IRequest): Promise<AuthenticatedRequest> => {
      return await authMiddleware.verifyToken(request);
    },
    
    // Optional authentication
    optional: async (request: IRequest): Promise<IRequest> => {
      return await authMiddleware.optionalAuth(request);
    },

    // Helper to get user from authenticated request
    getUser: (request: IRequest): User => {
      const user = (request as any).user;
      if (!user) {
        throw new UnauthorizedError('User not authenticated');
      }
      return user;
    }
  };
}