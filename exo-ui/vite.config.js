import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/NasaSpaceAppsChallenge/',
    build: {
    chunkSizeWarningLimit: 10000, // Increase limit to 1000 kB
  }
})
