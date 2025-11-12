<template>
  <div v-if="alerts.length > 0" class="mb-8">
    <div class="bg-red-900/30 backdrop-blur-lg border border-red-500/50 rounded-xl p-6">
      <h2 class="text-xl font-bold text-white mb-4 flex items-center">
        <span class="text-2xl mr-2 animate-pulse">🚨</span>
        Security Alerts
        <span class="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded-full">
          {{ alerts.length }}
        </span>
      </h2>
      <div class="space-y-3">
        <div 
          v-for="(alert, index) in alerts" 
          :key="index"
          class="p-4 bg-red-900/50 border border-red-500/30 rounded-lg hover:bg-red-900/70 transition-all"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="font-semibold text-red-200 flex items-center mb-2">
                <span class="mr-2">⚠️</span>
                Multiple Failed Login Attempts
              </div>
              <div class="space-y-1 text-sm">
                <div class="text-red-300">
                  <span class="font-medium">User:</span> 
                  <span class="font-mono ml-1">{{ alert.username }}</span>
                </div>
                <div class="text-red-300">
                  <span class="font-medium">Failed Attempts:</span> 
                  <span class="font-bold text-red-200 ml-1">{{ alert.failed_attempts }}</span>
                </div>
                <div class="text-red-300">
                  <span class="font-medium">Source IPs:</span>
                  <div class="font-mono text-xs mt-1 flex flex-wrap gap-2">
                    <span 
                      v-for="ip in alert.ip_addresses" 
                      :key="ip"
                      class="px-2 py-1 bg-red-800/50 rounded"
                    >
                      {{ ip }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="text-red-400 text-xs whitespace-nowrap ml-4">
              {{ formatTimestamp(alert.last_attempt) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  alerts: {
    type: Array,
    default: () => []
  }
})

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp)
  return date.toLocaleString()
}
</script>