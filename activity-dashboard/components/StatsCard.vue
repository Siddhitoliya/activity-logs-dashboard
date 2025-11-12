<template>
  <div class="card hover:border-purple-400/50 transition-all duration-300">
    <div class="flex items-center justify-between mb-2">
      <span class="text-purple-300 text-sm font-medium">{{ title }}</span>
      <span class="text-2xl">{{ emoji }}</span>
    </div>
    <div class="text-3xl font-bold text-white mb-2">
      {{ formatNumber(value) }}
    </div>
    <div :class="subtextClass" class="text-sm">
      {{ subtext }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    default: 0
  },
  emoji: {
    type: String,
    default: '📊'
  },
  subtext: {
    type: String,
    default: ''
  },
  subtextClass: {
    type: String,
    default: 'text-purple-400'
  }
})

const formatNumber = (num) => {
  if (typeof num !== 'number') return num
  return num.toLocaleString()
}
</script>