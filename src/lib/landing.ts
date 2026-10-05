import type { Entry } from './content';

export const clientLanding = {
  'claude-code': {
    name: 'Claude Code',
    title: 'Best MCP servers for Claude Code',
    description: 'Find MCP servers that extend Claude Code with databases, browser automation, APIs, files, and developer tools. Compare source, transport, and setup details.',
    terms: ['claude code', 'claude desktop', 'anthropic', 'claude'],
  },
  codex: {
    name: 'Codex',
    title: 'Best MCP servers for Codex',
    description: 'Explore MCP servers for Codex workflows, from repositories and local files to web tools and business APIs, with source-linked setup details.',
    terms: ['codex', 'openai'],
  },
  cursor: {
    name: 'Cursor',
    title: 'Best MCP servers for Cursor',
    description: 'Discover MCP servers that connect Cursor to browsers, files, databases, GitHub, and external APIs. Review compatibility and permissions before connecting.',
    terms: ['cursor'],
  },
  'vs-code': {
    name: 'VS Code',
    title: 'Best MCP servers for VS Code',
    description: 'Browse MCP servers for VS Code development workflows, including code, documentation, testing, browser automation, and data integrations.',
    terms: ['vs code', 'visual studio code', 'vscode'],
  },
} as const;

export type ClientSlug = keyof typeof clientLanding;

export function clientMatches(entry: Entry, terms: readonly string[]) {
  const haystack = [entry.title, entry.description, entry.tags.join(' '), entry.body].join(' ').toLowerCase();
  return terms.some(term => haystack.includes(term));
}

export function categorySlug(category: string) {
  return category.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function categoryTitle(category: string) {
  return `Best ${category} MCP servers`;
}

export function categoryDescription(category: string) {
  const descriptions: Record<string, string> = {
    'Developer tools': 'Compare MCP servers for repositories, editors, testing, code analysis, and software delivery workflows.',
    'Knowledge & AI': 'Explore MCP servers for documentation, retrieval, memory, knowledge graphs, and AI development workflows.',
    'Design & creative': 'Find MCP servers that connect AI tools to design, illustration, 3D, video, and creative applications.',
    'Search & research': 'Compare MCP servers for web search, academic research, documents, discovery, and source-backed investigation.',
    'Web & browser': 'Explore MCP servers for browser automation, web testing, scraping, and controlled page interaction.',
    'Data & databases': 'Find MCP servers for querying, exploring, and managing relational, document, graph, and vector data systems.',
    'Cloud & infrastructure': 'Compare MCP servers for cloud platforms, containers, orchestration, deployment, and infrastructure operations.',
    Finance: 'Explore MCP servers for financial data, accounting, market research, and business reporting workflows.',
    Productivity: 'Find MCP servers for notes, tasks, calendars, documents, and everyday team productivity tools.',
  };
  return descriptions[category] || `Compare curated ${category} MCP servers with source links, connection details, and practical setup information for AI workflows.`;
}
