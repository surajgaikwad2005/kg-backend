/**
 * AiveeComposer
 * The input row: text field + send button. Enter sends, Shift+Enter is reserved
 * for future multiline. Accent comes from the cascaded --aivee-accent var.
 */
'use client';
import React from 'react';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/src/lib/utils';
import { ACCENT } from './aivee.theme';

export function AiveeComposer({ value, onChange, onSend, loading, placeholder = 'Ask Aivee anything…' }) {
  const canSend = Boolean(value.trim()) && !loading;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend) onSend();
    }
  };

  return (
    <div className={cn('flex items-center gap-2 rounded-xl border border-border bg-surface-2 py-1.5 pl-3.5 pr-1.5 transition-colors', ACCENT.focus)}>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label="Message Aivee"
        className="flex-1 bg-transparent text-body-sm text-text-primary outline-none placeholder:text-text-subtle"
      />
      <motion.button
        type="button"
        onClick={onSend}
        disabled={!canSend}
        whileTap={canSend ? { scale: 0.94 } : undefined}
        className={cn(
          'flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-caption font-bold text-white transition-opacity',
          canSend ? cn('cursor-pointer', ACCENT.send) : cn('cursor-not-allowed', ACCENT.sendOff),
        )}
      >
        <Send className="h-3 w-3" />
        Send
      </motion.button>
    </div>
  );
}
