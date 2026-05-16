import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.DOCKER ? 'http://backend:5000' : 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
