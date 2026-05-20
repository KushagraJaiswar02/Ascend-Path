import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        /**
         * Manual chunk strategy:
         * – vendor-react    → react + react-dom (shared by every chunk, cached longest)
         * – vendor-query    → @tanstack/react-query
         * – vendor-router   → react-router-dom
         * – vendor-ui       → radix-ui + lucide-react + shadcn utilities
         * – Every page module becomes its own async chunk automatically via React.lazy
         *
         * This prevents the main entry bundle from exploding when users visit
         * the landing/login pages (which don't need query/router/ui at load time).
         */
        manualChunks(id) {
          // Core React runtime — must be its own chunk so every lazy chunk can share it
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          // TanStack Query
          if (id.includes('node_modules/@tanstack/')) {
            return 'vendor-query';
          }
          // Router
          if (id.includes('node_modules/react-router') || id.includes('node_modules/@remix-run/')) {
            return 'vendor-router';
          }
          // UI primitives: radix, lucide, shadcn helpers
          if (
            id.includes('node_modules/radix-ui/') ||
            id.includes('node_modules/lucide-react/') ||
            id.includes('node_modules/class-variance-authority/') ||
            id.includes('node_modules/clsx/') ||
            id.includes('node_modules/tailwind-merge/')
          ) {
            return 'vendor-ui';
          }
          // Zustand store — small but shared
          if (id.includes('node_modules/zustand/')) {
            return 'vendor-store';
          }
        },
      },
    },
    // Raise the warning threshold slightly — we split manually so chunks stay lean
    chunkSizeWarningLimit: 500,
  },
})
