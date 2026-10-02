/**
 * RiskTemplateChat / AiveeChat (Risk Template)
 * Thin adapter over the reusable <AiveeChatBot /> widget.
 */
'use client';
import React, { useCallback } from 'react';
import { AiveeChatBot } from '@/src/components/aivee';
import { formatMarkdownForMarkmap } from '../_lib/markdownUtils';
import { sendChat } from '@/src/services/risk-template/riskTemplateService';
import { useApp } from '@/src/context/AppContext';

export function RiskTemplateChat({ templateName, onResult }) {
  const { plantCode } = useApp();
  const sendMessage = useCallback(async (text) => {
    const res = await sendChat({ user_query: text, template_name: templateName }, plantCode);

    if (!res.success) {
      throw new Error(res.message || "Couldn't find relevant information. Try rephrasing your query.");
    }

    const md = res.data?.markdown || '';
    if (!md.trim()) {
      return 'No results found for that query. Try rephrasing, or ask about a different mechanism.';
    }

    onResult?.(formatMarkdownForMarkmap(md, templateName));
    return `✓ Updated the mind map with results for **“${text}”**.`;
  }, [templateName, onResult, plantCode]);

  return (
    <AiveeChatBot
      title="Aivee"
      accent="cyan"
      status={{ tone: 'online' }}
      greeting="Hi, I am Aivee, how can I help you with this Risk Template?"
      placeholder={`Query ${templateName || 'the risk template base'}…`}
      sendMessage={sendMessage}
    />
  );
}

export const AiveeChat = RiskTemplateChat;
