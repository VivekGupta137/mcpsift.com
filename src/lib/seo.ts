import type { BlogPosting, BreadcrumbList, Graph, ItemList, Organization, SoftwareSourceCode, Thing, WebAPI, WebPage, WebSite } from 'schema-dts';
import type { Entry } from './content';

export type PageKind = 'directory' | 'guides' | 'guide' | 'server' | 'about' | 'notfound';

export function socialImagePath(pathname: string) {
  const slug = pathname.replace(/^\/+|\/+$/g, '').replace(/\.html$/, '') || 'home';
  return `/social/${slug}.png`;
}

export function plainMetadata(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

/** Remove importer/source wording that otherwise produces titles such as
 * “Notion MCP Server MCP server”. Keep the first spelling supplied by editors. */
export function serverSeoTitle(value: string) {
  const clean = plainMetadata(value).replace(/\b(MCP\s+server)(?:\s+MCP\s+server)+\b/gi, '$1');
  return /\bmcp\b/i.test(clean) ? clean : `${clean} MCP Server`;
}

export function serverSeoDescription(title: string, description: string) {
  const clean = plainMetadata(description);
  const generic = /publicly available community project|configuration, transport, authentication, and runtime requirements vary by project/i.test(clean)
    || /^official\s+.+\s+mcp\s+server$/i.test(clean);
  if (!generic && clean.length >= 50) return clean;
  return `Explore ${serverSeoTitle(title)} on MCP Sift: source links, setup guidance, connection details, and authentication notes.`;
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}

export function serializeJsonLd(value: Graph) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

interface SchemaOptions {
  site: URL;
  pathname: string;
  title: string;
  description: string;
  image: string;
  kind: PageKind;
  entry?: Entry;
  entries?: Entry[];
  repository?: string;
  updated?: string;
}

export function createPageSchema({ site, pathname, title, description, image, kind, entry, entries = [], repository, updated }: SchemaOptions): Graph {
  const absolute = (value: string) => new URL(value, site).href;
  const url = absolute(pathname);
  const organization: Organization = {
    '@type': 'Organization', '@id': absolute('/#organization'), name: 'MCP Sift', url: absolute('/'),
    logo: { '@type': 'ImageObject', url: absolute('/favicon.svg') },
    ...(repository ? { sameAs: [repository] } : {}),
  };
  const website: WebSite = {
    '@type': 'WebSite', '@id': absolute('/#website'), name: 'MCP Sift', url: absolute('/'),
    description: 'A curated directory for finding and comparing MCP servers for AI tools.',
    inLanguage: 'en', publisher: { '@id': organization['@id']! },
  };
  const page: WebPage = {
    '@type': kind === 'about' ? 'AboutPage' : kind === 'directory' || kind === 'guides' ? 'CollectionPage' : 'WebPage',
    '@id': `${url}#webpage`, url, name: title, description, inLanguage: 'en',
    isPartOf: { '@id': website['@id']! },
    primaryImageOfPage: { '@type': 'ImageObject', url: image },
    ...(updated ? { dateModified: updated } : {}),
  };
  const nodes: Thing[] = [organization, website, page];
  if (pathname !== '/') {
    const ancestors = [{ name: 'Directory', item: absolute('/') }];
    if (kind === 'guide') ancestors.push({ name: 'Guides', item: absolute('/guides/') });
    ancestors.push({ name: entry?.title || (kind === 'guides' ? 'Guides' : kind === 'about' ? 'About & contributions' : title), item: url });
    const breadcrumbs: BreadcrumbList = {
      '@type': 'BreadcrumbList', '@id': `${url}#breadcrumbs`,
      itemListElement: ancestors.map((ancestor, index) => ({ '@type': 'ListItem', position: index + 1, ...ancestor })),
    };
    page.breadcrumb = { '@id': breadcrumbs['@id']! };
    nodes.push(breadcrumbs);
  }
  if (kind === 'guide' && entry) {
    const article: BlogPosting = {
      '@type': 'BlogPosting', '@id': `${url}#article`, headline: entry.title, description,
      url, image, inLanguage: 'en', mainEntityOfPage: { '@id': page['@id']! },
      author: {
        '@type': entry.authorType || 'Person', name: entry.author,
        ...(entry.authorUrl ? { url: entry.authorUrl } : entry.author === 'MCP Sift' ? { '@id': organization['@id']!, url: absolute('/about/') } : {}),
      },
      publisher: { '@id': organization['@id']! },
      datePublished: entry.date, dateModified: entry.updated || entry.date,
      articleSection: entry.category, keywords: entry.tags,
      timeRequired: `PT${entry.readingTime}M`,
    };
    page.mainEntity = { '@id': article['@id']! };
    nodes.push(article);
  }
  if (kind === 'server' && entry) {
    const software: SoftwareSourceCode | WebAPI = {
      '@type': entry.githubUrl ? 'SoftwareSourceCode' : 'WebAPI', '@id': `${url}#software`, name: entry.title, description: entry.description,
      url: entry.githubUrl || entry.documentationUrl || url,
      ...(entry.githubUrl ? { codeRepository: entry.githubUrl } : {}),
      ...(entry.documentationUrl ? { sameAs: [entry.documentationUrl] } : {}),
      keywords: entry.tags,
      ...(entry.updated ? { dateModified: entry.updated } : {}),
    };
    page.about = { '@id': software['@id']! };
    page.mainEntity = { '@id': software['@id']! };
    nodes.push(software);
  }
  if (kind === 'directory' || kind === 'guides') {
    const included = entries.filter(item => !item.seo.noindex);
    const list: ItemList = {
      '@type': 'ItemList', '@id': `${url}#list`, name: kind === 'directory' ? 'MCP servers' : 'MCP guides',
      numberOfItems: included.length,
      itemListElement: included.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.title, url: absolute(item.href) })),
    };
    page.mainEntity = { '@id': list['@id']! };
    nodes.push(list);
  }
  return { '@context': 'https://schema.org', '@graph': nodes };
}
