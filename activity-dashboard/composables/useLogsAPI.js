export const useLogsAPI = () => {
  const config = useRuntimeConfig()
  const API_BASE_URL = config.public.apiBase

  // Generic fetch wrapper with error handling
  const fetchData = async (endpoint, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = `${API_BASE_URL}${endpoint}${queryString ? '?' + queryString : ''}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error)
      throw error
    }
  }

  // Authentication logs
  const getAuthLogs = async (params = {}) => {
    return await fetchData('/auth', params)
  }

  // Admin logs
  const getAdminLogs = async (params = {}) => {
    return await fetchData('/admin', params)
  }

  // Login statistics
  const getLoginStats = async (period = '24h') => {
    return await fetchData('/stats/login', { period })
  }

  // Realm statistics
  const getRealmStats = async () => {
    return await fetchData('/stats/realms')
  }

  // Time series data
  const getTimeSeriesData = async (period = '24h', interval = '1h') => {
    return await fetchData('/stats/timeseries', { period, interval })
  }

  // Top active users
  const getTopUsers = async (limit = 10) => {
    return await fetchData('/stats/users/top', { limit })
  }

  // Security alerts
  const getSecurityAlerts = async () => {
    return await fetchData('/security/alerts')
  }

  // Check API health
  const checkHealth = async () => {
    try {
      const response = await fetch(API_BASE_URL.replace('/api/logs', '/health'))
      return await response.json()
    } catch (error) {
      console.error('Health check failed:', error)
      return { status: 'unhealthy', error: error.message }
    }
  }

  return {
    getAuthLogs,
    getAdminLogs,
    getLoginStats,
    getRealmStats,
    getTimeSeriesData,
    getTopUsers,
    getSecurityAlerts,
    checkHealth
  }
}