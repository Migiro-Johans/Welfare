# 🚀 START HERE - Quick Launch Guide

## What's Happening Now

✅ Docker Desktop is running
⏳ Backend dependencies are installing (npm install)

---

## Next Steps (Follow These in Order)

### Step 1: Wait for Backend Install to Complete

The backend is currently installing dependencies. This takes 1-2 minutes.

**Check status:**
```bash
cd welfare-poll-backend
# If you see node_modules/ folder, it's done
ls node_modules
```

---

### Step 2: Start PostgreSQL Database with Docker

```bash
cd welfare-poll-backend
docker-compose up -d db
```

**Wait 5 seconds**, then verify:
```bash
docker ps
# You should see a container named "welfare-poll-db"
```

---

### Step 3: Create Database Tables

```bash
cd welfare-poll-backend
docker exec -i welfare-poll-db psql -U postgres -d welfare_poll < migrations/create-tables.sql
```

**Expected output:**
```
CREATE TABLE
CREATE INDEX
...
INSERT 0 1
```

---

### Step 4: Start Backend Server

**Open Terminal 1:**
```bash
cd welfare-poll-backend
npm run dev
```

**Expected output:**
```
Server running on port 5000
Database connection established successfully.
🚀 Server is running on http://localhost:5000
```

**✅ Keep this terminal running!**

---

### Step 5: Install Frontend Dependencies

**Open Terminal 2:**
```bash
cd welfare-poll-frontend
npm install
```

This takes 1-2 minutes.

---

### Step 6: Start Frontend Server

**In Terminal 2 (after npm install completes):**
```bash
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

**✅ Keep this terminal running!**

---

### Step 7: Test the Backend API

**Open Terminal 3 (for testing):**

**Health check:**
```bash
curl http://localhost:5000/health
```

**Expected response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-11-17T..."
}
```

**Get poll settings:**
```bash
curl http://localhost:5000/api/poll/settings
```

**Get voting results:**
```bash
curl http://localhost:5000/api/votes/results
```

---

## Step 8: Open Application in Browser

1. **Frontend**: http://localhost:3000
2. **Backend API**: http://localhost:5000
3. **Health Check**: http://localhost:5000/health

---

## Step 9: Create First Admin User

### Method 1: Using Postman/Thunder Client

**Register a user:**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

Body:
{
  "member_id": "ADMIN001",
  "email": "admin@welfare.com",
  "full_name": "Admin User",
  "phone": "+254712345678",
  "password": "Admin123!"
}
```

**Save the token from the response!**

### Method 2: Make User Admin

After registering, make them admin:

```bash
docker exec -it welfare-poll-db psql -U postgres -d welfare_poll
```

Then run:
```sql
UPDATE members SET is_admin = TRUE WHERE email = 'admin@welfare.com';
SELECT member_id, email, is_admin FROM members;
\q
```

---

## Quick Reference Commands

### Backend Commands
```bash
cd welfare-poll-backend

npm run dev          # Start development server
docker-compose up -d # Start database
docker-compose down  # Stop database
docker-compose logs  # View logs
```

### Frontend Commands
```bash
cd welfare-poll-frontend

npm run dev          # Start development server
npm run build        # Build for production
```

### Database Commands
```bash
# Connect to database
docker exec -it welfare-poll-db psql -U postgres -d welfare_poll

# View members
SELECT * FROM members;

# View votes
SELECT * FROM votes;

# Exit
\q
```

---

## Troubleshooting

### Issue: "Port 5000 already in use"
```bash
lsof -ti:5000 | xargs kill -9
```

### Issue: "Cannot connect to database"
```bash
docker-compose restart db
# Wait 5 seconds
docker exec -it welfare-poll-db psql -U postgres -d welfare_poll
```

### Issue: Frontend not loading
```bash
cd welfare-poll-frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## Visual Guide

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  Terminal 1: Backend (Port 5000)                            │
│  cd welfare-poll-backend && npm run dev                     │
│  ✅ Keep Running                                             │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Terminal 2: Frontend (Port 3000)                           │
│  cd welfare-poll-frontend && npm run dev                    │
│  ✅ Keep Running                                             │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Terminal 3: Testing/Database                               │
│  Use for: curl commands, docker exec, etc.                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘

                           │
                           ▼

                  Browser: localhost:3000
                  (React App - Build UI here)
```

---

## What to Build Next (Frontend)

Once both servers are running, start building React components:

1. **`src/App.jsx`** - Main app with routing
2. **`src/components/Auth/Login.jsx`** - Login form
3. **`src/components/Auth/Register.jsx`** - Registration form
4. **`src/components/Voting/VotingPage.jsx`** - Main voting interface
5. **`src/components/Results/ResultsDashboard.jsx`** - Results with charts
6. **`src/components/Admin/AdminDashboard.jsx`** - Admin panel

**See NEXT_STEPS.md for detailed component examples.**

---

## Success Checklist

- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:3000
- [ ] Database container running
- [ ] Health check returns success
- [ ] Can register a user via API
- [ ] Admin user created
- [ ] Ready to build UI components!

---

## Get Help

- **Setup Issues**: See QUICK_START.md
- **API Reference**: See PROJECT_SUMMARY.md
- **Component Examples**: See NEXT_STEPS.md
- **Full Docs**: See README.md

---

**🎉 You're ready to launch! Follow the steps above and you'll be running in 5-10 minutes!**
