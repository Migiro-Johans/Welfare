# Welfare Poll - Vercel + Supabase Deployment Guide

Complete guide to deploy your application using Vercel (frontend + backend) and Supabase (database).

## Architecture

```
┌─────────────────────────────────────┐
│          Vercel                     │
│                                     │
│  ┌──────────────┐  ┌─────────────┐ │
│  │   Frontend   │  │   Backend   │ │
│  │   (React)    │  │   (API)     │ │
│  └──────────────┘  └─────────────┘ │
└────────────────┬────────────────────┘
                 │
                 ↓ Database Connection
         ┌───────────────┐
         │   Supabase    │
         │  (PostgreSQL) │
         └───────────────┘
```

---

## Prerequisites

1. [Vercel Account](https://vercel.com) - Sign up with GitHub
2. [Supabase Account](https://supabase.com) - Sign up with GitHub
3. GitHub repository with your code (already done ✓)

---

## Step 1: Set Up Supabase Database (10 minutes)

### 1.1 Create Supabase Project

1. Go to https://supabase.com
2. Click "New project"
3. Fill in details:
   - **Name**: `welfare-poll`
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users (e.g., `East US`)
4. Click "Create new project"
5. Wait 2-3 minutes for provisioning

### 1.2 Get Database Connection Details

Once the project is ready:

1. Go to **Settings** → **Database**
2. Note these details:

**Direct Connection (for migrations):**
```
Host: db.xxxxxxx.supabase.co
Port: 5432
Database: postgres
User: postgres
Password: [your-password]
```

**Connection Pooling (for production):**
```
Host: db.xxxxxxx.supabase.co
Port: 6543
```

**Connection String (for backend):**
```
postgresql://postgres:[PASSWORD]@db.xxxxxxx.supabase.co:6543/postgres?pgbouncer=true
```

### 1.3 Run Database Migrations

Go to **SQL Editor** in Supabase dashboard and run these queries in order:

#### Migration 1: Create Tables

```sql
-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  member_id VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP WITH TIME ZONE,
  password_reset_by INTEGER REFERENCES members(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
  vote_option INTEGER NOT NULL CHECK (vote_option IN (1, 2)),
  vote_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(member_id)
);

-- Create poll_settings table
CREATE TABLE IF NOT EXISTS poll_settings (
  id SERIAL PRIMARY KEY,
  poll_status VARCHAR(20) DEFAULT 'open' CHECK (poll_status IN ('open', 'closed', 'not_started')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  total_expected_members INTEGER DEFAULT 300,
  minimum_participation INTEGER DEFAULT 150,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INTEGER,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_votes_member_id ON votes(member_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_member_id ON audit_logs(member_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_member_id ON notifications(member_id);
CREATE INDEX IF NOT EXISTS idx_members_reset_token ON members(reset_token);

-- Insert default poll settings
INSERT INTO poll_settings (poll_status, total_expected_members, minimum_participation)
VALUES ('open', 300, 150)
ON CONFLICT DO NOTHING;
```

#### Migration 2: Create Admin User

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
) ON CONFLICT (email) DO NOTHING;
```

**Admin Credentials:**
- Email: `admin@welfare.com`
- Password: `admin123`

---

## Step 2: Prepare Backend for Vercel (15 minutes)

Vercel supports Node.js backends through serverless functions, but since we have an Express app, we'll use a simpler approach: deploy the Express app as-is.

### 2.1 Create Vercel Configuration for Backend

Create [welfare-poll-backend/vercel.json](welfare-poll-backend/vercel.json):

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/app.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/app.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 2.2 Update Backend Package.json

Ensure your [welfare-poll-backend/package.json](welfare-poll-backend/package.json) has:

```json
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js"
  },
  "engines": {
    "node": "18.x"
  }
}
```

### 2.3 Generate Production Secrets

Run this command twice to generate JWT_SECRET and VOTE_SECRET:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Save both outputs - you'll need them for environment variables.

---

## Step 3: Deploy Backend to Vercel (10 minutes)

### Option A: Via Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy Backend**
   ```bash
   cd welfare-poll-backend
   vercel --prod
   ```

4. **Configure Environment Variables**

   After deployment, go to Vercel dashboard → Your backend project → Settings → Environment Variables

   Add these variables:

   ```env
   NODE_ENV=production

   # Supabase Database (use connection pooling)
   DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.xxxxxxx.supabase.co:6543/postgres?pgbouncer=true&sslmode=require

   # JWT Configuration
   JWT_SECRET=[generated-secret-from-step-2.3]
   JWT_EXPIRE=7d

   # Vote Security
   VOTE_SECRET=[generated-secret-from-step-2.3]

   # CORS (update after frontend deployment)
   CORS_ORIGIN=https://welfare-poll.vercel.app
   FRONTEND_URL=https://welfare-poll.vercel.app

   # Rate Limiting
   RATE_LIMIT_WINDOW=15
   RATE_LIMIT_MAX=100
   ```

5. **Redeploy with Environment Variables**
   ```bash
   vercel --prod
   ```

6. **Note Your Backend URL**
   - Example: `https://welfare-poll-backend.vercel.app`
   - Test: Visit `https://your-backend-url.vercel.app/health`

### Option B: Via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import `Migiro-Johans/Welfare` repository
4. Configure:
   - **Root Directory**: `welfare-poll-backend`
   - **Framework Preset**: Other
   - **Build Command**: `npm install`
   - **Output Directory**: (leave empty)
5. Add environment variables (same as Option A)
6. Click "Deploy"

---

## Step 4: Deploy Frontend to Vercel (10 minutes)

### Option A: Via Vercel CLI

1. **Deploy Frontend**
   ```bash
   cd welfare-poll-frontend
   vercel --prod
   ```

2. **Configure Environment Variables**

   Go to Vercel dashboard → Your frontend project → Settings → Environment Variables

   Add these:

   ```env
   VITE_API_URL=https://your-backend-url.vercel.app/api
   VITE_SOCKET_URL=https://your-backend-url.vercel.app
   ```

3. **Redeploy**
   ```bash
   vercel --prod
   ```

### Option B: Via Vercel Dashboard

1. Click "Add New" → "Project"
2. Import `Migiro-Johans/Welfare` repository again
3. Configure:
   - **Root Directory**: `welfare-poll-frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variables (VITE_API_URL and VITE_SOCKET_URL)
5. Click "Deploy"

---

## Step 5: Update CORS Settings (5 minutes)

Now that you have your frontend URL, update the backend:

1. Go to Vercel dashboard → Backend project → Settings → Environment Variables
2. Update these variables:
   ```env
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```
3. Vercel will automatically redeploy

---

## Step 6: Test Your Deployment (10 minutes)

### Testing Checklist

- [ ] **Backend Health Check**
  - Visit: `https://your-backend-url.vercel.app/health`
  - Should return: `{"success":true,"message":"Server is running"}`

- [ ] **Frontend Access**
  - Visit: `https://your-frontend-url.vercel.app`
  - Should load the login page

- [ ] **Admin Login**
  - Email: `admin@welfare.com`
  - Password: `admin123`
  - Should access admin dashboard

- [ ] **User Registration**
  - Register a new user
  - Verify phone uniqueness
  - Login with new user

- [ ] **Voting System**
  - Submit a vote
  - View results page
  - Check vote count updates

- [ ] **Admin Features**
  - View analytics dashboard
  - Generate temporary password for a user
  - View audit logs

- [ ] **Password Reset**
  - Test "Forgot Password" flow
  - Request password reset
  - Contact admin with reset token

---

## Troubleshooting

### Database Connection Issues

**Error**: "connect ETIMEDOUT" or "connect ECONNREFUSED"

**Solution**:
1. Verify DATABASE_URL is correct
2. Ensure you're using port 6543 (connection pooler)
3. Add `?pgbouncer=true&sslmode=require` to connection string

### CORS Errors

**Error**: "Access to fetch blocked by CORS policy"

**Solution**:
1. Verify CORS_ORIGIN matches your frontend URL exactly
2. No trailing slashes in URLs
3. Wait for backend to redeploy after changing env vars

### Frontend Build Errors

**Error**: "Failed to build"

**Solution**:
1. Check that VITE_API_URL and VITE_SOCKET_URL are set
2. Verify all dependencies are in package.json
3. Check Vercel build logs for specific errors

### Backend Function Timeouts

**Error**: "Function execution timed out"

**Solution**:
1. Vercel serverless functions have 10s timeout on free tier
2. Optimize slow database queries
3. Add indexes to frequently queried columns
4. Consider upgrading to Pro plan for 60s timeout

### WebSocket Connection Issues

**Error**: Socket.io not connecting

**Note**: Vercel serverless functions don't support persistent WebSocket connections. You have two options:

1. **Remove real-time features** (simpler)
   - Comment out Socket.io code in backend
   - Remove Socket.io from frontend
   - Use polling instead

2. **Deploy backend to Railway** (recommended for production)
   - Keep frontend on Vercel
   - Deploy backend to Railway (supports WebSockets)
   - Follow instructions in [SUPABASE_DEPLOYMENT.md](SUPABASE_DEPLOYMENT.md)

---

## Environment Variables Reference

### Backend (Vercel)

```env
NODE_ENV=production
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxxxx.supabase.co:6543/postgres?pgbouncer=true&sslmode=require
JWT_SECRET=[64-char-hex-string]
JWT_EXPIRE=7d
VOTE_SECRET=[64-char-hex-string]
CORS_ORIGIN=https://your-frontend-url.vercel.app
FRONTEND_URL=https://your-frontend-url.vercel.app
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### Frontend (Vercel)

```env
VITE_API_URL=https://your-backend-url.vercel.app/api
VITE_SOCKET_URL=https://your-backend-url.vercel.app
```

---

## Monitoring and Maintenance

### Vercel Monitoring

1. **Function Logs**
   - Go to Vercel project → Logs
   - View real-time function invocations
   - Debug errors

2. **Analytics**
   - Enable Vercel Analytics in project settings
   - Track performance metrics
   - Monitor bandwidth usage

### Supabase Monitoring

1. **Database Usage**
   - Go to Supabase dashboard → Settings → Usage
   - Monitor storage, bandwidth, and requests
   - Check against free tier limits

2. **Query Performance**
   - Go to Database → Query Performance
   - Identify slow queries
   - Add indexes as needed

3. **Connection Stats**
   - Go to Database → Connection Pooling
   - Monitor active connections
   - Verify pooler is working

### Database Backups

#### Manual Backup

```bash
# Backup database
pg_dump "postgresql://postgres:[PASSWORD]@db.xxxxxxx.supabase.co:5432/postgres" > backup.sql

# Restore database
psql "postgresql://postgres:[PASSWORD]@db.xxxxxxx.supabase.co:5432/postgres" < backup.sql
```

#### Automatic Backups

Supabase Pro plan ($25/month) includes:
- Daily automatic backups
- Point-in-time recovery
- 7-day retention

---

## Cost Estimate

### Free Tier

- **Vercel**:
  - Hobby plan (free)
  - Unlimited projects
  - 100GB bandwidth/month
  - 100 GB-hours serverless function execution

- **Supabase**:
  - Free tier
  - 500MB database storage
  - 2GB file storage
  - 5GB bandwidth/month
  - Unlimited API requests

**Total Cost**: $0/month (within free tier limits)

### If You Exceed Free Tier

- **Vercel Pro**: $20/month (per user)
- **Supabase Pro**: $25/month (per project)

**Estimated Cost for 300+ users**: ~$45-50/month

---

## Production Recommendations

### 1. Use Custom Domain

#### Vercel Domain Setup

1. Go to project → Settings → Domains
2. Add your custom domain
3. Configure DNS records:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### 2. Enable HTTPS

Both Vercel and Supabase provide automatic SSL certificates. No additional setup needed!

### 3. Set Up Error Tracking

Consider integrating:
- [Sentry](https://sentry.io) for error tracking
- [LogRocket](https://logrocket.com) for session replay

### 4. Performance Optimization

1. **Database Indexes**
   ```sql
   CREATE INDEX idx_votes_created_at ON votes(created_at);
   CREATE INDEX idx_members_email_phone ON members(email, phone);
   ```

2. **Caching**
   - Use Vercel Edge Network for static assets
   - Implement API response caching for frequently accessed data

3. **Connection Pooling**
   - Always use Supabase pooler (port 6543) for production
   - Monitor connection stats in Supabase dashboard

### 5. Security Checklist

- [ ] Change admin password from `admin123`
- [ ] Generate new JWT_SECRET and VOTE_SECRET
- [ ] Enable Supabase Row Level Security (RLS)
- [ ] Set up database backup schedule
- [ ] Configure rate limiting appropriately
- [ ] Review and restrict database access
- [ ] Enable 2FA on Vercel and Supabase accounts
- [ ] Never commit .env files to git

---

## Alternative: Backend on Railway (Recommended for Production)

If you need WebSocket support or want traditional server deployment:

### Why Railway for Backend?

- ✅ Full WebSocket support (Socket.io works)
- ✅ Traditional server environment
- ✅ Better for long-running processes
- ✅ More predictable pricing

### Quick Setup

1. Deploy backend to Railway instead of Vercel
2. Keep frontend on Vercel
3. Follow instructions in [SUPABASE_DEPLOYMENT.md](SUPABASE_DEPLOYMENT.md)

**Architecture:**
```
Frontend (Vercel) → Backend (Railway) → Database (Supabase)
```

---

## Support and Resources

### Documentation

- **Vercel**: https://vercel.com/docs
- **Supabase**: https://supabase.com/docs
- **Node.js on Vercel**: https://vercel.com/docs/functions/serverless-functions/runtimes/node-js

### Community

- **Vercel Discord**: https://vercel.com/discord
- **Supabase Discord**: https://discord.supabase.com

### Getting Help

1. Check Vercel function logs for backend errors
2. Check browser console for frontend errors
3. Check Supabase logs for database errors
4. Review this guide's troubleshooting section

---

## Next Steps After Deployment

1. ✅ Test all features thoroughly
2. ✅ Change admin password
3. ✅ Set up custom domain (optional)
4. ✅ Configure error tracking
5. ✅ Set up database backups
6. ✅ Monitor usage and costs
7. ✅ Document your deployment details

---

**Deployment Date**: 2025-11-18

**Status**: Ready for deployment to Vercel + Supabase! 🚀

**Estimated Time**: 45-60 minutes total

---

## Quick Command Reference

```bash
# Generate secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy backend
cd welfare-poll-backend && vercel --prod

# Deploy frontend
cd welfare-poll-frontend && vercel --prod

# Manual database backup
pg_dump "postgresql://postgres:[PASSWORD]@db.xxxxxxx.supabase.co:5432/postgres" > backup.sql
```

---

Your application is now fully deployed on Vercel with Supabase! 🎉
