import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, 
    proxy: {
      // Proxiera alla API-förfrågningar till backend
      '/api': {
        target: 'http://localhost:1337', // Backend-servern
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), 
      }
    }
  },
})
