import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { isLowValueServer } from './index-quality.mjs';

export function resolveSiteUrl(value) {
  if (!value) return undefined;
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.port || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('SITE_URL must be an HTTPS origin with no credentials, port, subpath, query, or fragment.');
  }
  return url.origin;
}

export function sitemapContent() {
  const pages = new Map();
  const staticRoutes = { home: '/', guides: '/guides/', about: '/about/', '404': '/404.html' };
  for (const section of ['pages', 'servers', 'guides']) {
    const directory = path.resolve('data', section);
    for (const filename of readdirSync(directory).filter(file => file.endsWith('.md'))) {
      const { data } = matter(readFileSync(path.join(directory, filename), 'utf8'));
      const slug = filename.slice(0, -3);
      const route = section === 'pages' ? staticRoutes[slug] : `/${section}/${slug}/`;
      if (!route || route === '/404.html') continue;
      const date = data.updated || (section === 'guides' ? data.date : undefined);
      pages.set(route, { noindex: data.seo?.noindex === true || (section === 'servers' && isLowValueServer(data, matter(readFileSync(path.join(directory, filename), 'utf8')).content)), lastmod: date ? new Date(date) : undefined });
    }
  }
  // Landing pages are generated from the server catalog, so include their
  // stable URLs in the sitemap even though they do not have Markdown files.
  const categories = new Set();
  const serverDirectory = path.resolve('data', 'servers');
  for (const filename of readdirSync(serverDirectory).filter(file => file.endsWith('.md'))) {
    const { data } = matter(readFileSync(path.join(serverDirectory, filename), 'utf8'));
    if (typeof data.category === 'string') categories.add(data.category);
  }
  for (const category of categories) {
    const slug = category.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    pages.set(`/categories/${slug}/`, {});
  }
  pages.set('/categories/', {});
  for (const slug of ['claude-code', 'codex', 'cursor', 'vs-code']) pages.set(`/clients/${slug}/`, {});
  const pageCount = Math.ceil(readdirSync(serverDirectory).filter(file => file.endsWith('.md')).length / 24);
  for (let page = 2; page <= pageCount; page++) pages.set(`/servers/page/${page}/`, {});
  return pages;
}
