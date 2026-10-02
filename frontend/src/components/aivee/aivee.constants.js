/**
 * aivee.constants.js
 * Shared defaults + pure helpers for the reusable <AiveeChatBot /> widget.
 * No React here — safe to import anywhere.
 */

export const AIVEE_AVATAR = '/images/Aivee_1.png';
export const AIVEE_THINKING_AVATAR = '/images/Aivee.gif';

export const DEFAULT_GREETING =
  "Hi! I'm Aivee, your AI assistant. Ask me anything and I'll help you out.";

export const DEFAULT_PLACEHOLDER = 'Ask Aivee anything…';

/**
 * Seed message list. Pass a `greeting` string for the common case, or a full
 * `initialMessages` array to control the opening turn(s).
 */
export function buildInitialMessages(greeting = DEFAULT_GREETING, initialMessages) {
  if (Array.isArray(initialMessages) && initialMessages.length) return initialMessages;
  return [{ id: 'greeting', role: 'avi', content: greeting }];
}

/**
 * Normalize whatever a page's `sendMessage()` resolves to into a chat message.
 * Accepts a plain string, or an object exposing the text under
 * `content | response | text | message`; any extra keys become `meta`.
 */
export function normalizeReply(reply) {
  if (reply == null) return { content: '', meta: {} };
  if (typeof reply === 'string') return { content: reply, meta: {} };

  const { content, response, text, message, ...meta } = reply;
  const raw = content ?? response ?? text ?? message;
  const resolved =
    raw == null ? JSON.stringify(reply, null, 2)
    : typeof raw === 'string' ? raw
    : JSON.stringify(raw, null, 2);

  return { content: resolved, meta };
}
