import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/ResolveIQ_Web/',
  server: {
    proxy: {
      '/api': {
        target: 'http://180.235.121.253:8070',
        changeOrigin: true,
      },
    },
  },
})
