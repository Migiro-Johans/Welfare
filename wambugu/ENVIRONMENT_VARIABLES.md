# Environment Variables Guide

Complete guide to configuring environment variables for the Welfare Poll application.

---

## 📋 Quick Reference

### Development vs Production

| Environment | File | Usage |
|-------------|------|-------|
| **Development** | `.env` | Local development with Docker |
| **Production** | Vercel Dashboard | Production deployment |

---

## 🔧 Backend Environment Variables

### Required for All Environments

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Server port | `5001` (dev) or `3000` (prod) |
| `DATABASE_URL` | Full database connection string | See below |
| `JWT_SECRET` | Secret for JWT tokens | Random 32+ char string |
| `VOTE_SECRET` | Secret for vote hashing | Different random 32+ char string |
| `CORS_ORIGIN` | Allowed frontend URL | `http://localhost:3000` or production URL |
| `FRONTEND_URL` | Frontend URL for emails | Same as CORS_ORIGIN |

### Database Variables

**For Production (Supabase):**
```env
DATABASE_URL=postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
DB_HOST=db.xxxxx.supabase.co
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_supabase_password
```

**For Development (Docker):**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/welfare_poll
DB_HOST=localhost
DB_PORT=5432
DB_NAME=welfare_poll
DB_USER=postgres
DB_PASSWORD=postgres
```

### Email Variables (Optional)

```env
EMAIL_ENABLED=false                    # Set to true to enable
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com         # Or 'disabled' to disable
SMTP_PASS=your-app-password            # Or 'disabled' to disable
SMTP_FROM=noreply@welfare-poll.com
```

### Rate Limiting

```env
RATE_LIMIT_WINDOW=15      # Minutes
RATE_LIMIT_MAX=100        # Requests per window
```

---

## 🎨 Frontend Environment Variables

### Required

```env
VITE_API_URL=http://localhost:5001/api              # Development
VITE_API_URL=https://your-backend.vercel.app/api   # Production

VITE_SOCKET_URL=http://localhost:5001              # Development
VITE_SOCKET_URL=https://your-backend.vercel.app    # Production
```

### Files

- **Development:** `.env` or `.env.local`
- **Production:** `.env.production` or Vercel environment variables

---

## 🔐 Generating Secure Secrets

### Method 1: Node.js (Recommended)

```bash
# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate Vote Secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Method 2: OpenSSL

```bash
openssl rand -base64 32
```

### Method 3: Online Generator

Visit: https://www.random.org/strings/
- Length: 32 characters
- Use: Letters, numbers, special characters

**IMPORTANT:**
- ⚠️ Never use example values in production!
- ⚠️ JWT_SECRET and VOTE_SECRET must be different!
- ⚠️ Keep secrets secure - don't commit to git!

---

## 🗂️ Environment Files Reference

### Backend Files

```
welfare-poll-backend/
├── .env                        # Local development (git ignored)
├── .env.example                # Template with instructions
├── .env.production.example     # Production template (git committed)
└── .gitignore                  # Ensures .env is not committed
```

### Frontend Files

```
welfare-poll-frontend/
├── .env                        # Local development (git ignored)
├── .env.production             # Production template (git committed)
└── .gitignore                  # Ensures .env is not committed
```

---

## 🚀 Setup Instructions

### Development Setup

1. **Backend:**
   ```bash
   cd welfare-poll-backend
   cp .env.example .env
   # Edit .env with local values
   ```

2. **Frontend:**
   ```bash
   cd welfare-poll-frontend
   echo "VITE_API_URL=http://localhost:5001/api" > .env
   echo "VITE_SOCKET_URL=http://localhost:5001" >> .env
   ```

### Production Setup (Vercel)

#### Backend:

1. Go to Vercel Project → Settings → Environment Variables
2. Add each variable from `.env.production.example`
3. Generate new secrets for JWT_SECRET and VOTE_SECRET
4. Use Supabase connection string for DATABASE_URL
5. Update CORS_ORIGIN after frontend deploys

#### Frontend:

1. Update `.env.production` with backend URL
2. Or add variables in Vercel:
   - `VITE_API_URL`
   - `VITE_SOCKET_URL`

---

## 📊 Environment Variables by Deployment Stage

### Stage 1: Initial Backend Deployment

```env
NODE_ENV=production
DATABASE_URL=[supabase-url]
JWT_SECRET=[generated-secret]
VOTE_SECRET=[generated-different-secret]
EMAIL_ENABLED=false
CORS_ORIGIN=*                          # Temporary
FRONTEND_URL=https://your-frontend.vercel.app
```

### Stage 2: After Frontend Deployment

Update backend variables:
```env
CORS_ORIGIN=https://your-frontend.vercel.app  # Update to exact URL
```

Then redeploy backend.

### Stage 3: Enable Email (Optional)

Update backend variables:
```env
EMAIL_ENABLED=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

Then redeploy backend.

---

## 🔍 Verification

### Check Backend Variables

```bash
# Development
cd welfare-poll-backend
cat .env | grep -v "^#" | grep -v "^$"

# Production (Vercel)
# Check in Vercel Dashboard → Settings → Environment Variables
```

### Check Frontend Variables

```bash
# Development
cd welfare-poll-frontend
cat .env

# Production
cat .env.production
```

### Test Backend Health

```bash
# Development
curl http://localhost:5001/health

# Production
curl https://your-backend.vercel.app/health
```

---

## ⚠️ Common Issues

### Issue: CORS Error

**Problem:** Frontend can't connect to backend

**Solution:**
1. Check CORS_ORIGIN matches frontend URL exactly
2. No trailing slashes
3. Include protocol (https://)
4. Redeploy backend after changing

### Issue: Database Connection Failed

**Problem:** Backend can't connect to database

**Solution:**
1. Check DATABASE_URL is correct
2. Use port 6543 for Supabase (connection pooling)
3. Verify password in connection string
4. Check Supabase project is active

### Issue: Email Service Crashes

**Problem:** Backend crashes on startup

**Solution:**
1. Set EMAIL_ENABLED=false
2. Or set SMTP_USER=disabled
3. Configure proper Gmail App Password if enabling

### Issue: JWT Errors

**Problem:** Login fails or tokens invalid

**Solution:**
1. Check JWT_SECRET is set
2. Verify it's not empty or default value
3. Ensure same secret used consistently

---

## 📝 Checklist

### Development

- [ ] Backend .env created from .env.example
- [ ] Frontend .env created with localhost URLs
- [ ] Database credentials match Docker setup
- [ ] Email disabled or configured
- [ ] Can start both servers without errors

### Production

- [ ] JWT_SECRET generated (not example value!)
- [ ] VOTE_SECRET generated (different from JWT!)
- [ ] DATABASE_URL from Supabase
- [ ] Database password correct
- [ ] CORS_ORIGIN set to frontend URL
- [ ] Frontend URLs point to backend
- [ ] All variables added in Vercel
- [ ] Backend deploys successfully
- [ ] Frontend deploys successfully
- [ ] Health check returns 200 OK
- [ ] Admin can login

---

## 🔗 Related Documentation

- [.env.example](welfare-poll-backend/.env.example) - Backend template
- [.env.production.example](welfare-poll-backend/.env.production.example) - Production template
- [DEPLOY_NOW.md](DEPLOY_NOW.md) - Deployment guide
- [READY_TO_DEPLOY.md](READY_TO_DEPLOY.md) - Pre-deployment checklist

---

## 🆘 Need Help?

1. **Missing variable?** Check `.env.example` for all required variables
2. **Production issues?** See [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md)
3. **Database errors?** See [FIX_DATABASE_ERROR.md](FIX_DATABASE_ERROR.md)

---

**Keep your secrets safe! Never commit .env files to git.** 🔒
