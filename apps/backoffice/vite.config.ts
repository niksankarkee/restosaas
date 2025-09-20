import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@restosaas/types': path.resolve(__dirname, '../../packages/types/src'),
      '@restosaas/api-client': path.resolve(
        __dirname,
        '../../packages/api-client/src'
      ),
      '@restosaas/ui': path.resolve(__dirname, '../../packages/ui/src'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
