import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const cacheDirectory = path.resolve('.cache/readmes');
const maxBytes = 2 * 1024 * 1024;
const pending = new Map();

// Simple semaphore to limit concurrent fetches
class Semaphore {
  constructor(max) {
    this.max = max;
    this.count = 0;
    this.queue = [];
  }
  async acquire() {
    if (this.count < this.max) {
      this.count++;
      return;
    }
    return new Promise(resolve => this.queue.push(resolve));
  }
  release() {
    if (this.queue.length > 0) {
      const resolve = this.queue.shift();
      resolve();
    } else {
      this.count--;
    }
  }
}
const fetchLimiter = new Semaphore(20);

export function rawReadmeUrl(input) {
  const url = new URL(input);
  if (url.protocol !== 'https:' || url.username || url.password || url.port) throw new Error('README URLs must use public HTTPS GitHub URLs.');
  if (url.hostname === 'raw.githubusercontent.com') return url.href;
  if (url.hostname === 'github.com') {
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length >= 5 && parts[2] === 'blob') {
      return `https://raw.githubusercontent.com/${parts[0]}/${parts[1]}/${parts.slice(3).join('/')}`;
    }
  }
  throw new Error('Use a GitHub blob URL or raw.githubusercontent.com URL for readmeUrl.');
}

export async function fetchReadme(input, force = false) {
  const url = rawReadmeUrl(input);
  if (!force && pending.has(url)) return pending.get(url);
  
  const operation = (async () => {
    await fetchLimiter.acquire();
    try {
      return await load(url, force);
    } finally {
      fetchLimiter.release();
    }
  })();
  
  pending.set(url, operation);
  return operation;
}

async function load(url, force) {
  const filename = path.join(cacheDirectory, `${createHash('sha256').update(url).digest('hex')}.json`);
  let cached;
  try {
    const candidate = JSON.parse(await readFile(filename, 'utf8'));
    if (candidate.url === url && typeof candidate.markdown === 'string' && Number.isFinite(Date.parse(candidate.fetchedAt))) cached = candidate;
  } catch {}
  const offline = process.env.README_OFFLINE === 'true';
  const fresh = cached && Date.now() - Date.parse(cached.fetchedAt) < 60 * 60 * 1000;
  if (cached && (offline || (!force && fresh))) return { ...cached, state: offline ? 'cached' : 'fresh' };
  try {
    if (offline) throw new Error('Offline mode enabled');
    const response = await fetch(url, {
      signal: AbortSignal.timeout(12000),
      redirect: 'error',
      headers: { Accept: 'text/plain', 'User-Agent': 'mcp-sift-static-build' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (Number(response.headers.get('content-length')) > maxBytes) throw new Error('README exceeds 2 MB');
    const chunks = [];
    let length = 0;
    for await (const chunk of response.body) {
      length += chunk.byteLength;
      if (length > maxBytes) throw new Error('README exceeds 2 MB');
      chunks.push(Buffer.from(chunk));
    }
    const markdown = Buffer.concat(chunks).toString('utf8');
    if (!markdown.trim() || /^\s*<!doctype html/i.test(markdown)) throw new Error('README is empty or not Markdown');
    const result = { markdown, url, fetchedAt: new Date().toISOString() };
    await mkdir(cacheDirectory, { recursive: true });
    await writeFile(filename, JSON.stringify(result));
    return { ...result, state: 'fresh' };
  } catch (error) {
    if (!error.message.includes('HTTP 404') && !error.message.includes('HTTP 301')) {
      console.warn(`[README] ${url} ${error.message}${cached ? ' — using cached copy' : ' — displaying source link'}`);
    }
    if (cached) return { ...cached, state: 'cached' };
    return { markdown: '', url, fetchedAt: null, state: 'unavailable' };
  }
}
