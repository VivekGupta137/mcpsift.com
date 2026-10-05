import { Marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

export interface Heading { id: string; text: string; depth: number }
export interface MarkdownDocument { html: string; headings: Heading[] }

export function renderMarkdown(source: string, prefix = 'content', baseUrl?: string): MarkdownDocument {
  const headings: Heading[] = [];
  const seen = new Map<string, number>();
  const parser = new Marked({ gfm: true, breaks: false });
  parser.use({ renderer: {
    heading(token) {
      const text = token.text.replace(/<[^>]*>/g, '').replace(/[*_`]/g, '');
      const slug = text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'section';
      const count = seen.get(slug) || 0;
      seen.set(slug, count + 1);
      const id = `${prefix}-${slug}${count ? `-${count}` : ''}`;
      headings.push({ id, text, depth: token.depth });
      const depth = prefix === 'readme' ? Math.min(token.depth + 1, 6) : token.depth;
      return `<h${depth} id="${id}">${this.parser.parseInline(token.tokens)}</h${depth}>`;
    },
  } });
  const resolve = (value: string, image = false) => {
    if (value.startsWith('#')) return `#${prefix}-${value.slice(1)}`;
    if (!baseUrl || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(value)) return value;
    const base = new URL(baseUrl);
    const repositoryParts = base.pathname.split('/').filter(Boolean);
    const repositoryRoot = `${base.origin}/${repositoryParts.slice(0, 3).join('/')}/`;
    const resolved = value.startsWith('/') && base.hostname === 'raw.githubusercontent.com'
      ? new URL(value.slice(1), repositoryRoot).href
      : new URL(value, baseUrl).href;
    if (!image && resolved.startsWith('https://raw.githubusercontent.com/')) {
      const path = new URL(resolved).pathname.split('/').filter(Boolean);
      return `https://github.com/${path[0]}/${path[1]}/blob/${path.slice(2).join('/')}`;
    }
    return resolved;
  };
  const html = sanitizeHtml(parser.parse(source) as string, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'details', 'summary', 'del', 'kbd', 'mark'],
    allowedAttributes: {
      a: ['href', 'title', 'rel', 'target'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'decoding', 'referrerpolicy'],
      code: ['class'],
      h1: ['id'], h2: ['id'], h3: ['id'], h4: ['id'], h5: ['id'], h6: ['id'],
      th: ['align'], td: ['align'], ol: ['start'],
    },
    allowedSchemes: ['https', 'http', 'mailto'],
    allowProtocolRelative: false,
    transformTags: {
      a: (_tag, attributes) => ({ tagName: 'a', attribs: {
        ...attributes,
        href: resolve(attributes.href || ''),
        rel: 'noopener noreferrer',
      } }),
      img: (_tag, attributes) => ({ tagName: 'img', attribs: {
        ...attributes,
        src: resolve(attributes.src || '', true),
        loading: 'lazy', decoding: 'async', referrerpolicy: 'no-referrer',
      } }),
    },
  }).replace(/<table>/g, '<div class="table-scroll" tabindex="0" role="region" aria-label="Scrollable table"><table>').replace(/<\/table>/g, '</table></div>');
  return { html, headings };
}

export function markdownSections(source: string) {
  return source.split(/(?=^## )/m).filter(part => part.trim()).map((part, index) => ({
    title: part.match(/^## (.+)/)?.[1] || 'Overview',
    ...renderMarkdown(part, 'content'),
    key: index,
  }));
}
