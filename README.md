# activity-logs-dashboard# Keycloak Logging System

Complete production-ready logging and monitoring solution for Keycloak using Vector, Express.js, PostgreSQL, and Nuxt.js.

## 🎯 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│ Server (192.168.6.224)                              │
│  ├─ Keycloak (Docker)         Port: 8080, 8443     │
│  ├─ PostgreSQL (Keycloak DB)  Port: 5432           │
│  └─ Vector (Log Collector)    Port: 8686           │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP/gRPC (Log Stream)
                   ▼
┌─────────────────────────────────────────────────────┐
│ Your PC (Development Machine)                       │
│  ├─ Nuxt Dashboard            Port: 3000           │
│  ├─ Express API                Port: 3001           │
│  └─ PostgreSQL (Logs DB)       Port: 5432           │
└─────────────────────────────────────────────────────┘
```

## ✨ Features

- ✅ **Real-time Log Processing** - Vector collects and processes logs from Keycloak
- ✅ **Secure Data Pipeline** - Token-based authentication between Vector and API
- ✅ **Comprehensive Logging** - Authentication events, admin actions, and metrics
- ✅ **Beautiful Dashboard** - Modern, responsive UI with real-time updates
- ✅ **Advanced Analytics** - Statistics, time-series data, and user insights
- ✅ **Security Alerts** - Automatic detection of suspicious activities
- ✅ **Scalable Architecture** - Handles thousands of events per second
- ✅ **Production Ready** - Battle-tested components and best practices

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **PostgreSQL** 13.x or higher ([Download](https://www.postgresql.org/download/))
- **Docker & Docker Compose** (on server)
- **SSH Access** to Keycloak server (192.168.6.224)
- **Network Access** between your PC and server

## 🚀 Quick Start Guide

### Step 1: Setup Database

```bash
# Start PostgreSQL (if not running)
# Windows: Services → PostgreSQL → Start
# Linux: sudo systemctl start postgresql
# macOS: brew services start postgresql

# Create database
psql -U postgres

# In PostgreSQL shell:
CREATE DATABASE keycloak_logs;
\c keycloak_logs

# Copy and paste content from database/schema.sql
# Then exit:
\q
```

### Step 2: Setup Backend API

```bash
# Navigate to backend directory
cd backend

# Initialize project
npm init -y

# Install dependencies
npm install express pg cors dotenv helmet express-rate-limit compression morgan
npm install --save-dev nodemon

# Edit .env file with your actual values

# Start backend
npm run dev

# Should see:
# ✅ Database connected successfully
# 🚀 Server running on http://localhost:3001
```

### Step 3: Setup Frontend Dashboard

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Create Nuxt project
npx nuxi@latest init .

# Install Tailwind CSS
npm install -D @nuxtjs/tailwindcss
npx tailwindcss init

# Start dashboard
npm run dev

# Should see:
# Nuxt running at http://localhost:3000
```

### Step 4: Configure Keycloak Server

```bash
# SSH into server
ssh glide@192.168.6.224
# Password: gt123

# Navigate to Keycloak directory
cd /path/to/keycloak

# Backup existing files
cp docker-compose.yml docker-compose.yml.backup

# Create vector.toml
nano vector.toml
# Paste content from server-config/vector.toml

# ⚠️ IMPORTANT: Update these values in vector.toml:
# 1. Replace YOUR_PC_IP with your actual PC IP
#    Find it: ipconfig (Windows) or ip addr (Linux)
# 2. Replace YOUR_SECRET_TOKEN_HERE with a secure token
#    Generate: openssl rand -base64 32

# Update docker-compose.yml
nano docker-compose.yml
# Paste content from server-config/docker-compose.yml

# Create logs directory
mkdir -p logs

# Restart services
docker-compose down
docker-compose up -d

# Verify
docker-compose ps
docker-compose logs -f vector
```

## 📁 Complete File Structure

```
activity-logs-dashboard/
│
├── backend/                          # Express.js API
│   ├── config/
│   │   └── database.js              # PostgreSQL connection
│   ├── controllers/
│   │   └── logsController.js        # Business logic
│   ├── middleware/
│   │   └── auth.js                  # Authentication
│   ├── routes/
│   │   └── logs.js                  # API routes
│   ├── .env                         # Environment config
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── README.md
│   └── server.js                    # Entry point
│
├── frontend/                         # Nuxt.js Dashboard
|   ├── app/
│   │   └── app.vue
│   ├── assets/
│   │   └── css/
│   │       └── tailwind.css
│   ├── components/
│   │   ├── LogsTable.vue
│   │   ├── StatsCard.vue
│   │   └── SecurityAlerts.vue
│   ├── composables/
│   │   └── useLogsAPI.js
│   ├── pages/
│   │   └── index.vue
│   ├── .env
│   ├── .gitignore
│   ├── nuxt.config.ts
│   ├── package.json
│   ├── README.md
│   └── tailwind.config.js
│
├── database/
│   └── schema.sql                   # Database schema
│
├── server-config/                    # Keycloak Server
│   ├── docker-compose.yml
│   ├── vector.toml
│
└── README.md                        # This file
```

## 🔧 Configuration

### Backend (.env)

```env
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=keycloak_logs
DB_USER=postgres
DB_PASSWORD=your_password
FRONTEND_URL=http://localhost:3000
VECTOR_SECRET_TOKEN=your_secret_token_here
```

### Frontend (.env)

```env
API_BASE_URL=http://localhost:3001/api/logs
```

### Vector (vector.toml)

⚠️ **Critical Configuration:**

1. **Replace YOUR_PC_IP** with your PC's IP address:
   ```toml
   uri = "http://192.168.6.100:3001/api/logs/ingest"
   ```

2. **Replace YOUR_SECRET_TOKEN_HERE** with the same token from backend .env:
   ```toml
   Authorization = "Bearer your_secret_token_here"
   ```

## 📊 API Endpoints

### Health Check
```
GET /health
```

### Authentication Logs
```
GET /api/logs/auth?limit=50&offset=0&event_type=LOGIN&success=true
```

### Admin Logs
```
GET /api/logs/admin?limit=50&offset=0
```

### Statistics
```
GET /api/logs/stats/login?period=24h
GET /api/logs/stats/realms
GET /api/logs/stats/timeseries?period=24h&interval=1h
GET /api/logs/stats/users/top?limit=10
```

### Security
```
GET /api/logs/security/alerts
```

## 🧪 Testing the System

### 1. Test Database Connection

```bash
psql -U postgres -d keycloak_logs -c "SELECT COUNT(*) FROM auth_logs;"
```

### 2. Test Backend API

```bash
# Health check
curl http://localhost:3001/health

# Should return: {"status":"healthy",...}
```

### 3. Test Vector Pipeline

```bash
# SSH into server
ssh glide@192.168.6.224

# Check Vector logs
docker-compose logs -f vector

# Test Vector API
curl http://192.168.6.224:8686/health
```

### 4. Generate Test Logs

1. Open Keycloak in browser
2. Try logging in (successful and failed attempts)
3. Wait 10-30 seconds for Vector to batch and send
4. Check dashboard at `http://localhost:3000`

### 5. Verify Data Flow

```bash
# On your PC
# Check if logs are being inserted
psql -U postgres -d keycloak_logs -c "SELECT COUNT(*) FROM auth_logs;"

# View recent logs
psql -U postgres -d keycloak_logs -c "SELECT * FROM auth_logs ORDER BY timestamp DESC LIMIT 5;"
```

## 🔍 Troubleshooting

### Problem: Backend can't connect to database

**Solution:**
```bash
# Check PostgreSQL is running
pg_isready -U postgres

# Test connection
psql -U postgres -d keycloak_logs -c "SELECT 1;"

# Verify credentials in backend/.env
```

### Problem: Frontend shows CORS error

**Solution:**
```bash
# In backend/.env, verify:
FRONTEND_URL=http://localhost:3000

# Restart backend
cd backend && npm run dev
```

### Problem: Vector can't reach Express API

**Solution:**
```bash
# On server, test connectivity:
curl http://YOUR_PC_IP:3001/health

# Check firewall on your PC:
# Windows: Allow port 3001 in Windows Firewall
# Linux: sudo ufw allow 3001
```

### Problem: No logs appearing

**Check Vector logs:**
```bash
# On server
docker-compose logs vector | tail -100
```

**Common issues:**
- Wrong IP address in vector.toml
- Wrong authentication token
- Firewall blocking connection
- Backend not running

### Problem: Dashboard shows "Failed to refresh data"

**Check:**
1. Backend is running: `curl http://localhost:3001/health`
2. Database has data: `psql -U postgres -d keycloak_logs -c "SELECT COUNT(*) FROM auth_logs;"`
3. Browser console for errors (F12)

## 📈 Performance Optimization

### Database

```sql
-- Add more indexes for common queries
CREATE INDEX idx_auth_logs_timestamp_success ON auth_logs(timestamp DESC, success);

-- Enable autovacuum
ALTER TABLE auth_logs SET (autovacuum_enabled = true);
```

### Vector Batching

Adjust in `vector.toml`:
```toml
batch.max_events = 100      # Increase for higher throughput
batch.timeout_secs = 10     # Reduce for lower latency
```

### Backend Connection Pool

In `backend/config/database.js`:
```javascript
max: 20,  // Increase for more concurrent connections
```

## 🔒 Security Checklist

Before deploying to production:

- [ ] Change default PostgreSQL password
- [ ] Generate secure VECTOR_SECRET_TOKEN
- [ ] Enable HTTPS for Express API
- [ ] Implement Keycloak token validation in dashboard
- [ ] Configure firewall rules
- [ ] Enable database encryption at rest
- [ ] Setup database backups
- [ ] Configure log rotation
- [ ] Add rate limiting for all endpoints
- [ ] Enable request logging
- [ ] Setup error monitoring (Sentry)
- [ ] Configure alerts for security events

## 📚 Additional Resources

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Vector Documentation](https://vector.dev/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [PostgreSQL Manual](https://www.postgresql.org/docs/)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review server and application logs
3. Verify all configuration files
4. Test each component individually

## 🎯 Next Steps

Once the system is running:

1. **Add Alerting** - Integrate with Slack/Discord for security alerts
2. **Enhanced Analytics** - Add charts using Chart.js or Recharts
3. **Export Functionality** - CSV export, PDF reports
4. **Real-time Updates** - WebSocket connection for live streaming
5. **Advanced Filtering** - Full-text search, complex queries
6. **User Management** - Integrate with Keycloak for authentication

---

**Built with ❤️ for secure Keycloak monitoring**