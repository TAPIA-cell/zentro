import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Aumenta el límite de aviso a 1000 kbs (o lo que necesites)
    chunkSizeWarningLimit: 3000, 
  },
<<<<<<< HEAD
})
=======
})
>>>>>>> 6897e291505809fcf51e2de7217485fab8f1ba8b
