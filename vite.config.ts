process.env.ROLLUP_DISABLE_NATIVE = process.env.ROLLUP_DISABLE_NATIVE || '1';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three']
        }
      },
      external: []
    }
  },
  optimizeDeps: {
    include: ['three']
  },
  server: {
    host: '::',
    port: 8080,
  },
});
