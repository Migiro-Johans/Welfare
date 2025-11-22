# Supabase Database Setup - Super Quick Guide

## 🎯 5-Minute Setup

### Step 1: Create Supabase Project (2 min)

1. Go to https://supabase.com
2. Click "New project"
3. Fill in:
   - Name: `welfare-poll`
   - Database Password: Generate strong password (**SAVE THIS!**)
   - Region: Choose closest to you
4. Click "Create new project"
5. Wait for provisioning (~2 min)

### Step 2: Run Migration (1 min)

1. Click **SQL Editor** (left sidebar)
2. Click "New query"
3. Copy this command to get the migration file:

```bash
cat welfare-poll-backend/migrations/supabase-complete-migration.sql
```

4. Paste the entire content into SQL Editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. ✅ You should see "Success. No rows returned"

### Step 3: Get Connection String (1 min)

1. Go to **Settings** (gear icon)
2. Click **Database**
3. Scroll to **Connection string**
4. Select **URI** tab
5. Click **Connection pooling** toggle
6. Copy the connection string (looks like):
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
7. **IMPORTANT:** Replace `[YOUR-PASSWORD]` with your actual database password
8. Save this for Vercel deployment!

### Step 4: Verify It Worked (30 sec)

In SQL Editor, run:

```sql
-- Check tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

You should see 5 tables:
- audit_logs
- members
- notifications
- poll_settings
- votes

```sql
-- Check admin user
SELECT member_id, email, is_admin FROM members WHERE email = 'admin@welfare.com';
```

You should see:
```
 member_id |       email       | is_admin
-----------+-------------------+----------
 ADMIN001  | admin@welfare.com | t
```

✅ **Done!** Your database is ready.

---

## 🚀 Next: Deploy to Vercel

Now that your database is ready, continue with deployment:

1. **Deploy Backend:**
   - See [DEPLOY_NOW.md](DEPLOY_NOW.md) - Part 2
   - Use the connection string from Step 3

2. **Deploy Frontend:**
   - See [DEPLOY_NOW.md](DEPLOY_NOW.md) - Part 3

---

## 🔒 Important Security Notes

After deployment:

1. **Change admin password** immediately after first login
2. **Secure your database password** - Don't share or commit it
3. **Enable Row Level Security** (optional) in Supabase for extra protection

---

## 📊 What Was Created

The migration created:

### Tables:
1. **members** - User accounts (1 admin user pre-created)
2. **votes** - Voting records
3. **poll_settings** - Poll configuration (default settings added)
4. **audit_logs** - Activity tracking
5. **notifications** - Email queue

### Default Data:
- Poll settings (is_open: true, min votes: 150)
- Admin user: `admin@welfare.com` / `admin123`

### Indexes:
- Optimized for fast queries
- Email, member_id, votes lookups

---

## 🐛 Troubleshooting

### "Syntax error at or near NOT"

You tried to run the old migration file. Use the new one:
```bash
cat welfare-poll-backend/migrations/supabase-complete-migration.sql
```

### "relation already exists"

Tables already created! Run this to check:
```sql
\dt
```

### Can't see admin user

Run:
```sql
SELECT * FROM members;
```

If empty, re-run the admin insert SQL from the migration file.

### Wrong password in connection string

The connection string has `[YOUR-PASSWORD]` - replace it with your actual database password (the one you set when creating the project).

---

## 📱 Supabase Dashboard Features

After setup, you can use Supabase dashboard to:

- **Table Editor** - View/edit data visually
- **SQL Editor** - Run custom queries
- **Database** - Monitor performance
- **Auth** - Manage authentication (optional)
- **Storage** - File uploads (optional)

---

## ✅ Setup Complete!

Your database is now ready for the Welfare Poll app!

**Connection String:** Saved ✓
**Tables Created:** 5 ✓
**Admin User:** Created ✓
**Default Settings:** Added ✓

**Next:** Deploy your backend and frontend to Vercel using [DEPLOY_NOW.md](DEPLOY_NOW.md)

---

**Admin Login:**
- Email: `admin@welfare.com`
- Password: `admin123` (change immediately after first login!)
