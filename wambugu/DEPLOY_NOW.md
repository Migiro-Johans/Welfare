# Deploy Welfare Poll App - Complete Guide

This guide will help you deploy your application to production and verify it works correctly.

## 🎯 Recommended Deployment Stack

**Best Option: Vercel + Supabase (100% Free Tier Available)**

- ✅ **Frontend**: Vercel (Free)
- ✅ **Backend**: Vercel (Free)
- ✅ **Database**: Supabase (Free tier - 500MB database)
- ✅ **Email**: Optional - Add later with Gmail

**Why this stack?**
- 100% free for small projects
- Automatic HTTPS/SSL
- Global CDN
- Easy deployment
- Great performance

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] App works locally (test at http://localhost:3000)
- [ ] Admin can login locally
- [ ] Voting works locally
- [ ] All dependencies are in package.json
- [ ] No sensitive data in code (use environment variables)

---

## 🚀 Deployment Steps

### Part 1: Deploy Database (15 minutes)

#### Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub

#### Step 2: Create New Project

1. Click "New project"
2. Fill in:
   - **Organization**: Create new or select existing
   - **Name**: `welfare-poll`
   - **Database Password**: Generate strong password (SAVE THIS!)
   - **Region**: Choose closest to your users
3. Click "Create new project"
4. Wait 2-3 minutes ⏳

#### Step 3: Run Database Migrations

1. Once project is ready, go to **SQL Editor** (left sidebar)
2. Copy and paste the contents of each migration file:

**Migration 1 - Create Tables:**
```bash
# On your local machine, copy this file:
cat welfare-poll-backend/migrations/create-tables.sql
```
Paste into Supabase SQL Editor and click "Run"

**Migration 2 - Update Phone Unique:**
```bash
cat welfare-poll-backend/migrations/update-phone-unique.sql
```
Paste and run

**Migration 3 - Add Expected Members:**
```bash
cat welfare-poll-backend/migrations/add-total-expected-members.sql
```
Paste and run

**Migration 4 - Add Password Reset:**
```bash
cat welfare-poll-backend/migrations/add-password-reset-fields.sql
```
Paste and run

#### Step 4: Create Admin User

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
)
VALUES (
  'ADMIN001',
  'admin@welfare.com',
  '+254712345678',
  'System Administrator',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5HlFpj6jQ3xWu',
  TRUE,
  TRUE,
  TRUE,
  NOW(),
  NOW()
);
```

**Admin credentials:** `admin@welfare.com` / `admin123`

#### Step 5: Get Database Connection String

1. Go to **Settings** → **Database**
2. Scroll to **Connection string** → **URI**
3. Copy the connection string (looks like):
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
4. **IMPORTANT**: Replace `[YOUR-PASSWORD]` with your actual database password
5. Save this for later! 📝

---

### Part 2: Deploy Backend to Vercel (10 minutes)

#### Step 1: Prepare Backend for Vercel

1. Create `vercel.json` in `welfare-poll-backend/`:

```bash
cd welfare-poll-backend
cat > vercel.json << 'EOF'
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
EOF
```

#### Step 2: Update package.json

Ensure your `welfare-poll-backend/package.json` has:

```json
{
  "engines": {
    "node": "18.x"
  },
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js"
  }
}
```

#### Step 3: Deploy Backend

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `welfare-poll-backend`
5. Click "Environment Variables" and add:

```
NODE_ENV=production
PORT=3000

# Database (from Supabase)
DATABASE_URL=postgresql://postgres.xxxxx:[PASSWORD]@...
DB_HOST=db.xxxxx.supabase.co
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-supabase-password

# JWT (generate new secrets!)
JWT_SECRET=your_very_long_random_secret_here_change_this
JWT_EXPIRE=7d

# Security (generate new secret!)
VOTE_SECRET=your_vote_hash_secret_change_this

# Email (disable for now, enable later)
EMAIL_ENABLED=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=disabled
SMTP_PASS=disabled
SMTP_FROM=noreply@welfare-poll.com

# CORS (will update after frontend deployment)
CORS_ORIGIN=*
FRONTEND_URL=https://your-frontend.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

6. Click "Deploy" 🚀
7. Wait for deployment (2-3 minutes)
8. Copy your backend URL (e.g., `https://welfare-poll-backend.vercel.app`)

#### Step 4: Test Backend

```bash
curl https://your-backend-url.vercel.app/health
```

Should return: `{"success":true,"message":"Server is running"...}`

---

### Part 3: Deploy Frontend to Vercel (10 minutes)

#### Step 1: Update Frontend Environment

Update `welfare-poll-frontend/.env.production`:

```bash
cd welfare-poll-frontend
cat > .env.production << 'EOF'
VITE_API_URL=https://your-backend-url.vercel.app/api
VITE_SOCKET_URL=https://your-backend-url.vercel.app
EOF
```

Replace `your-backend-url` with your actual backend URL from Part 2.

#### Step 2: Deploy Frontend

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import the same GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `welfare-poll-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:

```
VITE_API_URL=https://your-backend-url.vercel.app/api
VITE_SOCKET_URL=https://your-backend-url.vercel.app
```

6. Click "Deploy" 🚀
7. Wait for deployment (2-3 minutes)
8. Copy your frontend URL (e.g., `https://welfare-poll.vercel.app`)

---

### Part 4: Update CORS Settings

#### Step 1: Update Backend Environment

1. Go to your backend project in Vercel
2. Settings → Environment Variables
3. Update:
   - `CORS_ORIGIN` = `https://your-frontend-url.vercel.app`
   - `FRONTEND_URL` = `https://your-frontend-url.vercel.app`
4. Click "Save"
5. Go to "Deployments" tab
6. Click "..." on latest deployment → "Redeploy"

---

## ✅ Deployment Verification

### Test 1: Backend Health Check

```bash
curl https://your-backend-url.vercel.app/health
```

✅ Expected: `{"success":true,...}`

### Test 2: Database Connection

```bash
curl https://your-backend-url.vercel.app/api/poll/status
```

✅ Expected: `{"success":true,"data":{"is_open":true,...}}`

### Test 3: Frontend Loads

1. Open: `https://your-frontend-url.vercel.app`
2. ✅ Should see the login/register page
3. ✅ No console errors (F12)

### Test 4: Admin Login

1. Go to your frontend URL
2. Click "Login"
3. Enter: `admin@welfare.com` / `admin123`
4. ✅ Should login successfully
5. Navigate to `/admin`
6. ✅ Should see admin dashboard

### Test 5: User Registration

1. Click "Register"
2. Fill in:
   - Member ID: `TEST001`
   - Email: `test@example.com`
   - Name: `Test User`
   - Phone: `+254711111111`
   - Password: `Test1234!`
3. Click "Register"
4. ✅ Should register successfully

### Test 6: Voting

1. Login as the test user
2. Go to `/vote`
3. Select an option
4. Click "Submit Vote"
5. ✅ Vote should be recorded

### Test 7: Admin Dashboard

1. Login as admin
2. Go to `/admin`
3. ✅ Should see the test vote
4. Click "Export to Excel"
5. ✅ Excel file should download

### Test 8: Real-time Updates

1. Open two browser windows
2. Window 1: Login as admin, view `/results`
3. Window 2: Login as test user, cast a vote
4. ✅ Window 1 should update automatically

---

## 🔒 Security Checklist

After deployment:

- [ ] Change admin password immediately
- [ ] Update JWT_SECRET to a strong random string
- [ ] Update VOTE_SECRET to a strong random string
- [ ] Set CORS_ORIGIN to your exact frontend URL
- [ ] Enable HTTPS only (Vercel does this automatically)
- [ ] Review Supabase database security settings
- [ ] Consider enabling email notifications
- [ ] Set up database backups in Supabase

---

## 📧 Enable Email Notifications (Optional)

### Step 1: Create Gmail App Password

1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate password for "Mail"
5. Copy the 16-character password

### Step 2: Update Backend Environment

In Vercel backend project:

1. Settings → Environment Variables
2. Update:
   ```
   EMAIL_ENABLED=true
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   SMTP_FROM=noreply@welfare-poll.com
   ```
3. Redeploy

---

## 🎯 Production URLs

After deployment, you'll have:

| Service | URL |
|---------|-----|
| **Frontend** | https://welfare-poll.vercel.app |
| **Backend API** | https://welfare-poll-backend.vercel.app |
| **Admin Panel** | https://welfare-poll.vercel.app/admin |
| **Database** | Supabase Dashboard |

---

## 🐛 Troubleshooting

### Backend won't start

**Check:**
- Environment variables are set correctly
- DATABASE_URL is valid
- Run migrations in Supabase SQL Editor

**Fix:**
```bash
# Check Vercel logs
vercel logs [deployment-url]
```

### Frontend can't connect to backend

**Check:**
- VITE_API_URL in frontend .env.production
- CORS_ORIGIN in backend environment

**Fix:**
- Ensure URLs don't have trailing slashes
- Redeploy both frontend and backend

### Database connection error

**Check:**
- Supabase project is active
- Connection pooling port is 6543 (not 5432)
- Password is correct in DATABASE_URL

**Fix:**
- Test connection from Supabase SQL Editor
- Regenerate connection string

### Admin can't login

**Check:**
- Admin user exists in database
- Password hash is correct

**Fix:**
Run in Supabase SQL Editor:
```sql
SELECT * FROM members WHERE email = 'admin@welfare.com';
```

If not found, re-run admin creation SQL.

### Socket.io not working

**Check:**
- VITE_SOCKET_URL is set correctly
- Backend allows WebSocket connections

**Fix:**
- Vercel supports WebSockets by default
- Check browser console for errors

---

## 📊 Monitoring

### Vercel Analytics

1. Go to your project in Vercel
2. Click "Analytics" tab
3. View:
   - Page views
   - Performance
   - Errors

### Supabase Monitoring

1. Go to Supabase dashboard
2. Click "Database" → "Reports"
3. View:
   - Database size
   - Queries per second
   - Connection pool usage

---

## 🔄 Making Updates

### Update Code

1. Push changes to GitHub
2. Vercel automatically redeploys
3. Check deployment status in Vercel dashboard

### Update Database Schema

1. Create new migration SQL file
2. Run in Supabase SQL Editor
3. Test on staging first if possible

### Update Environment Variables

1. Vercel → Settings → Environment Variables
2. Update values
3. Redeploy (Deployments → Redeploy)

---

## 💰 Cost Estimate

**Free Tier (Small Projects):**
- Vercel: Free (100GB bandwidth/month)
- Supabase: Free (500MB database, 2GB bandwidth)
- **Total: $0/month** ✅

**Paid Tier (Larger Projects):**
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- **Total: $45/month**

---

## 📚 Additional Resources

- **Existing Guides:**
  - [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Railway deployment
  - [VERCEL_SUPABASE_DEPLOYMENT.md](VERCEL_SUPABASE_DEPLOYMENT.md) - Detailed Vercel guide
  - [SUPABASE_DEPLOYMENT.md](SUPABASE_DEPLOYMENT.md) - Database setup

- **Support:**
  - Vercel Docs: https://vercel.com/docs
  - Supabase Docs: https://supabase.com/docs
  - Node.js Docs: https://nodejs.org/docs

---

## ✅ Deployment Complete!

Once all tests pass, your application is live and ready for users!

**Next Steps:**
1. Share the URL with your members
2. Change the admin password
3. Monitor usage in Vercel/Supabase dashboards
4. Set up regular database backups
5. Consider custom domain (optional)

**Your Live URLs:**
- 🌐 Application: https://your-app.vercel.app
- ⚙️ Admin Panel: https://your-app.vercel.app/admin
- 📊 Database: Supabase Dashboard

---

**Congratulations! Your Welfare Poll app is now live! 🎉**
