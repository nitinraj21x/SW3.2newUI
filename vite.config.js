import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    // Increase the warning threshold — pdfjs chunks are legitimately large
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // ── Vendor chunks ──────────────────────────────────────────────────
          // React core — loaded on every page
          if (id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/scheduler')) {
            return 'vendor-react';
          }
          // Router
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router';
          }
          // Zustand state
          if (id.includes('node_modules/zustand')) {
            return 'vendor-zustand';
          }
          // lucide icons — large, used by both public site and portal
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          // pdfjs — huge, only used in resume parsing
          if (id.includes('pdfjs-dist')) {
            return 'vendor-pdfjs';
          }
          // qrcode — only used during TOTP setup
          if (id.includes('node_modules/qrcode')) {
            return 'vendor-qrcode';
          }
          // date-fns
          if (id.includes('node_modules/date-fns')) {
            return 'vendor-datefns';
          }
          // ── App chunks ─────────────────────────────────────────────────────
          // Public site — only loaded at /
          if (id.includes('/src/public-site/')) {
            return 'app-public';
          }
          // Portal layout (sidebar, header) — loaded once after login
          if (id.includes('/portal/components/layout/') ||
              id.includes('/portal/store/')) {
            return 'app-portal-core';
          }
          // Portal tabs — each tab is its own chunk (lazy-loaded)
          // Vite handles these via dynamic import(); no manual split needed
        },
      },
    },
  },
});
