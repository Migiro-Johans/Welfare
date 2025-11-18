# Quick Deployment Guide

Fast-track guide to deploy your Welfare Poll application.

## Prerequisites

Create accounts on:
- [Railway](https://railway.app) (for database & backend)
- [Vercel](https://vercel.com) (for frontend)

---

## Step 1: Deploy Database (5 minutes)

1. Go to https://railway.app
2. Click "Start a New Project" → "Provision PostgreSQL"
3. Copy the `DATABASE_URL` from the Variables tab
4. Run migrations:
   ```bash
   cd welfare-poll-backend
   psql "YOUR_RAILWAY_DATABASE_URL" < migrations/create-tables.sql
   psql "YOUR_RAILWAY_DATABASE_URL" < migrations/update-phone-unique.sql
   psql "YOUR_RAILWAY_DATABASE_URL" < migrations/add-total-expected-members.sql
   psql "YOUR_RAILWAY_DATABASE_URL" < migrations/add-password-reset-fields.sql
   ```

---

## Step 2: Deploy Backend (10 minutes)

1. In Railway, click "New Project" → "Deploy from GitHub repo"
2. Select `Migiro-Johans/Welfare` repository
3. Set root directory: `welfare-poll-backend`
4. Add these environment variables in Railway:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=<your-railway-postgres-url>
JWT_SECRET=<generate-new-secret>
VOTE_SECRET=<generate-new-secret>
CORS_ORIGIN=https://your-app.vercel.app
FRONTEND_URL=https://your-app.vercel.app
JWT_EXPIRE=7d
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

5. Railway will auto-deploy
6. Copy your backend URL (e.g., `https://welfare-poll-backend.railway.app`)
7. Test: Visit `https://your-backend-url.railway.app/health`

---

## Step 3: Create Admin User (2 minutes)

Connect to Railway database:

```sql
INSERT INTO members (member_id, email, phone, full_name, password_hash, is_admin, is_active, email_verified, created_at, updated_at)
VALUES (
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

Admin password: `admin123`

---

## Step 4: Deploy Frontend (5 minutes)

### Option A: Vercel CLI (Fastest)

```bash
npm install -g vercel
vercel login
cd welfare-poll-frontend
vercel --prod
```

When prompted, set environment variables:
- `VITE_API_URL`: `https://your-backend-url.railway.app/api`
- `VITE_SOCKET_URL`: `https://your-backend-url.railway.app`

### Option B: Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import `Migiro-Johans/Welfare`
4. Configure:
   - Framework: `Vite`
   - Root Directory: `welfare-poll-frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variables:
   - `VITE_API_URL`: `https://your-backend-url.railway.app/api`
   - `VITE_SOCKET_URL`: `https://your-backend-url.railway.app`
6. Deploy

---

## Step 5: Update CORS (2 minutes)

1. Go back to Railway
2. Update backend environment variables:
   - `CORS_ORIGIN`: `https://your-app.vercel.app`
   - `FRONTEND_URL`: `https://your-app.vercel.app`
3. Railway will auto-redeploy

---

## Step 6: Test (5 minutes)

1. Visit your Vercel URL
2. Login with `admin@welfare.com` / `admin123`
3. Test registration, voting, and admin features

---

## Generate Secrets

For JWT_SECRET and VOTE_SECRET, run:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run this twice to get two different secrets.

---

## Troubleshooting

**Can't connect to database?**
- Verify DATABASE_URL is correct
- Check Railway database is running

**CORS errors?**
- Ensure CORS_ORIGIN matches your Vercel URL exactly
- No trailing slash

**Frontend can't reach backend?**
- Check VITE_API_URL has `/api` at the end
- Verify backend health endpoint works

---

## Cost

- **Railway**: $5 free credit, then ~$10-15/month
- **Vercel**: Free tier (unlimited projects)
- **Total**: ~$10-15/month

---

## Quick Commands

```bash
# Test local build
cd welfare-poll-frontend && npm run build

# Check environment
cd welfare-poll-backend && cat .env

# View logs (Railway)
# Use Railway dashboard

# Redeploy
git push origin main  # Auto-deploys both services
```

---

## Support

For detailed instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

**Your app is ready to deploy!** 🚀
