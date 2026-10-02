/**
 * AiveeMarkdown
 * Compact markdown renderer for Aivee's responses, styled with the app's design
 * tokens (semantic text/surface/border colors auto-switch light ⇄ dark).
 */
'use client';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const components = {
  p: ({ children }) => <p className="my-1.5 leading-relaxed first:mt-0 last:mb-0">{children}</p>,
  h1: ({ children }) => <h1 className="mt-3 mb-1.5 text-body font-extrabold text-text-primary">{children}</h1>,
  h2: ({ children }) => <h2 className="mt-2.5 mb-1.5 text-body-sm font-bold text-text-primary">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-2 mb-1 text-body-sm font-bold text-text-primary">{children}</h3>,
  strong: ({ children }) => <strong className="font-bold text-text-primary">{children}</strong>,
  em: ({ children }) => <em className="italic text-text-muted">{children}</em>,
  ul: ({ children }) => <ul className="my-1.5 flex list-disc flex-col gap-1 pl-4.5">{children}</ul>,
  ol: ({ children }) => <ol className="my-1.5 flex list-decimal flex-col gap-1 pl-5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed marker:text-text-subtle">{children}</li>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="text-brand underline decoration-brand/40 underline-offset-2 hover:decoration-brand">
      {children}
    </a>
  ),
  code: ({ inline, children }) => {
    const isInline = inline ?? !String(children).includes('\n');
    return isInline ? (
      <code className="rounded bg-black/5 px-1.5 py-0.5 font-mono text-[0.8em] font-semibold text-brand dark:bg-white/10">
        {children}
      </code>
    ) : (
      <code className="font-mono text-[0.8em]">{children}</code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-2 overflow-x-auto rounded-lg border border-border bg-canvas p-3 text-xs leading-relaxed">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2 rounded-r-lg border-l-2 border-brand bg-brand/6 px-3 py-2 text-text-muted">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-border" />,
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-surface-2">{children}</thead>,
  tr: ({ children }) => <tr className="border-b border-border last:border-0">{children}</tr>,
  th: ({ children }) => <th className="px-3 py-2 text-left font-bold text-text-primary">{children}</th>,
  td: ({ children }) => <td className="px-3 py-1.5 align-top text-text-secondary">{children}</td>,
};

export function AiveeMarkdown({ content }) {
  return (
    <div className="text-body-sm text-text-secondary">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content || ''}
      </ReactMarkdown>
    </div>
  );
}
