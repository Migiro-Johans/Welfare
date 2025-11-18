# Welfare Poll - Supabase Deployment Guide

Complete guide to deploy your application using Supabase as the database.

## Why Supabase?

- ✅ **Free Tier**: 500MB database, unlimited API requests
- ✅ **Managed PostgreSQL**: No database management needed
- ✅ **Auto-backups**: Automatic daily backups
- ✅ **Real-time**: Built-in real-time subscriptions
- ✅ **Dashboard**: Easy-to-use web interface
- ✅ **Connection Pooling**: Built-in Supavisor for connection management

---

## Architecture

```
┌─────────────────┐
│   Vercel        │  ← Frontend (React)
│   (Frontend)    │
└────────┬────────┘
         │
         ↓ API Calls
┌─────────────────┐
│   Railway       │  ← Backend (Node.js/Express)
│   (Backend)     │
└────────┬────────┘
         │
         ↓ Database Connection
┌─────────────────┐
│   Supabase      │  ← PostgreSQL Database
│   (Database)    │
└─────────────────┘
```

---

## Part 1: Set Up Supabase (5 minutes)

### Step 1: Create Supabase Project

1. **Go to Supabase**
   - Visit https://supabase.com
   - Click "Start your project"
   - Sign up with GitHub (recommended)

2. **Create New Project**
   - Click "New Project"
   - Organization: Create or select
   - Name: `welfare-poll`
   - Database Password: Generate strong password (save this!)
   - Region: Choose closest to your users (e.g., `East US`)
   - Click "Create new project"
   - Wait 2-3 minutes for provisioning

3. **Get Connection Details**

   Once project is ready, go to **Settings** → **Database**

   You'll need these connection details:

   **Direct Connection (for migrations):**
   ```
   Host: db.xxxxxxx.supabase.co
   Port: 5432
   Database: postgres
   User: postgres
   Password: [your-password]
   ```

   **Connection String:**
   ```
   postgresql://postgres:[PASSWORD]@db.xxxxxxx.supabase.co:5432/postgres
   ```

   **Connection Pooling (recommended for production):**
   ```
   postgresql://postgres:[PASSWORD]@db.xxxxxxx.supabase.co:6543/postgres?pgbouncer=true
   ```

### Step 2: Run Database Migrations

#### Option A: Using Supabase SQL Editor (Easiest)

1. Go to **SQL Editor** in Supabase dashboard
2. Click "New query"
3. Copy and paste migration files one by one:

**Migration 1: Create Tables**

Copy content from `welfare-poll-backend/migrations/create-tables.sql` and run it.

**Migration 2: Update Phone Unique**

Copy content from `welfare-poll-backend/migrations/update-phone-unique.sql` and run it.

**Migration 3: Add Total Expected Members**

Copy content from `welfare-poll-backend/migrations/add-total-expected-members.sql` and run it.

**Migration 4: Add Password Reset Fields**

Copy content from `welfare-poll-backend/migrations/add-password-reset-fields.sql` and run it.

#### Option B: Using Command Line

1. **Install psql** (if not already installed)
   ```bash
   # macOS
   brew install postgresql

   # Ubuntu/Debian
   sudo apt-get install postgresql-client
   ```

2. **Run Migrations**
   ```bash
   cd welfare-poll-backend

   # Replace with your Supabase connection string
   SUPABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxxxx.supabase.co:5432/postgres"

   psql "$SUPABASE_URL" < migrations/create-tables.sql
   psql "$SUPABASE_URL" < migrations/update-phone-unique.sql
   psql "$SUPABASE_URL" < migrations/add-total-expected-members.sql
   psql "$SUPABASE_URL" < migrations/add-password-reset-fields.sql
   ```

### Step 3: Create Admin User

In Supabase SQL Editor, run:

```sql
INSERT INTO members (
  member_id,
  email,
  phone,
  full_name,
  password_hash,
  is_admin,
  is_active,
  email_verified,
  created_at,
  updated_at
) VALUES (
  'ADMIN001',
  'admin@welfare.com',
  '+254700000000',
  'Admin User',
  '$2b$12$0pnLCfeSOSH1xH/ATDh5OOPTZhlHvVkl2RiSy9Xnno2/oc15aGDru',
  true,
  true,
  true,
  NOW(),
  NOW()
);
```

**Admin credentials:**
- Email: `admin@welfare.com`
- Password: `admin123`

### Step 4: Configure Connection Pooling (Important!)

For production, use Supabase's connection pooler:

1. Go to **Settings** → **Database**
2. Find "Connection Pooling" section
3. Mode: `Transaction` (recommended)
4. Copy the pooler connection string (port 6543)

---

## Part 2: Deploy Backend to Railway (10 minutes)

### Step 1: Prepare Backend

No code changes needed! The backend already uses standard PostgreSQL connection.

### Step 2: Deploy to Railway

1. **Go to Railway**
   - Visit https://railway.app
   - Login with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `Migiro-Johans/Welfare`
   - Set root directory: `welfare-poll-backend`

3. **Configure Environment Variables**

   In Railway, go to your service → Variables:

   ```env
   NODE_ENV=production
   PORT=5000

   # Supabase Connection (use connection pooling)
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxxxx.supabase.co:6543/postgres?pgbouncer=true

   # Or use individual variables
   DB_HOST=db.xxxxxxx.supabase.co
   DB_PORT=6543
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=[your-supabase-password]

   # Security (generate new secrets!)
   JWT_SECRET=[generate-with-command-below]
   JWT_EXPIRE=7d
   VOTE_SECRET=[generate-with-command-below]

   # CORS (update after Vercel deployment)
   CORS_ORIGIN=https://your-app.vercel.app
   FRONTEND_URL=https://your-app.vercel.app

   # Rate Limiting
   RATE_LIMIT_WINDOW=15
   RATE_LIMIT_MAX=100
   ```

   **Generate secrets:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   Run twice for JWT_SECRET and VOTE_SECRET.

4. **Deploy**
   - Railway will automatically build and deploy
   - Wait for deployment to complete
   - Copy your backend URL (e.g., `https://welfare-poll-backend.railway.app`)

5. **Verify Backend**
   - Visit `https://your-backend-url.railway.app/health`
   - Should return: `{"success":true,"message":"Server is running"}`

---

## Part 3: Deploy Frontend to Vercel (5 minutes)

### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd welfare-poll-frontend
   vercel --prod
   ```

4. **Set Environment Variables**

   When prompted or via dashboard:
   ```env
   VITE_API_URL=https://your-backend-url.railway.app/api
   VITE_SOCKET_URL=https://your-backend-url.railway.app
   ```

### Option B: Using Vercel Dashboard

1. **Go to Vercel**
   - Visit https://vercel.com/dashboard
   - Click "Add New" → "Project"

2. **Import Repository**
   - Select `Migiro-Johans/Welfare`
   - Click "Import"

3. **Configure Project**
   - Framework Preset: `Vite`
   - Root Directory: `welfare-poll-frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Environment Variables**
   ```env
   VITE_API_URL=https://your-backend-url.railway.app/api
   VITE_SOCKET_URL=https://your-backend-url.railway.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://welfare-poll.vercel.app`

---

## Part 4: Update Backend CORS (2 minutes)

1. Go back to Railway
2. Update backend environment variables:
   ```env
   CORS_ORIGIN=https://your-app.vercel.app
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Railway will auto-redeploy

---

## Part 5: Testing (5 minutes)

### Test Checklist

- [ ] **Backend Health**: Visit `https://your-backend.railway.app/health`
- [ ] **Frontend**: Visit `https://your-app.vercel.app`
- [ ] **Admin Login**: Email: `admin@welfare.com`, Password: `admin123`
- [ ] **Database**: Check Supabase Table Editor for data
- [ ] **Registration**: Create new user
- [ ] **Voting**: Submit a vote
- [ ] **Results**: View results page
- [ ] **Admin Dashboard**: View analytics
- [ ] **Password Reset**: Test password reset flow

---

## Supabase Features You Can Use

### 1. Database Dashboard

- **Table Editor**: View and edit data directly
- **SQL Editor**: Run custom queries
- **Backups**: Automatic daily backups (paid tiers)

### 2. Monitoring

- **Database Usage**: Monitor storage and requests
- **Connection Stats**: See active connections
- **Query Performance**: Analyze slow queries

### 3. API (Optional)

Supabase provides auto-generated REST and GraphQL APIs. You can use these in the future if you want to:
- Simplify some API endpoints
- Use real-time subscriptions
- Leverage Row Level Security (RLS)

---

## Connection Pooling Explained

**Why use connection pooling?**
- Prevents "too many connections" errors
- Better performance under load
- Required for serverless deployments

**When to use:**
- **Port 5432 (Direct)**: Local development, migrations
- **Port 6543 (Pooler)**: Production backend

**Your setup:**
```env
# Development (.env)
DATABASE_URL=postgresql://postgres:password@localhost:5432/welfare_poll

# Production (Railway)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxxxx.supabase.co:6543/postgres?pgbouncer=true
```

---

## Security Best Practices

### Database Security

1. **Never expose database password**
   - Use environment variables only
   - Don't commit to git

2. **Use Connection Pooling**
   - Port 6543 for production
   - Prevents connection exhaustion

3. **Enable RLS (Optional)**
   - Supabase Row Level Security
   - Additional layer of protection

### Application Security

1. **Change Admin Password**
   - Login and change from `admin123`
   - Use password reset feature

2. **Generate New Secrets**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   - Use for JWT_SECRET
   - Use for VOTE_SECRET

3. **Configure CORS Properly**
   - Only allow your Vercel domain
   - No wildcards in production

---

## Supabase Limits (Free Tier)

| Resource | Free Tier Limit |
|----------|----------------|
| Database | 500 MB |
| Bandwidth | 5 GB/month |
| API Requests | Unlimited |
| Auth Users | 50,000 |
| Storage | 1 GB |

**Your app usage:**
- ~10-20 MB for database (for 300 users)
- ~1 GB bandwidth/month (estimated)
- Well within free tier limits!

---

## Monitoring Your Database

### 1. Check Database Size

In Supabase SQL Editor:

```sql
SELECT
  pg_size_pretty(pg_database_size('postgres')) as database_size;
```

### 2. Check Table Sizes

```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 3. Check Active Connections

```sql
SELECT count(*) FROM pg_stat_activity;
```

---

## Troubleshooting

### "Too many connections" Error

**Solution**: Use connection pooling (port 6543)

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxxxx.supabase.co:6543/postgres?pgbouncer=true
```

### "SSL Connection Required" Error

**Solution**: Add SSL parameter to connection string

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxxxx.supabase.co:6543/postgres?pgbouncer=true&sslmode=require
```

### Can't Connect from Railway

**Solution**: Check Supabase network settings
1. Go to Settings → Database
2. Ensure "Connection pooling" is enabled
3. Try direct connection (port 5432) first to test

### Slow Queries

**Check in Supabase:**
1. Go to Database → Query Performance
2. Identify slow queries
3. Add indexes if needed

---

## Backup and Restore

### Manual Backup

```bash
# Backup database
pg_dump "postgresql://postgres:[PASSWORD]@db.xxxxxxx.supabase.co:5432/postgres" > backup.sql

# Restore database
psql "postgresql://postgres:[PASSWORD]@db.xxxxxxx.supabase.co:5432/postgres" < backup.sql
```

### Automatic Backups

Supabase Pro plan includes:
- Daily automatic backups
- Point-in-time recovery
- 7-day retention

---

## Cost Comparison

| Service | Free Tier | Paid (if needed) |
|---------|-----------|------------------|
| Supabase | 500MB DB, 5GB bandwidth | $25/month (8GB DB, 250GB bandwidth) |
| Railway | $5 credit | ~$10-15/month |
| Vercel | Unlimited projects | Free for most apps |
| **Total** | **~$5-10/month** | **~$35-40/month** |

**Your estimated cost**: ~$5-10/month (well within free tiers for small to medium usage)

---

## Upgrading to Paid Plans

**When to upgrade Supabase:**
- Database > 500MB
- Need point-in-time recovery
- Want automatic daily backups
- Need > 5GB bandwidth/month

**When to upgrade Railway:**
- After $5 free credit runs out
- Need more resources

---

## Next Steps After Deployment

1. **Test thoroughly** - Run through all features
2. **Monitor usage** - Check Supabase and Railway dashboards
3. **Set up alerts** - Get notified of issues
4. **Update admin password** - Change from default
5. **Configure custom domain** (optional)
6. **Enable database backups** - Manual or automatic
7. **Document your setup** - Keep connection details safe

---

## Quick Reference

### Supabase Dashboard
- **URL**: https://app.supabase.com
- **Project**: `welfare-poll`
- **Tables**: members, votes, poll_settings, audit_logs, notifications

### Connection Strings

**Development:**
```
postgresql://postgres:postgres@localhost:5432/welfare_poll
```

**Production (Direct - for migrations):**
```
postgresql://postgres:[PASSWORD]@db.xxxxxxx.supabase.co:5432/postgres
```

**Production (Pooled - for backend):**
```
postgresql://postgres:[PASSWORD]@db.xxxxxxx.supabase.co:6543/postgres?pgbouncer=true
```

### Important URLs

- **Supabase Dashboard**: https://app.supabase.com
- **Railway Dashboard**: https://railway.app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Backend Health**: https://your-backend.railway.app/health
- **Frontend**: https://your-app.vercel.app

---

## Support

**Supabase:**
- Documentation: https://supabase.com/docs
- Community: https://github.com/supabase/supabase/discussions
- Discord: https://discord.supabase.com

**Issues?**
1. Check Supabase logs in dashboard
2. Check Railway logs for backend
3. Check Vercel logs for frontend
4. Check browser console for client errors

---

**Status**: Ready for deployment with Supabase! 🚀

Your application is optimized for Supabase's managed PostgreSQL.
