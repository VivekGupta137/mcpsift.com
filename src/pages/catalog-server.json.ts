import type { APIRoute } from 'astro';
import { cardData, getEntries } from '../lib/content';

/** Client-side search/discovery payload; kept out of the homepage HTML. */
export const GET: APIRoute = async () => {
  const entries = await getEntries('server');
  entries.sort((a, b) => (b.repositoryStats?.stars || 0) - (a.repositoryStats?.stars || 0));
  return new Response(JSON.stringify(entries.map(cardData)), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
};
