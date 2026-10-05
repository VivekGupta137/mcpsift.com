import { Button, Disclosure, Link } from '@heroui/react';
import type { Heading } from '../lib/markdown';

export default function Contents({ headings }: { headings: Heading[] }) {
  const links = headings.filter(heading => heading.depth === 2);
  if (!links.length) return null;
  const items = <nav aria-label="On this page">{links.map(heading => <Link key={heading.id} href={`#${heading.id}`}>{heading.text}</Link>)}</nav>;
  return <>
    <div className="toc-desktop panel"><p>On this page</p>{items}</div>
    <Disclosure className="toc-mobile"><Disclosure.Heading><Button slot="trigger" variant="secondary">On this page<Disclosure.Indicator /></Button></Disclosure.Heading><Disclosure.Content><Disclosure.Body>{items}</Disclosure.Body></Disclosure.Content></Disclosure>
  </>;
}
