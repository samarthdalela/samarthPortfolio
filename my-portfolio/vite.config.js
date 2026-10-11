import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    host:"0.0.0.0",
    port:3000,
  },
  build: {
    rollupOptions: {
      // Pages: the portfolio, the free tools hub and the QR code generator.
      input: {
        main: 'index.html',
        services: 'services/index.html',
        qr: 'qr-code-generator/index.html',
      },
    },
  },
})
