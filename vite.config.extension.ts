import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// Chrome Extension build configuration
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'src/chromeExtention',
    emptyOutDir: false, // Don't delete manifest.json and icons
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  // Use relative paths for assets (required for Chrome extensions)
  base: './',
})
