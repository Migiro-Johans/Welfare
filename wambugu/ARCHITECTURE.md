# 🔗 Backend-Frontend Architecture Diagram

## Current Setup (All Working ✅)

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER BROWSER                                 │
└─────────────────────────────────────────────────────────────────┘
                           ↓
                    (Opens in browser)
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                  FRONTEND (React)                               │
│               http://localhost:3000                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  - Login/Register Pages                                  │  │
│  │  - Voting Interface                                      │  │
│  │  - Results Dashboard                                     │  │
│  │  - Admin Panel                                           │  │
│  │  - Navbar, Components                                    │  │
│  │                                                          │  │
│  │  .env:                                                   │  │
│  │  VITE_API_URL=http://localhost:5001/api                │  │
│  │  VITE_SOCKET_URL=http://localhost:5001                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
              ↓ (HTTP/REST)      ↓ (WebSocket)
    ┌─────────────────────────────────────┐
    │   Vite Dev Server                   │
    │   ├─ HMR (Hot Module Reload)        │
    │   ├─ Proxy: /api → :5001            │
    │   └─ Static file serving             │
    └─────────────────────────────────────┘
              ↓                    ↓
    ┌─────────────────────────────────────────────────────────────┐
    │              CORS Headers Validation                        │
    │         (Origin: http://localhost:3000)                     │
    │  ✅ Access-Control-Allow-Origin                             │
    │  ✅ Access-Control-Allow-Methods                            │
    │  ✅ Access-Control-Allow-Credentials                        │
    └─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                  BACKEND (Express.js)                           │
│               http://localhost:5001                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Routes:                                                 │  │
│  │  ├─ /api/auth/register, /login, /profile               │  │
│  │  ├─ /api/votes/submit, /results, /my-vote              │  │
│  │  ├─ /api/poll/settings, /status, /statistics           │  │
│  │  └─ /api/admin/* (Protected - Admin only)               │  │
│  │                                                          │  │
│  │  .env:                                                   │  │
│  │  PORT=5001                                              │  │
│  │  CORS_ORIGIN=http://localhost:3000                      │  │
│  │  JWT_SECRET=welfare_poll_jwt_secret_key_dev_...         │  │
│  │                                                          │  │
│  │  Middleware:                                             │  │
│  │  ├─ CORS (allow localhost:3000)                         │  │
│  │  ├─ Authentication (JWT)                                │  │
│  │  ├─ Rate Limiting                                       │  │
│  │  └─ Error Handling                                      │  │
│  │                                                          │  │
│  │  Socket.io:                                              │  │
│  │  └─ Real-time vote updates                              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│              PostgreSQL Database                               │
│               localhost:5432                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Database: welfare_poll                                  │  │
│  │  ├─ members (2 users)                                    │  │
│  │  ├─ votes (2 votes)                                      │  │
│  │  ├─ poll_settings                                        │  │
│  │  ├─ audit_logs                                           │  │
│  │  └─ notifications                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Communication Flow

### Example: User Voting

```
1. User clicks "Vote Option 1"
   ↓
2. Frontend (React Component)
   └─ POST /api/votes
      └─ Body: { vote_option: 1 }
      └─ Header: Authorization: Bearer JWT_TOKEN
   ↓
3. Network Request
   └─ Vite Proxy intercepts
   └─ Forwards to http://localhost:5001/api/votes
   ↓
4. Backend (Express Server)
   └─ Routes to voteController.vote()
   └─ Validates JWT token
   └─ Checks vote constraints
   └─ Saves to PostgreSQL
   └─ Generates vote hash
   └─ Logs audit entry
   └─ Emits Socket.io event: 'voteResults'
   ↓
5. Response
   └─ HTTP 201 Created
   └─ Body: { success: true, data: { vote_id, vote_option, voted_at } }
   ↓
6. Frontend receives response
   └─ Updates state
   └─ Shows confirmation toast
   └─ Redirects to results page
   ↓
7. Socket.io Event
   └─ All connected clients receive 'voteResults'
   └─ Results dashboard updates in real-time
```

---

## Request/Response Examples

### Registration
```
REQUEST:
POST http://localhost:5001/api/auth/register
Content-Type: application/json

{
  "member_id": "MEM001",
  "email": "john@example.com",
  "full_name": "John Doe",
  "phone": "+254712345678",
  "password": "SecurePass123!"
}

RESPONSE:
HTTP/1.1 201 Created

{
  "success": true,
  "message": "Registration successful",
  "data": {
    "id": 1,
    "member_id": "MEM001",
    "email": "john@example.com",
    "full_name": "John Doe",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
```
REQUEST:
POST http://localhost:5001/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

RESPONSE:
HTTP/1.1 200 OK

{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "member_id": "MEM001",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Submit Vote
```
REQUEST:
POST http://localhost:5001/api/votes
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "vote_option": 1
}

RESPONSE:
HTTP/1.1 201 Created

{
  "success": true,
  "message": "Vote submitted successfully",
  "data": {
    "vote_id": 1,
    "vote_option": 1,
    "voted_at": "2025-11-22T03:11:24.331Z"
  }
}
```

### Get Results (Public)
```
REQUEST:
GET http://localhost:5001/api/votes/results

RESPONSE:
HTTP/1.1 200 OK

{
  "success": true,
  "data": {
    "total_members": 2,
    "total_votes": 2,
    "participation_rate": 100,
    "results": {
      "option1": {
        "count": 1,
        "percentage": 50
      },
      "option2": {
        "count": 1,
        "percentage": 50,
        "threshold_met": false,
        "required_votes": 150
      }
    },
    "last_updated": "2025-11-22T03:11:24.331Z"
  }
}
```

---

## Environment Variables Explained

### Backend (.env)
```env
# Server
NODE_ENV=development              # Use 'production' for deployment
PORT=5001                          # Backend listens on this port
API_URL=http://localhost:5001      # API base URL

# Database
DB_HOST=localhost                  # PostgreSQL server
DB_PORT=5432                       # PostgreSQL port
DB_NAME=welfare_poll               # Database name
DB_USER=postgres                   # Database user
DB_PASSWORD=postgres               # Database password

# JWT Authentication
JWT_SECRET=...                     # Secret key for signing tokens
JWT_EXPIRE=7d                      # Token expiration time

# CORS - CRITICAL FOR CONNECTION
CORS_ORIGIN=http://localhost:3000  # Allow requests from frontend

# Frontend URL (for redirects, emails)
FRONTEND_URL=http://localhost:3000 # Frontend base URL

# Socket.io
SOCKET_URL=http://localhost:5001   # WebSocket URL
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5001/api        # Backend API endpoint
VITE_SOCKET_URL=http://localhost:5001         # Backend WebSocket endpoint
```

### Vite Config (vite.config.js)
```javascript
server: {
  port: 3000,                      // Frontend port
  proxy: {
    '/api': {
      target: 'http://localhost:5001',  // Dev server proxy target
      changeOrigin: true
    }
  }
}
```

---

## Ports Quick Reference

| Service | Port | URL | Status |
|---------|------|-----|--------|
| Frontend (Vite) | 3000 | http://localhost:3000 | ✅ Running |
| Backend (Express) | 5001 | http://localhost:5001 | ✅ Running |
| PostgreSQL | 5432 | localhost:5432 | ✅ Running |
| Socket.io | 5001 | ws://localhost:5001 | ✅ Ready |

---

## Network Requests Path

### During Development (with Vite Proxy)

**Option A: Using full URL**
```
React Component
  ↓
axios.post('http://localhost:5001/api/votes')
  ↓
Vite Proxy (reads from vite.config.js)
  ↓
Express Backend at http://localhost:5001
```

**Option B: Using relative path**
```
React Component
  ↓
axios.post('/api/votes')
  ↓
Vite Proxy (matches /api pattern)
  ↓
Forwards to http://localhost:5001/api/votes
```

---

## Security Considerations

### CORS (Cross-Origin Resource Sharing)
- ✅ Backend allows `http://localhost:3000`
- ✅ Frontend can make cross-origin requests
- ✅ Credentials included in requests

### JWT Authentication
- ✅ Token stored in localStorage
- ✅ Token sent in Authorization header
- ✅ Token verified on every protected endpoint
- ⚠️ In production, use HttpOnly cookies

### HTTPS in Production
- 🚀 Use HTTPS URLs instead of HTTP
- 🚀 Update CORS_ORIGIN to production domain
- 🚀 Set secure cookies

---

## Troubleshooting Checklist

```
❓ Frontend can't reach backend?
  ✓ Check if backend is running: curl http://localhost:5001/health
  ✓ Check vite.config.js proxy target (should be :5001)
  ✓ Check frontend .env VITE_API_URL
  ✓ Check backend .env CORS_ORIGIN=http://localhost:3000

❓ CORS error in console?
  ✓ Backend must have CORS_ORIGIN=http://localhost:3000
  ✓ Restart backend after changing .env
  ✓ Check Network tab for Access-Control-Allow-Origin header

❓ API returns 401 Unauthorized?
  ✓ Token might be expired
  ✓ Check if token is being sent: Authorization header
  ✓ Try logging in again

❓ Real-time updates not working?
  ✓ Check if Socket.io is initialized
  ✓ Check browser console for WebSocket connection
  ✓ Verify VITE_SOCKET_URL in frontend .env
```

---

## Next Steps

✅ Backend & Frontend are **CONNECTED**
✅ API endpoints are **WORKING**
✅ Database is **CONNECTED**

👉 **Now build the UI components** using:
   - React components in `src/components/`
   - Use existing services (`api.js`, `AuthContext`)
   - Add pages for Login, Register, Vote, Results, Admin

