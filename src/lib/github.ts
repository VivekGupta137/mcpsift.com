import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export interface RepositoryStats {
  repository: string;
  stars: number;
  forks: number;
  fetchedAt: string;
  stale: boolean;
}

const pending = new Map<string, Promise<RepositoryStats | undefined>>();
const cacheDirectory = path.resolve('.cache/github');

export function githubRepository(input: string): string | undefined {
  const url = new URL(input);
  if (url.protocol !== 'https:' || url.hostname !== 'github.com' || url.username || url.password || url.port) return undefined;
  const [owner, rawRepository] = url.pathname.split('/').filter(Boolean);
  const repository = rawRepository?.replace(/\.git$/, '');
  if (!owner || !repository || !/^[a-zA-Z0-9-]+$/.test(owner) || !/^[a-zA-Z0-9_.-]+$/.test(repository)) return undefined;
  return `${owner}/${repository}`.toLowerCase();
}

export async function fetchRepositoryStats(input?: string): Promise<RepositoryStats | undefined> {
  if (!input) return undefined;
  const repository = githubRepository(input);
  if (!repository) return undefined;
  if (!pending.has(repository)) pending.set(repository, loadStats(repository));
  return pending.get(repository);
}

function validStats(value: RepositoryStats, repository: string) {
  return value?.repository === repository && Number.isSafeInteger(value.stars) && value.stars >= 0
    && Number.isSafeInteger(value.forks) && value.forks >= 0 && Number.isFinite(Date.parse(value.fetchedAt));
}

async function loadStats(repository: string): Promise<RepositoryStats | undefined> {
  const filename = path.join(cacheDirectory, `${createHash('sha256').update(repository).digest('hex')}.json`);
  let cached: RepositoryStats | undefined;
  try {
    const candidate = JSON.parse(await readFile(filename, 'utf8'));
    if (validStats(candidate, repository)) cached = candidate;
  } catch {}
  const offline = process.env.GITHUB_OFFLINE === 'true';
  const fresh = cached && Date.now() - Date.parse(cached.fetchedAt) < 60 * 60 * 1000;
  if (cached && (offline || fresh)) return { ...cached, stale: offline || !fresh };
  try {
    if (offline) throw new Error('Offline mode enabled');
    const response = await fetch(`https://api.github.com/repos/${repository}`, {
      signal: AbortSignal.timeout(12000),
      redirect: 'error',
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'mcp-sift-static-build',
        ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const result: RepositoryStats = { repository, stars: data.stargazers_count, forks: data.forks_count, fetchedAt: new Date().toISOString(), stale: false };
    if (!validStats(result, repository)) throw new Error('Invalid repository counts');
    try {
      await mkdir(cacheDirectory, { recursive: true });
      await writeFile(filename, JSON.stringify(result));
    } catch { console.warn(`[GitHub] ${repository}: could not save repository cache`); }
    return result;
  } catch (error) {
    console.warn(`[GitHub] ${repository}: ${error instanceof Error ? error.message : 'Request failed'} — ${cached ? 'using cached counts' : 'counts unavailable'}`);
    return cached ? { ...cached, stale: true } : undefined;
  }
}
