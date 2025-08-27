# Birthday App Backend

This backend provides API services for the Birthday Reminder mobile app using CloudFlare Workers and Supabase.

## Architecture

- **CloudFlare Workers**: Edge API endpoints
- **Supabase**: PostgreSQL database with auth
- **Docker**: Local development environment

## Quick Start

### 1. Prerequisites
- Node.js 18+
- Docker Desktop
- PostgreSQL (already installed)
- TablePlus (already installed)

### 2. Install Dependencies

```bash
cd backend/worker
npm install
```

### 3. Start Local Database

```bash
cd backend
docker-compose up -d
```

This starts PostgreSQL on port 54322.

### 4. Run Database Migrations

Using TablePlus:
1. Connect to `localhost:54322` (user: postgres, password: postgres)
2. Run the SQL from `supabase/migrations/001_initial_schema.sql`

### 5. Start Worker Locally

```bash
cd backend/worker
npm run dev
```

The API will be available at `http://localhost:8787`

### 6. Test the API

```bash
# Health check
curl http://localhost:8787/health

# Test endpoint
curl http://localhost:8787/api/test
```

## Next Steps

1. **Create CloudFlare Account**
   - Sign up at https://dash.cloudflare.com
   - Get Account ID and API Token

2. **Set up Supabase Project** (for production)
   - Create project at https://app.supabase.com
   - Get project URL and keys

3. **Configure Secrets**
   ```bash
   wrangler secret put SUPABASE_URL
   wrangler secret put SUPABASE_ANON_KEY
   wrangler secret put SUPABASE_SERVICE_KEY
   wrangler secret put JWT_SECRET
   wrangler secret put OPENAI_API_KEY
   ```

## API Endpoints

### Currently Implemented
- `GET /health` - Health check
- `GET /api/test` - Test endpoint

### Coming Soon
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/birthdays` - List birthdays
- `POST /api/birthdays` - Create birthday
- `POST /api/gifts/suggest` - AI gift suggestions

## Development

### Project Structure
```
backend/
├── worker/          # CloudFlare Worker API
│   ├── src/
│   │   ├── modules/    # Feature modules
│   │   ├── shared/     # Shared utilities
│   │   └── index.ts    # Main router
│   └── wrangler.toml   # CloudFlare config
├── supabase/        # Database setup
│   └── migrations/     # SQL migrations
└── docker-compose.yml  # Local services
```

### Environment Variables

Create `.dev.vars` in the worker directory:
```env
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-key-here
SUPABASE_SERVICE_KEY=your-key-here
JWT_SECRET=your-secret-here
OPENAI_API_KEY=sk-...
CORS_ORIGIN=http://localhost:8081
```