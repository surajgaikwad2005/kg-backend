/**
 * Reusable Aivee chat assistant.
 *
 *   import { AiveeChatBot } from '@/src/components/aivee';
 *
 * Pass a per-page `sendMessage(text, ctx)` to wire it to that page's Aivee API.
 * `useAiveeChat` is exported for advanced callers that want to drive the thread
 * themselves; the lower-level pieces are available for custom layouts.
 */
export { AiveeChatBot } from './AiveeChatBot';
export { useAiveeChat } from './useAiveeChat';
export { AiveeMessage, AiveeTyping } from './AiveeMessage';
export { AiveeComposer } from './AiveeComposer';
export { AiveeLauncher } from './AiveeLauncher';
export { AiveeMarkdown } from './AiveeMarkdown';
export { ACCENT_PRESETS, resolveAccent } from './aivee.theme';
export {
  AIVEE_AVATAR,
  AIVEE_THINKING_AVATAR,
  DEFAULT_GREETING,
  DEFAULT_PLACEHOLDER,
} from './aivee.constants';
