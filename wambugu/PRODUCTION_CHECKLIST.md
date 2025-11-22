# Production Deployment Checklist

Use this checklist to ensure your Welfare Poll application is production-ready and functions correctly after deployment.

---

## 📋 Pre-Deployment Checklist

### Code & Testing
- [ ] **All features work locally**
  - [ ] User registration
  - [ ] User login
  - [ ] Voting (cast and change votes)
  - [ ] Results page with real-time updates
  - [ ] Admin dashboard
  - [ ] Excel export
  - [ ] Password reset

- [ ] **No sensitive data in code**
  - [ ] No hardcoded passwords
  - [ ] No API keys in source code
  - [ ] All secrets in .env files
  - [ ] .env files in .gitignore

- [ ] **Dependencies are up to date**
  - [ ] package.json includes all dependencies
  - [ ] No vulnerabilities (`npm audit`)
  - [ ] Node version specified in package.json

- [ ] **Database migrations ready**
  - [ ] All migration files exist
  - [ ] Migrations tested locally
  - [ ] Admin user creation SQL ready

### Security
- [ ] **Strong secrets generated**
  - [ ] New JWT_SECRET (not dev value)
  - [ ] New VOTE_SECRET (not dev value)
  - [ ] Strong database password
  - [ ] Email app password (if enabled)

- [ ] **CORS configured properly**
  - [ ] CORS_ORIGIN set to exact frontend URL
  - [ ] No wildcard (*) in production

- [ ] **Rate limiting enabled**
  - [ ] Auth endpoints limited
  - [ ] Voting endpoints limited
  - [ ] API endpoints protected

### Environment Variables
- [ ] **Backend .env prepared**
  - [ ] All database credentials
  - [ ] JWT secrets
  - [ ] Email configuration
  - [ ] CORS settings
  - [ ] Frontend URL

- [ ] **Frontend .env.production created**
  - [ ] VITE_API_URL points to production backend
  - [ ] VITE_SOCKET_URL points to production backend

---

## 🚀 Deployment Steps Checklist

### Database (Supabase)
- [ ] **Supabase project created**
  - [ ] Project name set
  - [ ] Strong password saved
  - [ ] Region selected
  - [ ] Project fully provisioned

- [ ] **Migrations run successfully**
  - [ ] create-tables.sql executed
  - [ ] update-phone-unique.sql executed
  - [ ] add-total-expected-members.sql executed
  - [ ] add-password-reset-fields.sql executed
  - [ ] No errors in SQL execution

- [ ] **Admin user created**
  - [ ] Admin SQL insert successful
  - [ ] Can query admin user
  - [ ] Credentials saved securely

- [ ] **Connection string obtained**
  - [ ] Connection pooling URL (port 6543)
  - [ ] Password included in URL
  - [ ] URL tested and working

### Backend (Vercel)
- [ ] **Code prepared**
  - [ ] vercel.json created
  - [ ] package.json engines specified
  - [ ] Start script configured

- [ ] **Deployed to Vercel**
  - [ ] Repository connected
  - [ ] Root directory set correctly
  - [ ] All environment variables added
  - [ ] Deployment successful

- [ ] **Backend URL obtained**
  - [ ] URL copied
  - [ ] Health endpoint tested
  - [ ] API endpoints accessible

### Frontend (Vercel)
- [ ] **Environment configured**
  - [ ] .env.production created
  - [ ] Backend URL set correctly
  - [ ] Socket URL set correctly

- [ ] **Deployed to Vercel**
  - [ ] Repository connected
  - [ ] Root directory set correctly
  - [ ] Build command configured
  - [ ] Output directory set to 'dist'
  - [ ] Environment variables added
  - [ ] Deployment successful

- [ ] **Frontend URL obtained**
  - [ ] URL copied
  - [ ] Site loads without errors

### CORS Update
- [ ] **Backend CORS updated**
  - [ ] CORS_ORIGIN set to frontend URL
  - [ ] FRONTEND_URL set correctly
  - [ ] Backend redeployed
  - [ ] No CORS errors in browser

---

## ✅ Post-Deployment Verification

### Automated Tests

Run these curl commands to verify backend:

```bash
# Replace YOUR_BACKEND_URL with actual URL

# 1. Health Check
curl https://YOUR_BACKEND_URL/health
# Expected: {"success":true,"message":"Server is running"...}

# 2. Poll Status
curl https://YOUR_BACKEND_URL/api/poll/status
# Expected: {"success":true,"data":{"is_open":true...}}

# 3. Poll Statistics
curl https://YOUR_BACKEND_URL/api/poll/statistics
# Expected: {"success":true,"data":{"total_members":1...}}
```

**Results:**
- [ ] Health check returns 200 OK
- [ ] Poll status returns correct data
- [ ] Statistics endpoint works
- [ ] No 500 errors

### Manual Frontend Tests

#### Test 1: Homepage Load
- [ ] Go to your frontend URL
- [ ] Page loads completely
- [ ] No console errors (F12)
- [ ] No network errors
- [ ] CSS loads correctly

#### Test 2: Admin Login
- [ ] Click "Login"
- [ ] Enter: `admin@welfare.com` / `admin123`
- [ ] Login succeeds
- [ ] Redirected to appropriate page
- [ ] No errors in console

#### Test 3: Admin Dashboard
- [ ] Navigate to `/admin`
- [ ] Dashboard loads
- [ ] Analytics cards show data
- [ ] Vote table visible
- [ ] No JavaScript errors

#### Test 4: User Registration
- [ ] Go to `/register`
- [ ] Fill in test user:
  ```
  Member ID: TEST001
  Email: test@yourdomain.com
  Name: Test User
  Phone: +254700000000
  Password: Test1234!
  ```
- [ ] Registration succeeds
- [ ] User is logged in
- [ ] No errors

#### Test 5: Voting
- [ ] Login as test user
- [ ] Go to `/vote`
- [ ] Select Option 1
- [ ] Submit vote
- [ ] Success message appears
- [ ] Vote is recorded

#### Test 6: Change Vote
- [ ] Still logged in as test user
- [ ] Select Option 2
- [ ] Submit vote
- [ ] Success message appears
- [ ] Vote updated to Option 2

#### Test 7: View Results
- [ ] Go to `/results`
- [ ] Results display correctly
- [ ] Vote counts are accurate
- [ ] Percentages calculated correctly
- [ ] Charts render (if implemented)

#### Test 8: Admin Features
Login as admin and test:

- [ ] **View All Votes**
  - [ ] Votes table shows entries
  - [ ] Test vote visible
  - [ ] Member details correct

- [ ] **Export to Excel**
  - [ ] Click export button
  - [ ] File downloads
  - [ ] Excel file opens
  - [ ] Data is correct

- [ ] **Update Member Count**
  - [ ] Click settings button
  - [ ] Change member count
  - [ ] Save changes
  - [ ] Analytics update

- [ ] **Reset Votes**
  - [ ] Click reset button
  - [ ] Confirm action
  - [ ] Votes deleted
  - [ ] Count shows 0

- [ ] **Generate Temp Password**
  - [ ] Click reset on a member
  - [ ] Temp password generated
  - [ ] Modal shows password
  - [ ] Can copy password

#### Test 9: Real-time Updates (Socket.io)
- [ ] Open two browser windows
- [ ] Window 1: Admin viewing `/results`
- [ ] Window 2: User casting a vote
- [ ] Window 1 updates automatically
- [ ] No errors in console

#### Test 10: Password Reset Flow
- [ ] Click "Forgot Password"
- [ ] Enter test user email
- [ ] Submit request
- [ ] Appropriate message shown
- [ ] If email enabled, email received

### Performance Tests

- [ ] **Page Load Speed**
  - [ ] Homepage < 3 seconds
  - [ ] Admin dashboard < 4 seconds
  - [ ] No slow queries

- [ ] **API Response Time**
  - [ ] Voting endpoint < 1 second
  - [ ] Analytics endpoint < 2 seconds
  - [ ] Export endpoint < 5 seconds

- [ ] **Mobile Responsiveness**
  - [ ] Test on mobile device
  - [ ] UI displays correctly
  - [ ] Buttons are clickable
  - [ ] Forms work properly

### Security Tests

- [ ] **Authentication**
  - [ ] Can't access `/vote` without login
  - [ ] Can't access `/admin` without admin role
  - [ ] JWT expires after 7 days
  - [ ] Logout works correctly

- [ ] **Authorization**
  - [ ] Regular user can't access admin routes
  - [ ] Admin can access all routes
  - [ ] API returns 401 for unauthorized
  - [ ] API returns 403 for forbidden

- [ ] **Input Validation**
  - [ ] Email validation works
  - [ ] Phone validation works
  - [ ] Password requirements enforced
  - [ ] SQL injection prevented

- [ ] **HTTPS**
  - [ ] Site uses HTTPS
  - [ ] No mixed content warnings
  - [ ] SSL certificate valid

---

## 🔒 Post-Deployment Security

### Immediate Actions
- [ ] **Change admin password**
  ```sql
  -- In Supabase SQL Editor
  UPDATE members
  SET password_hash = '[new-bcrypt-hash]'
  WHERE email = 'admin@welfare.com';
  ```

- [ ] **Verify environment variables**
  - [ ] No default/dev secrets in production
  - [ ] All secrets are unique and strong
  - [ ] Database password is strong

- [ ] **Set up database backups**
  - [ ] Enable Supabase automatic backups
  - [ ] Test backup restoration
  - [ ] Document backup process

### Monitoring Setup
- [ ] **Vercel Analytics**
  - [ ] Analytics enabled
  - [ ] Error tracking active
  - [ ] Performance monitoring on

- [ ] **Supabase Monitoring**
  - [ ] Database size tracking
  - [ ] Query performance monitoring
  - [ ] Connection pool monitoring

- [ ] **Error Logging**
  - [ ] Check Vercel logs regularly
  - [ ] Set up error notifications
  - [ ] Monitor API errors

---

## 📊 Functional Verification Matrix

| Feature | Local | Production | Notes |
|---------|-------|------------|-------|
| User Registration | ✅ | ⬜ | |
| User Login | ✅ | ⬜ | |
| Admin Login | ✅ | ⬜ | |
| Cast Vote | ✅ | ⬜ | |
| Change Vote | ✅ | ⬜ | |
| View Results | ✅ | ⬜ | |
| Real-time Updates | ✅ | ⬜ | |
| Admin Dashboard | ✅ | ⬜ | |
| Export to Excel | ✅ | ⬜ | |
| View All Votes | ✅ | ⬜ | |
| Reset Votes | ✅ | ⬜ | |
| Update Settings | ✅ | ⬜ | |
| Password Reset | ✅ | ⬜ | |
| Email Notifications | ⬜ | ⬜ | Optional |

---

## 🎯 Launch Checklist

### Before Going Live
- [ ] All tests passed
- [ ] Admin password changed
- [ ] Database backed up
- [ ] Monitoring enabled
- [ ] Error tracking configured
- [ ] Documentation updated with production URLs

### Going Live
- [ ] Announce to users
- [ ] Share production URL
- [ ] Provide admin contact info
- [ ] Monitor for first few hours
- [ ] Be ready for support requests

### After Launch
- [ ] Monitor error logs daily
- [ ] Check database usage weekly
- [ ] Review analytics monthly
- [ ] Update dependencies quarterly
- [ ] Review security annually

---

## 🐛 Common Issues & Fixes

### Issue: "Cannot connect to database"
**Check:**
- [ ] DATABASE_URL is correct
- [ ] Using port 6543 (pooling)
- [ ] Supabase project is active
- [ ] Password is correct

**Fix:**
- Regenerate connection string in Supabase
- Update environment variables in Vercel
- Redeploy backend

### Issue: "CORS error in browser"
**Check:**
- [ ] CORS_ORIGIN matches frontend URL exactly
- [ ] No trailing slashes
- [ ] Backend redeployed after CORS update

**Fix:**
- Update CORS_ORIGIN in backend environment
- Redeploy backend
- Clear browser cache

### Issue: "Admin can't login"
**Check:**
- [ ] Admin user exists in database
- [ ] Password hash is correct
- [ ] Email is exactly 'admin@welfare.com'

**Fix:**
```sql
-- In Supabase SQL Editor
SELECT * FROM members WHERE email = 'admin@welfare.com';
-- If not found, re-run admin creation SQL
```

### Issue: "Socket.io not connecting"
**Check:**
- [ ] VITE_SOCKET_URL is correct
- [ ] No firewall blocking WebSockets
- [ ] Browser supports WebSockets

**Fix:**
- Check browser console for errors
- Verify socket URL in frontend .env
- Test WebSocket connection separately

### Issue: "Excel export fails"
**Check:**
- [ ] ExcelJS library installed
- [ ] Backend has enough memory
- [ ] Request doesn't timeout

**Fix:**
- Check Vercel function logs
- Increase function timeout if needed
- Test with smaller dataset

---

## ✅ Final Sign-Off

Before marking deployment as complete:

- [ ] **All tests passed**
- [ ] **Security hardened**
- [ ] **Monitoring active**
- [ ] **Backups configured**
- [ ] **Documentation updated**
- [ ] **Team notified**

**Deployment completed by:** _______________
**Date:** _______________
**Production URL:** _______________
**Admin credentials updated:** _______________

---

## 📞 Support Contacts

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Node.js Issues**: https://github.com/nodejs/node/issues

---

**Congratulations! Your Welfare Poll app is production-ready! 🎉**
