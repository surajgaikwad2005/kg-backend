/**
 * AiveeWindow
 * The open chat surface — a docked card (bottom corner) or an expanded overlay
 * with an optional sessions rail. Purely presentational: all chat state arrives
 * through the `chat` prop (the useAiveeChat return), so the conversation survives
 * docked ⇄ expanded transitions. Surfaces use the app's semantic design tokens;
 * the accent (brand) colour is set once via --aivee-accent and cascades to every
 * child, so the widget reskins per page from a single `accent` prop.
 */
'use client';
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { X, Maximize2, Minimize2, MessageSquarePlus, MessageCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { AiveeMessage, AiveeTyping } from './AiveeMessage';
import { AiveeComposer } from './AiveeComposer';
import { ACCENT, accentVars, sizeOf } from './aivee.theme';

const TONE = {
  live: { dot: 'bg-success', text: 'text-success' },
  online: { dot: 'bg-success', text: 'text-success' },
  draft: { dot: ACCENT.dot, text: ACCENT.text },
  idle: { dot: 'bg-text-subtle', text: 'text-text-subtle' },
};

const PANEL = 'flex flex-col overflow-hidden border border-border bg-surface shadow-modal';

function HeaderBtn({ onClick, title, danger, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={cn(
        'flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface-2 text-text-subtle transition-colors',
        danger
          ? 'hover:border-danger/40 hover:bg-danger/10 hover:text-danger'
          : 'hover:text-text-primary',
      )}
    >
      {children}
    </button>
  );
}

export function AiveeWindow({
  anchor, expanded, onToggleExpand, onClose,
  title, subtitle, status, avatar, thinkingAvatar,
  placeholder, suggestions = [], sessions, chat,
  onMessageActivate, messageActivateHint,
  accent, size, enableNewChat = true, headerActions = [], panelClassName,
}) {
  const { messages, input, setInput, loading, send, reset } = chat;
  const tone = TONE[status?.tone] || TONE.idle;
  const isEmpty = messages.length <= 1;
  const hasSessions = Array.isArray(sessions) && sessions.length > 0;

  const [activeSession, setActiveSession] = useState(sessions?.[0]?.id ?? null);
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ── Header ──────────────────────────────────────────────────────────────
  const header = (
    <div className="flex shrink-0 items-center gap-2.5 border-b border-border bg-surface px-3.5 py-3">
      <div className={cn('h-9 w-9 shrink-0 overflow-hidden rounded-full border-2', ACCENT.ring)}>
        <Image src={thinkingAvatar} alt={title} width={36} height={36} className="h-full w-full object-cover" unoptimized />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-body-sm font-extrabold text-text-primary">{title}</p>
        <p className={cn('flex items-center gap-1.5 truncate text-label font-semibold', tone.text)}>
          <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', tone.dot)} />
          {status?.label || subtitle}
        </p>
      </div>
      {headerActions.map((a) => (
        <HeaderBtn key={a.key || a.title} onClick={a.onClick} title={a.title}>{a.icon}</HeaderBtn>
      ))}
      {enableNewChat && (
        <HeaderBtn onClick={reset} title="New chat"><MessageSquarePlus className="h-3.5 w-3.5" /></HeaderBtn>
      )}
      {onToggleExpand && (
        <HeaderBtn onClick={onToggleExpand} title={expanded ? 'Collapse' : 'Expand'}>
          {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </HeaderBtn>
      )}
      <HeaderBtn onClick={onClose} title="Close" danger><X className="h-3.5 w-3.5" /></HeaderBtn>
    </div>
  );

  // ── Scrollable thread (+ empty-state suggestions) ─────────────────────────
  const thread = (
    <div className="thin-scrollbar flex-1 space-y-3.5 overflow-y-auto bg-surface px-4 py-4">
      {messages.map(m => (
        <AiveeMessage
          key={m.id}
          message={m}
          avatar={avatar}
          onActivate={onMessageActivate}
          activateHint={messageActivateHint}
        />
      ))}

      {isEmpty && suggestions.length > 0 && (
        <div className="flex flex-col gap-2 pt-1">
          {suggestions.map((q, i) => (
            <motion.button
              key={i}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.05 }}
              onClick={() => send(q)}
              className={cn('cursor-pointer rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-left text-caption font-medium text-text-secondary transition-colors', ACCENT.suggestHover)}
            >
              {q}
            </motion.button>
          ))}
        </div>
      )}

      {loading && <AiveeTyping thinkingAvatar={thinkingAvatar} />}
      <div ref={bottomRef} />
    </div>
  );

  const composer = (
    <div className="shrink-0 border-t border-border bg-surface px-3.5 py-3">
      <AiveeComposer value={input} onChange={setInput} onSend={() => send()} loading={loading} placeholder={placeholder} />
    </div>
  );

  const motionProps = {
    initial: { opacity: 0, y: 18, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 18, scale: 0.97 },
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  };

  // ── Expanded overlay ──────────────────────────────────────────────────────
  if (expanded) {
    return (
      <motion.div
        {...motionProps}
        style={accentVars(accent)}
        className={cn(PANEL, 'fixed left-1/2 top-1/2 z-60 h-[80vh] w-[min(900px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl', panelClassName)}
      >
        {header}
        <div className="flex flex-1 overflow-hidden">
          {hasSessions && (
            <aside className="thin-scrollbar flex w-52 shrink-0 flex-col gap-1 overflow-y-auto border-r border-border bg-canvas p-2.5">
              <button
                type="button"
                onClick={reset}
                className={cn('flex w-full cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-caption font-bold transition-colors', ACCENT.sessionNew)}
              >
                <MessageSquarePlus className="h-3.5 w-3.5" /> New Chat
              </button>
              <p className="mt-2.5 px-1 pb-1 text-2xs font-bold uppercase tracking-wider text-text-subtle">Recent</p>
              <div className="flex flex-col gap-0.5">
                {sessions.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveSession(s.id)}
                    className={cn(
                      'flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-caption transition-colors',
                      s.id === activeSession
                        ? 'bg-surface-2 text-text-primary'
                        : 'text-text-muted hover:bg-surface-2/60',
                    )}
                  >
                    <MessageCircle className={cn('h-3 w-3 shrink-0', s.id === activeSession ? ACCENT.text : 'text-text-subtle')} />
                    <span className="truncate">{s.title}</span>
                  </button>
                ))}
              </div>
            </aside>
          )}
          <div className="flex flex-1 flex-col overflow-hidden bg-surface">
            {thread}
            {composer}
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Docked card ───────────────────────────────────────────────────────────
  return (
    <motion.div
      {...motionProps}
      style={accentVars(accent)}
      className={cn(PANEL, 'fixed z-60 max-h-[80vh] max-w-[calc(100vw-2rem)] rounded-2xl', sizeOf(size).docked, anchor, panelClassName)}
    >
      {header}
      {thread}
      {composer}
    </motion.div>
  );
}
