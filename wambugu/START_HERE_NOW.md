# 🎯 START HERE - Welfare Poll Application

Welcome! This is your **complete guide** to getting the Welfare Poll application running.

---

## ⚡ Super Quick Start (3 Steps)

### 1️⃣ Make sure Docker Desktop is running

### 2️⃣ Run the startup script
```bash
./start-app.sh
```

### 3️⃣ Open your browser
Go to: **http://localhost:3000**

Login with:
- Email: `admin@welfare.com`
- Password: `admin123`

**Done!** 🎉

---

## 🔍 Verify Everything is Working

Run this to check your setup:
```bash
./verify-setup.sh
```

This will tell you exactly what's working and what needs fixing.

---

## 📚 Documentation Guide

Depending on what you need:

| I want to... | Read this file |
|--------------|----------------|
| **Get started quickly** | [QUICK_REFERENCE.md](QUICK_REFERENCE.md) |
| **Detailed setup instructions** | [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) |
| **Understand the project** | [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) |
| **Deploy to production** | [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) |
| **Learn about features** | [README.md](README.md) |

---

## 🎮 What Can You Do?

### As a Regular User:
1. **Register** - Create an account
2. **Login** - Access the system
3. **Vote** - Choose between Option 1 or Option 2
4. **Change Vote** - Update your choice anytime
5. **View Results** - See real-time voting results

### As an Admin (`admin@welfare.com`):
1. **Dashboard** - View analytics at `/admin`
2. **Export Data** - Download votes to Excel
3. **Manage Votes** - View all votes with details
4. **Reset Votes** - Clear all votes (for testing)
5. **Manage Members** - Reset passwords, view member list
6. **Settings** - Update total member count

---

## 🚀 Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     YOUR BROWSER                            │
│              http://localhost:3000                          │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Register │  │  Login   │  │   Vote   │  │  Admin   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP/WebSocket
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND API SERVER                          │
│              http://localhost:5001                          │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   Auth      │  │    Voting    │  │     Admin       │   │
│  │  (JWT)      │  │   (Logic)    │  │  (Analytics)    │   │
│  └─────────────┘  └──────────────┘  └─────────────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │ SQL
                        ↓
┌─────────────────────────────────────────────────────────────┐
│              POSTGRESQL DATABASE                            │
│              localhost:5432 (Docker)                        │
│                                                             │
│  Tables: members, votes, poll_settings, audit_logs         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Component Status

Run `./verify-setup.sh` to check, or manually verify:

### ✅ Backend
- Port: **5001**
- Health: http://localhost:5001/health
- Logs: Check terminal running `npm run dev`

### ✅ Frontend
- Port: **3000**
- URL: http://localhost:3000
- Logs: Check terminal running `npm run dev`

### ✅ Database
- Port: **5432**
- Container: `welfare-poll-backend-db-1`
- Command: `docker ps` to verify

---

## 🐛 Common Issues & Fixes

### "Docker daemon not running"
```bash
# Start Docker Desktop app, then run:
./start-app.sh
```

### "Port already in use"
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### "Cannot connect to database"
```bash
cd welfare-poll-backend
docker compose restart db
```

### "Tables don't exist"
```bash
cd welfare-poll-backend
docker compose exec db psql -U postgres -d welfare_poll -f /docker-entrypoint-initdb.d/create-tables.sql
```

### "Admin user doesn't exist"
```bash
cd welfare-poll-backend
docker compose exec db psql -U postgres -d welfare_poll <<EOF
INSERT INTO members (member_id, email, phone, full_name, password_hash, is_admin, is_active, email_verified, created_at, updated_at)
VALUES (
  'ADMIN001',
  'admin@welfare.com',
  '+254712345678',
  'System Administrator',
  '\$2b\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5HlFpj6jQ3xWu',
  TRUE,
  TRUE,
  TRUE,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;
EOF
```

---

## 📊 Testing the Full Flow

### 1. Create a Regular User
1. Go to http://localhost:3000/register
2. Fill in:
   - Member ID: `MEM001`
   - Email: `test@example.com`
   - Full Name: `Test User`
   - Phone: `+254712345678`
   - Password: `Test1234!`
3. Click "Register"

### 2. Login as Regular User
1. Go to http://localhost:3000/login
2. Login with `test@example.com` / `Test1234!`
3. You'll land on `/vote` page

### 3. Cast a Vote
1. Select Option 1 or Option 2
2. Click "Submit Vote"
3. See confirmation message

### 4. View Results
1. Go to http://localhost:3000/results
2. See your vote counted in real-time

### 5. Login as Admin
1. Logout (if logged in)
2. Login with `admin@welfare.com` / `admin123`
3. Go to http://localhost:3000/admin

### 6. Explore Admin Features
1. View analytics dashboard
2. Click "Export to Excel" to download votes
3. See all votes in the table
4. Try generating a temporary password for a member

---

## 🎓 Next Steps

Once everything is running:

1. **Customize** - Update poll options, branding, etc.
2. **Add Features** - Member management, notifications, etc.
3. **Deploy** - See deployment guides for production
4. **Secure** - Change admin password, update JWT secrets

---

## 📞 Need Help?

1. **Check verification**: `./verify-setup.sh`
2. **View logs**: Look at terminal outputs
3. **Check docs**: Read [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)
4. **Database issues**: See [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

---

## 🎯 Quick Command Reference

```bash
# Start everything
./start-app.sh

# Verify setup
./verify-setup.sh

# Start database only
cd welfare-poll-backend && docker compose up -d db

# Start backend only
cd welfare-poll-backend && npm run dev

# Start frontend only
cd welfare-poll-frontend && npm run dev

# View database
cd welfare-poll-backend
docker compose exec db psql -U postgres -d welfare_poll

# Stop everything
# Ctrl+C in terminals, then:
cd welfare-poll-backend && docker compose down
```

---

## ✨ You're Ready!

Everything you need is set up. Just run:

```bash
./start-app.sh
```

Then visit: **http://localhost:3000/admin**

Login: `admin@welfare.com` / `admin123`

**Happy polling!** 🎉
