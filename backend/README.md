# Keycloak Logs Backend API

Express.js REST API for receiving, storing, and serving Keycloak authentication and admin logs.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your actual values

# Create database (if not already done)
psql -U postgres -c "CREATE DATABASE keycloak_logs;"
psql -U postgres -d keycloak_logs -f ../database/schema.sql

# Start development server
npm run dev

# Start production server
npm start
```

## 📡 API Endpoints

### Health Check
- `GET /health` - Server health status

### Log Ingestion (Protected with VECTOR_SECRET_TOKEN)
- `POST /api/logs/ingest` - Receive logs from Vector

### Dashboard API
- `GET /api/logs/auth` - Get authentication logs
- `GET /api/logs/admin` - Get admin activity logs
- `GET /api/logs/stats/login` - Login statistics
- `GET /api/logs/stats/realms` - Realm statistics
- `GET /api/logs/stats/timeseries` - Time-series data
- `GET /api/logs/stats/users/top` - Top active users
- `GET /api/logs/security/alerts` - Security alerts

## 🔒 Authentication

### Vector Authentication
Requests to `/api/logs/ingest` must include:
```
Authorization: Bearer YOUR_VECTOR_SECRET_TOKEN
```

### Dashboard Authentication
Currently open for development. Implement Keycloak token validation in `middleware/auth.js` for production.

## 📊 Query Parameters

### Authentication Logs
```
GET /api/logs/auth?limit=50&offset=0&event_type=LOGIN&success=true&realm=my-realm
```

Parameters:
- `limit` - Number of records (default: 100)
- `offset` - Pagination offset (default: 0)
- `event_type` - Filter by LOGIN, LOGOUT, TOKEN_REFRESH, etc.
- `success` - Filter by success status (true/false)
- `realm` - Filter by Keycloak realm
- `start_date` - Start date (ISO format)
- `end_date` - End date (ISO format)

### Statistics
```
GET /api/logs/stats/login?period=24h
```

Periods: `1h`, `24h`, `7d`, `30d`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| DB_HOST | PostgreSQL host | localhost |
| DB_PORT | PostgreSQL port | 5432 |
| DB_NAME | Database name | keycloak_logs |
| DB_USER | Database user | postgres |
| DB_PASSWORD | Database password | - |
| VECTOR_SECRET_TOKEN | Vector authentication | - |
| FRONTEND_URL | CORS origin | http://localhost:3000 |

## 🗄️ Database Schema

### auth_logs
- id, timestamp, event_type, realm, client_id
- user_id, username, email, ip_address
- user_agent, session_id, error_message
- success, metadata, created_at

### admin_logs
- id, timestamp, operation_type, resource_type
- resource_path, admin_user_id, admin_username
- realm, representation, error_message, created_at

### performance_metrics
- id, timestamp, metric_type, value
- labels, created_at

## 📈 Performance

- Connection pooling (max 20 connections)
- Rate limiting (1000 requests/minute for ingestion)
- Request compression
- Response caching headers
- Database query optimization with indexes

## 🔍 Debugging

```bash
# View logs in development
npm run dev

# Test API endpoints
curl http://localhost:3001/health
curl http://localhost:3001/api/logs/auth?limit=5

# Check database connection
psql -U postgres -d keycloak_logs -c "SELECT COUNT(*) FROM auth_logs;"
```

## 🚨 Common Issues

### Database Connection Error
- Verify PostgreSQL is running
- Check credentials in .env
- Ensure database exists

### Port Already in Use
- Change PORT in .env
- Kill existing process: `lsof -ti:3001 | xargs kill`

### CORS Errors
- Verify FRONTEND_URL matches your Nuxt app
- Check browser console for specific errors

## 📝 Development

### Adding New Endpoints
1. Create controller function in `controllers/logsController.js`
2. Add route in `routes/logs.js`
3. Update this README

### Database Migrations
Currently manual. For production, consider using:
- Sequelize
- Knex.js
- TypeORM

## 🎯 Production Checklist

- [ ] Change VECTOR_SECRET_TOKEN to secure value
- [ ] Enable HTTPS
- [ ] Implement Keycloak token validation
- [ ] Setup database backups
- [ ] Configure log rotation
- [ ] Add monitoring (PM2, New Relic, etc.)
- [ ] Setup error tracking (Sentry)
- [ ] Enable request logging
- [ ] Configure rate limiting for all endpoints
- [ ] Review CORS settings

## 📄 License

MIT