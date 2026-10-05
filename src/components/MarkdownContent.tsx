import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@heroui/react';
import Icon from './Icon';

function CopyButton({ text }: { text: string }) {
  const [status, setStatus] = useState('Copy');
  useEffect(() => {
    if (status === 'Copy') return;
    const timeout = window.setTimeout(() => setStatus('Copy'), 2400);
    return () => window.clearTimeout(timeout);
  }, [status]);
  return <Button size="sm" variant="secondary" className="copy-button" onPress={async () => {
    try { await navigator.clipboard.writeText(text); setStatus('Copied'); } catch { setStatus('Select to copy'); }
  }} aria-label={status === 'Copied' ? 'Copied to clipboard' : 'Copy code'}><Icon name={status === 'Copied' ? 'check' : 'copy'} size={15} /><span aria-live="polite">{status}</span></Button>;
}

export default function MarkdownContent({ html, className = '' }: { html: string; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [blocks, setBlocks] = useState<{ target: HTMLDivElement; text: string }[]>([]);
  useEffect(() => {
    const targets = Array.from(root.current?.querySelectorAll('pre') || []).map(pre => {
      const target = document.createElement('div');
      target.className = 'code-toolbar';
      pre.before(target);
      const language = pre.querySelector('code')?.className.replace('language-', '') || 'code';
      const label = document.createElement('span');
      label.textContent = language;
      target.append(label);
      return { target, text: pre.textContent || '' };
    });
    setBlocks(targets);
    return () => targets.forEach(({ target }) => target.remove());
  }, [html]);
  return <><div className={`prose ${className}`} ref={root} dangerouslySetInnerHTML={{ __html: html }} />{blocks.map((block, index) => createPortal(<CopyButton text={block.text} />, block.target, String(index)))}</>;
}
