export interface Env {
  // Environment variables
  ENVIRONMENT: 'development' | 'staging' | 'production';
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_KEY: string;
  JWT_SECRET: string;
  CORS_ORIGIN: string;
  
  // Optional - will add when you have CloudFlare account
  // IMAGES: R2Bucket;
  // RATE_LIMIT: KVNamespace;
  
  // For AI gift suggestions
  OPENAI_API_KEY?: string;
}