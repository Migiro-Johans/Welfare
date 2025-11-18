# Quick Start Guide - Welfare Poll Application

## Prerequisites Setup

### Option 1: Local Development (Recommended for Mac)

#### 1. Install PostgreSQL using Homebrew
```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database
createdb welfare_poll

# Verify installation
psql --version
```

#### 2. Install Node.js Dependencies

**Backend:**
```bash
cd welfare-poll-backend
npm install
```

**Frontend:**
```bash
cd welfare-poll-frontend
npm install
```

#### 3. Setup Database Schema
```bash
cd welfare-poll-backend
psql -d welfare_poll -f migrations/create-tables.sql
```

#### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd welfare-poll-backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd welfare-poll-frontend
npm run dev
```

### Option 2: Using Docker (Easiest Setup)

#### 1. Install Docker Desktop
Download from: https://www.docker.com/products/docker-desktop/

#### 2. Start Docker Desktop
Open Docker Desktop application and wait for it to start.

#### 3. Run the Application
```bash
cd welfare-poll-backend
docker-compose up -d
```

This will:
- Start PostgreSQL database
- Run database migrations automatically
- Start the backend API server

#### 4. Start Frontend
```bash
cd welfare-poll-frontend
npm install
npm run dev
```

### Option 3: Using PostgreSQL.app (Mac Only)

#### 1. Download Postgres.app
Download from: https://postgresapp.com/

#### 2. Install and Start
- Drag Postgres.app to Applications folder
- Open Postgres.app
- Click "Initialize" to create a new server

#### 3. Configure PATH
```bash
# Add to your ~/.zshrc or ~/.bash_profile
export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"

# Reload shell
source ~/.zshrc
```

#### 4. Create Database
```bash
createdb welfare_poll
```

#### 5. Continue with Backend/Frontend setup from Option 1, steps 2-4

---

## Current Status Check

Let's verify what's installed:

```bash
# Check Node.js
node --version  # Should be 18+

# Check npm
npm --version

# Check PostgreSQL
psql --version

# Check if PostgreSQL is running
pg_isready
```

## Environment Variables

### Backend (.env) - Already Created
Location: `welfare-poll-backend/.env`

**Important**: Update these values before production:
- `DB_PASSWORD`: Your PostgreSQL password
- `JWT_SECRET`: Strong random string
- `VOTE_SECRET`: Strong random string
- `SMTP_*`: Email service credentials (optional for development)

### Frontend (.env) - Already Created
Location: `welfare-poll-frontend/.env`

---

## Testing the Setup

### 1. Test Backend
```bash
cd welfare-poll-backend
npm run dev
```

Expected output:
```
Server running on port 5000
Database connection established successfully
🚀 Server is running on http://localhost:5000
```

Test health endpoint:
```bash
curl http://localhost:5000/health
```

### 2. Test Frontend
```bash
cd welfare-poll-frontend
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

Open browser: http://localhost:3000

---

## Creating Your First Admin User

### Method 1: Using psql
```bash
# After registering a user through the app
psql -d welfare_poll

# Make user admin
UPDATE members SET is_admin = TRUE WHERE email = 'your-email@example.com';

# Exit
\q
```

### Method 2: Direct SQL file
Create `create-admin.sql`:
```sql
-- First, hash a password (use bcrypt with 12 rounds)
-- Password: Admin123!
INSERT INTO members (member_id, email, full_name, phone, password_hash, is_admin, is_active)
VALUES (
  'ADMIN001',
  'admin@welfare.com',
  'System Administrator',
  '+254712345678',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lmJ8YYsGJZKC',
  TRUE,
  TRUE
);
```

Run:
```bash
psql -d welfare_poll -f create-admin.sql
```

---

## Troubleshooting

### Issue: "Cannot connect to database"

**Solution 1: Check PostgreSQL is running**
```bash
# Mac with Homebrew
brew services list | grep postgresql

# Start if not running
brew services start postgresql@15
```

**Solution 2: Check database exists**
```bash
psql -l | grep welfare_poll

# Create if missing
createdb welfare_poll
```

**Solution 3: Check credentials**
Edit `welfare-poll-backend/.env`:
- Ensure DB_USER and DB_PASSWORD match your PostgreSQL setup
- Default PostgreSQL user is usually 'postgres' with no password locally

### Issue: "Port 5000 already in use"

**Check what's using the port:**
```bash
lsof -ti:5000
```

**Kill the process:**
```bash
kill -9 $(lsof -ti:5000)
```

**Or change port in `.env`:**
```bash
PORT=5001
```

### Issue: "Module not found"

**Reinstall dependencies:**
```bash
# Backend
cd welfare-poll-backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd welfare-poll-frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Email not sending"

**For Development:**
Email is optional. The app will log errors but continue working.

**For Production:**
1. Use Gmail App Password (not regular password)
2. Enable 2FA on Gmail account
3. Generate App Password: https://myaccount.google.com/apppasswords
4. Update SMTP_* variables in `.env`

### Issue: Docker not running

**Start Docker Desktop:**
1. Open Applications
2. Launch Docker Desktop
3. Wait for "Docker Desktop is running" notification
4. Then run: `docker-compose up -d`

---

## Development Workflow

### 1. Daily Development Start
```bash
# Terminal 1 - Backend
cd welfare-poll-backend
npm run dev

# Terminal 2 - Frontend
cd welfare-poll-frontend
npm run dev
```

### 2. Making Changes
- Backend changes auto-reload (nodemon)
- Frontend changes auto-reload (Vite HMR)

### 3. Viewing Logs
```bash
# Backend logs
tail -f welfare-poll-backend/logs/combined.log

# Or check console output in terminal
```

### 4. Database Changes
```bash
# Connect to database
psql -d welfare_poll

# Run queries
SELECT * FROM members;
SELECT * FROM votes;

# Exit
\q
```

---

## Next Steps After Setup

1. **Register First User**: Go to http://localhost:3000/register
2. **Make User Admin**: Run SQL update query
3. **Test Voting**: Login and cast a vote
4. **Check Real-time Updates**: Open in multiple browser tabs
5. **Test Admin Panel**: Login as admin user

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Change all secrets in `.env` (JWT_SECRET, VOTE_SECRET)
- [ ] Use strong database password
- [ ] Configure production database (not localhost)
- [ ] Set up SSL/TLS certificates
- [ ] Configure production email service
- [ ] Set NODE_ENV=production
- [ ] Update CORS_ORIGIN to production domain
- [ ] Set up proper logging service
- [ ] Configure backup strategy
- [ ] Set up monitoring (Sentry, DataDog, etc.)
- [ ] Run security audit: `npm audit`
- [ ] Test all endpoints
- [ ] Create admin users
- [ ] Document API for external use

---

## Recommended Tools

### Database Management
- **TablePlus**: https://tableplus.com/ (Mac/Windows/Linux)
- **pgAdmin**: https://www.pgadmin.org/
- **Postico**: https://eggerapps.at/postico/ (Mac only)

### API Testing
- **Postman**: https://www.postman.com/
- **Insomnia**: https://insomnia.rest/
- **Thunder Client** (VS Code extension)

### Monitoring
- **Browser DevTools**: Network tab for API calls
- **React DevTools**: Browser extension
- **Backend logs**: Check `logs/` directory

---

## Support & Resources

### Documentation
- [README.md](README.md) - Complete project documentation
- [Backend API Docs](welfare-poll-backend/src/routes/) - API route definitions
- [Database Schema](welfare-poll-backend/migrations/create-tables.sql) - SQL schema

### Common Commands Reference
```bash
# Backend
npm run dev          # Start development server
npm start            # Start production server
npm test             # Run tests

# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Database
psql -d welfare_poll              # Connect to database
psql -d welfare_poll -f file.sql  # Run SQL file
createdb welfare_poll             # Create database
dropdb welfare_poll               # Delete database (careful!)
```

---

**You're all set! Choose your preferred setup option above and get started.** 🚀
