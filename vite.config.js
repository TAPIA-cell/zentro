import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Aumenta el límite de aviso a 1000 kbs (o lo que necesites)
    chunkSizeWarningLimit: 1000, 
  },
})
