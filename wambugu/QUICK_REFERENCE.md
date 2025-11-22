# Quick Reference - Welfare Poll Application

## 🚀 One-Command Startup

```bash
./start-app.sh
```

That's it! Everything will start automatically.

---

## 📋 Manual Commands

### Start Database
```bash
cd welfare-poll-backend && docker compose up -d db
```

### Start Backend
```bash
cd welfare-poll-backend && npm run dev
```

### Start Frontend
```bash
cd welfare-poll-frontend && npm run dev
```

---

## 🔐 Default Admin Credentials

**Email:** `admin@welfare.com`
**Password:** `admin123`

---

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5001 |
| Admin Dashboard | http://localhost:3000/admin |
| Health Check | http://localhost:5001/health |

---

## 📍 Routes

| Route | Description | Access Level |
|-------|-------------|-------------|
| `/register` | Create account | Public |
| `/login` | Login | Public |
| `/vote` | Cast vote | Logged in |
| `/results` | View results | Logged in |
| `/admin` | Admin panel | Admin only |

---

## 🛠️ Common Commands

### View Database
```bash
cd welfare-poll-backend
docker compose exec db psql -U postgres -d welfare_poll -c "SELECT * FROM members;"
```

### Create Another Admin User
```bash
docker compose exec db psql -U postgres -d welfare_poll -c "UPDATE members SET is_admin = TRUE WHERE email = 'user@example.com';"
```

### Reset Admin Password (back to admin123)
```bash
docker compose exec db psql -U postgres -d welfare_poll -c "UPDATE members SET password_hash = '\$2b\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5HlFpj6jQ3xWu' WHERE email = 'admin@welfare.com';"
```

### View All Votes
```bash
docker compose exec db psql -U postgres -d welfare_poll -c "SELECT m.full_name, v.vote_option, v.voted_at FROM votes v JOIN members m ON v.member_id = m.id;"
```

### Stop Everything
```bash
# Stop servers: Ctrl+C in terminal windows
# Stop database:
cd welfare-poll-backend && docker compose down
```

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 5001 in use | `lsof -ti:5001 \| xargs kill -9` |
| Port 3000 in use | `lsof -ti:3000 \| xargs kill -9` |
| Database won't start | `docker compose restart db` |
| Can't connect to DB | Check Docker Desktop is running |
| Frontend can't reach backend | Check backend is on port 5001 |
| Tables don't exist | Run migrations (see SETUP_INSTRUCTIONS.md) |

---

## 📊 Admin Features

Once logged in as admin at `/admin`, you can:

- ✅ View vote analytics and statistics
- ✅ Export votes to Excel
- ✅ Update total expected member count
- ✅ Reset all votes (delete all)
- ✅ View all votes with member details
- ✅ Generate temporary passwords for members
- ✅ See who changed their vote

---

## 📁 Project Structure

```
wambugu/
├── welfare-poll-backend/    # Node.js API
│   ├── src/                # Source code
│   ├── migrations/         # Database migrations
│   ├── .env               # Backend config
│   └── docker-compose.yml # Database setup
│
├── welfare-poll-frontend/   # React app
│   ├── src/               # Source code
│   └── .env              # Frontend config
│
├── start-app.sh          # Auto-start script
└── SETUP_INSTRUCTIONS.md # Detailed setup guide
```

---

## ⚡ Quick Test Flow

1. Start app: `./start-app.sh`
2. Open: http://localhost:3000
3. Login: `admin@welfare.com` / `admin123`
4. Go to: http://localhost:3000/admin
5. Explore the admin dashboard!

---

Need detailed help? See [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)
