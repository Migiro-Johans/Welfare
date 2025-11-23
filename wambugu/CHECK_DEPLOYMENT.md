# Check Deployment Status

Quick guide to verify your deployment is working.

---

## 🔄 Recent Fix Applied

**What was fixed:**
- Changed route loading from lazy-loading to direct imports
- Should resolve `FUNCTION_INVOCATION_FAILED` errors
- Committed and pushed to trigger auto-deployment

**Commit:** `6765fa1` - "Fix route loading in serverless entry point"

---

## ⏱️ Wait for Auto-Deployment

Vercel will automatically redeploy after detecting the git push.

**Timeline:**
- **0-1 minute:** Vercel detects push
- **1-3 minutes:** Build and deployment
- **3 minutes:** Ready to test

---

## ✅ Check Deployment Status

### Option 1: Via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your backend project
3. Click **Deployments** tab
4. Look for the latest deployment
5. Wait for green checkmark ✅

### Option 2: Via Command Line

```bash
# Check if new deployment is ready (wait 3 minutes first)
curl -I https://welfare-jjv3-17n9zg9k4-migiro-johans-projects.vercel.app/health
```

Look for `HTTP/2 200` status code.

---

## 🧪 Test Endpoints (After 3 Minutes)

### Test 1: Root Endpoint

```bash
curl https://welfare-jjv3-17n9zg9k4-migiro-johans-projects.vercel.app/
```

**Expected:**
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

### Test 2: Health Check

```bash
curl https://welfare-jjv3-17n9zg9k4-migiro-johans-projects.vercel.app/health
```

**Expected:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-...",
  "environment": "production"
}
```

### Test 3: Poll Status (Most Important)

```bash
curl https://welfare-jjv3-17n9zg9k4-migiro-johans-projects.vercel.app/api/poll/status
```

**Expected:**
```json
{
  "success": true,
  "data": {
    "is_open": true,
    "total_votes": 0,
    "option1_votes": 0,
    "option2_votes": 0,
    ...
  }
}
```

---

## 🐛 If Still Failing

### Check Function Logs

1. Go to Vercel Dashboard → Your Project
2. Click latest deployment
3. Click **View Function Logs**
4. Look for specific error messages

### Common Issues

#### Issue: "Cannot find module"

**Likely cause:** Missing dependency or wrong path

**Check:**
```bash
# Verify all dependencies are in package.json
cat welfare-poll-backend/package.json | grep -A 20 dependencies
```

#### Issue: "Database connection failed"

**Fix:** Verify environment variables in Vercel:
- `DATABASE_URL` should use port **6543**
- Password should match Supabase

#### Issue: Still getting FUNCTION_INVOCATION_FAILED

**Options:**
1. Check if Vercel deployment completed
2. Try manual redeploy in Vercel dashboard
3. Check function logs for specific errors
4. Verify all environment variables are set

---

## 📊 Deployment Verification Checklist

After waiting 3 minutes:

- [ ] Vercel shows green checkmark for latest deployment
- [ ] Root endpoint (/) returns API info
- [ ] Health endpoint (/health) returns success
- [ ] Poll status (/api/poll/status) returns data
- [ ] No FUNCTION_INVOCATION_FAILED errors
- [ ] No "Cannot find module" errors

---

## ⏭️ Once Working

After all tests pass:

1. ✅ Backend is fully deployed and working
2. ✅ Ready to deploy frontend
3. ✅ Follow [DEPLOY_FRONTEND_NOW.md](DEPLOY_FRONTEND_NOW.md)

---

## 🕐 Current Time Check

**Pushed at:** Check your terminal for timestamp
**Wait until:** 3 minutes after push
**Then test:** Run the curl commands above

---

## 💡 Quick Status Command

Run this after 3 minutes:

```bash
echo "Testing backend deployment..."
echo ""
echo "1. Root endpoint:"
curl -s https://welfare-jjv3-17n9zg9k4-migiro-johans-projects.vercel.app/ | head -n 3
echo ""
echo ""
echo "2. Health check:"
curl -s https://welfare-jjv3-17n9zg9k4-migiro-johans-projects.vercel.app/health | head -n 3
echo ""
echo ""
echo "3. Poll status:"
curl -s https://welfare-jjv3-17n9zg9k4-migiro-johans-projects.vercel.app/api/poll/status | head -n 3
echo ""
```

---

**Wait 3 minutes, then test!** ⏱️
