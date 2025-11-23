# Fix Vercel 500 Error - Deployment Guide

Your Vercel deployment is returning a 500 error. This guide will fix it.

---

## 🔍 Problem Identified

**Issue:** The backend [app.js](welfare-poll-backend/src/app.js) calls `startServer()` which tries to start an HTTP server with `server.listen()`. This doesn't work in Vercel's serverless environment.

**Solution:** Created a serverless-compatible entry point at [api/index.js](welfare-poll-backend/api/index.js).

---

## ✅ What Was Fixed

### 1. Created Serverless Entry Point
- **New file:** `welfare-poll-backend/api/index.js`
- Exports the Express app without starting a server
- Handles database initialization on cold starts
- Removes Socket.io server initialization (not compatible with serverless)

### 2. Updated Vercel Configuration
- **File:** `welfare-poll-backend/vercel.json`
- Changed entry point from `src/app.js` to `api/index.js`
- Routes all requests to the serverless function

---

## 🚀 Deploy the Fix

### Option 1: Push to Git (Recommended)

```bash
cd welfare-poll-backend

# Stage the new files
git add api/index.js
git add vercel.json

# Commit the fix
git commit -m "Fix Vercel 500 error: Add serverless entry point

- Create api/index.js for Vercel serverless compatibility
- Update vercel.json to use new entry point
- Remove server.listen() which doesn't work in serverless"

# Push to trigger Vercel deployment
git push
```

Vercel will automatically detect the changes and redeploy.

### Option 2: Manual Redeploy in Vercel Dashboard

1. Go to your Vercel project dashboard
2. Click **Deployments**
3. Click **Redeploy** on the latest deployment
4. Wait for deployment to complete

---

## 🔍 Verify the Fix

After deployment completes:

### 1. Test Root Endpoint

```bash
curl https://your-backend.vercel.app/
```

**Expected response:**
```json
{
  "success": true,
  "message": "Welfare Poll API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "auth": "/api/auth",
    "votes": "/api/votes",
    "poll": "/api/poll",
    "admin": "/api/admin"
  }
}
```

### 2. Test Health Endpoint

```bash
curl https://your-backend.vercel.app/health
```

**Expected response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-...",
  "environment": "production"
}
```

### 3. Test Database Connection

```bash
curl https://your-backend.vercel.app/api/poll/status
```

Should return poll status without errors.

---

## ⚠️ Important Notes

### Socket.io Limitation

**Socket.io is NOT compatible with Vercel serverless functions.**

The real-time voting updates won't work on Vercel. You have two options:

#### Option A: Disable Real-time Updates (Simple)
The app will work, but users need to refresh to see updated results.

#### Option B: Use Polling Instead (Better UX)
Update the frontend to poll for results every few seconds:

```javascript
// In frontend vote results component
useEffect(() => {
  const interval = setInterval(() => {
    fetchResults(); // Your API call
  }, 5000); // Poll every 5 seconds

  return () => clearInterval(interval);
}, []);
```

#### Option C: Deploy to Alternative Platform (Best)
For full Socket.io support, consider:
- Railway.app (free tier available)
- Render.com (free tier available)
- Heroku (paid)
- DigitalOcean App Platform

---

## 📝 Files Changed

### Created:
- ✅ `welfare-poll-backend/api/index.js` - Serverless entry point

### Modified:
- ✅ `welfare-poll-backend/vercel.json` - Updated routes

### Unchanged:
- `welfare-poll-backend/src/app.js` - Still used for local development
- All route files - No changes needed
- All controllers - No changes needed

---

## 🔧 Local Development Still Works

Your local development setup is **not affected**:

```bash
# Start local server (uses src/app.js)
cd welfare-poll-backend
npm run dev
```

Local development will still have Socket.io real-time updates working perfectly.

---

## 📊 Deployment Checklist

After fixing and redeploying:

- [ ] Pushed api/index.js and vercel.json to git
- [ ] Vercel deployment completed successfully
- [ ] Root endpoint (/) returns API info
- [ ] Health endpoint (/health) returns success
- [ ] Database connection works (/api/poll/status)
- [ ] Admin login works
- [ ] Voting works
- [ ] Results display (may need manual refresh)

---

## 🐛 If Still Getting 500 Error

### Check Vercel Logs

1. Go to Vercel Dashboard → Your Project
2. Click **Deployments** → Latest deployment
3. Click **View Function Logs**
4. Look for error messages

### Common Issues:

#### Missing Environment Variables
**Error:** "DATABASE_URL is not defined"

**Fix:** Add all 21 environment variables from [VERCEL_IMPORT_QUICK.md](VERCEL_IMPORT_QUICK.md)

#### Database Connection Failed
**Error:** "Connection refused" or "timeout"

**Fix:**
- Verify DATABASE_URL uses port **6543** (not 5432)
- Check Supabase project is active
- Verify password is correct

#### Missing Dependencies
**Error:** "Cannot find module 'xyz'"

**Fix:** Ensure all dependencies are in package.json (they are!)

---

## 💡 Alternative: Full Server Deployment

If you need Socket.io real-time updates, deploy to a platform that supports WebSockets:

### Railway.app (Recommended)

1. Go to https://railway.app
2. Connect your GitHub repository
3. Select `welfare-poll-backend` directory
4. Add environment variables (same as Vercel)
5. Deploy

Railway supports WebSockets, so Socket.io will work perfectly.

### Render.com

1. Go to https://render.com
2. New → Web Service
3. Connect repository
4. Root directory: `welfare-poll-backend`
5. Build command: `npm install`
6. Start command: `npm start`
7. Add environment variables
8. Deploy

---

## 🔗 Next Steps

1. **Deploy the fix** (git push or manual redeploy)
2. **Test all endpoints** using the verification steps above
3. **Update frontend** with backend URL
4. **Test full application** (login, voting, results)
5. **Optional:** Consider alternative platform for real-time updates

---

## 📞 Need Help?

- **Deployment issues:** Check Vercel function logs
- **Database errors:** See [FIX_DATABASE_ERROR.md](FIX_DATABASE_ERROR.md)
- **Environment setup:** See [VERCEL_IMPORT_QUICK.md](VERCEL_IMPORT_QUICK.md)

---

**The fix is ready to deploy!** 🚀

Just push the changes to git and Vercel will automatically redeploy with the fix.
