import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { loadEnv } from 'vite';
import { resolveSiteUrl, sitemapContent } from './src/lib/site.mjs';

const environment = loadEnv(process.env.NODE_ENV || 'production', process.cwd(), '');
if (environment.README_OFFLINE && !process.env.README_OFFLINE) process.env.README_OFFLINE = environment.README_OFFLINE;
for (const key of ['GITHUB_TOKEN', 'GITHUB_OFFLINE']) {
  if (environment[key] && !process.env[key]) process.env[key] = environment[key];
}
const site = resolveSiteUrl(process.env.SITE_URL || environment.SITE_URL || 'https://mcpsift.com');
const sitemapPages = sitemapContent();

const developmentSearch = {
  name: 'mcp-sift-development-search',
  configureServer(server) {
    server.watcher.add(path.resolve('data'));
    server.watcher.on('all', (_event, filename) => {
      if (filename.startsWith(path.resolve('data'))) server.ws.send({ type: 'full-reload' });
    });
    server.middlewares.use('/pagefind', async (request, response, next) => {
      const pathname = (request.url || '').split('?')[0];
      if (!/^\/[a-zA-Z0-9_./-]+$/.test(pathname) || pathname.includes('..')) return next();
      try {
        const file = await readFile(path.join(process.cwd(), 'dist/pagefind', pathname));
        const extension = path.extname(pathname);
        response.setHeader('Content-Type', extension === '.js' ? 'text/javascript' : extension === '.wasm' ? 'application/wasm' : extension === '.json' ? 'application/json' : 'application/octet-stream');
        response.end(file);
      } catch { next(); }
    });
    server.middlewares.use(async (request, response, next) => {
      const pathname = (request.url || '').split('?')[0];
      if (!/^\/sitemap(?:-index|-\d+)?\.xml$/.test(pathname)) return next();
      try {
        const file = await readFile(path.join(process.cwd(), 'dist', pathname));
        response.setHeader('Content-Type', 'application/xml; charset=utf-8');
        response.end(file);
      } catch { next(); }
    });
  },
};

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  redirects: {
    '/servers/fetch/': '/servers/fetch-mcp/',
    '/servers/filesystem/': '/servers/filesystem-mcp/',
    '/servers/github/': '/servers/github-mcp/',
    '/servers/heroui/': '/servers/heroui-mcp/',
    '/servers/memory/': '/servers/memory-mcp/',
    '/servers/penpot/': '/servers/penpot-mcp/',
  },
  integrations: [
    react(),
    partytown({ config: { debug: false, forward: [] } }),
    ...(site ? [sitemap({
      filter: page => {
        const metadata = sitemapPages.get(new URL(page).pathname);
        return Boolean(metadata && !metadata.noindex);
      },
      serialize: item => {
        const lastmod = sitemapPages.get(new URL(item.url).pathname)?.lastmod;
        return { ...item, ...(lastmod ? { lastmod } : {}) };
      },
    })] : []),
  ],
  vite: { plugins: [tailwindcss(), developmentSearch] },
});
