<template>
  <div>
    <!-- Filters -->
    <div class="flex flex-wrap gap-4 mb-4">
      <select 
        v-model="localFilters.event_type" 
        @change="$emit('filter-change', localFilters)"
        class="px-4 py-2 bg-gray-700 text-white border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <option value="">All Events</option>
        <option value="LOGIN">Login</option>
        <option value="LOGOUT">Logout</option>
        <option value="TOKEN_REFRESH">Token Refresh</option>
        <option value="REGISTER">Register</option>
      </select>
      
      <select 
        v-model="localFilters.success" 
        @change="$emit('filter-change', localFilters)"
        class="px-4 py-2 bg-gray-700 text-white border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <option value="">All Status</option>
        <option value="true">Success</option>
        <option value="false">Failed</option>
      </select>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-purple-500/30">
            <th class="text-left py-3 px-4 text-purple-300 font-medium">Time</th>
            <th class="text-left py-3 px-4 text-purple-300 font-medium">Event</th>
            <th class="text-left py-3 px-4 text-purple-300 font-medium">User</th>
            <th class="text-left py-3 px-4 text-purple-300 font-medium">Realm</th>
            <th class="text-left py-3 px-4 text-purple-300 font-medium">IP Address</th>
            <th class="text-left py-3 px-4 text-purple-300 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="log in logs" 
            :key="log.id"
            class="border-b border-purple-500/10 hover:bg-gray-700/30 transition-colors"
          >
            <td class="py-3 px-4 text-gray-300 text-sm whitespace-nowrap">
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
              <span v-if="log.success" class="badge badge-success">
                ✓ Success
              </span>
              <span v-else class="badge badge-error">
                ✗ Failed
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="logs.length === 0" class="text-center py-12 text-purple-300">
        <div class="text-4xl mb-2">📭</div>
        <div>No logs found for the selected filters</div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex justify-between items-center mt-6">
      <button
        @click="$emit('previous-page')"
        :disabled="currentPage === 1"
        class="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ← Previous
      </button>
      <span class="text-purple-300">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
      <button
        @click="$emit('next-page')"
        :disabled="currentPage >= totalPages"
        class="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  logs: {
    type: Array,
    default: () => []
  },
  filters: {
    type: Object,
    default: () => ({})
  },
  currentPage: {
    type: Number,
    default: 1
  },
  totalPages: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['filter-change', 'previous-page', 'next-page'])

const localFilters = ref({
  event_type: props.filters.event_type || '',
  success: props.filters.success || ''
})

watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp)
  return date.toLocaleString()
}

const getEventBadgeClass = (eventType) => {
  const classes = {
    LOGIN: 'badge badge-info',
    LOGOUT: 'px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs',
    TOKEN_REFRESH: 'px-2 py-1 bg-purple-900/50 text-purple-300 rounded text-xs',
    REGISTER: 'badge badge-success'
  }
  return classes[eventType] || 'px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs'
}
</script>