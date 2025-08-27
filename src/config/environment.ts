// Environment configuration for API endpoints
const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : true;

export const config = {
  api: {
    baseUrl: isDev ? 'http://localhost:8787' : 'https://your-worker.your-subdomain.workers.dev',
    timeout: 10000,
  },
  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
  },
} as const;