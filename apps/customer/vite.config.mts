/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/customer',
  // Resolve workspace libs (@org/ui) to their TS source for HMR, no prebuild.
  resolve: {
    conditions: ['@org/source', 'module', 'browser', 'development', 'default'],
  },
  server: {
    port: 4201,
    host: 'localhost',
    // Proxy API calls to the NestJS server so the SPA avoids CORS in dev.
    proxy: {
      '/api': {
        target: process.env.API_PROXY_TARGET ?? 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4201,
    host: 'localhost',
  },
  plugins: [react()],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));
