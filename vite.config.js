import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/CubeViz-Modern/',
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    watch: {
      usePolling: true
    }
  }
})
