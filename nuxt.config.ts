// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL,
      assetBaseUrl: process.env.NUXT_PUBLIC_ASSET_BASE_URL,
    },
  },

  compatibilityDate: "2025-07-15",
  css: ["~/assets/css/main.css", 'leaflet/dist/leaflet.css'],
  devtools: { enabled: true },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  modules: ["@nuxtjs/tailwindcss"],
  vite: {
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    }
  }
});
