# ⚡ Quick Vercel Import Reference

Your environment variables are ready to import! Here's the fastest way to do it.

---

## 📋 Copy-Paste Ready Variables

Use this list in Vercel Dashboard → Settings → Environment Variables → Add New

### 1. Server Configuration (2 variables)

```
Name: NODE_ENV
Value: production
```

```
Name: PORT
Value: 3000
```

### 2. Database - Supabase (6 variables)

```
Name: DATABASE_URL
Value: postgresql://postgres:Joh@n$*46mig@db.hiptxtuoslczmygamsfy.supabase.co:6543/postgres
```

```
Name: DB_HOST
Value: db.hiptxtuoslczmygamsfy.supabase.co
```

```
Name: DB_PORT
Value: 6543
```

```
Name: DB_NAME
Value: postgres
```

```
Name: DB_USER
Value: postgres
```

```
Name: DB_PASSWORD
Value: Joh@n$*46mig
```

### 3. Security (3 variables)

```
Name: JWT_SECRET
Value: l9qaVSUNlfBCa9m6ZBy30Pgv3GaTb9XA1KN3bL/vpWo=
```

```
Name: JWT_EXPIRE
Value: 7d
```

```
Name: VOTE_SECRET
Value: a2EWTtbqQ23ohaDLprmyTgNoThSk5cLpQHsOSdEjmGA=
```

### 4. Email Configuration (6 variables)

```
Name: EMAIL_ENABLED
Value: false
```

```
Name: SMTP_HOST
Value: smtp.gmail.com
```

```
Name: SMTP_PORT
Value: 465
```

```
Name: SMTP_USER
Value: disabled
```

```
Name: SMTP_PASS
Value: disabled
```

```
Name: SMTP_FROM
Value: noreply@welfare-poll.com
```

### 5. CORS & Frontend (2 variables)

```
Name: CORS_ORIGIN
Value: *
```

**Note**: Update to actual frontend URL after deployment

```
Name: FRONTEND_URL
Value: https://your-frontend.vercel.app
```

**Note**: Update to actual frontend URL after deployment

### 6. Rate Limiting (2 variables)

```
Name: RATE_LIMIT_WINDOW
Value: 15
```

```
Name: RATE_LIMIT_MAX
Value: 100
```

---

## ✅ Import Checklist

As you add each variable in Vercel, check it off:

**Server:**
- [ ] NODE_ENV
- [ ] PORT

**Database:**
- [ ] DATABASE_URL
- [ ] DB_HOST
- [ ] DB_PORT
- [ ] DB_NAME
- [ ] DB_USER
- [ ] DB_PASSWORD

**Security:**
- [ ] JWT_SECRET
- [ ] JWT_EXPIRE
- [ ] VOTE_SECRET

**Email:**
- [ ] EMAIL_ENABLED
- [ ] SMTP_HOST
- [ ] SMTP_PORT
- [ ] SMTP_USER
- [ ] SMTP_PASS
- [ ] SMTP_FROM

**CORS:**
- [ ] CORS_ORIGIN
- [ ] FRONTEND_URL

**Rate Limiting:**
- [ ] RATE_LIMIT_WINDOW
- [ ] RATE_LIMIT_MAX

**Total: 21 variables**

---

## 🚀 Import Steps

### Option 1: Manual Copy-Paste (Recommended)

1. Go to https://vercel.com
2. Select your **welfare-poll-backend** project
3. Click **Settings** → **Environment Variables**
4. For each variable above:
   - Click **Add New**
   - Copy the **Name**
   - Copy the **Value**
   - Select **Production** environment
   - Click **Save**
5. After adding all 21 variables, redeploy

### Option 2: Bulk Import (If Available)

1. Copy all content from `welfare-poll-backend/.env.vercel`
2. Go to Vercel → Settings → Environment Variables
3. Look for "Import from .env" or bulk import
4. Paste content
5. Select **Production** environment
6. Save

---

## ⚠️ Critical Reminders

### Database Port
✅ **Correct:** Port `6543` (connection pooling)
❌ **Wrong:** Port `5432` (direct connection)

The DATABASE_URL uses port **6543** for Vercel serverless functions.

### CORS Origin
Initially set to `*` for testing.
After frontend deploys, update to exact URL:
```
CORS_ORIGIN=https://your-actual-frontend.vercel.app
```

### Email Service
Set to **disabled** (`EMAIL_ENABLED=false`).
Can enable later if needed.

---

## 🔍 After Import

### 1. Verify All Variables Added
- Go to Settings → Environment Variables
- Should see **21 total variables**
- All should show "Production" environment

### 2. Deploy Backend
- Go to **Deployments** tab
- Click **Redeploy** on latest deployment
- Wait for deployment to complete
- Save your backend URL (e.g., `https://welfare-poll-backend.vercel.app`)

### 3. Test Health Endpoint
```bash
curl https://YOUR-BACKEND-URL.vercel.app/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "database": "connected"
}
```

### 4. Test Database Connection
```bash
curl https://YOUR-BACKEND-URL.vercel.app/api/poll/status
```

Should return poll status without errors.

---

## 🔒 Security Cleanup

After successful import:

```bash
# Delete the file with real credentials
rm welfare-poll-backend/.env.vercel

# Verify it's deleted
ls -la welfare-poll-backend/.env*
```

**The file is already in .gitignore**, but delete it after importing for security.

---

## 🎯 Next Steps

After backend is deployed:

1. ✅ Save your backend URL
2. ✅ Deploy frontend with backend URL
3. ✅ Update CORS_ORIGIN to frontend URL
4. ✅ Redeploy backend
5. ✅ Test the application
6. ✅ Change admin password

See [DEPLOY_NOW.md](DEPLOY_NOW.md) for complete deployment guide.

---

## 📞 Need Help?

- **Full guide**: [VERCEL_IMPORT_GUIDE.md](VERCEL_IMPORT_GUIDE.md)
- **Deployment**: [DEPLOY_NOW.md](DEPLOY_NOW.md)
- **Troubleshooting**: [FIX_DATABASE_ERROR.md](FIX_DATABASE_ERROR.md)

---

**You're ready to import! 🚀**

Just copy-paste the 21 variables above into Vercel Dashboard.
