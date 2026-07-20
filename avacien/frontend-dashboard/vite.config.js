import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dashboard Manajer Avacien — port 5174 (cocok dengan CORS backend)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true,
  },
})
