# Backend-Frontend Connection Guide

## ✅ Connection Status

Both services are **RUNNING AND CONNECTED**:
- ✅ Backend: `http://localhost:5001` (Express Server)
- ✅ Frontend: `http://localhost:3000` (Vite Dev Server)
- ✅ API: `http://localhost:5001/api` (Working)

---

## 🔧 Configuration Summary

### Backend Configuration
**File:** `welfare-poll-backend/.env`

```env
NODE_ENV=development
PORT=5001                              # Backend runs on port 5001
CORS_ORIGIN=http://localhost:3000      # Allows frontend to connect
API_URL=http://localhost:5001
```

### Frontend Configuration
**File:** `welfare-poll-frontend/.env`

```env
VITE_API_URL=http://localhost:5001/api        # API endpoint
VITE_SOCKET_URL=http://localhost:5001         # WebSocket endpoint
```

### Vite Proxy Configuration
**File:** `welfare-poll-frontend/vite.config.js`

```javascript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:5001',  // Proxy requests to backend
      changeOrigin: true
    }
  }
}
```

---

## 🚀 How to Start Development

### Terminal 1 - Start Backend
```bash
cd welfare-poll-backend
npm run dev
```
Expected output:
```
🚀 Server is running on http://localhost:5001
📊 Health check: http://localhost:5001/health
🔌 WebSocket ready for real-time updates
```

### Terminal 2 - Start Frontend
```bash
cd welfare-poll-frontend
npm run dev
```
Expected output:
```
VITE v5.0.11  ready in 123 ms

➜  Local:   http://localhost:3000/
```

---

## 🧪 Testing the Connection

### 1. Health Check (Backend)
```bash
curl http://localhost:5001/health
```
Response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-11-22T03:11:13.019Z"
}
```

### 2. Public API Endpoint (No Auth Required)
```bash
curl http://localhost:5001/api/votes/results
```
Response:
```json
{
  "success": true,
  "data": {
    "total_members": 2,
    "total_votes": 2,
    "participation_rate": 100,
    "results": {
      "option1": { "count": 1, "percentage": 50 },
      "option2": { "count": 1, "percentage": 50, "threshold_met": false }
    }
  }
}
```

### 3. Test Registration (Frontend → Backend)
1. Open http://localhost:3000
2. Click "Register"
3. Fill in form and submit
4. Check backend console for confirmation

### 4. Test Login & Voting
1. Login with registered credentials
2. Vote on an option
3. Check real-time results update

---

## 🔌 How API Requests Work

### Frontend → Backend Flow

**Frontend Code Example:**
```javascript
// src/services/api.js
const api = axios.create({
  baseURL: 'http://localhost:5001/api'
});

// Request to register
api.post('/auth/register', userData)
```

**What Happens:**
1. Frontend sends request to `http://localhost:5001/api/auth/register`
2. Backend receives request on `/api/auth/register`
3. Backend processes and returns response
4. Frontend receives JSON response

### Using Vite Proxy (Alternative)
```javascript
// This also works because of Vite proxy
api.post('/api/auth/register', userData)
// Gets proxied to http://localhost:5001/api/auth/register
```

---

## 🛠️ Troubleshooting

### Issue: Cannot connect to backend from frontend

**Check 1: Is backend running?**
```bash
curl http://localhost:5001/health
```
If no response → Start backend with `npm run dev`

**Check 2: Wrong API URL in frontend**
- Check `welfare-poll-frontend/.env`
- Ensure `VITE_API_URL=http://localhost:5001/api`

**Check 3: CORS Error**
- Backend `.env` should have `CORS_ORIGIN=http://localhost:3000`
- Check browser console for specific CORS error

**Check 4: Port conflict**
```bash
# Find process on port 5001
lsof -i :5001

# Find process on port 3000
lsof -i :3000

# Kill if needed
kill -9 <PID>
```

### Issue: 404 errors when calling API

**Solution 1: Check endpoint exists**
```bash
curl -X GET http://localhost:5001/api/votes/results
```

**Solution 2: Check authentication**
Some endpoints require JWT token:
```bash
curl -X GET http://localhost:5001/api/votes/my-vote \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Issue: Real-time updates not working

**Check Socket.io connection:**
1. Open browser DevTools → Console
2. Check for Socket.io connection messages
3. Verify `VITE_SOCKET_URL=http://localhost:5001` in frontend `.env`

---

## 📊 Current Database Status

Connected to PostgreSQL:
```
Database: welfare_poll
Host: localhost
Port: 5432
User: postgres
```

**Tables:**
- ✅ members (2 records)
- ✅ votes (2 records)
- ✅ poll_settings
- ✅ audit_logs
- ✅ notifications

---

## 🔐 Authentication Flow

1. **Register/Login**
   - User submits credentials
   - Backend verifies and returns JWT token
   - Frontend stores token in localStorage

2. **Authenticated Requests**
   - Frontend includes `Authorization: Bearer TOKEN` header
   - Backend verifies token using `authenticate` middleware
   - Request proceeds or returns 401

3. **Token Refresh**
   - Current token expires in 7 days (`JWT_EXPIRE=7d`)
   - When expired, user must login again

---

## 📱 Real-time Updates

**Socket.io Connection:**
```javascript
// Frontend
const socket = io('http://localhost:5001');

socket.on('voteResults', (data) => {
  // Update UI with latest results
});
```

**Events:**
- `voteResults` - Broadcast when any user votes
- `connection` - When user connects
- `disconnect` - When user disconnects

---

## 🚢 Production Deployment

When deploying to production:

1. **Update environment variables:**
   ```env
   # Backend (.env)
   NODE_ENV=production
   PORT=your_port
   CORS_ORIGIN=https://your-frontend-domain.com
   
   # Frontend (.env.production)
   VITE_API_URL=https://your-backend-domain.com/api
   VITE_SOCKET_URL=https://your-backend-domain.com
   ```

2. **CORS considerations:**
   - Backend must allow your production frontend domain
   - Use HTTPS in production
   - Set secure cookies if using sessions

3. **API Base URL:**
   - Use relative paths in production: `/api` instead of full URL
   - Let your web server handle routing

---

## ✨ Quick Status Check

Run this script to verify connection:
```bash
#!/bin/bash
echo "Checking Backend..."
curl -s http://localhost:5001/health && echo "✅ Backend OK" || echo "❌ Backend DOWN"

echo "Checking Frontend..."
curl -s http://localhost:3000 > /dev/null && echo "✅ Frontend OK" || echo "❌ Frontend DOWN"

echo "Checking API..."
curl -s http://localhost:5001/api/votes/results && echo "✅ API OK" || echo "❌ API DOWN"
```

---

## 🎯 Next Steps

1. ✅ Backend & Frontend connected
2. ✅ API endpoints working
3. ✅ Database connected

**Ready to:**
- Test user registration
- Test voting functionality
- Test admin features
- Deploy to production

