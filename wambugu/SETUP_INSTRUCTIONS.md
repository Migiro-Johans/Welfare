# Complete Setup Instructions for Welfare Poll Application

This guide will help you get the entire application running properly.

## Prerequisites

- **Docker Desktop** installed and running
- **Node.js** 18+ installed
- **npm** installed

## Quick Start (Recommended)

### Option 1: Automated Setup (Easiest)

Simply run the startup script:

```bash
./start-app.sh
```

This will:
- Start PostgreSQL database in Docker
- Run database migrations
- Create default admin user
- Install all dependencies
- Start both backend and frontend servers

### Option 2: Manual Setup (Step by Step)

If the automated script doesn't work, follow these steps:

---

## Step 1: Start the Database

```bash
cd welfare-poll-backend
docker compose up -d db
```

Wait about 10 seconds for the database to be ready.

---

## Step 2: Run Database Migrations

```bash
# Check if you're still in welfare-poll-backend directory
docker compose exec db psql -U postgres -d welfare_poll -f /docker-entrypoint-initdb.d/create-tables.sql
```

Or alternatively:

```bash
docker exec -i $(docker compose ps -q db) psql -U postgres -d welfare_poll < migrations/create-tables.sql
```

---

## Step 3: Create Admin User

Run this command to create the default admin user:

```bash
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

**Default Admin Credentials:**
- Email: `admin@welfare.com`
- Password: `admin123`

---

## Step 4: Install Dependencies

### Backend
```bash
cd welfare-poll-backend
npm install
cd ..
```

### Frontend
```bash
cd welfare-poll-frontend
npm install
cd ..
```

---

## Step 5: Start the Servers

Open **two separate terminal windows**:

**Terminal 1 - Backend:**
```bash
cd welfare-poll-backend
npm run dev
```

You should see: `Server running on port 5001`

**Terminal 2 - Frontend:**
```bash
cd welfare-poll-frontend
npm run dev
```

You should see: `Local: http://localhost:3000/`

---

## Step 6: Access the Application

Open your browser and go to:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5001
- **Health Check:** http://localhost:5001/health

### Main Routes:

| Route | Description | Access |
|-------|-------------|--------|
| `/register` | Create new account | Public |
| `/login` | Login page | Public |
| `/vote` | Cast your vote | Logged in users |
| `/results` | View results | Logged in users |
| `/admin` | Admin dashboard | Admin users only |

---

## Step 7: Login as Admin

1. Go to http://localhost:3000/login
2. Enter credentials:
   - **Email:** `admin@welfare.com`
   - **Password:** `admin123`
3. After login, navigate to http://localhost:3000/admin

---

## Troubleshooting

### Database Connection Issues

**Problem:** "Database connection failed"

**Solution:**
```bash
# Check if database is running
docker ps

# Restart database
cd welfare-poll-backend
docker compose restart db
```

### Port Already in Use

**Problem:** "Port 5001 is already in use"

**Solution:**
```bash
# Find and kill the process using port 5001
lsof -ti:5001 | xargs kill -9

# Or change the port in backend/.env
PORT=5002
```

### Frontend Can't Connect to Backend

**Problem:** "Network Error" or "Failed to fetch"

**Solution:**
1. Check that backend is running on port 5001
2. Verify frontend `.env` file:
   ```
   VITE_API_URL=http://localhost:5001/api
   VITE_SOCKET_URL=http://localhost:5001
   ```
3. Restart frontend server

### Admin User Already Exists

**Problem:** "duplicate key value violates unique constraint"

**Solution:**
This is normal - it means admin already exists. Just login with the credentials.

To reset admin password:
```bash
docker compose exec db psql -U postgres -d welfare_poll -c "UPDATE members SET password_hash = '\$2b\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5HlFpj6jQ3xWu' WHERE email = 'admin@welfare.com';"
```

### Database Tables Don't Exist

**Problem:** "relation 'members' does not exist"

**Solution:**
Re-run migrations:
```bash
cd welfare-poll-backend
docker compose exec db psql -U postgres -d welfare_poll -f /docker-entrypoint-initdb.d/create-tables.sql
```

---

## Stopping the Application

### Stop Servers
Press `Ctrl+C` in each terminal window running the servers.

### Stop Database
```bash
cd welfare-poll-backend
docker compose down
```

### Stop Everything (Including Data)
```bash
cd welfare-poll-backend
docker compose down -v  # Warning: This deletes all data!
```

---

## Verifying Everything Works

### 1. Check Database
```bash
cd welfare-poll-backend
docker compose exec db psql -U postgres -d welfare_poll -c "SELECT member_id, email, is_admin FROM members;"
```

You should see the admin user listed.

### 2. Check Backend Health
```bash
curl http://localhost:5001/health
```

Should return: `{"status":"ok","timestamp":"..."}`

### 3. Check Frontend
Open http://localhost:3000 in your browser.

### 4. Test Full Flow

1. **Register a new user:**
   - Go to http://localhost:3000/register
   - Fill in the form
   - Click "Register"

2. **Login:**
   - Go to http://localhost:3000/login
   - Enter your credentials
   - You should be redirected to `/vote`

3. **Cast a vote:**
   - Select Option 1 or Option 2
   - Submit your vote
   - Check confirmation message

4. **View results:**
   - Go to http://localhost:3000/results
   - See real-time vote counts

5. **Access admin (admin users only):**
   - Login as `admin@welfare.com` / `admin123`
   - Navigate to http://localhost:3000/admin
   - View analytics, votes, export data

---

## Environment Configuration

### Backend (.env)
Located at: `welfare-poll-backend/.env`

Key variables:
- `PORT=5001` - Backend server port
- `DB_HOST=localhost` - Database host
- `DB_PASSWORD=postgres` - Database password
- `JWT_SECRET` - Secret for JWT tokens
- `CORS_ORIGIN=http://localhost:3000` - Frontend URL

### Frontend (.env)
Located at: `welfare-poll-frontend/.env`

Key variables:
- `VITE_API_URL=http://localhost:5001/api` - Backend API URL
- `VITE_SOCKET_URL=http://localhost:5001` - Socket.io URL

---

## Production Deployment

For production deployment, see:
- `DEPLOYMENT_GUIDE.md` - Railway deployment
- `SUPABASE_DEPLOYMENT.md` - Supabase database
- `VERCEL_SUPABASE_DEPLOYMENT.md` - Vercel + Supabase

---

## Need Help?

1. Check the logs:
   - Backend: Look at the terminal where backend is running
   - Frontend: Look at the terminal where frontend is running
   - Browser: Open DevTools (F12) and check Console

2. Check existing documentation:
   - `README.md` - Project overview
   - `QUICK_START.md` - Quick start guide
   - `PROJECT_SUMMARY.md` - Detailed project info

3. Common issues are usually:
   - Docker not running
   - Wrong ports in .env files
   - Database not migrated
   - Dependencies not installed

---

## Summary Checklist

- [ ] Docker Desktop is running
- [ ] Database started with `docker compose up -d db`
- [ ] Database migrations run
- [ ] Admin user created
- [ ] Backend dependencies installed (`npm install`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Backend server running on port 5001
- [ ] Frontend server running on port 3000
- [ ] Can access http://localhost:3000
- [ ] Can login as admin
- [ ] Can access admin dashboard at /admin

---

**You're all set! Happy polling! 🎉**
