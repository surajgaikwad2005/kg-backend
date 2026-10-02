'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Sparkles, Bot, User, Terminal } from 'lucide-react';
import { useAgent } from '../_context/AgentContext';
import { useTheme } from '@/src/context/visuals/ThemeContext';
import { useChatWithAgent } from '../_queries/useAgentFactoryQueries';

/** Turn the structured /agents/{id}/chat response into a readable bubble. */
function formatAgentResponse(res) {
  const r = res?.response;
  if (typeof r === 'string') return r;
  if (r == null) return typeof res === 'string' ? res : JSON.stringify(res, null, 2);
  return JSON.stringify(r, null, 2);
}

export function ChatSandbox() {
  const { activeAgent, deployedAgentId } = useAgent();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatMutation = useChatWithAgent();
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const agentId = deployedAgentId || activeAgent?.agent_id || null;
  const loading = chatMutation.isPending;

  const sendMessage = async () => {
    const query = input.trim();
    if (!query || loading) return;
    setMessages(prev => [...prev, { role: 'user', content: query, ts: Date.now() }]);
    setInput('');

    if (!agentId) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Deploy this agent first (click "Deploy Agent" in the header), then I can route your query through the live tools.', ts: Date.now() }]);
      return;
    }

    chatMutation.mutate(
      { agentId, query },
      {
        onSuccess: (res) => {
          setMessages(prev => [...prev, { role: 'assistant', content: formatAgentResponse(res), toolLogs: res?.tool_logs || [], ts: Date.now() }]);
        },
        onError: (e) => {
          setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${e?.message || 'The agent could not be reached.'}`, ts: Date.now() }]);
        },
      }
    );
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  const isDraft = !agentId;

  return (
    <div className="h-[290px] flex flex-col shrink-0 bg-canvas border-t border-border">

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 h-[38px] shrink-0 border-b border-border">
        <div className="flex items-center gap-2">
          <Terminal size={12} className="text-text-subtle" />
          <span className="text-[10px] font-extrabold tracking-[0.1em] uppercase text-text-subtle">Agent</span>
          <span className={`text-[10px] font-extrabold tracking-[0.1em] uppercase ${isDraft ? 'text-warning' : 'text-success'}`}>
            {isDraft ? 'Draft' : 'Live'}
          </span>
          <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-text-subtle/60">Sandbox</span>
          {activeAgent && (
            <>
              <span className="text-xs text-text-subtle/60">·</span>
              <span className="text-[10px] font-mono text-text-subtle/60">ID: {activeAgent.id}</span>
            </>
          )}
        </div>
        <button
          onClick={() => setMessages([])}
          className="flex items-center gap-1.5 py-[3px] px-2.5 rounded-md text-[10px] font-bold tracking-[0.08em] uppercase bg-transparent cursor-pointer transition-all text-text-subtle border border-border hover:text-danger hover:border-danger/30"
        >
          <Trash2 size={11} />
          Wipe Logs
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2.5 px-4 flex flex-col gap-2.5">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-2.5">
            <div className="w-[38px] h-[38px] rounded-xl flex items-center justify-center bg-brand/10 border border-brand/20">
              <Sparkles size={17} className="text-brand" />
            </div>
            <div>
              <p className="m-0 text-xs font-bold text-text-subtle">AI Sandbox Environment</p>
              <p className="mt-1 mb-0 text-[11px] leading-[1.6] text-text-subtle/60">
                Configure parameters on the canvas above and click{' '}
                <span className="font-semibold text-brand">Deploy Agent</span>, then chat here to test live tool routing.
              </p>
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.ts} className={`flex gap-2 items-start ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-6 h-6 rounded-full shrink-0 mt-0.5 flex items-center justify-center border ${msg.role === 'user' ? 'bg-brand/15 border-brand/30' : 'bg-success/15 border-success/30'}`}>
                {msg.role === 'user' ? <User size={12} className="text-brand" /> : <Bot size={12} className="text-success" />}
              </div>
              <div className={`max-w-[82%] py-2 px-3 text-[11px] leading-[1.65] whitespace-pre-wrap break-words border ${msg.role === 'user' ? 'rounded-[12px_4px_12px_12px] bg-brand/10 border-brand/20 text-brand' : 'rounded-[4px_12px_12px_12px] bg-surface border-border text-text-secondary'}`}>
                {msg.content}
                {msg.toolLogs?.length > 0 && (
                  <div className="mt-1.5 pt-1.5 border-t border-border text-[9px] font-mono flex flex-col gap-0.5 text-text-subtle">
                    {msg.toolLogs.map((log, i) => <span key={i}>↳ {log}</span>)}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-2 items-start">
            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border bg-success/15 border-success/30">
              <Bot size={12} className="text-success" />
            </div>
            <div className="py-2.5 px-3.5 rounded-[4px_12px_12px_12px] flex gap-1 items-center bg-surface border border-border">
              {[0, 0.18, 0.36].map((delay, i) => (
                <div key={i} style={{ '--dot-delay': `${delay}s` }} className="w-1.5 h-1.5 rounded-full bg-text-subtle animate-bounce [animation-delay:var(--dot-delay)] [animation-duration:1.2s]" />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-[8px_14px_10px] shrink-0">
        <div
          className="flex items-center gap-2 p-[6px_6px_6px_12px] rounded-xl transition-colors border bg-surface border-border focus-within:border-brand/40"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type stock details, support issues, questions or arithmetic instructions..."
            className="flex-1 bg-transparent border-none outline-none text-[11px] text-text-primary"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-[9px] text-[11px] font-bold text-white border-none shrink-0 transition-opacity ${!input.trim() || loading ? 'bg-brand/30 cursor-not-allowed' : 'bg-gradient-to-br from-brand to-highlight cursor-pointer'}`}
          >
            <Send size={12} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
