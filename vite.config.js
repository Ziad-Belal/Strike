// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'url'; // Import the modern URL helpers

export default defineConfig({
  plugins: [react()],
  // --- THIS IS THE FINAL, CORRECTED ALIAS SECTION ---
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})