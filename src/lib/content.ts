import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { rawReadmeUrl } from './readme.mjs';
import { fetchRepositoryStats, type RepositoryStats } from './github';
import { renderMarkdown } from './markdown';
import { readContentDate, readSeoMetadata, type SeoMetadata } from './seo-metadata';
import { isLowValueServer } from './index-quality.mjs';

export interface Entry {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  body: string;
  href: string;
  icon: string;
  kind: 'server' | 'guide';
  githubUrl?: string;
  repositoryStats?: RepositoryStats;
  readmeUrl?: string;
  documentationUrl?: string;
  endpoint?: string;
  source?: string;
  transport?: string;
  authentication?: string;
  owner?: string;
  author?: string;
  date?: string;
  readingTime?: number;
  updated?: string;
  authorUrl?: string;
  authorType?: 'Person' | 'Organization';
  seo: SeoMetadata;
}

function required(data: Record<string, unknown>, key: string, filename: string): string {
  if (typeof data[key] !== 'string' || !data[key].trim()) throw new Error(`${filename}: frontmatter.${key} must be a nonempty string`);
  return data[key];
}

function httpUrl(value: unknown, field: string, filename: string) {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') throw new Error(`${filename}: ${field} must be a URL string`);
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error(`${filename}: ${field} must be a public HTTPS URL`);
  return url.href;
}

export async function getEntries(kind: 'server' | 'guide'): Promise<Entry[]> {
  const directory = path.resolve('data', kind === 'server' ? 'servers' : 'guides');
  const filenames = (await readdir(directory)).filter(filename => filename.endsWith('.md')).sort();
  const serverFilenames = kind === 'server' ? (await Promise.all(filenames.map(async filename => {
    const { data } = matter(await readFile(path.join(directory, filename), 'utf8'));
    return typeof data.title === 'string' && typeof data.description === 'string' ? filename : null;
  }))).filter((filename): filename is string => filename !== null) : filenames;
  const entries = await Promise.all(serverFilenames.map(async filename => {
    const slug = filename.replace(/\.md$/, '');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`${filename}: use lowercase kebab-case filenames`);
    const { data, content } = matter(await readFile(path.join(directory, filename), 'utf8'));
    if (!content.trim()) throw new Error(`${filename}: Markdown body is required`);
    if (!Array.isArray(data.tags) || !data.tags.every(tag => typeof tag === 'string' && tag.trim())) throw new Error(`${filename}: tags must be an array of strings`);
    const entry: Entry = {
      slug, kind, title: required(data, 'title', filename),
      description: required(data, 'description', filename),
      category: required(data, 'category', filename),
      tags: data.tags, body: content,
      icon: typeof data.icon === 'string' ? data.icon : kind === 'server' ? 'code' : 'book',
      href: `/${kind === 'server' ? 'servers' : 'guides'}/${slug}/`,
      seo: readSeoMetadata(data.seo, filename),
      updated: readContentDate(data.updated, 'updated', filename),
    };
    // Keep placeholder imports out of search until an editor adds repository-
    // specific content. This is also mirrored by sitemapContent().
    if (kind === 'server' && isLowValueServer(data, content)) entry.seo = { ...entry.seo, noindex: true };
    if (kind === 'server') {
      entry.source = required(data, 'source', filename);
      entry.transport = required(data, 'transport', filename);
      entry.authentication = required(data, 'authentication', filename);
      entry.githubUrl = httpUrl(data.githubUrl, 'githubUrl', filename);
      if (entry.githubUrl && new URL(entry.githubUrl).hostname !== 'github.com') throw new Error(`${filename}: githubUrl must point to GitHub`);
      entry.readmeUrl = httpUrl(data.readmeUrl, 'readmeUrl', filename);
      if (entry.readmeUrl) rawReadmeUrl(entry.readmeUrl);
      entry.documentationUrl = httpUrl(data.documentationUrl, 'documentationUrl', filename);
      entry.endpoint = httpUrl(data.endpoint, 'endpoint', filename);
      if (!entry.githubUrl && !entry.documentationUrl) throw new Error(`${filename}: a GitHub or documentation URL is required`);
      entry.owner = typeof data.owner === 'string' ? data.owner : entry.githubUrl ? new URL(entry.githubUrl).pathname.split('/')[1] : entry.source;
      const staticStars = data.githubStars;
      const staticForks = data.githubForks;
      const staticFetchedAt = data.githubStatsFetchedAt;
      const githubUrl = entry.githubUrl;
      if (!githubUrl) throw new Error(`${filename}: GitHub URL disappeared during validation`);
      if (Number.isSafeInteger(staticStars) && staticStars >= 0 && Number.isSafeInteger(staticForks) && staticForks >= 0 && typeof staticFetchedAt === 'string') {
        entry.repositoryStats = { repository: new URL(githubUrl).pathname.split('/').filter(Boolean).slice(0, 2).join('/').toLowerCase(), stars: staticStars, forks: staticForks, fetchedAt: staticFetchedAt, stale: true };
      } else {
        entry.repositoryStats = await fetchRepositoryStats(entry.githubUrl);
      }
    } else {
      entry.author = required(data, 'author', filename);
      entry.date = readContentDate(data.date, 'date', filename);
      if (!entry.date) throw new Error(`${filename}: date is required`);
      if (entry.updated && entry.updated < entry.date) throw new Error(`${filename}: updated cannot precede date`);
      entry.authorUrl = httpUrl(data.authorUrl, 'authorUrl', filename);
      if (data.authorType !== undefined && !['Person', 'Organization'].includes(data.authorType)) throw new Error(`${filename}: authorType must be Person or Organization`);
      entry.authorType = data.authorType || (entry.author === 'MCP Sift' ? 'Organization' : 'Person');
      entry.readingTime = Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
    }
    return entry;
  }));
  return entries.sort((first, second) => kind === 'guide' ? (second.date || '').localeCompare(first.date || '') || first.title.localeCompare(second.title) : first.title.localeCompare(second.title));
}

export function cardData(entry: Entry): Omit<Entry, 'body'> {
  const { body, ...metadata } = entry;
  return metadata;
}

export async function getPage(slug: string) {
  const filename = path.resolve('data/pages', `${slug}.md`);
  const { data, content } = matter(await readFile(filename, 'utf8'));
  return { title: required(data, 'title', filename), description: required(data, 'description', filename), eyebrow: typeof data.eyebrow === 'string' ? data.eyebrow : '', seo: readSeoMetadata(data.seo, filename), updated: readContentDate(data.updated, 'updated', filename), body: content, ...renderMarkdown(content) };
}

export const repositoryUrl = import.meta.env.PUBLIC_REPOSITORY_URL || '';
if (repositoryUrl && !/^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/.test(repositoryUrl)) throw new Error('PUBLIC_REPOSITORY_URL must be a GitHub repository URL');
