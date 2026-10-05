import { readdir, readFile } from 'node:fs/promises';
import matter from 'gray-matter';
import { fetchReadme } from '../src/lib/readme.mjs';

const filenames = (await readdir('data/servers')).filter(filename => filename.endsWith('.md'));
let unavailable = 0;
await Promise.all(filenames.map(async filename => {
  const { data } = matter(await readFile(`data/servers/${filename}`, 'utf8'));
  if (!data.readmeUrl) return;
  const result = await fetchReadme(data.readmeUrl, true);
  console.log(`${filename}: ${result.state}`);
  if (result.state === 'unavailable') unavailable++;
}));
if (unavailable) process.exitCode = 1;
