# Import Environment Variables to Vercel

Quick guide to import your environment variables to Vercel.

---

## 🎯 Quick Import Methods

### Method 1: Copy-Paste from File (Easiest)

1. **Open the Vercel file:**
   ```bash
   cat welfare-poll-backend/.env.vercel
   ```

2. **Go to Vercel Dashboard:**
   - Open your backend project in Vercel
   - Click **Settings** tab
   - Click **Environment Variables** in sidebar

3. **Paste each variable:**
   - For each line in `.env.vercel`, add to Vercel:
     - **Key:** Variable name (e.g., `NODE_ENV`)
     - **Value:** Variable value (e.g., `production`)
     - **Environment:** Select `Production`, `Preview`, and `Development`
   - Click **Save**

### Method 2: Bulk Import (Faster)

Vercel allows importing multiple variables at once:

1. **Copy all content from `.env.vercel`:**
   ```bash
   cat welfare-poll-backend/.env.vercel | pbcopy  # macOS
   # Or manually copy the file content
   ```

2. **In Vercel Dashboard:**
   - Settings → Environment Variables
   - Look for **"Import from .env"** or bulk import option
   - Paste all content
   - Select environments (Production, Preview, Development)
   - Save

### Method 3: Using Vercel CLI (Advanced)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
cd welfare-poll-backend
vercel link

# Add environment variables
vercel env add NODE_ENV production
vercel env add DATABASE_URL "postgresql://postgres:Joh@n$*46mig@db.hiptxtuoslczmygamsfy.supabase.co:6543/postgres"
# ... repeat for each variable
```

---

## 📋 Environment Variables to Import

Here's what you need to add (from `.env.vercel`):

### Server Configuration
```
NODE_ENV=production
PORT=3000
```

### Database (Supabase)
```
DATABASE_URL=postgresql://postgres:Joh@n$*46mig@db.hiptxtuoslczmygamsfy.supabase.co:6543/postgres
DB_HOST=db.hiptxtuoslczmygamsfy.supabase.co
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=Joh@n$*46mig
```

### Security (Generated)
```
JWT_SECRET=l9qaVSUNlfBCa9m6ZBy30Pgv3GaTb9XA1KN3bL/vpWo=
JWT_EXPIRE=7d
VOTE_SECRET=a2EWTtbqQ23ohaDLprmyTgNoThSk5cLpQHsOSdEjmGA=
```

### Email (Disabled)
```
EMAIL_ENABLED=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=disabled
SMTP_PASS=disabled
SMTP_FROM=noreply@welfare-poll.com
```

### CORS & Frontend (Update Later)
```
CORS_ORIGIN=*
FRONTEND_URL=https://your-frontend.vercel.app
```

### Rate Limiting
```
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

---

## ⚠️ Important Notes

### Database Connection String

**Current (Port 5432 - Direct):**
```
postgresql://postgres:Joh@n$*46mig@db.hiptxtuoslczmygamsfy.supabase.co:5432/postgres
```

**Change to (Port 6543 - Connection Pooling):**
```
postgresql://postgres:Joh@n$*46mig@db.hiptxtuoslczmygamsfy.supabase.co:6543/postgres
```

**Why?** Vercel serverless functions work better with connection pooling (port 6543).

### CORS Origin

**Initially:** Set to `*` (wildcard) for testing
**After frontend deploys:** Update to exact frontend URL:
```
CORS_ORIGIN=https://your-actual-frontend.vercel.app
```

Then **redeploy** the backend.

---

## ✅ Verification Steps

### After Adding Variables

1. **Check all variables are added:**
   - Go to Settings → Environment Variables
   - Should see ~18 variables total

2. **Verify no typos:**
   - Check DATABASE_URL port is 6543
   - Check JWT_SECRET and VOTE_SECRET are different
   - Check EMAIL_ENABLED=false (unless configuring email)

3. **Deploy:**
   - Go to Deployments tab
   - Click **"Redeploy"** on latest deployment
   - Or push a new commit to trigger deployment

4. **Test deployment:**
   ```bash
   curl https://your-backend.vercel.app/health
   ```

   Should return:
   ```json
   {"success":true,"message":"Server is running",...}
   ```

5. **Test database connection:**
   ```bash
   curl https://your-backend.vercel.app/api/poll/status
   ```

   Should return poll status without errors.

---

## 🔧 Troubleshooting

### Issue: "Database connection failed"

**Check:**
1. DATABASE_URL uses port **6543** (not 5432)
2. Password is correct in connection string
3. Supabase project is active

**Fix:**
Update DATABASE_URL to use port 6543:
```
postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:6543/postgres
```

### Issue: "CORS error" in frontend

**Check:**
1. CORS_ORIGIN is set
2. Frontend URL is correct

**Fix:**
After frontend deploys, update:
```
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

### Issue: "Environment variable not found"

**Check:**
1. Variable is added in Vercel
2. Selected correct environments (Production, Preview, Development)
3. Redeployed after adding

**Fix:**
1. Add missing variable
2. Redeploy project

### Issue: Backend won't start

**Check Vercel logs:**
1. Go to project in Vercel
2. Click latest deployment
3. Click "View Function Logs"
4. Look for errors

**Common issues:**
- Missing required env variable
- Invalid DATABASE_URL
- Syntax error in env value

---

## 📱 Update CORS After Frontend Deployment

Once your frontend is deployed:

1. **Get frontend URL** from Vercel (e.g., `https://welfare-poll.vercel.app`)

2. **Update backend environment variables:**
   ```
   CORS_ORIGIN=https://welfare-poll.vercel.app
   FRONTEND_URL=https://welfare-poll.vercel.app
   ```

3. **Redeploy backend:**
   - Vercel → Deployments → Latest → Redeploy

4. **Test:**
   - Open frontend
   - Try logging in
   - Should work without CORS errors

---

## 🔒 Security Reminders

### After Deployment

1. **Delete `.env.vercel` from local machine** (contains real credentials)
   ```bash
   rm welfare-poll-backend/.env.vercel
   ```

2. **Don't commit `.env.vercel` to git**
   - It's already in `.gitignore`
   - Double-check: `git status`

3. **Change admin password** after first login

4. **Monitor Vercel logs** for any security issues

5. **Enable email** when ready (optional)

---

## 📊 Environment Variable Checklist

Before deploying:

- [ ] All variables from `.env.vercel` added to Vercel
- [ ] DATABASE_URL uses port 6543 (connection pooling)
- [ ] JWT_SECRET is unique (not example value)
- [ ] VOTE_SECRET is unique and different from JWT_SECRET
- [ ] EMAIL_ENABLED=false (unless configuring email now)
- [ ] CORS_ORIGIN set (can be `*` initially)
- [ ] All environments selected (Production, Preview, Development)

After first deployment:

- [ ] Health check returns 200 OK
- [ ] Database connection works
- [ ] Backend URL saved for frontend

After frontend deployment:

- [ ] CORS_ORIGIN updated to exact frontend URL
- [ ] FRONTEND_URL updated to exact frontend URL
- [ ] Backend redeployed
- [ ] Frontend can connect to backend
- [ ] No CORS errors

---

## 🚀 Quick Start

**Fastest way to import:**

1. Open `.env.vercel` file
2. Copy all content
3. Go to Vercel → Settings → Environment Variables
4. Add each variable (or bulk import if available)
5. Select all environments
6. Save
7. Redeploy

**Time:** ~5-10 minutes

---

## 🔗 Next Steps

After importing and deploying:

1. **Deploy frontend** - See [DEPLOY_NOW.md](DEPLOY_NOW.md) Part 3
2. **Update CORS** - Update CORS_ORIGIN to frontend URL
3. **Test application** - Use [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md)
4. **Change admin password** - Login and update from `admin123`

---

**Your environment variables are ready to import to Vercel!** 🎉

File to use: `welfare-poll-backend/.env.vercel`
