import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const targetCount = 930;
const searchQueries = ['topic:mcp'];
const excludedName = /awesome|beginner|guide|sdk|framework|client|registry|directory|catalog|list|template|sample|example|starter|demo|tutorial|course|server-and-client/i;
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'mcp-sift-catalog-importer', ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) };

async function search(query, page) {
  const url = new URL('https://api.github.com/search/repositories');
  url.searchParams.set('q', query); url.searchParams.set('sort', 'stars'); url.searchParams.set('order', 'desc');
  url.searchParams.set('per_page', '100'); url.searchParams.set('page', String(page));
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`GitHub search failed (${response.status}) for ${query}, page ${page}`);
  return (await response.json()).items;
}

function slugFor(name) {
  let slug = name.toLowerCase().replace(/mcp[-_]server/g, 'mcp').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!slug.includes('mcp')) slug = `${slug}-mcp`;
  return slug;
}

function titleFor(name) {
  return name.replace(/[-_]+/g, ' ').replace(/\bmcp\b/gi, 'MCP').replace(/\b(api|ai|aws|cli|db|id|ui|url|sql|rag|pdf|ssh|rss|seo|sms|vpn)\b/gi, word => word.toUpperCase()).replace(/\b\w/g, character => character.toUpperCase()).trim();
}

function categoryFor(repo) {
  const text = `${repo.name} ${repo.description || ''} ${(repo.topics || []).join(' ')}`.toLowerCase();
  if (/database|postgres|mysql|mongo|sql|redis|supabase|qdrant|elasticsearch|snowflake|duckdb/.test(text)) return 'Data & databases';
  if (/figma|penpot|design|blender|unity|image|video|audio|cad|kicad|drawio/.test(text)) return 'Design & creative';
  if (/browser|playwright|chrome|puppeteer|scrap|crawl|firecrawl/.test(text)) return 'Web & browser';
  if (/aws|cloudflare|kubernetes|docker|terraform|azure|gcp|cloud|devops|prometheus|grafana/.test(text)) return 'Cloud & infrastructure';
  if (/slack|notion|gmail|discord|linear|asana|notebook|calendar|office|wordpress|salesforce/.test(text)) return 'Productivity';
  if (/finance|stock|trading|market|crypto|polymarket|alpaca/.test(text)) return 'Finance';
  if (/search|research|arxiv|scholar|wikipedia|news|academic/.test(text)) return 'Search & research';
  if (/memory|knowledge|rag|embedding|llm|model|ai/.test(text)) return 'Knowledge & AI';
  return 'Developer tools';
}

function yaml(value) { return JSON.stringify(String(value).replace(/\s+/g, ' ').trim()); }

const serverDirectory = path.resolve('data/servers');
const allFiles = (await readdir(serverDirectory)).filter(file => file.endsWith('.md'));
const existingFiles = [];
const existingRepositories = new Set();
for (const filename of allFiles) {
  const { data } = matter(await readFile(path.join(serverDirectory, filename), 'utf8'));
  if (typeof data.title !== 'string' || typeof data.description !== 'string' || !Array.isArray(data.tags)) continue;
  existingFiles.push(filename);
  if (typeof data.githubUrl === 'string') existingRepositories.add(new URL(data.githubUrl).pathname.toLowerCase().replace(/\/$/, '').replace(/\.git$/, ''));
}
const repositories = new Map();
for (const query of searchQueries) for (let page = 1; page <= 2; page++) {
  for (const repo of await search(query, page)) repositories.set(repo.full_name.toLowerCase(), repo);
}
const candidates = [...repositories.values()].filter(repo => {
  const identity = `/${repo.full_name.toLowerCase()}`;
  return !repo.archived && !repo.disabled && !repo.fork && !existingRepositories.has(identity) && !excludedName.test(repo.name);
}).sort((first, second) => second.stargazers_count - first.stargazers_count);

const usedSlugs = new Set(existingFiles.map(file => file.slice(0, -3)));
let added = 0;
for (const repo of candidates) {
  if (existingFiles.length + added >= targetCount) break;
  let slug = slugFor(repo.name);
  if (usedSlugs.has(slug)) slug = `${slug}-${repo.owner.login.toLowerCase()}`;
  if (usedSlugs.has(slug)) continue;
  usedSlugs.add(slug);
  const displayTitle = titleFor(repo.name);
  const description = repo.description?.trim() || `A community-built MCP server for ${displayTitle}.`;
  const topics = [...new Set(['mcp', 'mcp-server', ...(repo.topics || [])].map(topic => topic.toLowerCase().replace(/[^a-z0-9-]/g, '-')).filter(Boolean))].slice(0, 8);
  const body = `## Overview\n\nThe **${displayTitle} MCP server** is a publicly available community project. Review the upstream repository for installation instructions, supported tools, compatibility, permissions, and current maintenance status.\n\n## Configuration\n\nConfiguration, transport, authentication, and runtime requirements vary by project. Open the repository before connecting and use the smallest set of credentials and permissions required.\n\n[Open the ${displayTitle} repository](${repo.html_url}) to read the latest documentation.`;
  const content = `---\ntitle: ${yaml(displayTitle)}\ndescription: ${yaml(description)}\ncategory: ${yaml(categoryFor(repo))}\ntags: [${topics.map(yaml).join(', ')}]\nsource: Community\nowner: ${yaml(repo.owner.login)}\ntransport: stdio or Streamable HTTP\nauthentication: Varies by repository; review the upstream documentation\ngithubUrl: ${repo.html_url}\nreadmeUrl: ${repo.html_url}/blob/${repo.default_branch || 'main'}/README.md\ngithubStars: ${repo.stargazers_count}\ngithubForks: ${repo.forks_count}\ngithubStatsFetchedAt: ${new Date().toISOString()}\n---\n${body}\n`;
  await writeFile(path.join(serverDirectory, `${slug}.md`), content);
  added++;
}
if (existingFiles.length + added < targetCount) throw new Error(`Only generated ${existingFiles.length + added} entries; fewer than ${targetCount} candidates passed the filter.`);
console.log(`Imported ${added} repositories; ${existingFiles.length + added} total server entries.`);
