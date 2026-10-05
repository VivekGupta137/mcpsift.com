import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, CodeXml, Copy, Database, ExternalLink, FileCode2, Folder, Github, GitFork, Globe, Info, Layers, Menu, Network, Palette, Search, SlidersHorizontal, Star, X } from 'lucide-react';

const icons = { arrow: ArrowRight, back: ArrowLeft, book: BookOpen, check: Check, chevron: ChevronDown, code: CodeXml, copy: Copy, database: Database, external: ExternalLink, file: FileCode2, folder: Folder, github: Github, fork: GitFork, star: Star, globe: Globe, info: Info, layers: Layers, menu: Menu, memory: Network, palette: Palette, search: Search, filter: SlidersHorizontal, close: X };

export default function Icon({ name = 'code', size = 20, className = '' }: { name?: string; size?: number; className?: string }) {
  const Component = icons[name as keyof typeof icons] || CodeXml;
  return <Component size={size} strokeWidth={1.7} aria-hidden="true" className={className} />;
}
