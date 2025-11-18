# Welfare Poll Application - Deployment Guide

Complete guide to deploy your Welfare Poll application to production.

## Architecture Overview

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
         ↓ Database
┌─────────────────┐
│   Railway       │  ← PostgreSQL Database
│   (Database)    │
└─────────────────┘
```

---

## Prerequisites

Before starting, create accounts on:
1. [Vercel](https://vercel.com) - For frontend hosting
2. [Railway](https://railway.app) - For backend and database (or use [Render](https://render.com))
3. GitHub account (already set up ✓)

---

## Part 1: Deploy Database (Railway)

### Option A: Railway Database (Recommended)

1. **Go to Railway**
   - Visit https://railway.app
   - Click "Start a New Project"
   - Select "Provision PostgreSQL"

2. **Configure Database**
   - Railway will automatically create a PostgreSQL instance
   - Go to the PostgreSQL service
   - Click "Variables" tab
   - Copy these values for later:
     - `PGHOST`
     - `PGPORT`
     - `PGDATABASE`
     - `PGUSER`
     - `PGPASSWORD`
   - Or copy the full `DATABASE_URL` connection string

3. **Run Migrations**
   - Connect to your local project
   - Update backend `.env` temporarily with Railway database credentials
   - Run migrations:
     ```bash
     cd welfare-poll-backend
     psql "your-railway-database-url" < migrations/create-tables.sql
     psql "your-railway-database-url" < migrations/update-phone-unique.sql
     psql "your-railway-database-url" < migrations/add-total-expected-members.sql
     psql "your-railway-database-url" < migrations/add-password-reset-fields.sql
     ```

### Option B: Neon Database (Alternative)

1. Visit https://neon.tech
2. Create a new project
3. Copy the connection string
4. Run the same migrations as above

---

## Part 2: Deploy Backend (Railway)

### Step 1: Prepare Backend

1. **Update package.json** (if needed)
   - Ensure `"start": "node src/app.js"` exists in scripts
   - Add engines specification:
     ```json
     "engines": {
       "node": "18.x"
     }
     ```

2. **Create Railway Configuration**
   - Railway auto-detects Node.js apps
   - No additional configuration needed

### Step 2: Deploy to Railway

1. **Connect GitHub Repository**
   - Go to Railway dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `Migiro-Johans/Welfare`
   - Select `welfare-poll-backend` as root directory

2. **Configure Environment Variables**

   In Railway, go to your backend service → Variables, add:

   ```env
   NODE_ENV=production
   PORT=5000

   # Database (use Railway's internal connection)
   DB_HOST=<from Railway PostgreSQL>
   DB_PORT=<from Railway PostgreSQL>
   DB_NAME=<from Railway PostgreSQL>
   DB_USER=<from Railway PostgreSQL>
   DB_PASSWORD=<from Railway PostgreSQL>

   # Or use DATABASE_URL directly
   DATABASE_URL=<your-railway-postgres-url>

   # JWT Secret (generate a new one for production!)
   JWT_SECRET=<generate-strong-secret-here>
   JWT_EXPIRE=7d

   # Vote Secret (generate a new one!)
   VOTE_SECRET=<generate-strong-secret-here>

   # CORS (will update after Vercel deployment)
   CORS_ORIGIN=https://your-vercel-domain.vercel.app

   # Email (optional - configure if you have SMTP)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=noreply@welfare-poll.com

   # Frontend URL (will update after Vercel deployment)
   FRONTEND_URL=https://your-vercel-domain.vercel.app

   # Rate Limiting
   RATE_LIMIT_WINDOW=15
   RATE_LIMIT_MAX=100
   ```

3. **Deploy**
   - Railway will automatically build and deploy
   - Wait for deployment to complete
   - Copy your backend URL (e.g., `https://welfare-poll-backend.railway.app`)

4. **Verify Backend**
   - Visit `https://your-backend-url.railway.app/health`
   - Should return: `{"success":true,"message":"Server is running"}`

### Step 3: Set Up Admin User

Connect to your Railway database and create an admin user:

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

Password for this admin is: `admin123`

---

## Part 3: Deploy Frontend (Vercel)

### Step 1: Prepare Frontend

1. **Create Production Environment File**

   Create `welfare-poll-frontend/.env.production`:

   ```env
   VITE_API_URL=https://your-backend-url.railway.app/api
   VITE_SOCKET_URL=https://your-backend-url.railway.app
   ```

2. **Create Vercel Configuration**

   Create `welfare-poll-frontend/vercel.json`:

   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite",
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

### Step 2: Deploy to Vercel

#### Option A: Via Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy Frontend**
   ```bash
   cd welfare-poll-frontend
   vercel --prod
   ```

4. **Follow the prompts:**
   - Set up and deploy? `Y`
   - Which scope? (select your account)
   - Link to existing project? `N`
   - Project name? `welfare-poll`
   - Directory? `./` (current directory)
   - Override settings? `N`

#### Option B: Via Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Click "Add New" → "Project"

2. **Import Repository**
   - Select your GitHub repository `Migiro-Johans/Welfare`
   - Click "Import"

3. **Configure Project**
   - Framework Preset: `Vite`
   - Root Directory: `welfare-poll-frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Environment Variables**

   Add these in Vercel project settings:

   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   VITE_SOCKET_URL=https://your-backend-url.railway.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://welfare-poll.vercel.app` (or your custom domain)

### Step 3: Update Backend CORS

Now that you have your Vercel URL, update Railway backend environment variables:

```env
CORS_ORIGIN=https://your-app.vercel.app
FRONTEND_URL=https://your-app.vercel.app
```

Railway will automatically redeploy with new settings.

---

## Part 4: Testing

### Test Checklist

1. **Backend Health Check**
   - [ ] Visit `https://your-backend-url.railway.app/health`
   - [ ] Should return success message

2. **Frontend Access**
   - [ ] Visit `https://your-app.vercel.app`
   - [ ] Should load login page

3. **Admin Login**
   - [ ] Email: `admin@welfare.com`
   - [ ] Password: `admin123`
   - [ ] Should access admin dashboard

4. **User Registration**
   - [ ] Register new user
   - [ ] Verify phone uniqueness
   - [ ] Login with new user

5. **Voting System**
   - [ ] Submit a vote
   - [ ] View results
   - [ ] Verify real-time updates

6. **Admin Features**
   - [ ] View analytics
   - [ ] Generate temporary passwords
   - [ ] View audit logs

---

## Part 5: Post-Deployment Setup

### 1. Custom Domain (Optional)

#### Vercel Domain
1. Go to Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### 2. SSL Certificates

Both Railway and Vercel provide automatic SSL certificates. No additional setup needed!

### 3. Monitoring

#### Railway Monitoring
- Railway provides built-in metrics
- View logs in Railway dashboard
- Set up alerts for downtime

#### Vercel Analytics
- Enable Vercel Analytics in project settings
- Monitor performance and usage

### 4. Database Backups

#### Railway Backups
1. Go to PostgreSQL service in Railway
2. Enable automated backups
3. Download manual backup:
   ```bash
   pg_dump "your-railway-database-url" > backup.sql
   ```

---

## Environment Variables Summary

### Backend (Railway)

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=<railway-postgres-url>
JWT_SECRET=<generate-new-strong-secret>
JWT_EXPIRE=7d
VOTE_SECRET=<generate-new-strong-secret>
CORS_ORIGIN=https://your-app.vercel.app
FRONTEND_URL=https://your-app.vercel.app
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### Frontend (Vercel)

```env
VITE_API_URL=https://your-backend.railway.app/api
VITE_SOCKET_URL=https://your-backend.railway.app
```

---

## Troubleshooting

### Backend Issues

**Database Connection Errors**
- Verify DATABASE_URL is correct
- Check Railway database is running
- Ensure migrations have run

**CORS Errors**
- Update CORS_ORIGIN to match your Vercel URL exactly
- No trailing slash in URL

**Port Issues**
- Railway automatically assigns PORT - use `process.env.PORT`
- Don't hardcode port numbers

### Frontend Issues

**API Connection Failed**
- Check VITE_API_URL includes `/api`
- Verify backend is deployed and healthy
- Check browser console for errors

**Build Failures**
- Ensure all dependencies are in package.json
- Check node version compatibility
- Review Vercel build logs

**Blank Page**
- Check if dist folder is being generated
- Verify vercel.json rewrites configuration
- Check browser console for errors

### General Issues

**Environment Variables Not Loading**
- Redeploy after changing env vars
- Clear cache and rebuild
- Check variable names are exact matches

---

## Maintenance

### Updating the Application

1. **Make changes locally**
2. **Commit and push to GitHub**
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```
3. **Auto-deploy**
   - Railway and Vercel will auto-deploy on git push
   - Monitor deployment in respective dashboards

### Database Migrations

When adding new database changes:

1. Create migration SQL file
2. Connect to Railway database
3. Run migration:
   ```bash
   psql "your-railway-database-url" < migrations/your-new-migration.sql
   ```

---

## Security Checklist

- [ ] Change all default passwords
- [ ] Generate new JWT_SECRET for production
- [ ] Generate new VOTE_SECRET for production
- [ ] Set up HTTPS (automatic with Railway/Vercel)
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up database backups
- [ ] Review and limit database access
- [ ] Use environment variables for all secrets
- [ ] Never commit .env files to git

---

## Cost Estimate (Free Tier)

- **Vercel**: Free (includes 100GB bandwidth, unlimited projects)
- **Railway**: $5/month credit free, then pay-as-you-go
  - PostgreSQL: ~$5-10/month after free credit
  - Backend: ~$5/month after free credit
- **Total**: ~$10-15/month after Railway free tier

### Free Alternatives

- **Database**: Neon.tech (Free tier: 1GB storage)
- **Backend**: Render.com (Free tier with limitations)
- **Frontend**: Vercel (Free tier)

---

## Support

If you encounter issues:
1. Check Railway logs for backend errors
2. Check Vercel logs for frontend errors
3. Check browser console for client-side errors
4. Review this guide's troubleshooting section

---

## Next Steps After Deployment

1. Test all features thoroughly
2. Create regular database backups
3. Monitor application performance
4. Set up custom domain (optional)
5. Configure email service for password resets
6. Add more comprehensive error tracking (e.g., Sentry)
7. Set up CI/CD pipelines (optional)

---

**Deployment Date**: 2025-11-18

**Status**: Ready for deployment

Your application is now ready to be deployed to production!
