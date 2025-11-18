# Welfare Members Poll - Full Stack Application

A comprehensive web application for conducting welfare benefit polls among organization members.

## Project Structure

```
wambugu/
├── welfare-poll-backend/     # Node.js/Express Backend API
└── welfare-poll-frontend/    # React Frontend Application
```

## Features

### Core Functionality
- **Member Authentication**: Secure registration and login with JWT
- **Voting System**: Single-choice voting with vote change capability
- **Real-time Results**: Live updates using Socket.io
- **Admin Dashboard**: Complete vote management and analytics
- **Email Notifications**: Automated confirmations and reminders
- **Data Export**: Excel export for votes and reports

### Poll Options

#### Option 1: Micro-Insurance Cover (Britam)
- Annual Premium: Kshs. 7,300
- Inpatient Cover: Kshs. 200,000
- Outpatient Cover: Kshs. 50,000
- Last Expense: Kshs. 40,000

#### Option 2: Internal Welfare Contribution Scheme
- Monthly Contribution: Kshs. 500
- Minimum 150 members required
- Hospital Bill Reimbursement: Up to Kshs. 80,000
- Last Expense Support: Up to Kshs. 50,000

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.io
- **Email**: Nodemailer
- **Validation**: Joi
- **ORM**: Sequelize

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Notifications**: React Hot Toast

## Quick Start

### Prerequisites
- Node.js 18 or higher
- PostgreSQL 15 or higher
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd welfare-poll-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=welfare_poll
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourorganization.com

VOTE_SECRET=your_vote_hash_secret
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

5. Create PostgreSQL database:
```bash
psql -U postgres
CREATE DATABASE welfare_poll;
\q
```

6. Run migrations:
```bash
psql -U postgres -d welfare_poll -f migrations/create-tables.sql
```

7. Start development server:
```bash
npm run dev
```

Backend will be running at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd welfare-poll-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

4. Start development server:
```bash
npm run dev
```

Frontend will be running at `http://localhost:3000`

## Docker Deployment

### Using Docker Compose

1. Create `.env` file in `welfare-poll-backend/`:
```env
DB_PASSWORD=secure_password_here
JWT_SECRET=your_jwt_secret_here
VOTE_SECRET=your_vote_secret_here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourorganization.com
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

2. Start services:
```bash
cd welfare-poll-backend
docker-compose up -d
```

3. Check logs:
```bash
docker-compose logs -f
```

4. Stop services:
```bash
docker-compose down
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new member
- `POST /api/auth/login` - Login member
- `POST /api/auth/logout` - Logout member
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/profile` - Update profile

### Voting
- `POST /api/votes` - Submit/update vote
- `GET /api/votes/results` - Get results (public)
- `GET /api/votes/my-vote` - Get user's vote

### Poll
- `GET /api/poll/settings` - Get poll settings
- `GET /api/poll/status` - Check poll status
- `GET /api/poll/statistics` - Get statistics

### Admin (requires admin role)
- `GET /api/admin/votes` - Get all votes
- `GET /api/admin/analytics` - Get analytics
- `PATCH /api/admin/poll-status` - Open/close poll
- `PUT /api/admin/poll-settings` - Update settings
- `GET /api/admin/export/votes` - Export to Excel
- `GET /api/admin/members` - Get all members
- `POST /api/admin/notifications` - Send bulk emails
- `GET /api/admin/audit-logs` - View audit trail

## Database Schema

### Tables
- **members**: User accounts and authentication
- **votes**: Vote records with integrity hash
- **poll_settings**: Poll configuration
- **audit_logs**: Activity tracking
- **notifications**: Email notification queue

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT authentication with 7-day expiry
- Vote integrity hash verification
- Rate limiting on all endpoints
- CORS protection
- Helmet.js security headers
- SQL injection prevention via Sequelize
- Input validation with Joi
- Audit logging for all actions

## Development

### Backend Development
```bash
cd welfare-poll-backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
cd welfare-poll-frontend
npm run dev  # Uses Vite HMR
```

### Running Tests
```bash
# Backend tests
cd welfare-poll-backend
npm test

# Frontend tests
cd welfare-poll-frontend
npm test
```

## Production Deployment

### Backend Production Build
```bash
cd welfare-poll-backend
NODE_ENV=production npm start
```

### Frontend Production Build
```bash
cd welfare-poll-frontend
npm run build
npm run preview
```

### Environment Variables for Production
Ensure all environment variables are properly set with secure values:
- Change all secrets (JWT_SECRET, VOTE_SECRET)
- Use production database credentials
- Configure production email service
- Set proper CORS origins
- Enable SSL/TLS

## Creating Admin Users

To create an admin user, manually update the database:
```sql
UPDATE members SET is_admin = TRUE WHERE email = 'admin@example.com';
```

## Monitoring & Logs

### Backend Logs
- Error logs: `welfare-poll-backend/logs/error.log`
- Combined logs: `welfare-poll-backend/logs/combined.log`
- Console output in development mode

### Health Check
```bash
curl http://localhost:5000/health
```

## Troubleshooting

### Database Connection Issues
1. Verify PostgreSQL is running
2. Check database credentials in `.env`
3. Ensure database exists: `psql -U postgres -l`

### Email Not Sending
1. Verify SMTP credentials
2. For Gmail, use App Passwords (not regular password)
3. Check email service logs

### Socket.io Not Connecting
1. Ensure backend server is running
2. Check CORS settings
3. Verify FRONTEND_URL in backend `.env`

## Project Structure Details

### Backend Structure
```
src/
├── config/          # Database, email, socket config
├── controllers/     # Request handlers
├── middleware/      # Auth, validation, error handling
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic
└── utils/           # Helper functions
```

### Frontend Structure
```
src/
├── components/      # React components
│   ├── Auth/       # Login, Register
│   ├── Voting/     # Vote interface
│   ├── Results/    # Results dashboard
│   ├── Admin/      # Admin panel
│   └── Common/     # Shared components
├── contexts/        # React contexts
├── hooks/          # Custom hooks
├── services/       # API & Socket services
└── utils/          # Utility functions
```

## License

Proprietary - All rights reserved

## Support

For issues or questions, contact the development team.

---

**Built with Node.js, React, PostgreSQL, and Socket.io**
