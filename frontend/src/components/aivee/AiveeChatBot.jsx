/**
 * AiveeChatBot
 * Reusable, page-agnostic floating AI assistant. Drop it on any page and pass a
 * `sendMessage` function that talks to THAT page's Aivee endpoint (a service from
 * src/services/*) — everything else (open/close, docked/expanded, thread state,
 * markdown, animations, theming) is handled here.
 *
 * @example
 *   import { AiveeChatBot } from '@/src/components/aivee';
 *   import { askPlantGpt } from '@/src/services/plant-gpt/plantGptService';
 *   import { useApp } from '@/src/context/AppContext';
 *
 *   const { plantId } = useApp();
 *   <AiveeChatBot
 *     title="PlantGPT"
 *     subtitle="Diagnostics assistant"
 *     suggestions={['Why is compressor C-2210 tripping?']}
 *     sendMessage={(text) =>
 *       askPlantGpt(plantId?.id ?? '', { query: text }).then(r => r.data?.response)
 *     }
 *   />
 *
 * Props:
 *   sendMessage   (required) async (text, { history, signal }) => string | { content|response|text, ...meta }
 *   title, subtitle           header copy
 *   status        { label?, tone: 'live'|'online'|'draft'|'idle' } status pill
 *   greeting | initialMessages   opening turn(s)
 *   suggestions   string[]    starter prompts shown on the empty thread
 *   placeholder   input placeholder
 *   avatar, thinkingAvatar     image srcs (defaults to the Aivee artwork)
 *   accent        preset name ('indigo'|'cyan'|'emerald'|…) or raw colour
 *                 ('#0ea5e9'); recolours launcher, header, bubbles, send, etc.
 *   size          'sm' | 'md' | 'lg'   docked-card footprint (default 'md')
 *   position      'bottom-right' | 'bottom-left'
 *   sessions      [{ id, title }]  optional recent-chats rail (expanded view)
 *   open / onOpenChange / defaultOpen   controlled or uncontrolled visibility
 *   showLauncher  render the built-in floating launcher when closed (default
 *                 true). Set false to supply your own trigger via `open`.
 *   enableExpand  allow the expand-to-overlay control (default true)
 *   enableNewChat show the header "new chat" / reset button (default true)
 *   headerActions [{ key?, icon, title, onClick }]  extra header buttons
 *   panelClassName / launcherClassName   escape hatches for bespoke styling
 *   onMessageActivate  (message) => void   fired when a message is double-clicked
 *                      (e.g. to jump somewhere); enables the affordance on bubbles.
 *   messageActivateHint  tooltip shown on activatable bubbles.
 *   onError       (err) => void   notified on a failed turn
 */
'use client';
import React, { useCallback, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/src/lib/utils';
import { AiveeLauncher } from './AiveeLauncher';
import { AiveeWindow } from './AiveeWindow';
import { useAiveeChat } from './useAiveeChat';
import { AIVEE_AVATAR, AIVEE_THINKING_AVATAR, DEFAULT_GREETING, DEFAULT_PLACEHOLDER } from './aivee.constants';

const ANCHOR = {
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6',
};

export function AiveeChatBot({
  sendMessage,
  title = 'Aivee',
  subtitle = 'AI Assistant',
  status,
  greeting = DEFAULT_GREETING,
  initialMessages,
  suggestions = [],
  placeholder = DEFAULT_PLACEHOLDER,
  avatar = AIVEE_AVATAR,
  thinkingAvatar = AIVEE_THINKING_AVATAR,
  accent,
  size = 'md',
  position = 'bottom-right',
  sessions,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  showLauncher = true,
  onMessageActivate,
  messageActivateHint,
  enableExpand = true,
  enableNewChat = true,
  headerActions = [],
  panelClassName,
  launcherClassName,
  onError,
  launcherLabel = 'Open Aivee assistant',
}) {
  const isControlled = openProp !== undefined;
  const [openState, setOpenState] = useState(defaultOpen);
  const open = isControlled ? openProp : openState;

  const setOpen = useCallback((next) => {
    if (!isControlled) setOpenState(next);
    onOpenChange?.(next);
  }, [isControlled, onOpenChange]);

  const [expanded, setExpanded] = useState(false);
  const chat = useAiveeChat({ sendMessage, greeting, initialMessages, onError });
  const anchor = ANCHOR[position] || ANCHOR['bottom-right'];

  return (
    <AnimatePresence>
      {!open ? (
        showLauncher ? (
          <AiveeLauncher
            key="avi-launcher"
            avatar={avatar}
            accent={accent}
            label={launcherLabel}
            onClick={() => setOpen(true)}
            className={cn('fixed z-60', anchor, launcherClassName)}
          />
        ) : null
      ) : (
        <AiveeWindow
          key={expanded ? 'avi-expanded' : 'avi-docked'}
          anchor={anchor}
          expanded={expanded}
          onToggleExpand={enableExpand ? () => setExpanded(e => !e) : undefined}
          onClose={() => setOpen(false)}
          title={title}
          subtitle={subtitle}
          status={status}
          avatar={avatar}
          thinkingAvatar={thinkingAvatar}
          placeholder={placeholder}
          suggestions={suggestions}
          sessions={sessions}
          chat={chat}
          accent={accent}
          size={size}
          enableNewChat={enableNewChat}
          headerActions={headerActions}
          panelClassName={panelClassName}
          onMessageActivate={onMessageActivate}
          messageActivateHint={messageActivateHint}
        />
      )}
    </AnimatePresence>
  );
}
