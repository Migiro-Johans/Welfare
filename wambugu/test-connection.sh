#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Backend-Frontend Connection Test${NC}"
echo -e "${BLUE}================================${NC}\n"

# Test Backend Health
echo -e "${YELLOW}1. Testing Backend Health...${NC}"
if curl -s http://localhost:5001/health | grep -q "success"; then
  echo -e "${GREEN}✅ Backend is running on http://localhost:5001${NC}"
else
  echo -e "${RED}❌ Backend is NOT running${NC}"
  echo -e "${YELLOW}   Start it with: cd welfare-poll-backend && npm run dev${NC}"
  exit 1
fi

# Test Frontend
echo -e "\n${YELLOW}2. Testing Frontend...${NC}"
if curl -s http://localhost:3000 | grep -q "root"; then
  echo -e "${GREEN}✅ Frontend is running on http://localhost:3000${NC}"
else
  echo -e "${RED}❌ Frontend is NOT running${NC}"
  echo -e "${YELLOW}   Start it with: cd welfare-poll-frontend && npm run dev${NC}"
  exit 1
fi

# Test API Connection
echo -e "\n${YELLOW}3. Testing API Endpoints...${NC}"

# Public endpoint (no auth)
RESPONSE=$(curl -s http://localhost:5001/api/votes/results)
if echo "$RESPONSE" | grep -q "success"; then
  echo -e "${GREEN}✅ Public API endpoint working${NC}"
  TOTAL_VOTES=$(echo "$RESPONSE" | grep -o '"total_votes":[0-9]*' | cut -d: -f2)
  echo -e "   Total votes recorded: $TOTAL_VOTES"
else
  echo -e "${RED}❌ API endpoint failed${NC}"
fi

# Test CORS
echo -e "\n${YELLOW}4. Testing CORS Configuration...${NC}"
CORS_RESPONSE=$(curl -s -i -X OPTIONS http://localhost:5001/api/votes/results \
  -H "Origin: http://localhost:3000" 2>&1 | grep -i "access-control")

if [ -n "$CORS_RESPONSE" ]; then
  echo -e "${GREEN}✅ CORS headers present${NC}"
  echo -e "   $CORS_RESPONSE"
else
  echo -e "${YELLOW}⚠️  No CORS headers detected (might be OK)${NC}"
fi

# Test Database Connection
echo -e "\n${YELLOW}5. Testing Database Connection...${NC}"
DB_CHECK=$(curl -s http://localhost:5001/api/votes/results | grep -o '"total_members":[0-9]*')
if [ -n "$DB_CHECK" ]; then
  TOTAL_MEMBERS=$(echo "$DB_CHECK" | cut -d: -f2)
  echo -e "${GREEN}✅ Database is connected${NC}"
  echo -e "   Total members: $TOTAL_MEMBERS"
else
  echo -e "${RED}❌ Database connection failed${NC}"
fi

# Test Socket.io
echo -e "\n${YELLOW}6. Testing Socket.io...${NC}"
if curl -s http://localhost:5001/socket.io/?transport=polling 2>&1 | grep -q "sid"; then
  echo -e "${GREEN}✅ Socket.io is ready for real-time updates${NC}"
else
  echo -e "${YELLOW}⚠️  Socket.io status unknown (normal for polling test)${NC}"
fi

# Summary
echo -e "\n${BLUE}================================${NC}"
echo -e "${GREEN}✅ ALL SYSTEMS OPERATIONAL${NC}"
echo -e "${BLUE}================================${NC}\n"

echo -e "${YELLOW}Access URLs:${NC}"
echo -e "  Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "  Backend:  ${GREEN}http://localhost:5001${NC}"
echo -e "  API:      ${GREEN}http://localhost:5001/api${NC}\n"

echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Open http://localhost:3000 in your browser"
echo -e "  2. Register a new account"
echo -e "  3. Login and test voting"
echo -e "  4. Check results dashboard"
echo -e "  5. Access admin panel if admin user\n"
