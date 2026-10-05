export interface SeoMetadata {
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  noindex?: boolean;
}

export function readSeoMetadata(value: unknown, filename: string): SeoMetadata {
  if (value === undefined) return {};
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${filename}: seo must be a frontmatter object`);
  const input = value as Record<string, unknown>;
  const output: SeoMetadata = {};
  for (const field of ['title', 'description', 'image', 'imageAlt'] as const) {
    if (input[field] === undefined) continue;
    if (typeof input[field] !== 'string' || !input[field].trim()) throw new Error(`${filename}: seo.${field} must be a nonempty string`);
    output[field] = input[field].trim();
  }
  if (input.noindex !== undefined) {
    if (typeof input.noindex !== 'boolean') throw new Error(`${filename}: seo.noindex must be a boolean`);
    output.noindex = input.noindex;
  }
  if (output.image) {
    const local = output.image.startsWith('/') && !output.image.startsWith('//');
    const url = new URL(output.image, local ? 'https://local.invalid' : undefined);
    if (url.protocol !== 'https:' || url.username || url.password || !/\.(png|jpe?g|webp)$/i.test(url.pathname)) throw new Error(`${filename}: seo.image must be a root-relative or HTTPS PNG, JPEG, or WebP URL`);
  }
  return output;
}

export function readContentDate(value: unknown, field: string, filename: string): string | undefined {
  if (value === undefined) return undefined;
  const date = value instanceof Date ? value.toISOString().slice(0, 10) : value;
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) throw new Error(`${filename}: ${field} must be a valid YYYY-MM-DD date`);
  return date;
}
