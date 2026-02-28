// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'server', // SSR mode for API routes and dynamic pages
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  integrations: [react(), icon()],

  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            // React core - cached independently
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'react-vendor';
            }
            // Radix UI components
            if (id.includes('node_modules/@radix-ui/')) {
              return 'radix-ui';
            }
            // Zod validation
            if (id.includes('node_modules/zod')) {
              return 'zod';
            }
            // Better Auth
            if (id.includes('node_modules/better-auth')) {
              return 'better-auth';
            }
            // Tiptap editor (admin only)
            if (id.includes('node_modules/@tiptap/') || id.includes('node_modules/prosemirror')) {
              return 'tiptap';
            }
            // date-fns (admin only)
            if (id.includes('node_modules/date-fns')) {
              return 'date-fns';
            }
          },
        },
      },
    },
    server: {
      watch: {
        ignored: ['**/.wrangler/**'],
      },
      allowedHosts: ['.loca.lt'],
    },
  }
});