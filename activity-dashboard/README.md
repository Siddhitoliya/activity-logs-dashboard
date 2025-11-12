# Keycloak Dashboard

Real-time monitoring dashboard for Keycloak authentication and admin logs.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment variables (optional)
cp .env.example .env

# Start development server
npm run dev

# Open browser
# http://localhost:3000
```

## 🏗️ Build Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Generate static site
npm run generate
```

## 🎨 Features

### Real-time Monitoring
- Auto-refreshes every 30 seconds
- Manual refresh button
- Live statistics updates

### Authentication Logs
- View all login/logout events
- Filter by event type
- Filter by success/failure
- Pagination support

### Admin Activity
- Track admin operations
- View resource modifications
- Audit trail

### Analytics
- Login statistics
- Realm statistics
- Top active users
- Time-based analysis

### Security
- Failed login alerts
- Suspicious activity detection
- Multiple login attempts tracking

## 🔧 Configuration

### Environment Variables

Create `.env` file:

```env
API_BASE_URL=http://localhost:3001/api/logs
```

### API Integration

The dashboard uses the `useLogsAPI` composable for all API calls:

```javascript
const { getAuthLogs, getLoginStats } = useLogsAPI()

// Fetch logs
const logs = await getAuthLogs({ limit: 50, offset: 0 })

// Get statistics
const stats = await getLoginStats('24h')
```

## 🎨 Customization

### Colors

Edit `tailwind.config.js` to customize the color scheme:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#8b5cf6',  // Change primary color
        // ...
      }
    }
  }
}
```

### Auto-refresh Interval

In `pages/index.vue`, change the interval:

```javascript
// Auto-refresh every 30 seconds
setInterval(refreshData, 30000)  // Change to desired interval in ms
```

### Pagination

Adjust default items per page:

```javascript
const authFilter = ref({
  limit: 50,  // Change to desired number
  offset: 0
})
```

## 📊 Components Usage

### StatsCard

```vue
<StatsCard
  title="Total Logins"
  :value="1234"
  emoji="👤"
  subtext="Last 24 hours"
  subtextClass="text-green-400"
/>
```

### LogsTable

```vue
<LogsTable
  :logs="authLogs"
  :filters="authFilter"
  :currentPage="1"
  :totalPages="10"
  @filter-change="handleFilterChange"
  @previous-page="loadPreviousPage"
  @next-page="loadNextPage"
/>
```

### SecurityAlerts

```vue
<SecurityAlerts :alerts="securityAlerts" />
```

## 🔍 Debugging

### Check API Connection

```javascript
// In browser console
fetch('http://localhost:3001/health')
  .then(r => r.json())
  .then(console.log)
```

### View Logs

Open browser DevTools (F12) → Console tab

### Network Requests

DevTools → Network tab → Filter by XHR

## 🚨 Common Issues

### CORS Error
- Verify backend FRONTEND_URL matches dashboard URL
- Check backend CORS configuration
- Ensure backend is running

### API Not Responding
```bash
# Check if backend is running
curl http://localhost:3001/health
```

### No Data Showing
- Check browser console for errors
- Verify database has data
- Test API endpoints directly

### Port Already in Use
```bash
# Change port in nuxt.config.ts
devServer: {
  port: 3001  // Change to available port
}
```

## 🎯 Performance Tips

### Optimize Bundle Size
```bash
# Analyze bundle
npm run build -- --analyze
```

### Lazy Load Components
```vue
<script setup>
const LogsTable = defineAsyncComponent(() => 
  import('~/components/LogsTable.vue')
)
</script>
```

### Image Optimization
Use Nuxt Image module for optimized images

## 📱 Responsive Design

The dashboard is fully responsive:
- Mobile: Single column layout
- Tablet: Two column layout
- Desktop: Four column layout

## 🔒 Security Considerations

### Production Checklist
- [ ] Change API base URL to production URL
- [ ] Enable HTTPS
- [ ] Implement authentication
- [ ] Add rate limiting
- [ ] Enable CSP headers
- [ ] Minimize bundle size
- [ ] Enable compression

### Authentication

To add Keycloak authentication:

1. Install `@nuxtjs/keycloak`
2. Configure in `nuxt.config.ts`
3. Add auth middleware
4. Protect routes

## 🚀 Deployment

### Vercel
```bash
npm run build
vercel deploy
```

### Netlify
```bash
npm run generate
netlify deploy --prod --dir=dist
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### PM2
```bash
npm run build
pm2 start npm --name "keycloak-dashboard" -- start
```

## 📄 License

MIT