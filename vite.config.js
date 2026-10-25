import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(function () {
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: 'all',
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api': {
          target: process.env.VITE_BACKEND_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: process.env.VITE_BACKEND_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});

