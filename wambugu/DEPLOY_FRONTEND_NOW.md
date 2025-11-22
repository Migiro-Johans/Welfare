# Deploy Frontend to Vercel - Quick Guide

Your backend is deployed! Now let's deploy the frontend.

---

## ✅ Pre-Flight Check

**Backend Status:**
- ✅ Backend deployed: `https://welfare-jjv3-17n9zg9k4-migiro-johans-projects.vercel.app`
- ✅ Health check working
- ✅ Database connected

**Frontend Ready:**
- ✅ `.env.production` updated with backend URL
- ✅ `vercel.json` configured for Vite
- ✅ Build command: `npm run build`
- ✅ Output directory: `dist`

---

## 🚀 Deploy Frontend - 3 Methods

### Method 1: Via Vercel Dashboard (Easiest)

#### Step 1: Go to Vercel

1. Open https://vercel.com/dashboard
2. Click **Add New** → **Project**

#### Step 2: Import Repository

1. Click **Import Git Repository**
2. Select your GitHub repository (same repo as backend)
3. Click **Import**

#### Step 3: Configure Project

**Project Settings:**
- **Framework Preset:** Vite
- **Root Directory:** `welfare-poll-frontend` ← Click **Edit** and set this!
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `dist` (auto-detected)

**Environment Variables:**

Click **Environment Variables** and add:

```
Name: VITE_API_URL
Value: https://welfare-jjv3-17n9zg9k4-migiro-johans-projects.vercel.app/api
Environment: Production
```

```
Name: VITE_SOCKET_URL
Value: https://welfare-jjv3-17n9zg9k4-migiro-johans-projects.vercel.app
Environment: Production
```

#### Step 4: Deploy

1. Click **Deploy**
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://welfare-poll-frontend.vercel.app`

---

### Method 2: Via Vercel CLI (Advanced)

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Navigate to frontend directory
cd /Users/yohans/Documents/Development/wambugu/welfare-poll-frontend

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? welfare-poll-frontend
# - Directory? ./ (current directory)
# - Override settings? No
```

---

### Method 3: Auto-Deploy via Git Push

#### Step 1: Commit Frontend Changes

```bash
cd /Users/yohans/Documents/Development/wambugu

# Add frontend .env.production
git add welfare-poll-frontend/.env.production
git commit -m "Configure frontend production environment"
git push origin main
```

#### Step 2: Connect in Vercel

1. Go to https://vercel.com/dashboard
2. Import the repository (if not already done)
3. Set root directory to `welfare-poll-frontend`
4. Vercel will auto-deploy on every push

---

## 🔍 After Deployment

### Step 1: Get Frontend URL

After deployment completes, you'll see:
```
✅ Deployment Complete
🌐 https://welfare-poll-frontend-xxxxx.vercel.app
```

Or a production URL:
```
https://welfare-poll-frontend.vercel.app
```

### Step 2: Disable Deployment Protection (If Enabled)

Similar to backend:

1. Go to Project Settings → Deployment Protection
2. Edit "Vercel Authentication"
3. Select **Disabled** (for public access)
4. Save

### Step 3: Test Frontend

Open your frontend URL in a browser. You should see:
- ✅ Welfare Poll homepage
- ✅ Login/Register buttons
- ✅ No CORS errors in browser console

---

## 🔧 Update Backend CORS

Now that frontend is deployed, update backend to only allow your frontend:

### Step 1: Get Your Frontend URL

Example: `https://welfare-poll-frontend.vercel.app`

### Step 2: Update Backend Environment Variables

1. Go to Vercel → Your Backend Project → Settings → Environment Variables
2. Find `CORS_ORIGIN`
3. Click **Edit**
4. Change from `*` to your frontend URL:
   ```
   https://welfare-poll-frontend.vercel.app
   ```
5. Also update `FRONTEND_URL` to same value
6. Click **Save**

### Step 3: Redeploy Backend

1. Go to Deployments tab
2. Click **Redeploy** on latest deployment
3. Wait for deployment to complete

---

## ✅ Test Complete Application

### 1. Open Frontend

Navigate to your frontend URL

### 2. Register a New User

- Click **Register**
- Fill in details:
  - Member ID: `TEST001` (optional)
  - Full Name: `Test User`
  - Email: `test@example.com`
  - Phone: `+254712345678`
  - Password: `password123`
- Submit

### 3. Login

- Use email and password
- Should redirect to voting page

### 4. Cast a Vote

- Select a candidate
- Submit vote
- Should see success message

### 5. View Results

- Navigate to results page
- Should see vote counts
- **Note:** Refresh page to see updates (no real-time Socket.io)

### 6. Test Admin Login

- Logout
- Login as admin:
  - Email: `admin@welfare.com`
  - Password: `admin123`
- Should see Admin Dashboard

### 7. Admin Features

- ✅ View analytics
- ✅ Export to Excel
- ✅ Reset votes
- ✅ Update member count
- ✅ Generate temp passwords

---

## 📊 Deployment Checklist

### Backend
- [x] Deployed to Vercel
- [x] Environment variables configured (21 variables)
- [x] Health check working
- [x] Database connected
- [ ] CORS updated to frontend URL
- [ ] Redeployed after CORS update

### Frontend
- [ ] Deployed to Vercel
- [ ] `.env.production` configured
- [ ] Build successful
- [ ] No deployment errors
- [ ] Frontend loads without errors
- [ ] No CORS errors in console

### Application
- [ ] User registration works
- [ ] User login works
- [ ] Voting works
- [ ] Results display
- [ ] Admin login works
- [ ] Admin features work
- [ ] Excel export works

### Security
- [ ] Admin password changed from default
- [ ] Backend CORS restricted to frontend URL
- [ ] No sensitive data in frontend code
- [ ] Environment variables not committed

---

## 🐛 Troubleshooting

### Issue: Build Fails

**Error:** "Cannot find module" or build errors

**Fix:**
1. Check that root directory is set to `welfare-poll-frontend`
2. Verify build command is `npm run build`
3. Check build logs in Vercel dashboard

### Issue: CORS Errors in Browser

**Error:** "CORS policy: No 'Access-Control-Allow-Origin' header"

**Fix:**
1. Update backend `CORS_ORIGIN` to frontend URL
2. Redeploy backend
3. Clear browser cache
4. Try incognito/private browsing

### Issue: API Requests Fail

**Error:** "Network Error" or 404 errors

**Fix:**
1. Verify `VITE_API_URL` in frontend environment variables
2. Check backend health endpoint is accessible
3. Verify backend URL is correct

### Issue: Frontend Shows Blank Page

**Fix:**
1. Check browser console for errors
2. Verify build completed successfully
3. Check that `dist` directory was created
4. Try redeploying

---

## 📱 Custom Domain (Optional)

### Add Custom Domain

1. Go to Vercel → Project → Settings → Domains
2. Click **Add**
3. Enter your domain (e.g., `welfare-poll.yourdomain.com`)
4. Follow DNS setup instructions
5. Update backend CORS to use custom domain

---

## 🎯 Production URLs

After deployment, save these URLs:

**Backend:**
```
https://welfare-jjv3-17n9zg9k4-migiro-johans-projects.vercel.app
```

**Frontend:**
```
https://[YOUR-FRONTEND-URL].vercel.app
```

**Admin Login:**
```
https://[YOUR-FRONTEND-URL].vercel.app/login
Email: admin@welfare.com
Password: admin123
```

**⚠️ Change admin password immediately after first login!**

---

## 🔗 Related Guides

- **Backend deployment:** [DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md)
- **Environment variables:** [VERCEL_IMPORT_QUICK.md](VERCEL_IMPORT_QUICK.md)
- **Full deployment:** [DEPLOY_NOW.md](DEPLOY_NOW.md)

---

## 🎉 Congratulations!

Once both backend and frontend are deployed:

✅ Your Welfare Poll application is LIVE!
✅ Users can register and vote
✅ Admin can manage the poll
✅ Results are tracked in real-time database
✅ Data can be exported to Excel

---

**Next:** Deploy the frontend using Method 1 above, then update backend CORS!
