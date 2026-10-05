import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'mcp-sift-readme-link-refresh', ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) };
const repositories = new Map();

for (const query of ['in:name mcp-server', 'in:name mcp']) {
  for (let page = 1; page <= 5; page++) {
    const url = new URL('https://api.github.com/search/repositories');
    url.searchParams.set('q', query); url.searchParams.set('sort', 'stars'); url.searchParams.set('order', 'desc');
    url.searchParams.set('per_page', '100'); url.searchParams.set('page', String(page));
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`GitHub search failed (${response.status})`);
    for (const repo of (await response.json()).items) repositories.set(repo.full_name.toLowerCase(), repo);
  }
}

const directory = path.resolve('data/servers');
let updated = 0;
for (const filename of (await readdir(directory)).filter(file => file.endsWith('.md'))) {
  const filenamePath = path.join(directory, filename);
  const parsed = matter(await readFile(filenamePath, 'utf8'));
  if (typeof parsed.data.githubUrl !== 'string' || typeof parsed.data.githubStars !== 'number' || parsed.data.readmeUrl) continue;
  const repository = new URL(parsed.data.githubUrl).pathname.split('/').filter(Boolean).slice(0, 2).join('/').toLowerCase();
  const metadata = repositories.get(repository);
  const branch = metadata?.default_branch || 'main';
  parsed.data.readmeUrl = `${parsed.data.githubUrl.replace(/\/$/, '')}/blob/${branch}/README.md`;
  await writeFile(filenamePath, matter.stringify(parsed.content, parsed.data));
  updated++;
}
console.log(`Added README links to ${updated} generated server entries.`);
