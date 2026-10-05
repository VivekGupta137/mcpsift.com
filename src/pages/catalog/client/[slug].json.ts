import type { APIRoute } from 'astro';
import { cardData, getEntries } from '../../../lib/content';
import { clientLanding, clientMatches } from '../../../lib/landing';

export async function getStaticPaths() {
  const entries = await getEntries('server');
  entries.sort((a, b) => (b.repositoryStats?.stars || 0) - (a.repositoryStats?.stars || 0));
  return Object.entries(clientLanding).map(([slug, landing]) => ({
    params: { slug },
    props: { entries: entries.filter(entry => clientMatches(entry, landing.terms)).map(cardData) },
  }));
}

export const GET: APIRoute = ({ props }) => new Response(JSON.stringify(props.entries), {
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
  },
});
