/**
 * AiveeChatbot (Agent Factory)
 * Thin adapter over the reusable <AiveeChatBot /> widget. Its only job is to wire
 * Aivee to THIS page's API: a deployed agent's /agents/{id}/chat endpoint when one
 * exists, or local guidance responses while the agent is still a draft.
 */
'use client';
import React, { useCallback } from 'react';
import { AiveeChatBot } from '@/src/components/aivee';
import { useAgent } from '../_context/AgentContext';
import { useChatWithAgent } from '../_queries/useAgentFactoryQueries';

const MOCK_SESSIONS = [
  { id: 1, title: 'How do I add a scheduler node?' },
  { id: 2, title: 'Connect LLM to output node' },
  { id: 3, title: 'Configuring memory strategy' },
  { id: 4, title: 'Deploy agent to production' },
];

const SUGGESTIONS = [
  'How do I add a model node?',
  'How do I connect two nodes?',
  'What pipeline should I start with?',
];

const DRAFT_RESPONSES = [
  "To add a model node, click the **Models** tab on the left icon rail. Hover over a model to preview its capabilities, then drag it to the canvas or hit 'Add to Canvas'.",
  "Connect nodes by hovering over the bottom handle of any node — a blue dot appears. Drag from it to the top handle of the target node to wire them.",
  "I recommend starting with: **Memory → LLM → Output**. The Memory node stores context, the LLM processes queries, and Output formats the result.",
  "Click any node on the canvas to open its configuration in the **Properties panel** on the right. Adjust model, temperature, max tokens, and more there.",
  "For production, verify your LLM node has a valid model registry key and set your Output node's delivery mode to STREAMING for best performance.",
  "Use **Auto Layout** from the floating toolbar (top-left of the canvas) to automatically arrange your nodes into a clean, readable hierarchy.",
];

const GREETING =
  "Hi! I'm Aivee, your AI flow assistant. I can help you design, configure, and understand your agent pipeline. What would you like to know?";

/** Turn the structured /agents/{id}/chat response into a readable string. */
function formatAgentResponse(res) {
  const r = res?.response;
  if (typeof r === 'string') return r;
  if (r == null) return typeof res === 'string' ? res : JSON.stringify(res, null, 2);
  return JSON.stringify(r, null, 2);
}

export function AiveeChatbot() {
  const { showAivee, openAivee, closeAivee, deployedAgentId, activeAgent } = useAgent();
  const agentId = deployedAgentId || activeAgent?.agent_id || null;
  const isLive = Boolean(agentId);
  const chatMutation = useChatWithAgent();

  // Aivee stays out of the way until the agent is deployed (deploy auto-opens it)
  // or the operator explicitly summons it via the header's "Ask Aivee" button.
  const visible = isLive || showAivee;

  const sendMessage = useCallback(async (text) => {
    // Draft agent — no runtime to call yet, so reply with local guidance.
    if (!isLive) {
      await new Promise(r => setTimeout(r, 700 + Math.random() * 600));
      return DRAFT_RESPONSES[Math.floor(Math.random() * DRAFT_RESPONSES.length)];
    }
    const res = await chatMutation.mutateAsync({ agentId, query: text });
    // Extra keys beyond content/response/text/message land in `message.meta`.
    return { content: formatAgentResponse(res), toolLogs: res?.tool_logs || [] };
  }, [isLive, agentId, chatMutation]);

  if (!visible) return null;

  return (
    <AiveeChatBot
      open={showAivee}
      onOpenChange={(next) => (next ? openAivee() : closeAivee())}
      sendMessage={sendMessage}
      title="Aivee"
      subtitle={isLive ? `Live Agent · ${agentId}` : 'AI Flow Assistant · Draft'}
      status={{ tone: isLive ? 'live' : 'draft' }}
      greeting={GREETING}
      placeholder="Ask Aivee about your agent flow…"
      suggestions={SUGGESTIONS}
      sessions={MOCK_SESSIONS}
    />
  );
}
