/**
 * useAiveeChat
 * Headless chat state for <AiveeChatBot />. Owns the message thread, the input
 * buffer and the in-flight request — but stays agnostic about WHICH backend it
 * talks to: the caller supplies `sendMessage`, so every page can wire its own
 * Aivee endpoint (a domain service from src/services/*).
 *
 *   sendMessage(text, { history, signal }) => string | { content|response|text, ...meta }
 */
'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { buildInitialMessages, normalizeReply } from './aivee.constants';

let _seq = 0;
const nextId = () => `m_${Date.now().toString(36)}_${_seq++}`;

export function useAiveeChat({ sendMessage, greeting, initialMessages, onError } = {}) {
  const [messages, setMessages] = useState(() => buildInitialMessages(greeting, initialMessages));
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  // Abort any in-flight request when the host unmounts.
  useEffect(() => () => abortRef.current?.abort(), []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages(buildInitialMessages(greeting, initialMessages));
    setInput('');
    setLoading(false);
  }, [greeting, initialMessages]);

  const send = useCallback(async (textArg) => {
    const text = (typeof textArg === 'string' ? textArg : input).trim();
    if (!text || loading) return;

    if (typeof sendMessage !== 'function') {
      return;
    }

    // Snapshot the thread BEFORE the new turn so the backend sees prior context.
    let history = [];
    setMessages(prev => {
      history = prev.map(({ role, content }) => ({ role, content }));
      return [...prev, { id: nextId(), role: 'user', content: text }];
    });
    setInput('');
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const reply = await sendMessage(text, { history, signal: controller.signal });
      if (controller.signal.aborted) return;
      const { content, meta } = normalizeReply(reply);
      setMessages(prev => [...prev, { id: nextId(), role: 'avi', content, meta }]);
    } catch (err) {
      if (controller.signal.aborted) return;
      onError?.(err);
      setMessages(prev => [...prev, {
        id: nextId(),
        role: 'avi',
        error: true,
        content: `⚠️ ${err?.message || 'Something went wrong. Please try again.'}`,
      }]);
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setLoading(false);
    }
  }, [input, loading, sendMessage, onError]);

  return { messages, input, setInput, loading, send, stop, reset };
}
