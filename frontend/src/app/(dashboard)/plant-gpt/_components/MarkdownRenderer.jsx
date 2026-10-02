'use client';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function MarkdownRenderer({ content }) {
  const components = {
    p: ({ children }) => (
      <p className="mb-2.5 text-[14px] leading-7 font-normal text-text-secondary">
        {children}
      </p>
    ),
    h1: ({ children }) => (
      <h1 className="my-4 text-[18px] font-extrabold leading-tight text-text-primary">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="my-3.5 text-[16px] font-bold leading-snug text-text-primary">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="my-3 text-[14px] font-bold leading-relaxed text-text-primary">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="my-2.5 text-[13px] font-bold text-text-primary">
        {children}
      </h4>
    ),
    strong: ({ children }) => (
      <strong className="font-bold text-text-primary">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic text-text-muted">{children}</em>
    ),
    ul: ({ children }) => (
      <ul className="my-1 pl-[18px] flex flex-col gap-[3px] list-disc">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="my-1 pl-5 flex flex-col gap-[3px] list-decimal">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="text-[14px] leading-relaxed pl-0.5 text-text-secondary">
        {children}
      </li>
    ),
    code: ({ inline, children, ...props }) => {
      if (inline) {
        return (
          <code className="bg-surface-2 text-highlight px-1.5 py-px rounded-md text-[12.5px] font-mono font-semibold">
            {children}
          </code>
        );
      }
      return (
        <code className="font-mono text-[12px] text-text-secondary">
          {children}
        </code>
      );
    },
    pre: ({ children }) => (
      <pre className="my-2 py-3.5 px-4 bg-canvas border border-border rounded-xl overflow-x-auto text-[12.5px] leading-relaxed font-mono text-text-secondary">
        {children}
      </pre>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-2 px-3.5 py-2.5 bg-highlight/10 border-l-[3px] border-highlight rounded-r-lg text-[13.5px] leading-relaxed text-text-muted">
        {children}
      </blockquote>
    ),
    hr: () => (
      <hr className="border-none border-t border-border my-3" />
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-2.5 rounded-[10px] border border-border">
        <table className="w-full border-collapse text-[12.5px]">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-surface-2">{children}</thead>
    ),
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => (
      <tr className="border-b border-border">{children}</tr>
    ),
    th: ({ children }) => (
      <th className="px-3 py-2 text-left font-bold text-[11.5px] tracking-[0.02em] border-b border-border text-text-primary">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-3 py-[7px] align-top leading-relaxed text-text-secondary">
        {children}
      </td>
    ),
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-highlight underline decoration-highlight/30">
        {children}
      </a>
    ),
  };

  return (
    <div className="w-full">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
