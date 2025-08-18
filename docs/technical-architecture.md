# Technical Architecture

## 🏗 System Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Mobile App    │────▶│ CloudFlare       │────▶│    Supabase     │
│  (React Native) │◀────│   Workers        │◀────│   PostgreSQL    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                                                  │
         │              ┌──────────────────┐               │
         └─────────────▶│  CloudFlare R2   │◀──────────────┘
                        │  (Image Storage) │
                        └──────────────────┘
```

## 📱 Mobile Architecture

### Local-First Design
- **Primary Storage**: SQLite for all user data
- **Sync Queue**: Tracks all changes for server sync
- **Offline Mode**: Full functionality without internet
- **Optimistic UI**: Immediate updates, sync in background

### Data Flow
```
User Action → SQLite → UI Update → Sync Queue → Background Sync → Server
                ↑                                      │
                └─────────── Sync Response ◀───────────┘
```

### Key Libraries
- **Database**: expo-sqlite
- **State Management**: Zustand
- **Navigation**: React Navigation
- **UI Components**: React Native Paper
- **Forms**: React Hook Form
- **Secure Storage**: expo-secure-store
- **Networking**: Built-in fetch with retry logic

## 🗄 Database Schema

### Local SQLite Schema

```sql
-- Core birthday table
CREATE TABLE birthdays (
  id TEXT PRIMARY KEY,              -- nanoid generated
  name TEXT NOT NULL,
  date TEXT NOT NULL,               -- ISO format: YYYY-MM-DD
  phone TEXT,
  notes TEXT,
  photo_url TEXT,
  color TEXT,                       -- Hex color for gradient
  custom_message TEXT,              -- Person-specific template
  notification_settings TEXT,       -- JSON: override global settings
  synced_at TEXT,
  updated_at TEXT NOT NULL,
  deleted_at TEXT                   -- Soft delete
);

-- Sync queue for offline changes
CREATE TABLE sync_queue (
  id TEXT PRIMARY KEY,
  operation TEXT NOT NULL,          -- 'create', 'update', 'delete'
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  data TEXT NOT NULL,               -- JSON payload
  created_at TEXT NOT NULL,
  retry_count INTEGER DEFAULT 0,
  last_error TEXT
);

-- Message templates
CREATE TABLE message_templates (
  id TEXT PRIMARY KEY,
  category TEXT,                    -- 'friend', 'family', 'colleague', null
  template TEXT NOT NULL,
  is_global BOOLEAN DEFAULT true,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Gift suggestions cache
CREATE TABLE gift_suggestions (
  id TEXT PRIMARY KEY,
  birthday_id TEXT NOT NULL,
  suggestions TEXT NOT NULL,        -- JSON array
  generated_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,         -- One year from generation
  FOREIGN KEY(birthday_id) REFERENCES birthdays(id)
);

-- Settings
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Analytics events (local only)
CREATE TABLE analytics_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  data TEXT,
  created_at TEXT NOT NULL
);
```

### Cloud Database Schema (Supabase)

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  phone TEXT,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Birthdays table (synced from mobile)
CREATE TABLE birthdays (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  phone TEXT,
  notes TEXT,
  photo_key TEXT,                   -- R2 storage key
  color TEXT,
  custom_message TEXT,
  notification_settings JSONB,
  client_updated_at TIMESTAMPTZ,
  server_updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Gift card transactions
CREATE TABLE gift_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  birthday_id TEXT REFERENCES birthdays(id),
  provider TEXT NOT NULL,           -- 'amazon', 'target', etc.
  amount DECIMAL(10, 2) NOT NULL,
  commission DECIMAL(10, 2),
  status TEXT NOT NULL,             -- 'pending', 'completed', 'failed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI gift suggestions log
CREATE TABLE gift_suggestions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  birthday_id TEXT REFERENCES birthdays(id),
  suggestions JSONB NOT NULL,
  tokens_used INTEGER,
  cost DECIMAL(10, 4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔄 Sync Protocol

### Sync Strategy
1. **Client-Generated IDs**: Use nanoid for offline creation
2. **Last-Write-Wins**: Server timestamp breaks ties
3. **Soft Deletes**: Maintain referential integrity
4. **Incremental Sync**: Only changes since last sync
5. **Batch Operations**: Group changes for efficiency

### Sync Flow
```typescript
// Pseudo-code for sync process
async function syncBirthdays() {
  // 1. Check network status
  if (!isOnline) return;
  
  // 2. Get pending changes from sync_queue
  const pendingChanges = await getPendingChanges();
  
  // 3. Batch by operation type
  const batches = groupByOperation(pendingChanges);
  
  // 4. Send to server
  for (const batch of batches) {
    try {
      const response = await sendBatch(batch);
      await processSyncResponse(response);
      await removeSyncQueueItems(batch.ids);
    } catch (error) {
      await markSyncError(batch.ids, error);
    }
  }
  
  // 5. Pull server changes
  const lastSync = await getLastSyncTime();
  const serverChanges = await fetchChangesSince(lastSync);
  await applyServerChanges(serverChanges);
  
  // 6. Update sync timestamp
  await updateLastSyncTime();
}
```

### Conflict Resolution
- **Simple Conflicts**: Last-write-wins using server timestamp
- **Delete Conflicts**: Deleted items stay deleted
- **Complex Conflicts**: Queue for user resolution

## 🔐 Security Architecture

### Authentication Flow
```
Mobile App          CloudFlare          Supabase
    │                   │                   │
    ├──Login Request───►│                   │
    │                   ├──Verify User─────►│
    │                   │◄──User + Token────┤
    │◄──JWT Token───────┤                   │
    │                   │                   │
    ├──Store Token      │                   │
    │  (Secure Store)   │                   │
```

### Security Measures
- **Token Storage**: expo-secure-store (Keychain/Keystore)
- **API Authentication**: JWT with refresh tokens
- **Data Encryption**: SQLite encryption for sensitive data
- **Payment Security**: Never store payment info locally
- **Row Level Security**: Supabase RLS policies

## 🚀 CloudFlare Workers Endpoints

### API Structure
```
/api/auth
  POST   /register
  POST   /login
  POST   /refresh
  GET    /verify

/api/birthdays
  GET    /          - Get all birthdays
  POST   /          - Create birthday
  PUT    /:id       - Update birthday
  DELETE /:id       - Soft delete birthday

/api/sync
  POST   /push      - Send client changes
  POST   /pull      - Get server changes
  POST   /status    - Check sync health

/api/gifts
  POST   /suggest   - AI gift suggestions
  GET    /cards     - Available gift cards
  POST   /purchase  - Process gift card

/api/images
  POST   /upload    - Get signed upload URL
  GET    /:key      - Get image URL
  DELETE /:key      - Delete image
```

## 📊 Performance Optimizations

### Mobile Optimizations
- **Lazy Loading**: Load birthdays in chunks
- **Image Caching**: Cache profile photos locally
- **Debounced Sync**: Batch changes over 30 seconds
- **Background Sync**: Use background tasks for sync
- **Memoization**: Cache expensive calculations

### Backend Optimizations
- **Edge Caching**: CloudFlare cache for static data
- **Connection Pooling**: Reuse database connections
- **Query Optimization**: Indexed lookups
- **Compression**: gzip responses
- **CDN Distribution**: R2 with CloudFlare CDN

### Sync Optimizations
- **Differential Sync**: Only send changed fields
- **Compression**: Compress sync payloads
- **Pagination**: Limit batch sizes
- **Exponential Backoff**: Smart retry logic
- **Adaptive Frequency**: Sync based on usage patterns

## 🔍 Monitoring & Analytics

### Client-Side Analytics
- Birthday views
- Gift card purchases
- Message sends
- Feature usage
- Error tracking

### Server-Side Monitoring
- API response times
- Sync success rates
- Error rates by endpoint
- Database query performance
- R2 storage usage

### Key Metrics
- **DAU/MAU**: Daily/Monthly active users
- **Sync Success Rate**: Target >99%
- **Gift Card Conversion**: Purchase/view ratio
- **Message Send Rate**: Messages/birthday ratio
- **Retention**: 7-day, 30-day retention

## 🛠 Development Workflow

### Environment Setup
```bash
# Development
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=dev-key
CLOUDFLARE_WORKER_URL=http://localhost:8787

# Staging
SUPABASE_URL=https://staging.supabase.co
SUPABASE_ANON_KEY=staging-key
CLOUDFLARE_WORKER_URL=https://staging.workers.dev

# Production
SUPABASE_URL=https://prod.supabase.co
SUPABASE_ANON_KEY=prod-key
CLOUDFLARE_WORKER_URL=https://api.birthdayapp.com
```

### Testing Strategy
- **Unit Tests**: Core business logic
- **Integration Tests**: Database operations
- **E2E Tests**: Critical user flows
- **Sync Tests**: Offline/online scenarios
- **Performance Tests**: Load testing