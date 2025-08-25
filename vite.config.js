// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // We need to import Node's path module

export default defineConfig({
  plugins: [react()],
  // --- THIS IS THE NEW SECTION ---
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})