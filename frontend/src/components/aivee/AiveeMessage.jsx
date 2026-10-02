/**
 * AiveeMessage / AiveeTyping
 * Presentational chat bubbles. Aivee turns render markdown; user turns render as
 * plain pre-wrapped text. `message.meta.toolLogs` (if a page returns it) shows
 * as a small monospace trace under the bubble. Accent colours come from the
 * cascaded --aivee-accent var. Double-click activation (onActivate) lets a page
 * "jump to" whatever a bubble references.
 */
'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/src/lib/utils';
import { AiveeMarkdown } from './AiveeMarkdown';
import { AIVEE_AVATAR, AIVEE_THINKING_AVATAR } from './aivee.constants';
import { ACCENT } from './aivee.theme';

export function AiveeMessage({ message, avatar = AIVEE_AVATAR, onActivate, activateHint }) {
  const isAvi = message.role === 'avi';
  const canActivate = typeof onActivate === 'function' && !message.error;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={cn('flex items-start gap-2.5', isAvi ? 'flex-row' : 'flex-row-reverse')}
    >
      {isAvi ? (
        <div className={cn('mt-0.5 h-8 w-8 shrink-0 overflow-hidden rounded-full border-2', ACCENT.ringSoft)}>
          <Image src={avatar} alt="Aivee" width={32} height={32} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-caption font-extrabold text-white', ACCENT.dot)}>
          U
        </div>
      )}

      <div
        onDoubleClick={canActivate ? () => onActivate(message) : undefined}
        title={canActivate ? activateHint : undefined}
        className={cn(
          'max-w-[78%] wrap-break-word border px-3.5 py-2.5 text-body-sm leading-relaxed',
          isAvi
            ? 'rounded-[4px_14px_14px_14px] border-border bg-surface-2 text-text-secondary'
            : cn('whitespace-pre-wrap rounded-[14px_4px_14px_14px]', ACCENT.userBubble),
          message.error && 'border-danger/40 bg-danger/8 text-danger',
          canActivate && cn('cursor-pointer select-none transition-colors', ACCENT.activateHover),
        )}
      >
        {isAvi ? <AiveeMarkdown content={message.content} /> : message.content}

        {message.meta?.toolLogs?.length > 0 && (
          <div className="mt-1.5 flex flex-col gap-0.5 border-t border-border pt-1.5 font-mono text-2xs text-text-subtle">
            {message.meta.toolLogs.map((log, i) => (
              <span key={i}>↳ {log}</span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function AiveeTyping({ thinkingAvatar = AIVEE_THINKING_AVATAR }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className={cn('mt-0.5 h-8 w-8 shrink-0 overflow-hidden rounded-full border-2', ACCENT.ringSoft)}>
        <Image src={thinkingAvatar} alt="Aivee thinking" width={32} height={32} className="h-full w-full object-cover" unoptimized />
      </div>
      <div className={cn('flex items-center gap-1.5 rounded-[4px_14px_14px_14px] border px-3.5 py-3', ACCENT.typingBubble)}>
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.16, ease: 'easeInOut' }}
            className={cn('h-1.5 w-1.5 rounded-full', ACCENT.dot)}
          />
        ))}
      </div>
    </div>
  );
}
