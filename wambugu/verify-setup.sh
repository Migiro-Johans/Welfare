#!/bin/bash

# Verification script for Welfare Poll Application
# This script checks if all components are properly configured

set -e

echo "=========================================="
echo "  Welfare Poll - Setup Verification"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

CHECKS_PASSED=0
CHECKS_FAILED=0

check_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((CHECKS_PASSED++))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((CHECKS_FAILED++))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 1. Check Docker
echo "Checking Docker..."
if docker info > /dev/null 2>&1; then
    check_pass "Docker is running"
else
    check_fail "Docker is not running - Please start Docker Desktop"
fi
echo ""

# 2. Check backend .env
echo "Checking backend configuration..."
if [ -f "welfare-poll-backend/.env" ]; then
    check_pass "Backend .env file exists"

    # Check critical variables
    if grep -q "JWT_SECRET" welfare-poll-backend/.env; then
        check_pass "JWT_SECRET configured"
    else
        check_fail "JWT_SECRET missing in backend .env"
    fi

    if grep -q "PORT=5001" welfare-poll-backend/.env; then
        check_pass "Backend port set to 5001"
    else
        check_warn "Backend port may not be 5001 - check .env file"
    fi
else
    check_fail "Backend .env file missing"
fi
echo ""

# 3. Check frontend .env
echo "Checking frontend configuration..."
if [ -f "welfare-poll-frontend/.env" ]; then
    check_pass "Frontend .env file exists"

    if grep -q "VITE_API_URL.*5001" welfare-poll-frontend/.env; then
        check_pass "Frontend API URL points to port 5001"
    else
        check_fail "Frontend API URL not configured correctly"
    fi
else
    check_fail "Frontend .env file missing"
fi
echo ""

# 4. Check database
echo "Checking database..."
if docker compose -f welfare-poll-backend/docker-compose.yml ps | grep -q "db"; then
    check_pass "Database container exists"

    if docker compose -f welfare-poll-backend/docker-compose.yml ps | grep "db" | grep -q "Up"; then
        check_pass "Database is running"

        # Check if we can connect
        if docker compose -f welfare-poll-backend/docker-compose.yml exec -T db psql -U postgres -d welfare_poll -c "SELECT 1;" > /dev/null 2>&1; then
            check_pass "Database connection successful"

            # Check if tables exist
            if docker compose -f welfare-poll-backend/docker-compose.yml exec -T db psql -U postgres -d welfare_poll -c "SELECT 1 FROM members LIMIT 1;" > /dev/null 2>&1; then
                check_pass "Database tables exist"

                # Check if admin user exists
                ADMIN_COUNT=$(docker compose -f welfare-poll-backend/docker-compose.yml exec -T db psql -U postgres -d welfare_poll -t -c "SELECT COUNT(*) FROM members WHERE email = 'admin@welfare.com';" 2>/dev/null | tr -d '[:space:]' || echo "0")

                if [ "$ADMIN_COUNT" != "0" ]; then
                    check_pass "Admin user exists (admin@welfare.com)"
                else
                    check_fail "Admin user not found - run setup to create"
                fi
            else
                check_fail "Database tables don't exist - run migrations"
            fi
        else
            check_fail "Cannot connect to database"
        fi
    else
        check_fail "Database container is not running - start with: cd welfare-poll-backend && docker compose up -d db"
    fi
else
    check_fail "Database container doesn't exist - run docker compose up"
fi
echo ""

# 5. Check dependencies
echo "Checking dependencies..."
if [ -d "welfare-poll-backend/node_modules" ]; then
    check_pass "Backend dependencies installed"
else
    check_fail "Backend dependencies missing - run: cd welfare-poll-backend && npm install"
fi

if [ -d "welfare-poll-frontend/node_modules" ]; then
    check_pass "Frontend dependencies installed"
else
    check_fail "Frontend dependencies missing - run: cd welfare-poll-frontend && npm install"
fi
echo ""

# 6. Check if servers are running
echo "Checking running servers..."
if lsof -ti:5001 > /dev/null 2>&1; then
    check_pass "Backend server is running on port 5001"
else
    check_warn "Backend server is not running - start with: cd welfare-poll-backend && npm run dev"
fi

if lsof -ti:3000 > /dev/null 2>&1; then
    check_pass "Frontend server is running on port 3000"
else
    check_warn "Frontend server is not running - start with: cd welfare-poll-frontend && npm run dev"
fi
echo ""

# Summary
echo "=========================================="
echo "  Verification Summary"
echo "=========================================="
echo ""
echo -e "${GREEN}Passed: $CHECKS_PASSED${NC}"
echo -e "${RED}Failed: $CHECKS_FAILED${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Your setup looks good.${NC}"
    echo ""
    echo "You can now:"
    echo "  1. Start the app: ./start-app.sh"
    echo "  2. Access frontend: http://localhost:3000"
    echo "  3. Login as admin: admin@welfare.com / admin123"
    echo "  4. Access admin panel: http://localhost:3000/admin"
else
    echo -e "${RED}✗ Some checks failed. Please fix the issues above.${NC}"
    echo ""
    echo "Quick fixes:"
    echo "  - Start Docker Desktop"
    echo "  - Run: cd welfare-poll-backend && docker compose up -d db"
    echo "  - Run: cd welfare-poll-backend && npm install"
    echo "  - Run: cd welfare-poll-frontend && npm install"
    echo ""
    echo "For detailed setup: See SETUP_INSTRUCTIONS.md"
fi
echo ""
