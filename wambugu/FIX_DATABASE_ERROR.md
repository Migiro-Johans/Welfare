# Fix: "relation 'members' does not exist" Error

## 🔍 What This Error Means

The error `ERROR: 42P01: relation "members" does not exist` means your database doesn't have the required tables yet. You need to run the database migrations first.

---

## ✅ Solution: Run Migrations

### Option 1: Use the Migration Helper Script (Easiest)

I've created a script that makes this super easy:

```bash
./run-migrations.sh
```

Follow the prompts:
- **Option 1**: For local database (Docker)
- **Option 2**: For production database (Supabase/Remote)

The script will:
1. Run all 4 migration files in order
2. Create the admin user automatically
3. Verify everything worked

---

### Option 2: Manual - Local Database (Docker)

If you're running locally with Docker:

```bash
# Make sure database is running
docker compose -f welfare-poll-backend/docker-compose.yml up -d db

# Wait a few seconds
sleep 5

# Run each migration
docker compose -f welfare-poll-backend/docker-compose.yml exec -T db \
  psql -U postgres -d welfare_poll < welfare-poll-backend/migrations/create-tables.sql

docker compose -f welfare-poll-backend/docker-compose.yml exec -T db \
  psql -U postgres -d welfare_poll < welfare-poll-backend/migrations/update-phone-unique.sql

docker compose -f welfare-poll-backend/docker-compose.yml exec -T db \
  psql -U postgres -d welfare_poll < welfare-poll-backend/migrations/add-total-expected-members.sql

docker compose -f welfare-poll-backend/docker-compose.yml exec -T db \
  psql -U postgres -d welfare_poll < welfare-poll-backend/migrations/add-password-reset-fields.sql

# Create admin user
docker compose -f welfare-poll-backend/docker-compose.yml exec -T db \
  psql -U postgres -d welfare_poll <<'EOF'
INSERT INTO members (member_id, email, phone, full_name, password_hash, is_admin, is_active, email_verified, created_at, updated_at)
VALUES (
  'ADMIN001',
  'admin@welfare.com',
  '+254712345678',
  'System Administrator',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5HlFpj6jQ3xWu',
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

### Option 3: Manual - Production Database (Supabase)

If you're deploying to Supabase or another cloud database:

#### Method A: Using Supabase Dashboard - ONE FILE (Easiest!)

1. Go to your Supabase project
2. Click **SQL Editor** in the left sidebar
3. Copy the entire content from the all-in-one migration file:

```bash
cat welfare-poll-backend/migrations/supabase-complete-migration.sql
```

4. Paste into Supabase SQL Editor
5. Click "Run" ✅

**That's it!** This single file creates all tables, indexes, default settings, and the admin user.

#### Method B: Using Individual Migration Files (Alternative)

If you prefer to run migrations step-by-step:

**Step 1:** Copy content from `welfare-poll-backend/migrations/create-tables.sql`
```bash
cat welfare-poll-backend/migrations/create-tables.sql
```
Paste in SQL Editor → Click "Run"

**Step 2:** Copy content from `welfare-poll-backend/migrations/update-phone-unique.sql`
```bash
cat welfare-poll-backend/migrations/update-phone-unique.sql
```
Paste in SQL Editor → Click "Run"

**Step 3:** Copy content from `welfare-poll-backend/migrations/add-total-expected-members.sql`
```bash
cat welfare-poll-backend/migrations/add-total-expected-members.sql
```
Paste in SQL Editor → Click "Run"

**Step 4:** Copy content from `welfare-poll-backend/migrations/add-password-reset-fields.sql`
```bash
cat welfare-poll-backend/migrations/add-password-reset-fields.sql
```
Paste in SQL Editor → Click "Run"

**Step 5:** Create admin user - Paste this SQL and run:
```sql
INSERT INTO members (
  member_id,
  email,
  phone,
  full_name,
  password_hash,
  is_admin,
  is_active,
  email_verified,
  created_at,
  updated_at
)
VALUES (
  'ADMIN001',
  'admin@welfare.com',
  '+254712345678',
  'System Administrator',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5HlFpj6jQ3xWu',
  TRUE,
  TRUE,
  TRUE,
  NOW(),
  NOW()
);
```

#### Method B: Using psql Command Line

If you have `psql` installed:

```bash
# Get your database URL from Supabase
# Settings → Database → Connection String (URI)

# Run migrations
psql "your-database-url" < welfare-poll-backend/migrations/create-tables.sql
psql "your-database-url" < welfare-poll-backend/migrations/update-phone-unique.sql
psql "your-database-url" < welfare-poll-backend/migrations/add-total-expected-members.sql
psql "your-database-url" < welfare-poll-backend/migrations/add-password-reset-fields.sql

# Create admin user
psql "your-database-url" <<'EOF'
INSERT INTO members (member_id, email, phone, full_name, password_hash, is_admin, is_active, email_verified, created_at, updated_at)
VALUES ('ADMIN001', 'admin@welfare.com', '+254712345678', 'System Administrator', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5HlFpj6jQ3xWu', TRUE, TRUE, TRUE, NOW(), NOW());
EOF
```

Or use the helper script:
```bash
./run-migrations.sh
# Choose option 2 for production
# Enter your database connection string when prompted
```

---

## ✅ Verify Migrations Worked

### Check Tables Exist

**Local (Docker):**
```bash
docker compose -f welfare-poll-backend/docker-compose.yml exec -T db \
  psql -U postgres -d welfare_poll -c "\dt"
```

**Supabase:** Go to Table Editor - you should see 5 tables:
- members
- votes
- poll_settings
- audit_logs
- notifications

### Check Admin User Exists

**Local (Docker):**
```bash
docker compose -f welfare-poll-backend/docker-compose.yml exec -T db \
  psql -U postgres -d welfare_poll -c "SELECT member_id, email, is_admin FROM members WHERE email = 'admin@welfare.com';"
```

**Supabase:** In SQL Editor, run:
```sql
SELECT member_id, email, is_admin FROM members WHERE email = 'admin@welfare.com';
```

You should see:
```
 member_id |       email       | is_admin
-----------+-------------------+----------
 ADMIN001  | admin@welfare.com | t
```

---

## 🎯 After Migrations Complete

### Local Development:
1. Restart your backend server:
   ```bash
   cd welfare-poll-backend
   npm run dev
   ```

2. Test the app at http://localhost:3000
3. Login as admin: `admin@welfare.com` / `admin123`

### Production Deployment:
1. Continue with deployment guide: [DEPLOY_NOW.md](DEPLOY_NOW.md)
2. Your database is now ready for the backend to connect
3. Make sure `DATABASE_URL` in Vercel points to this database

---

## 🐛 Troubleshooting

### "Database does not exist"

**Local:**
```bash
docker compose -f welfare-poll-backend/docker-compose.yml exec -T db \
  psql -U postgres -c "CREATE DATABASE welfare_poll;"
```

**Supabase:** Database is created automatically, use `postgres` database

### "Permission denied"

Make sure you're using the correct credentials:
- **Local**: user=postgres, password=postgres (from .env)
- **Supabase**: user=postgres, password=[your-supabase-password]

### "Docker not running"

Start Docker Desktop, then:
```bash
docker compose -f welfare-poll-backend/docker-compose.yml up -d db
```

### Migration file not found

Make sure you're in the project root directory:
```bash
cd /Users/yohans/Documents/Development/wambugu
ls welfare-poll-backend/migrations/
```

---

## 📋 Migration Files Order

**IMPORTANT**: Run migrations in this exact order:

1. ✅ `create-tables.sql` - Creates all tables
2. ✅ `update-phone-unique.sql` - Adds unique constraint to phone
3. ✅ `add-total-expected-members.sql` - Adds expected members field
4. ✅ `add-password-reset-fields.sql` - Adds password reset fields

---

## 🎉 All Done!

Once migrations are complete:
- ✅ Database has all required tables
- ✅ Admin user exists
- ✅ App can connect and work properly

**Next steps:**
- Test locally: `npm run dev` in both backend and frontend
- Or deploy: Follow [DEPLOY_NOW.md](DEPLOY_NOW.md) guide

---

**Need more help?**
- Check [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) for local setup
- Check [DEPLOY_NOW.md](DEPLOY_NOW.md) for production deployment
