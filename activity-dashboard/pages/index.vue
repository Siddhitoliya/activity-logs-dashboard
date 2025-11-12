<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
    <!-- Header -->
    <header class="bg-gray-900/50 backdrop-blur-lg border-b border-purple-500/30 sticky top-0 z-50">
      <div class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="text-3xl">🔐</div>
            <div>
              <h1 class="text-2xl font-bold text-white">Keycloak Activity Monitor</h1>
              <p class="text-purple-300 text-sm">Real-time Authentication & Admin Logs</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- Refresh Button -->
            <button 
              @click="refreshData" 
              :disabled="loading"
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all disabled:opacity-50"
            >
              <span v-if="loading">🔄 Loading...</span>
              <span v-else>🔄 Refresh</span>
            </button>
            
            <!-- Time Period Selector -->
            <select 
              v-model="selectedPeriod" 
              @change="refreshData"
              class="px-4 py-2 bg-gray-800 text-white border border-purple-500/30 rounded-lg"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>
    </header>

    <div class="container mx-auto px-6 py-8">
      <!-- Error Message -->
      <div v-if="error" class="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
        ❌ {{ error }}
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Logins -->
        <div class="bg-gray-800/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-purple-300 text-sm font-medium">Total Logins</span>
            <span class="text-2xl">👤</span>
          </div>
          <div class="text-3xl font-bold text-white">{{ stats.totalLogins || 0 }}</div>
          <div class="text-green-400 text-sm mt-2">
            ✅ {{ stats.successfulLogins || 0 }} successful
          </div>
        </div>

        <!-- Failed Attempts -->
        <div class="bg-gray-800/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-purple-300 text-sm font-medium">Failed Attempts</span>
            <span class="text-2xl">⚠️</span>
          </div>
          <div class="text-3xl font-bold text-white">{{ stats.failedLogins || 0 }}</div>
          <div class="text-red-400 text-sm mt-2">
            {{ failureRate }}% failure rate
          </div>
        </div>

        <!-- Unique Users -->
        <div class="bg-gray-800/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-purple-300 text-sm font-medium">Unique Users</span>
            <span class="text-2xl">👥</span>
          </div>
          <div class="text-3xl font-bold text-white">{{ stats.uniqueUsers || 0 }}</div>
          <div class="text-purple-400 text-sm mt-2">
            Active users
          </div>
        </div>

        <!-- Security Alerts -->
        <div class="bg-gray-800/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-purple-300 text-sm font-medium">Security Alerts</span>
            <span class="text-2xl">🚨</span>
          </div>
          <div class="text-3xl font-bold text-white">{{ securityAlerts.length }}</div>
          <div class="text-yellow-400 text-sm mt-2">
            Requires attention
          </div>
        </div>
      </div>

      <!-- Security Alerts Section -->
      <div v-if="securityAlerts.length > 0" class="mb-8">
        <div class="bg-red-900/30 backdrop-blur-lg border border-red-500/50 rounded-xl p-6">
          <h2 class="text-xl font-bold text-white mb-4 flex items-center">
            <span class="text-2xl mr-2">🚨</span>
            Security Alerts
          </h2>
          <div class="space-y-3">
            <div 
              v-for="(alert, index) in securityAlerts" 
              :key="index"
              class="p-4 bg-red-900/50 border border-red-500/30 rounded-lg"
            >
              <div class="flex items-start justify-between">
                <div>
                  <div class="font-semibold text-red-200">
                    Multiple Failed Login Attempts
                  </div>
                  <div class="text-red-300 text-sm mt-1">
                    User: <span class="font-mono">{{ alert.username }}</span>
                  </div>
                  <div class="text-red-300 text-sm">
                    Failed Attempts: <span class="font-bold">{{ alert.failed_attempts }}</span>
                  </div>
                  <div class="text-red-300 text-sm">
                    IPs: <span class="font-mono text-xs">{{ alert.ip_addresses?.join(', ') }}</span>
                  </div>
                </div>
                <div class="text-red-400 text-xs">
                  {{ formatTimestamp(alert.last_attempt) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-6">
        <div class="flex space-x-2 bg-gray-800/50 backdrop-blur-lg border border-purple-500/30 rounded-lg p-2">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'flex-1 px-6 py-3 rounded-lg font-medium transition-all',
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-purple-300 hover:bg-gray-700/50'
            ]"
          >
            {{ tab.icon }} {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="bg-gray-800/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6">
        <!-- Authentication Logs Tab -->
        <div v-show="activeTab === 'auth'">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-white">Authentication Logs</h2>
            <div class="text-purple-300 text-sm">
              Showing {{ authLogs.length }} of {{ authLogsTotal }} logs
            </div>
          </div>
          
          <!-- Filters -->
          <div class="flex gap-4 mb-4">
            <select 
              v-model="authFilter.event_type" 
              @change="loadAuthLogs"
              class="px-4 py-2 bg-gray-700 text-white border border-purple-500/30 rounded-lg"
            >
              <option value="">All Events</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="TOKEN_REFRESH">Token Refresh</option>
              <option value="REGISTER">Register</option>
            </select>
            
            <select 
              v-model="authFilter.success" 
              @change="loadAuthLogs"
              class="px-4 py-2 bg-gray-700 text-white border border-purple-500/30 rounded-lg"
            >
              <option value="">All Status</option>
              <option value="true">Success</option>
              <option value="false">Failed</option>
            </select>
          </div>

          <!-- Logs Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-purple-500/30">
                  <th class="text-left py-3 px-4 text-purple-300 font-medium">Time</th>
                  <th class="text-left py-3 px-4 text-purple-300 font-medium">Event</th>
                  <th class="text-left py-3 px-4 text-purple-300 font-medium">User</th>
                  <th class="text-left py-3 px-4 text-purple-300 font-medium">Realm</th>
                  <th class="text-left py-3 px-4 text-purple-300 font-medium">IP</th>
                  <th class="text-left py-3 px-4 text-purple-300 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="log in authLogs" 
                  :key="log.id"
                  class="border-b border-purple-500/10 hover:bg-gray-700/30"
                >
                  <td class="py-3 px-4 text-gray-300 text-sm">
                    {{ formatTimestamp(log.timestamp) }}
                  </td>
                  <td class="py-3 px-4">
                    <span :class="getEventBadgeClass(log.event_type)">
                      {{ log.event_type }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-gray-300">
                    <div class="text-sm">{{ log.username || 'N/A' }}</div>
                    <div class="text-xs text-purple-400">{{ log.email || '' }}</div>
                  </td>
                  <td class="py-3 px-4 text-gray-300 text-sm">
                    {{ log.realm || 'N/A' }}
                  </td>
                  <td class="py-3 px-4 text-gray-300 font-mono text-sm">
                    {{ log.ip_address || 'N/A' }}
                  </td>
                  <td class="py-3 px-4">
                    <span v-if="log.success" class="px-2 py-1 bg-green-900/50 text-green-300 rounded text-xs">
                      ✓ Success
                    </span>
                    <span v-else class="px-2 py-1 bg-red-900/50 text-red-300 rounded text-xs">
                      ✗ Failed
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div v-if="authLogs.length === 0" class="text-center py-8 text-purple-300">
              No logs found for the selected filters
            </div>
          </div>

          <!-- Pagination -->
          <div class="flex justify-between items-center mt-6">
            <button
              @click="loadPreviousPage('auth')"
              :disabled="authFilter.offset === 0"
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
            >
              ← Previous
            </button>
            <span class="text-purple-300">
              Page {{ Math.floor(authFilter.offset / authFilter.limit) + 1 }}
            </span>
            <button
              @click="loadNextPage('auth')"
              :disabled="authLogs.length < authFilter.limit"
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </div>

        <!-- Admin Logs Tab -->
        <div v-show="activeTab === 'admin'">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-white">Admin Activity Logs</h2>
            <div class="text-purple-300 text-sm">
              Showing {{ adminLogs.length }} logs
            </div>
          </div>

          <!-- Admin Logs Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-purple-500/30">
                  <th class="text-left py-3 px-4 text-purple-300 font-medium">Time</th>
                  <th class="text-left py-3 px-4 text-purple-300 font-medium">Operation</th>
                  <th class="text-left py-3 px-4 text-purple-300 font-medium">Resource</th>
                  <th class="text-left py-3 px-4 text-purple-300 font-medium">Admin User</th>
                  <th class="text-left py-3 px-4 text-purple-300 font-medium">Realm</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="log in adminLogs" 
                  :key="log.id"
                  class="border-b border-purple-500/10 hover:bg-gray-700/30"
                >
                  <td class="py-3 px-4 text-gray-300 text-sm">
                    {{ formatTimestamp(log.timestamp) }}
                  </td>
                  <td class="py-3 px-4">
                    <span :class="getOperationBadgeClass(log.operation_type)">
                      {{ log.operation_type }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-gray-300 text-sm">
                    {{ log.resource_type || 'N/A' }}
                  </td>
                  <td class="py-3 px-4 text-gray-300">
                    {{ log.admin_username || 'N/A' }}
                  </td>
                  <td class="py-3 px-4 text-gray-300 text-sm">
                    {{ log.realm || 'N/A' }}
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div v-if="adminLogs.length === 0" class="text-center py-8 text-purple-300">
              No admin logs found
            </div>
          </div>
        </div>

        <!-- Analytics Tab -->
        <div v-show="activeTab === 'analytics'">
          <h2 class="text-xl font-bold text-white mb-6">Analytics & Insights</h2>
          
          <!-- Realm Statistics -->
          <div class="mb-8">
            <h3 class="text-lg font-semibold text-purple-300 mb-4">Realm Statistics</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div 
                v-for="realm in realmStats" 
                :key="realm.realm"
                class="p-4 bg-gray-700/50 rounded-lg border border-purple-500/30"
              >
                <div class="font-semibold text-white mb-2">{{ realm.realm }}</div>
                <div class="text-sm text-gray-300">
                  <div>Total Events: <span class="text-purple-300">{{ realm.total_events }}</span></div>
                  <div>Successful: <span class="text-green-400">{{ realm.successful_logins }}</span></div>
                  <div>Failed: <span class="text-red-400">{{ realm.failed_logins }}</span></div>
                  <div>Unique Users: <span class="text-blue-400">{{ realm.unique_users }}</span></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Top Users -->
          <div>
            <h3 class="text-lg font-semibold text-purple-300 mb-4">Top Active Users</h3>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-purple-500/30">
                    <th class="text-left py-3 px-4 text-purple-300 font-medium">Username</th>
                    <th class="text-left py-3 px-4 text-purple-300 font-medium">Email</th>
                    <th class="text-left py-3 px-4 text-purple-300 font-medium">Login Count</th>
                    <th class="text-left py-3 px-4 text-purple-300 font-medium">Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="user in topUsers" 
                    :key="user.username"
                    class="border-b border-purple-500/10"
                  >
                    <td class="py-3 px-4 text-gray-300">{{ user.username }}</td>
                    <td class="py-3 px-4 text-gray-300 text-sm">{{ user.email || 'N/A' }}</td>
                    <td class="py-3 px-4 text-purple-300 font-semibold">{{ user.login_count }}</td>
                    <td class="py-3 px-4 text-gray-300 text-sm">{{ formatTimestamp(user.last_login) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const API_BASE_URL = 'http://localhost:3001/api/logs'

// State
const loading = ref(false)
const error = ref(null)
const activeTab = ref('auth')
const selectedPeriod = ref('24h')

// Stats
const stats = ref({
  totalLogins: 0,
  successfulLogins: 0,
  failedLogins: 0,
  uniqueUsers: 0
})

// Logs
const authLogs = ref([])
const authLogsTotal = ref(0)
const adminLogs = ref([])
const realmStats = ref([])
const topUsers = ref([])
const securityAlerts = ref([])

// Filters
const authFilter = ref({
  limit: 50,
  offset: 0,
  event_type: '',
  success: ''
})

// Tabs configuration
const tabs = [
  { id: 'auth', label: 'Authentication', icon: '🔐' },
  { id: 'admin', label: 'Admin Activity', icon: '👑' },
  { id: 'analytics', label: 'Analytics', icon: '📊' }
]

// Computed
const failureRate = computed(() => {
  if (stats.value.totalLogins === 0) return 0
  return Math.round((stats.value.failedLogins / stats.value.totalLogins) * 100)
})

// Methods
async function fetchData(endpoint, params = {}) {
  const queryString = new URLSearchParams(params).toString()
  const url = `${API_BASE_URL}${endpoint}${queryString ? '?' + queryString : ''}`
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return await response.json()
}

async function loadAuthLogs() {
  try {
    const data = await fetchData('/auth', authFilter.value)
    authLogs.value = data.data || []
    authLogsTotal.value = data.total || 0
  } catch (err) {
    console.error('Error loading auth logs:', err)
    error.value = 'Failed to load authentication logs'
  }
}

async function loadAdminLogs() {
  try {
    const data = await fetchData('/admin', { limit: 100 })
    adminLogs.value = data.data || []
  } catch (err) {
    console.error('Error loading admin logs:', err)
  }
}

async function loadStats() {
  try {
    const data = await fetchData('/stats/login', { period: selectedPeriod.value })
    
    let totalLogins = 0
    let successfulLogins = 0
    let failedLogins = 0
    
    data.data?.forEach(stat => {
      if (stat.event_type === 'LOGIN') {
        if (stat.success) successfulLogins += parseInt(stat.count)
        else failedLogins += parseInt(stat.count)
        totalLogins += parseInt(stat.count)
      }
    })
    
    stats.value = {
      totalLogins,
      successfulLogins,
      failedLogins,
      uniqueUsers: stats.value.uniqueUsers
    }
  } catch (err) {
    console.error('Error loading stats:', err)
  }
}

async function loadRealmStats() {
  try {
    const data = await fetchData('/stats/realms')
    realmStats.value = data.data || []
    
    // Calculate unique users from realm stats
    const uniqueUsers = realmStats.value.reduce((sum, realm) => sum + parseInt(realm.unique_users || 0), 0)
    stats.value.uniqueUsers = uniqueUsers
  } catch (err) {
    console.error('Error loading realm stats:', err)
  }
}

async function loadTopUsers() {
  try {
    const data = await fetchData('/stats/users/top', { limit: 10 })
    topUsers.value = data.data || []
  } catch (err) {
    console.error('Error loading top users:', err)
  }
}

async function loadSecurityAlerts() {
  try {
    const data = await fetchData('/security/alerts')
    securityAlerts.value = data.alerts || []
  } catch (err) {
    console.error('Error loading security alerts:', err)
  }
}

async function refreshData() {
  loading.value = true
  error.value = null
  
  try {
    await Promise.all([
      loadAuthLogs(),
      loadAdminLogs(),
      loadStats(),
      loadRealmStats(),
      loadTopUsers(),
      loadSecurityAlerts()
    ])
  } catch (err) {
    error.value = 'Failed to refresh data. Please check your connection.'
  } finally {
    loading.value = false
  }
}

function loadNextPage(type) {
  if (type === 'auth') {
    authFilter.value.offset += authFilter.value.limit
    loadAuthLogs()
  }
}

function loadPreviousPage(type) {
  if (type === 'auth') {
    authFilter.value.offset = Math.max(0, authFilter.value.offset - authFilter.value.limit)
    loadAuthLogs()
  }
}

function formatTimestamp(timestamp) {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp)
  return date.toLocaleString()
}

function getEventBadgeClass(eventType) {
  const classes = {
    LOGIN: 'px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-xs',
    LOGOUT: 'px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs',
    TOKEN_REFRESH: 'px-2 py-1 bg-purple-900/50 text-purple-300 rounded text-xs',
    REGISTER: 'px-2 py-1 bg-green-900/50 text-green-300 rounded text-xs'
  }
  return classes[eventType] || 'px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs'
}

function getOperationBadgeClass(operation) {
  const classes = {
    CREATE: 'px-2 py-1 bg-green-900/50 text-green-300 rounded text-xs',
    UPDATE: 'px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-xs',
    DELETE: 'px-2 py-1 bg-red-900/50 text-red-300 rounded text-xs'
  }
  return classes[operation] || 'px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs'
}

// Lifecycle
onMounted(() => {
  refreshData()
  
  // Auto-refresh every 30 seconds
  setInterval(refreshData, 30000)
})
</script>