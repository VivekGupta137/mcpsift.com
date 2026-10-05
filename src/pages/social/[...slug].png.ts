import type { APIRoute, GetStaticPaths } from 'astro';
import { getEntries, getPage } from '../../lib/content';
import { renderSocialImage } from '../../lib/social-image';

export const getStaticPaths: GetStaticPaths = async () => {
  const [servers, guides] = await Promise.all([getEntries('server'), getEntries('guide')]);
  const staticPages = await Promise.all([
    { slug: 'home', page: 'home', title: 'Discover MCP servers', label: 'The MCP directory' },
    { slug: 'guides', page: 'guides', title: 'MCP guides & tutorials', label: 'Learn something useful' },
    { slug: 'about', page: 'about', title: 'About & contributions', label: 'About the directory' },
    { slug: '404', page: '404', title: 'A missing connection.', label: 'MCP Sift' },
  ].map(async item => {
    const content = await getPage(item.page);
    return { params: { slug: item.slug }, props: { title: content.seo.title || item.title, description: content.seo.description || content.description, label: item.label } };
  }));
  return [...staticPages, ...[...servers, ...guides].map(entry => ({
    params: { slug: `${entry.kind === 'server' ? 'servers' : 'guides'}/${entry.slug}` },
    props: {
      title: entry.seo.title || (entry.kind === 'server' ? `${entry.title} MCP server` : entry.title),
      description: entry.seo.description || entry.description,
      label: entry.kind === 'server' ? `${entry.category} · Server guide` : entry.category,
    },
  }))];
};

export const GET: APIRoute = async ({ props }) => {
  const image = await renderSocialImage(props.title, props.description, props.label);
  return new Response(new Uint8Array(image), { headers: { 'Content-Type': 'image/png' } });
};
