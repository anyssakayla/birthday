import { nanoid } from 'nanoid';
import { SupabaseService } from '@/shared/database/supabase.client';
import { Logger } from '@/shared/utils/logger';
import { Env } from '@/shared/types/env';
import {
  User,
  AuthResponse,
  DeviceTokenInfo,
  VerificationResponse,
  SendVerificationInput,
  VerifyPhoneInput,
  RecoveryLoginInput,
  SetRecoveryPasswordInput,
  RefreshTokenInput,
  AuthError,
  InvalidCredentialsError,
  PhoneNotVerifiedError,
  VerificationExpiredError,
  TooManyAttemptsError,
  TokenExpiredError
} from './auth.types';

export class AuthService {
  private logger: Logger;
  private supabase: SupabaseService;

  constructor(private env: Env) {
    this.logger = new Logger('AuthService', env);
    this.supabase = new SupabaseService(env);
  }

  /**
   * Send SMS verification code to phone number
   */
  async sendVerificationCode(input: SendVerificationInput): Promise<VerificationResponse> {
    this.logger.info('Sending verification code', { phone: input.phone });

    const client = this.supabase.getAdminClient();

    // Generate 6-digit code
    const code = this.generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes

    try {
      // Store verification code
      const { error } = await client
        .from('verification_codes')
        .insert({
          phone: input.phone,
          code,
          expires_at: expiresAt.toISOString()
        });

      if (error) {
        this.logger.error('Failed to store verification code', error);
        throw new AuthError('VERIFICATION_FAILED', 'Failed to send verification code');
      }

      // TODO: In production, integrate with SMS service (Twilio, etc.)
      // For development, we'll log the code
      if (this.env.ENVIRONMENT === 'development') {
        this.logger.info(`📱 SMS Code for ${input.phone}: ${code}`);
      } else {
        // Send actual SMS in production
        await this.sendSMS(input.phone, `Your verification code is: ${code}`);
      }

      return {
        success: true,
        message: 'Verification code sent',
        expiresIn: 600 // 10 minutes
      };

    } catch (error) {
      this.logger.error('Failed to send verification code', error);
      throw new AuthError('VERIFICATION_FAILED', 'Failed to send verification code');
    }
  }

  /**
   * Verify phone number with code and create/login user
   */
  async verifyPhoneAndAuth(input: VerifyPhoneInput): Promise<AuthResponse> {
    this.logger.info('Verifying phone and authenticating', { phone: input.phone });

    const client = this.supabase.getAdminClient();

    // Get and verify the code
    const { data: verificationData, error: verificationError } = await client
      .from('verification_codes')
      .select('*')
      .eq('phone', input.phone)
      .eq('code', input.code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (verificationError || !verificationData) {
      // Check if code exists but is expired
      const { data: expiredCode } = await client
        .from('verification_codes')
        .select('*')
        .eq('phone', input.phone)
        .eq('code', input.code)
        .single();

      if (expiredCode) {
        throw new VerificationExpiredError();
      }

      // Increment attempts
      await client
        .from('verification_codes')
        .update({ attempts: client.rpc('increment_attempts') })
        .eq('phone', input.phone)
        .eq('code', input.code);

      throw new InvalidCredentialsError('Invalid verification code');
    }

    // Mark code as used
    await client
      .from('verification_codes')
      .update({ used: true })
      .eq('id', verificationData.id);

    // Find or create user
    let user = await this.findUserByPhone(input.phone);
    
    if (!user) {
      // Create new user
      user = await this.createUserWithPhone(input.phone);
    } else {
      // Update phone verification status
      await client
        .from('users')
        .update({ phone_verified: true })
        .eq('id', user.id);
      
      user.phoneVerified = true;
    }

    // Create device token
    const deviceToken = await this.createDeviceToken(user.id, input.deviceName, input.deviceId);

    this.logger.info('Phone verification successful', { userId: user.id });

    return {
      user,
      deviceToken: deviceToken.token,
      expiresAt: deviceToken.expiresAt
    };
  }

  /**
   * Login with recovery password
   */
  async loginWithRecoveryPassword(input: RecoveryLoginInput): Promise<AuthResponse> {
    this.logger.info('Attempting recovery login', { phone: input.phone });

    const user = await this.findUserByPhone(input.phone);
    
    if (!user || !user.phoneVerified) {
      throw new PhoneNotVerifiedError();
    }

    const client = this.supabase.getAdminClient();

    // Get user with password hash
    const { data: userData, error } = await client
      .from('users')
      .select('recovery_password_hash')
      .eq('id', user.id)
      .single();

    if (error || !userData?.recovery_password_hash) {
      throw new InvalidCredentialsError('No recovery password set');
    }

    // Verify password (in production, use bcrypt)
    const isValidPassword = await this.verifyPassword(input.password, userData.recovery_password_hash);
    
    if (!isValidPassword) {
      throw new InvalidCredentialsError('Invalid recovery password');
    }

    // Create device token
    const deviceToken = await this.createDeviceToken(user.id, input.deviceName, input.deviceId);

    this.logger.info('Recovery login successful', { userId: user.id });

    return {
      user,
      deviceToken: deviceToken.token,
      expiresAt: deviceToken.expiresAt
    };
  }

  /**
   * Set recovery password for existing user
   */
  async setRecoveryPassword(userId: string, input: SetRecoveryPasswordInput): Promise<void> {
    this.logger.info('Setting recovery password', { userId });

    const passwordHash = await this.hashPassword(input.password);
    const client = this.supabase.getAdminClient();

    const { error } = await client
      .from('users')
      .update({ recovery_password_hash: passwordHash })
      .eq('id', userId);

    if (error) {
      this.logger.error('Failed to set recovery password', error);
      throw new AuthError('PASSWORD_UPDATE_FAILED', 'Failed to set recovery password');
    }
  }

  /**
   * Verify device token and get user
   */
  async verifyDeviceToken(token: string): Promise<User> {
    const client = this.supabase.getAdminClient();

    // Get device token info
    const { data: tokenData, error: tokenError } = await client
      .from('device_tokens')
      .select('*, users(*)')
      .eq('token_hash', await this.hashToken(token))
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (tokenError || !tokenData) {
      throw new TokenExpiredError();
    }

    // Update last used
    await client
      .from('device_tokens')
      .update({ last_used: new Date().toISOString() })
      .eq('id', tokenData.id);

    // Convert to User type
    const userData = tokenData.users as any;
    return this.convertToUser(userData);
  }

  /**
   * Refresh device token
   */
  async refreshDeviceToken(input: RefreshTokenInput): Promise<AuthResponse> {
    const user = await this.verifyDeviceToken(input.deviceToken);
    
    // Create new device token
    const client = this.supabase.getAdminClient();
    
    // Deactivate old token
    await client
      .from('device_tokens')
      .update({ is_active: false })
      .eq('token_hash', await this.hashToken(input.deviceToken));

    // Create new token
    const deviceToken = await this.createDeviceToken(user.id);

    return {
      user,
      deviceToken: deviceToken.token,
      expiresAt: deviceToken.expiresAt
    };
  }

  /**
   * Get user's device tokens
   */
  async getUserDeviceTokens(userId: string): Promise<DeviceTokenInfo[]> {
    const client = this.supabase.getAdminClient();

    const { data, error } = await client
      .from('device_tokens')
      .select('id, device_name, device_id, last_used, expires_at, is_active, created_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('last_used', { ascending: false });

    if (error) {
      throw new AuthError('TOKEN_FETCH_FAILED', 'Failed to fetch device tokens');
    }

    return data || [];
  }

  /**
   * Revoke device token
   */
  async revokeDeviceToken(userId: string, tokenId: string): Promise<void> {
    const client = this.supabase.getAdminClient();

    const { error } = await client
      .from('device_tokens')
      .update({ is_active: false })
      .eq('id', tokenId)
      .eq('user_id', userId);

    if (error) {
      throw new AuthError('TOKEN_REVOKE_FAILED', 'Failed to revoke device token');
    }
  }

  // Helper methods
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async findUserByPhone(phone: string): Promise<User | null> {
    const client = this.supabase.getAdminClient();
    
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error || !data) {
      return null;
    }

    return this.convertToUser(data);
  }

  private async createUserWithPhone(phone: string): Promise<User> {
    const client = this.supabase.getAdminClient();
    
    // Create a temporary email (user can update later)
    const tempEmail = `${nanoid(10)}@temp.birthday.app`;

    const { data, error } = await client
      .from('users')
      .insert({
        email: tempEmail,
        phone,
        phone_verified: true,
        subscription: 'free'
      })
      .select()
      .single();

    if (error || !data) {
      this.logger.error('Failed to create user', error);
      throw new AuthError('USER_CREATION_FAILED', 'Failed to create user');
    }

    return this.convertToUser(data);
  }

  private async createDeviceToken(userId: string, deviceName?: string, deviceId?: string): Promise<{ token: string; expiresAt: string }> {
    const client = this.supabase.getAdminClient();
    
    const token = nanoid(64); // Long random token
    const tokenHash = await this.hashToken(token);
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year

    const { error } = await client
      .from('device_tokens')
      .insert({
        user_id: userId,
        token_hash: tokenHash,
        device_name: deviceName,
        device_id: deviceId,
        expires_at: expiresAt.toISOString()
      });

    if (error) {
      this.logger.error('Failed to create device token', error);
      throw new AuthError('TOKEN_CREATION_FAILED', 'Failed to create device token');
    }

    return {
      token,
      expiresAt: expiresAt.toISOString()
    };
  }

  private convertToUser(data: any): User {
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      phone: data.phone,
      phoneVerified: data.phone_verified || false,
      subscription: data.subscription || 'free',
      hasRecoveryPassword: !!data.recovery_password_hash,
      createdAt: data.created_at
    };
  }

  private async hashToken(token: string): Promise<string> {
    // Simple hash for development - use crypto.subtle in production
    return `hash_${token}`;
  }

  private async hashPassword(password: string): Promise<string> {
    // Simple hash for development - use bcrypt in production
    return `hash_${password}`;
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    // Simple verification for development - use bcrypt in production
    return hash === `hash_${password}`;
  }

  private async sendSMS(phone: string, message: string): Promise<void> {
    // TODO: Integrate with SMS provider (Twilio, AWS SNS, etc.)
    this.logger.info(`📱 SMS to ${phone}: ${message}`);
  }
}