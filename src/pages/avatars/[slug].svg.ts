import type { APIRoute, GetStaticPaths } from 'astro';
import { readdir } from 'node:fs/promises';
import { Avatar, Style } from '@dicebear/core';
import definition from '@dicebear/styles/bottts-neutral.json';

const style = new Style(definition);

export const getStaticPaths: GetStaticPaths = async () => {
  const files = await readdir('data/servers');
  return files.filter(file => file.endsWith('.md')).map(file => ({ params: { slug: file.slice(0, -3) } }));
};

export const GET: APIRoute = ({ params }) => {
  const avatar = new Avatar(style, { seed: params.slug!, size: 144 });
  return new Response(avatar.toString(), { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } });
};
