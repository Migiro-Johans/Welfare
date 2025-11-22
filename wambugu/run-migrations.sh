#!/bin/bash

# Database Migration Helper Script
# This script helps you run migrations on local or production databases

set -e

echo "=========================================="
echo "  Database Migration Helper"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Ask which database to migrate
echo "Which database do you want to migrate?"
echo ""
echo "1) Local (Docker) - localhost:5432"
echo "2) Production (Supabase/Remote) - Enter connection string"
echo ""
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
    # Local database
    print_info "Migrating LOCAL database..."
    echo ""

    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running! Please start Docker Desktop."
        exit 1
    fi

    # Check if database container is running
    if ! docker compose -f welfare-poll-backend/docker-compose.yml ps | grep -q "db.*Up"; then
        print_error "Database container is not running!"
        print_info "Starting database..."
        docker compose -f welfare-poll-backend/docker-compose.yml up -d db
        sleep 5
    fi

    # Run migrations
    print_info "Running migrations..."

    echo "Migration 1: Creating tables..."
    docker compose -f welfare-poll-backend/docker-compose.yml exec -T db \
        psql -U postgres -d welfare_poll < welfare-poll-backend/migrations/create-tables.sql
    print_success "Tables created"

    echo ""
    echo "Migration 2: Updating phone unique constraint..."
    docker compose -f welfare-poll-backend/docker-compose.yml exec -T db \
        psql -U postgres -d welfare_poll < welfare-poll-backend/migrations/update-phone-unique.sql
    print_success "Phone constraint updated"

    echo ""
    echo "Migration 3: Adding total expected members..."
    docker compose -f welfare-poll-backend/docker-compose.yml exec -T db \
        psql -U postgres -d welfare_poll < welfare-poll-backend/migrations/add-total-expected-members.sql
    print_success "Expected members field added"

    echo ""
    echo "Migration 4: Adding password reset fields..."
    docker compose -f welfare-poll-backend/docker-compose.yml exec -T db \
        psql -U postgres -d welfare_poll < welfare-poll-backend/migrations/add-password-reset-fields.sql
    print_success "Password reset fields added"

    echo ""
    print_success "All migrations completed successfully!"

    # Create admin user if doesn't exist
    echo ""
    print_info "Checking for admin user..."
    ADMIN_EXISTS=$(docker compose -f welfare-poll-backend/docker-compose.yml exec -T db \
        psql -U postgres -d welfare_poll -t -c "SELECT COUNT(*) FROM members WHERE email = 'admin@welfare.com';" | tr -d '[:space:]')

    if [ "$ADMIN_EXISTS" = "0" ]; then
        print_warning "Admin user not found. Creating..."
        docker compose -f welfare-poll-backend/docker-compose.yml exec -T db \
            psql -U postgres -d welfare_poll <<EOF
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
        print_success "Admin user created!"
        print_info "Login: admin@welfare.com / admin123"
    else
        print_success "Admin user already exists"
    fi

elif [ "$choice" = "2" ]; then
    # Production database
    print_warning "PRODUCTION DATABASE MIGRATION"
    echo ""
    print_info "You will need your production database connection string"
    print_info "For Supabase: Settings → Database → Connection String (URI with pooling)"
    echo ""

    read -p "Enter database connection string: " DB_URL

    if [ -z "$DB_URL" ]; then
        print_error "Connection string cannot be empty!"
        exit 1
    fi

    print_warning "This will run migrations on your PRODUCTION database!"
    read -p "Are you sure? (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        print_info "Migration cancelled"
        exit 0
    fi

    # Check if psql is available
    if ! command -v psql &> /dev/null; then
        print_error "psql command not found!"
        print_info "For Supabase: Use the SQL Editor in the Supabase dashboard instead"
        print_info "Copy/paste each migration file from welfare-poll-backend/migrations/"
        echo ""
        print_info "Migration files to run in order:"
        echo "  1. create-tables.sql"
        echo "  2. update-phone-unique.sql"
        echo "  3. add-total-expected-members.sql"
        echo "  4. add-password-reset-fields.sql"
        echo ""
        print_info "Then run this SQL to create admin user:"
        cat <<'EOF'

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
);

EOF
        exit 1
    fi

    print_info "Running migrations on production database..."

    echo ""
    echo "Migration 1: Creating tables..."
    psql "$DB_URL" < welfare-poll-backend/migrations/create-tables.sql
    print_success "Tables created"

    echo ""
    echo "Migration 2: Updating phone unique constraint..."
    psql "$DB_URL" < welfare-poll-backend/migrations/update-phone-unique.sql
    print_success "Phone constraint updated"

    echo ""
    echo "Migration 3: Adding total expected members..."
    psql "$DB_URL" < welfare-poll-backend/migrations/add-total-expected-members.sql
    print_success "Expected members field added"

    echo ""
    echo "Migration 4: Adding password reset fields..."
    psql "$DB_URL" < welfare-poll-backend/migrations/add-password-reset-fields.sql
    print_success "Password reset fields added"

    echo ""
    print_success "All migrations completed successfully!"

    # Create admin user
    echo ""
    print_info "Creating admin user..."
    psql "$DB_URL" <<'EOF'
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
    print_success "Admin user created!"
    print_info "Login: admin@welfare.com / admin123"

else
    print_error "Invalid choice!"
    exit 1
fi

echo ""
echo "=========================================="
print_success "Database migration complete!"
echo "=========================================="
echo ""
print_info "Next steps:"
echo "  1. Test database connection"
echo "  2. Verify admin user can login"
echo "  3. Deploy your application"
echo ""
