import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'ja', 'fr', 'de', 'pt', 'ko', 'it'],
    routing: {
      prefixDefaultLocale: false,
    }
  },
  integrations: [
    svelte(),
    tailwind(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          es: 'es',
          ja: 'ja',
          fr: 'fr',
          de: 'de',
          pt: 'pt',
          ko: 'ko',
          it: 'it',
        },
      },
      filter: (page) => !page.includes('/404') && !page.includes('/500'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      serialize(item) {
        const pathname = new URL(item.url).pathname;
        const normalized = pathname.replace(/^\/(?:es|ja|fr|de|pt|ko|it)(?=\/|$)/, '') || '/';

        if (normalized === '/' || normalized === '') {
          item.priority = 1.0;
          item.changefreq = 'daily';
        } else if (normalized.startsWith('/create')) {
          item.priority = 0.9;
          item.changefreq = 'weekly';
        } else if (normalized.startsWith('/docs')) {
          item.priority = 0.8;
          item.changefreq = 'weekly';
        } else if (/^\/(?:about|privacy|terms|contact)/.test(normalized)) {
          item.priority = 0.5;
          item.changefreq = 'monthly';
        }

        if (item.links && item.links.length > 0) {
          const enLink = item.links.find((l) => l.lang === 'en');
          const hasXDefault = item.links.some((l) => l.lang === 'x-default');
          if (enLink && !hasXDefault) {
            item.links.push({
              url: enLink.url,
              lang: 'x-default',
            });
          }
        }

        return item;
      },
    }),
  ],
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
  devToolbar: {
    enabled: false,
  },
});