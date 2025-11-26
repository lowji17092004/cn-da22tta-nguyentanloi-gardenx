import { defineConfig } from 'vite'

// Vite config: fixed dev port and strictPort=true prevents auto-choosing another port
export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
    // set host if you need network access (uncomment)
    // host: true
  }
})
