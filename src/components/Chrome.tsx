import { useState, useEffect } from 'react';
import { Button, Link } from '@heroui/react';
import Icon from './Icon';

export function Header({ active = '', repository = '' }: { active?: string; repository?: string }) {
  const [open, setOpen] = useState(false);
  const links = [{ label: 'Directory', href: '/', key: 'directory' }, { label: 'Guides', href: '/guides/', key: 'guides' }, { label: 'About', href: '/about/', key: 'about' }];
  return <header className="site-header" data-pagefind-ignore>
    <div className="header-inner">
      <div className="brand-cluster"><Link href="/" className="brand" aria-label="MCP Sift home"><span className="brand-mark"><Icon name="memory" size={19} /></span><span>MCP Sift</span></Link><span className="registry-status"><i />Curated directory</span></div>
      <nav className="desktop-nav" aria-label="Main navigation">
        {links.map(link => <Link key={link.key} href={link.href} className={`nav-link ${active === link.key ? 'is-active' : ''}`} aria-current={active === link.key ? 'page' : undefined}>{link.label}</Link>)}
        {repository && <Link href={repository} className="action-link header-action" target="_blank" rel="noopener noreferrer"><Icon name="github" size={17} />Contribute<Icon name="external" size={13} /></Link>}
      </nav>
      <div className="mobile-nav">
        <Button isIconOnly variant="secondary" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="mobile-menu" onPress={() => setOpen(!open)}><Icon name={open ? 'close' : 'menu'} /></Button>
      </div>
    </div>
    {open && <nav id="mobile-menu" className="mobile-menu panel" aria-label="Mobile navigation" onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }}>
      {links.map(link => <Link key={link.key} href={link.href} aria-current={active === link.key ? 'page' : undefined}>{link.label === 'About' ? 'About & contributions' : link.label}</Link>)}
      {repository && <Link href={repository} target="_blank" rel="noopener noreferrer">GitHub <Icon name="external" size={16} /></Link>}
    </nav>}
    <noscript><nav className="no-js-nav" aria-label="Navigation"><a href="/">Directory</a><a href="/guides/">Guides</a><a href="/about/">About</a></nav></noscript>
  </header>;
}

export function Footer({ repository = '' }: { repository?: string }) {
  return <footer className="site-footer" data-pagefind-ignore>
    <div><Link href="/" className="footer-brand"><span className="brand-mark"><Icon name="memory" size={16} /></span>MCP Sift</Link><p>A curated MCP server directory with source-linked setup details, compatibility information, and practical guides.</p></div>
    <nav aria-label="Footer navigation"><Link href="/">Directory</Link><Link href="/guides/">Guides</Link><Link href="/about/">About</Link>{repository && <Link href={repository} target="_blank" rel="noopener noreferrer">GitHub <Icon name="external" size={12} /></Link>}</nav>
  </footer>;
}

export function ActionLink({ href, children, icon, primary = false }: { href: string; children: React.ReactNode; icon?: string; primary?: boolean }) {
  const external = /^https?:/.test(href);
  return <Link href={href} className={`action-link ${primary ? 'primary' : 'secondary'}`} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{icon && <Icon name={icon} size={18} />}{children}{external && <Icon name="external" size={14} />}</Link>;
}

const llmTargets = [
  {
    name: 'Claude',
    className: 'llm-btn llm-claude',
    url: (prompt: string) => `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
    icon: 'https://www.google.com/s2/favicons?domain=claude.ai&sz=32',
  },
  {
    name: 'ChatGPT',
    className: 'llm-btn llm-chatgpt',
    url: (prompt: string) => `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`,
    icon: 'https://www.google.com/s2/favicons?domain=chatgpt.com&sz=32',
  },
  {
    name: 'Gemini',
    className: 'llm-btn llm-gemini',
    url: (prompt: string) => `https://gemini.google.com/app?q=${encodeURIComponent(prompt)}`,
    icon: 'https://www.google.com/s2/favicons?domain=gemini.google.com&sz=32',
  },
];

export function LLMButtons({ title, slug }: { title: string; slug: string }) {
  const [open, setOpen] = useState(false);
  const pageUrl = `https://mcpsift.com/servers/${slug}/`;
  const prompt = `Help me set up the "${title}" MCP server. Installation instructions: ${pageUrl}`;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!(e.target as Element).closest('.llm-dropdown-wrap')) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div className="llm-dropdown-wrap" data-pagefind-ignore>
      <button className="action-link secondary llm-trigger" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-haspopup="true">
        <Icon name="layers" size={16} />
        Setup with AI
        <Icon name="chevron" size={14} />
      </button>
      {open && (
        <div className="llm-menu" role="menu">
          {llmTargets.map(llm => (
            <a key={llm.name} href={llm.url(prompt)} target="_blank" rel="noopener noreferrer" className="llm-menu-item" role="menuitem" onClick={() => setOpen(false)}>
              <img src={llm.icon} alt="" width={16} height={16} />
              {llm.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
