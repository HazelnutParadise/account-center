// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@sidebase/nuxt-auth'],
  auth: {
    globalAppMiddleware: {
      isEnabled: true,
    },
    provider: {
      type: 'authjs',
    },
  },
})
