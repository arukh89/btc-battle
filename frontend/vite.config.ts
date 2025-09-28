import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '.',              // pastikan root project benar
  build: {
    outDir: 'dist',       // hasil build ke dist
    emptyOutDir: true
  }
})
