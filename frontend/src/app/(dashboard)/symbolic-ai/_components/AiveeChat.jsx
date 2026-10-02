/**
 * AiveeChat (Symbolic AI)
 * Thin adapter over the reusable <AiveeChatBot /> widget. Shows the Aivee launcher
 * on the rule-detail screen and wires it to THIS page's API: each query hits the
 * symbolic-ai chat endpoint, and a successful result refreshes the mind map via
 * `onResult` while Aivee confirms in-thread.
 */
'use client';
import React, { useCallback } from 'react';
import { AiveeChatBot } from '@/src/components/aivee';
import { formatMarkdownForMarkmap } from '../_lib/markdownUtils';
import { sendChat } from '@/src/services/symbolic-ai/symbolicAiService';
import { useApp } from '@/src/context/AppContext';

export function AiveeChat({ ruleName, onResult }) {
  const { plantCode } = useApp();
  const sendMessage = useCallback(async (text) => {
    const res = await sendChat({ user_query: text, dashboard_name: ruleName }, plantCode);

    if (!res.success) {
      throw new Error(res.message || "Couldn't find relevant information. Try rephrasing your query.");
    }

    const md = res.data?.markdown || '';
    if (!md.trim()) {
      return 'No results found for that query. Try rephrasing, or ask about a different mechanism.';
    }

    onResult?.(formatMarkdownForMarkmap(md, ruleName));
    return `✓ Updated the mind map with results for **“${text}”**.`;
  }, [ruleName, onResult, plantCode]);

  return (
    <AiveeChatBot
      title="Aivee"
      // subtitle={ruleName ? `Querying · ${ruleName}` : 'Rule-base assistant'}
      accent="cyan"
      status={{ tone: 'online' }}
      greeting={`Hi, I am Aivee, how can I help you?`}
      placeholder={`Query ${ruleName || 'the knowledge base'}…`}
      sendMessage={sendMessage}
    />
  );
}
