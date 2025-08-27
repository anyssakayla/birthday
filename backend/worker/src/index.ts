import { Router, IRequest, error, json } from 'itty-router';
import { Env } from './shared/types/env';
import { AppError } from './shared/utils/errors';
import { Logger } from './shared/utils/logger';
import { AuthController, createAuthMiddleware } from './modules/auth';
import { SupabaseService } from './shared/database/supabase.client';

// Create router
const router = Router();

// CORS middleware
const corsHeaders = (env: Env) => ({
  'Access-Control-Allow-Origin': env.CORS_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
});

// Health check endpoint
router.get('/health', (request: IRequest, env: Env) => {
  return json({ 
    status: 'ok', 
    environment: env.ENVIRONMENT,
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
router.get('/api/test', (request: IRequest, env: Env) => {
  const logger = new Logger('TestEndpoint', env);
  logger.info('Test endpoint called');
  
  return json({ 
    message: 'Birthday API is working!',
    environment: env.ENVIRONMENT
  });
});

// Database test endpoint
router.get('/api/test/db', async (request: IRequest, env: Env) => {
  const logger = new Logger('DatabaseTest', env);
  logger.info('Database test endpoint called');
  
  try {
    const supabaseService = new SupabaseService(env);
    const isConnected = await supabaseService.testConnection();
    
    if (isConnected) {
      return json({
        message: 'Database connection successful',
        environment: env.ENVIRONMENT,
        connected: true
      });
    } else {
      return json(
        { error: 'Database connection failed', connected: false }, 
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('Database test failed', error);
    return json(
      { error: 'Database connection failed', details: error.message }, 
      { status: 500 }
    );
  }
});

// Auth routes
router.post('/api/auth/verify/send', async (request: IRequest, env: Env) => {
  const authController = new AuthController(env);
  return await authController.sendVerificationCode(request, env);
});

router.post('/api/auth/verify/confirm', async (request: IRequest, env: Env) => {
  const authController = new AuthController(env);
  return await authController.verifyPhoneAndAuth(request, env);
});

router.post('/api/auth/recovery/login', async (request: IRequest, env: Env) => {
  const authController = new AuthController(env);
  return await authController.recoveryLogin(request, env);
});

router.post('/api/auth/recovery/password', async (request: IRequest, env: Env) => {
  const authMiddleware = createAuthMiddleware(env);
  const authController = new AuthController(env);
  
  // Verify authentication
  await authMiddleware.required(request);
  return await authController.setRecoveryPassword(request, env);
});

router.post('/api/auth/token/refresh', async (request: IRequest, env: Env) => {
  const authController = new AuthController(env);
  return await authController.refreshToken(request, env);
});

router.get('/api/auth/me', async (request: IRequest, env: Env) => {
  const authMiddleware = createAuthMiddleware(env);
  const authController = new AuthController(env);
  
  // Verify authentication
  await authMiddleware.required(request);
  return await authController.getCurrentUser(request, env);
});

router.get('/api/auth/devices', async (request: IRequest, env: Env) => {
  const authMiddleware = createAuthMiddleware(env);
  const authController = new AuthController(env);
  
  // Verify authentication
  await authMiddleware.required(request);
  return await authController.getUserDevices(request, env);
});

router.delete('/api/auth/devices/:tokenId', async (request: IRequest, env: Env) => {
  const authMiddleware = createAuthMiddleware(env);
  const authController = new AuthController(env);
  
  // Verify authentication
  await authMiddleware.required(request);
  return await authController.revokeDeviceToken(request, env);
});

router.post('/api/auth/logout', async (request: IRequest, env: Env) => {
  const authMiddleware = createAuthMiddleware(env);
  const authController = new AuthController(env);
  
  // Verify authentication
  await authMiddleware.required(request);
  return await authController.logout(request, env);
});

// TODO: Add birthday routes  
// router.get('/api/birthdays', ...);
// router.post('/api/birthdays', ...);

// 404 handler
router.all('*', () => {
  return error(404, 'Not Found');
});

// Main worker handler
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const logger = new Logger('Worker', env);
    
    try {
      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders(env) });
      }
      
      // Log request in development
      if (env.ENVIRONMENT === 'development') {
        logger.debug('Incoming request', {
          method: request.method,
          url: request.url,
          headers: Object.fromEntries(request.headers.entries())
        });
      }
      
      // Route request
      const response = await router.handle(request, env, ctx);
      
      // Add CORS headers to response
      const corsResponse = new Response(response.body, response);
      Object.entries(corsHeaders(env)).forEach(([key, value]) => {
        corsResponse.headers.set(key, value);
      });
      
      return corsResponse;
      
    } catch (error) {
      logger.error('Unhandled error', error);
      
      // Handle custom app errors
      if (error instanceof AppError) {
        return json(
          { 
            error: {
              code: error.code,
              message: error.message,
              details: error.details
            }
          },
          { 
            status: error.statusCode,
            headers: corsHeaders(env)
          }
        );
      }
      
      // Generic error response
      const message = env.ENVIRONMENT === 'production' 
        ? 'Internal Server Error'
        : (error as Error).message;
        
      return json(
        { error: { code: 'INTERNAL_ERROR', message } },
        { status: 500, headers: corsHeaders(env) }
      );
    }
  },
};