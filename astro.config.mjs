import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [svelte(), tailwind()],
  site: 'https://unzipfilesonline.com',
  prefetch: true,
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    optimizeDeps: {
      include: ['@zip.js/zip.js', 'pdfjs-dist'],
    },
    worker: {
      format: 'es',
    },
  },
});