#!/bin/bash

# Welfare Poll Application Startup Script
# This script starts both backend and frontend servers

set -e

echo "=========================================="
echo "  Welfare Poll Application Startup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
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

# Check if Docker is running
echo "Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running!"
    print_info "Please start Docker Desktop and try again."
    exit 1
fi
print_status "Docker is running"
echo ""

# Start PostgreSQL database using Docker Compose
echo "Starting PostgreSQL database..."
cd welfare-poll-backend

if docker compose up -d db; then
    print_status "PostgreSQL database started"
else
    print_error "Failed to start database"
    exit 1
fi

# Wait for database to be ready
print_info "Waiting for database to be ready..."
sleep 5

# Check if database tables exist, if not run migrations
print_info "Checking database schema..."
if docker compose exec -T db psql -U postgres -d welfare_poll -c "SELECT 1 FROM members LIMIT 1;" > /dev/null 2>&1; then
    print_status "Database tables exist"
else
    print_warning "Database tables not found, running migrations..."
    if docker compose exec -T db psql -U postgres -d welfare_poll -f /docker-entrypoint-initdb.d/create-tables.sql > /dev/null 2>&1; then
        print_status "Database migrations completed"
    else
        print_error "Failed to run migrations"
        print_info "Trying alternative migration method..."
        docker exec -i $(docker compose ps -q db) psql -U postgres -d welfare_poll < migrations/create-tables.sql
    fi
fi

echo ""

# Check if admin user exists
print_info "Checking for admin user..."
ADMIN_EXISTS=$(docker compose exec -T db psql -U postgres -d welfare_poll -t -c "SELECT COUNT(*) FROM members WHERE email = 'admin@welfare.com';" 2>/dev/null | tr -d '[:space:]' || echo "0")

if [ "$ADMIN_EXISTS" = "0" ]; then
    print_warning "No admin user found. Creating default admin..."

    # Create admin user with password: admin123
    docker compose exec -T db psql -U postgres -d welfare_poll > /dev/null 2>&1 <<EOF
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

    if [ $? -eq 0 ]; then
        print_status "Admin user created successfully"
        print_info "Admin credentials: admin@welfare.com / admin123"
    else
        print_error "Failed to create admin user"
    fi
else
    print_status "Admin user already exists"
fi

cd ..
echo ""

# Install backend dependencies if needed
echo "Checking backend dependencies..."
cd welfare-poll-backend
if [ ! -d "node_modules" ]; then
    print_warning "Installing backend dependencies..."
    npm install
    print_status "Backend dependencies installed"
else
    print_status "Backend dependencies found"
fi
cd ..
echo ""

# Install frontend dependencies if needed
echo "Checking frontend dependencies..."
cd welfare-poll-frontend
if [ ! -d "node_modules" ]; then
    print_warning "Installing frontend dependencies..."
    npm install
    print_status "Frontend dependencies installed"
else
    print_status "Frontend dependencies found"
fi
cd ..
echo ""

# Start the servers
echo "=========================================="
echo "  Starting Application Servers"
echo "=========================================="
echo ""

print_info "Starting backend server on port 5001..."
print_info "Starting frontend server on port 3000..."
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo ""
    print_warning "Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    print_status "Servers stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend in background
cd welfare-poll-backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend in background
cd welfare-poll-frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for servers to start
sleep 5

echo ""
echo "=========================================="
echo "  Application Started Successfully! 🎉"
echo "=========================================="
echo ""
print_status "Backend running on:  http://localhost:5001"
print_status "Frontend running on: http://localhost:3000"
print_status "Database running on: localhost:5432"
echo ""
print_info "Admin Dashboard: http://localhost:3000/admin"
print_info "Admin Login: admin@welfare.com / admin123"
echo ""
echo "=========================================="
echo "  Quick Access Links"
echo "=========================================="
echo ""
echo "  📝 Register: http://localhost:3000/register"
echo "  🔐 Login:    http://localhost:3000/login"
echo "  🗳️  Vote:     http://localhost:3000/vote"
echo "  📊 Results:  http://localhost:3000/results"
echo "  ⚙️  Admin:    http://localhost:3000/admin"
echo ""
echo "=========================================="
echo ""
print_warning "Press Ctrl+C to stop all servers"
echo ""
print_info "Logs are being saved to:"
echo "  - Backend:  backend.log"
echo "  - Frontend: frontend.log"
echo ""

# Keep script running and show logs
tail -f backend.log frontend.log
