import type { APIRoute } from 'astro';
import { cardData, getEntries } from '../../../lib/content';
import { categorySlug } from '../../../lib/landing';

export async function getStaticPaths() {
  const entries = await getEntries('server');
  const categories = [...new Set(entries.map(entry => entry.category))];
  return categories.map(category => ({
    params: { slug: categorySlug(category) },
    props: { entries: entries.filter(entry => entry.category === category).map(cardData) },
  }));
}

export const GET: APIRoute = ({ props }) => new Response(JSON.stringify(props.entries), {
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
  },
});
