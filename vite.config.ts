import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, 
    proxy: {
      // Proxiera alla API-förfrågningar till backend
      '/api': {
        target: 'http://localhost:3000', // Backend-servern
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Ändra path så att /api blir roten
      }
    }
  },
})
