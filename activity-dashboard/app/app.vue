<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup>
// Global app configuration
useHead({
  titleTemplate: '%s - Keycloak Monitor',
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { 
      name: 'description', 
      content: 'Real-time Keycloak authentication and admin logs monitoring dashboard' 
    }
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})
</script>
