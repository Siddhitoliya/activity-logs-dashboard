export default defineNuxtConfig({
  devtools: { enabled: true },
  
  modules: ['@nuxtjs/tailwindcss'],
  
  ssr: false,
  
  compatibilityDate: '2025-11-12',
  
  app: {
    head: {
      title: 'Keycloak Activity Monitor',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Real-time Keycloak authentication and admin logs dashboard' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:3001/api/logs'
    }
  },
  
  css: ['~/assets/css/tailwind.css'],
  
  components: true,
  
  devServer: {
    port: 3000
  },
  
  nitro: {
    preset: 'node-server'
  },
  
  typescript: {
    strict: false,
    shim: false
  }
})