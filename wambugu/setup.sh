#!/bin/bash

echo "🚀 Welfare Poll Application - Setup Script"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

# Check PostgreSQL
echo ""
echo "🐘 Checking PostgreSQL..."
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version)
    echo -e "${GREEN}✓ PostgreSQL installed: $PSQL_VERSION${NC}"
    PG_INSTALLED=true
else
    echo -e "${YELLOW}⚠ PostgreSQL not found${NC}"
    echo "Choose installation method:"
    echo "  1. Homebrew: brew install postgresql@15"
    echo "  2. Postgres.app: https://postgresapp.com/"
    echo "  3. Docker: We'll use Docker Compose"
    PG_INSTALLED=false
fi

# Ask user preference
echo ""
echo "Choose setup method:"
echo "  1. Local PostgreSQL (requires PostgreSQL installed)"
echo "  2. Docker Compose (easiest - requires Docker Desktop)"
echo ""
read -p "Enter choice (1 or 2): " SETUP_CHOICE

if [ "$SETUP_CHOICE" = "2" ]; then
    echo ""
    echo "🐳 Docker Setup Selected"

    # Check if Docker is running
    if docker info &> /dev/null; then
        echo -e "${GREEN}✓ Docker is running${NC}"
    else
        echo -e "${RED}✗ Docker is not running${NC}"
        echo "Please start Docker Desktop and run this script again"
        echo "Or run: open -a Docker"
        exit 1
    fi

    # Install backend dependencies
    echo ""
    echo "📦 Installing backend dependencies..."
    cd welfare-poll-backend
    npm install

    # Start Docker Compose
    echo ""
    echo "🐳 Starting PostgreSQL with Docker..."
    docker-compose up -d db

    echo "⏳ Waiting for database to be ready..."
    sleep 5

    # Run migrations
    echo ""
    echo "📊 Running database migrations..."
    docker exec -i welfare-poll-db psql -U postgres -d welfare_poll < migrations/create-tables.sql

    echo ""
    echo -e "${GREEN}✓ Backend setup complete!${NC}"
    echo ""
    echo "To start the backend server:"
    echo "  cd welfare-poll-backend"
    echo "  npm run dev"

elif [ "$SETUP_CHOICE" = "1" ]; then
    if [ "$PG_INSTALLED" = false ]; then
        echo -e "${RED}PostgreSQL is not installed. Please install it first.${NC}"
        echo ""
        echo "Quick install with Homebrew:"
        echo "  brew install postgresql@15"
        echo "  brew services start postgresql@15"
        exit 1
    fi

    echo ""
    echo "🏠 Local PostgreSQL Setup Selected"

    # Create database
    echo ""
    echo "📊 Creating database..."
    createdb welfare_poll 2>/dev/null || echo "Database might already exist"

    # Install backend dependencies
    echo ""
    echo "📦 Installing backend dependencies..."
    cd welfare-poll-backend
    npm install

    # Run migrations
    echo ""
    echo "📊 Running database migrations..."
    psql -d welfare_poll -f migrations/create-tables.sql

    echo ""
    echo -e "${GREEN}✓ Backend setup complete!${NC}"
    echo ""
    echo "To start the backend server:"
    echo "  cd welfare-poll-backend"
    echo "  npm run dev"
else
    echo -e "${RED}Invalid choice${NC}"
    exit 1
fi

# Frontend setup
echo ""
echo "⚛️  Setting up frontend..."
cd ../welfare-poll-frontend
npm install

echo ""
echo -e "${GREEN}✓ Frontend setup complete!${NC}"
echo ""
echo "To start the frontend:"
echo "  cd welfare-poll-frontend"
echo "  npm run dev"

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Start backend:  cd welfare-poll-backend && npm run dev"
echo "  2. Start frontend: cd welfare-poll-frontend && npm run dev"
echo "  3. Open browser:   http://localhost:3000"
echo ""
echo "See QUICK_START.md for detailed instructions"
echo ""
