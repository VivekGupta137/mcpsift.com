import sharp from 'sharp';
import { escapeHtml, plainMetadata } from './seo';

function wrapText(input: string, width: number, limit: number) {
  const words = plainMetadata(input).split(' ').flatMap(word => word.length > width ? word.match(new RegExp(`.{1,${width}}`, 'gu')) || [] : [word]);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (current && `${current} ${word}`.length > width) { lines.push(current); current = word; }
    else current = current ? `${current} ${word}` : word;
  }
  if (current) lines.push(current);
  const visible = lines.slice(0, limit);
  if (lines.length > limit) visible[limit - 1] = `${visible[limit - 1].slice(0, width - 1)}…`;
  return visible;
}

export async function renderSocialImage(title: string, description: string, label: string) {
  const titleLines = wrapText(title, 32, 3);
  const descriptionLines = wrapText(description, 78, 2);
  const fontSize = titleLines.length > 2 ? 53 : 61;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#09090B"/>
    <circle cx="600" cy="0" r="420" fill="#6366F1" opacity="0.12"/>
    <rect x="48" y="48" width="1104" height="534" rx="24" fill="#121216" stroke="#27272A"/>
    <rect x="90" y="88" width="48" height="48" rx="12" fill="#18181B" stroke="#3F3F46"/>
    <path d="m108 102-9 10 9 10m12-20 9 10-9 10m-4-26-4 32" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="154" y="121" font-family="sans-serif" font-size="27" font-weight="600" fill="#F4F4F5">MCP Sift</text>
    <text x="90" y="184" font-family="monospace" font-size="15" letter-spacing="1.5" fill="#A78BFA">${escapeHtml(plainMetadata(label).toUpperCase())}</text>
    ${titleLines.map((line, index) => `<text x="86" y="${258 + index * 70}" font-family="sans-serif" font-size="${fontSize}" font-weight="700" letter-spacing="-1.4" fill="#F4F4F5">${escapeHtml(line)}</text>`).join('')}
    ${descriptionLines.map((line, index) => `<text x="90" y="${titleLines.length > 2 ? 457 + index * 31 : 411 + index * 31}" font-family="sans-serif" font-size="23" fill="#A1A1AA">${escapeHtml(line)}</text>`).join('')}
    <path d="M90 526h1020" stroke="#27272A"/>
    <text x="90" y="557" font-family="monospace" font-size="16" fill="#71717A">mcpsift.com · Curated MCP server directory</text>
    <path d="M1062 550h34m-10-10 10 10-10 10" fill="none" stroke="#8B5CF6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
