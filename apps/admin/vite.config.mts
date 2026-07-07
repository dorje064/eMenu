/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'node:path';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/admin',
  // Resolve the @org/ui workspace lib straight to its TS source (matches the
  // `@org/source` export condition) so it works without a node_modules link.
  resolve: {
    alias: {
      '@org/ui': resolve(import.meta.dirname, '../../libs/ui/src/index.ts'),
    },
    conditions: ['@org/source', 'module', 'browser', 'development', 'default'],
  },
  server: {
    port: 4200,
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
    port: 4200,
    host: 'localhost',
  },
  plugins: [
    react(),
    VitePWA({
      // Ship updates transparently — the admin runs long-lived on staff devices
      // watching the order stream, so we don't want a stale cached shell.
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // Generate icons/favicons/apple-touch from the brand logo at build time.
      pwaAssets: {
        image: 'public/logo.svg',
        preset: 'minimal-2023',
      },
      manifest: {
        name: 'eMenu',
        short_name: 'eMenu',
        description: 'Manage menus, tables and live orders for eMenu.',
        theme_color: '#ea580c',
        background_color: '#f9fafb',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
      },
      workbox: {
        // Precache the built SPA shell + assets, and fall back to index.html
        // for client-side routes so deep links work offline.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/index.html',
        // Never let the SW intercept the API proxy — always hit the network.
        navigateFallbackDenylist: [/^\/api/],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
      devOptions: {
        // Keep the SW off during `nx dev` to avoid caching surprises while
        // iterating; it activates in preview/production builds.
        enabled: false,
      },
    }),
  ],
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
