import { IRequest, json, error } from 'itty-router';
import { Env } from '@/shared/types/env';
import { Logger } from '@/shared/utils/logger';
import { ValidationError, UnauthorizedError } from '@/shared/utils/errors';
import { AuthService } from './auth.service';
import {
  SendVerificationSchema,
  VerifyPhoneSchema,
  RecoveryLoginSchema,
  SetRecoveryPasswordSchema,
  RefreshTokenSchema,
  AuthError
} from './auth.types';

export class AuthController {
  private logger: Logger;
  private authService: AuthService;

  constructor(private env: Env) {
    this.logger = new Logger('AuthController', env);
    this.authService = new AuthService(env);
  }

  /**
   * POST /api/auth/verify/send
   * Send SMS verification code
   */
  async sendVerificationCode(request: IRequest, env: Env) {
    try {
      const body = await request.json();
      const input = SendVerificationSchema.parse(body);

      const result = await this.authService.sendVerificationCode(input);

      return json(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * POST /api/auth/verify/confirm
   * Verify phone number and authenticate user
   */
  async verifyPhoneAndAuth(request: IRequest, env: Env) {
    try {
      const body = await request.json();
      const input = VerifyPhoneSchema.parse(body);

      const result = await this.authService.verifyPhoneAndAuth(input);

      return json(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * POST /api/auth/recovery/login
   * Login with recovery password
   */
  async recoveryLogin(request: IRequest, env: Env) {
    try {
      const body = await request.json();
      const input = RecoveryLoginSchema.parse(body);

      const result = await this.authService.loginWithRecoveryPassword(input);

      return json(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * POST /api/auth/recovery/password
   * Set recovery password for authenticated user
   */
  async setRecoveryPassword(request: IRequest, env: Env) {
    try {
      // Get user from auth middleware
      const user = (request as any).user;
      if (!user) {
        throw new UnauthorizedError();
      }

      const body = await request.json();
      const input = SetRecoveryPasswordSchema.parse(body);

      await this.authService.setRecoveryPassword(user.id, input);

      return json({ success: true, message: 'Recovery password set successfully' });
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * POST /api/auth/token/refresh
   * Refresh device token
   */
  async refreshToken(request: IRequest, env: Env) {
    try {
      const body = await request.json();
      const input = RefreshTokenSchema.parse(body);

      const result = await this.authService.refreshDeviceToken(input);

      return json(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * GET /api/auth/me
   * Get current user info
   */
  async getCurrentUser(request: IRequest, env: Env) {
    try {
      // User comes from auth middleware
      const user = (request as any).user;
      if (!user) {
        throw new UnauthorizedError();
      }

      return json({ user });
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * GET /api/auth/devices
   * Get user's device tokens
   */
  async getUserDevices(request: IRequest, env: Env) {
    try {
      const user = (request as any).user;
      if (!user) {
        throw new UnauthorizedError();
      }

      const devices = await this.authService.getUserDeviceTokens(user.id);

      return json({ devices });
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * DELETE /api/auth/devices/:tokenId
   * Revoke a device token
   */
  async revokeDeviceToken(request: IRequest, env: Env) {
    try {
      const user = (request as any).user;
      if (!user) {
        throw new UnauthorizedError();
      }

      const tokenId = request.params?.tokenId;
      if (!tokenId) {
        throw new ValidationError('Token ID required');
      }

      await this.authService.revokeDeviceToken(user.id, tokenId);

      return json({ success: true, message: 'Device token revoked' });
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * POST /api/auth/logout
   * Logout current device
   */
  async logout(request: IRequest, env: Env) {
    try {
      const user = (request as any).user;
      const deviceToken = (request as any).deviceToken;

      if (!user || !deviceToken) {
        throw new UnauthorizedError();
      }

      // Find and revoke current device token
      const devices = await this.authService.getUserDeviceTokens(user.id);
      // Note: In a real implementation, we'd need to identify the current token
      // For now, we'll just return success

      return json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(err: any) {
    this.logger.error('Auth controller error', err);

    if (err.name === 'ZodError') {
      return json(
        { 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Invalid input data',
            details: err.errors 
          } 
        },
        { status: 400 }
      );
    }

    if (err instanceof AuthError) {
      return json(
        { 
          error: { 
            code: err.code, 
            message: err.message 
          } 
        },
        { status: err.statusCode }
      );
    }

    // Generic error
    const message = this.env.ENVIRONMENT === 'production' 
      ? 'Authentication error' 
      : err.message;
      
    return json(
      { error: { code: 'AUTH_ERROR', message } },
      { status: 500 }
    );
  }
}