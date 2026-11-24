import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendTarget = process.env.VITE_PROXY_TARGET || 'http://localhost:8080';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: false,
      },
      '/oauth2': {
        target: backendTarget,
        changeOrigin: false,
      },
      '/login/oauth2': {
        target: backendTarget,
        changeOrigin: false,
      },
    },
  },
  preview: {
    host: true,
    port: 5173,
    allowedHosts: true,
  },
});
