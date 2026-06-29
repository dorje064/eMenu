/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/customer',
  // Resolve the @org/ui workspace lib straight to its TS source (matches the
  // `@org/source` export condition) so it works without a node_modules link.
  resolve: {
    alias: {
      '@org/ui': resolve(import.meta.dirname, '../../libs/ui/src/index.ts'),
    },
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
