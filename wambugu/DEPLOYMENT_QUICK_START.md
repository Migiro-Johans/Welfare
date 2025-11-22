# Deployment Quick Start - 30 Minutes to Live

Get your Welfare Poll app deployed in ~30 minutes with this streamlined guide.

## 🎯 What You'll Deploy

- **Database**: Supabase (PostgreSQL) - FREE
- **Backend**: Vercel (Node.js API) - FREE
- **Frontend**: Vercel (React app) - FREE

**Total Cost: $0/month** ✅

---

## ⚡ Quick Deploy (3 Steps)

### Step 1: Database (10 min)

1. **Create Supabase project** → https://supabase.com
   - New project → Name: `welfare-poll`
   - Generate strong password → **SAVE IT!**
   - Wait for provisioning

2. **Run migrations** → Supabase SQL Editor
   - Copy/paste each migration file from `welfare-poll-backend/migrations/`
   - Run in order: create-tables.sql, update-phone-unique.sql, add-total-expected-members.sql, add-password-reset-fields.sql

3. **Create admin user** → SQL Editor:
   ```sql
   INSERT INTO members (member_id, email, phone, full_name, password_hash, is_admin, is_active, email_verified, created_at, updated_at)
   VALUES ('ADMIN001', 'admin@welfare.com', '+254712345678', 'Administrator', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5HlFpj6jQ3xWu', TRUE, TRUE, TRUE, NOW(), NOW());
   ```

4. **Get connection string** → Settings → Database → Connection String (URI, port 6543)
   - Copy and save for backend deployment

### Step 2: Backend (10 min)

1. **Create vercel.json** in `welfare-poll-backend/`:
   ```json
   {
     "version": 2,
     "builds": [{"src": "src/app.js", "use": "@vercel/node"}],
     "routes": [{"src": "/(.*)", "dest": "src/app.js"}]
   }
   ```

2. **Deploy** → https://vercel.com
   - Import GitHub repo
   - Root: `welfare-poll-backend`
   - Add environment variables (see below)
   - Deploy!

3. **Environment Variables**:
   ```
   NODE_ENV=production
   DATABASE_URL=[your-supabase-connection-string]
   DB_HOST=[from-supabase]
   DB_PORT=6543
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=[your-supabase-password]
   JWT_SECRET=[generate-random-32-char-string]
   VOTE_SECRET=[generate-random-32-char-string]
   EMAIL_ENABLED=false
   CORS_ORIGIN=*
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

4. **Test**: `curl https://your-backend.vercel.app/health`

### Step 3: Frontend (10 min)

1. **Create .env.production** in `welfare-poll-frontend/`:
   ```
   VITE_API_URL=https://your-backend.vercel.app/api
   VITE_SOCKET_URL=https://your-backend.vercel.app
   ```

2. **Deploy** → Vercel
   - Import GitHub repo
   - Root: `welfare-poll-frontend`
   - Framework: Vite
   - Add environment variables (above)
   - Deploy!

3. **Update CORS**:
   - Go to backend project in Vercel
   - Environment Variables → Update `CORS_ORIGIN` to your frontend URL
   - Redeploy backend

4. **Test**: Open frontend URL → Login as `admin@welfare.com` / `admin123`

---

## ✅ Verify It Works

```bash
# 1. Backend health
curl https://your-backend.vercel.app/health

# 2. Database connection
curl https://your-backend.vercel.app/api/poll/status

# 3. Frontend loads
# Open browser to your frontend URL

# 4. Admin login
# Go to /admin and login

# 5. Test voting
# Register user → Cast vote → Check results
```

---

## 🔧 Generate Secrets

Use these commands to generate secure secrets:

```bash
# JWT Secret (32 characters)
openssl rand -base64 32

# Vote Secret (32 characters)
openssl rand -base64 32
```

Or use: https://www.random.org/strings/

---

## 📝 Environment Variables Template

### Backend (.env for Vercel)

```bash
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:6543/postgres
DB_HOST=db.xxxxx.supabase.co
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_supabase_password

# JWT
JWT_SECRET=your_32_char_random_string_here
JWT_EXPIRE=7d

# Security
VOTE_SECRET=your_32_char_vote_secret_here

# Email (disable initially)
EMAIL_ENABLED=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=disabled
SMTP_PASS=disabled
SMTP_FROM=noreply@welfare-poll.com

# CORS
CORS_ORIGIN=https://your-frontend.vercel.app
FRONTEND_URL=https://your-frontend.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### Frontend (.env.production)

```bash
VITE_API_URL=https://your-backend.vercel.app/api
VITE_SOCKET_URL=https://your-backend.vercel.app
```

---

## 🎯 Post-Deployment

1. **Change admin password** (do this immediately!)
2. **Test all features** (use [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md))
3. **Enable monitoring** in Vercel dashboard
4. **Set up backups** in Supabase
5. **Share URL** with users

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend won't start | Check Vercel logs → Verify DATABASE_URL |
| CORS error | Update CORS_ORIGIN → Redeploy backend |
| Admin can't login | Verify admin user exists in Supabase |
| Frontend can't connect | Check VITE_API_URL → Rebuild frontend |
| Database error | Verify connection string → Check Supabase status |

---

## 📚 Full Documentation

For detailed instructions, see:

- **[DEPLOY_NOW.md](DEPLOY_NOW.md)** - Step-by-step deployment guide
- **[PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md)** - Complete verification checklist
- **[VERCEL_SUPABASE_DEPLOYMENT.md](VERCEL_SUPABASE_DEPLOYMENT.md)** - Detailed Vercel/Supabase guide
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Alternative Railway deployment

---

## 🎉 You're Live!

Once deployed:

✅ Frontend: `https://your-app.vercel.app`
✅ Admin: `https://your-app.vercel.app/admin`
✅ API: `https://your-backend.vercel.app`

Login: `admin@welfare.com` / `admin123`

**Change the admin password immediately!**

---

**Need help?** Check the troubleshooting section or refer to the full deployment guides.
