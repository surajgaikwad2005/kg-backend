'use client';

/**
 * PnidKgAiveeChatbot — wires the reusable <AiveeChatBot /> to the P&ID knowledge
 * graph. Questions go to the KG chat API (knowledgeGraphService.ask); a
 * double-click on any message jumps the canvas to the node/connection it
 * mentions, resolved against the live graph via resolveGraphTarget + the KG
 * window focus bridge (window.__kgFocusNode / __kgFocusEdge from KG.jsx).
 *
 * Rendered at the validate-step level so it's always available on that page. The
 * floating launcher is the primary entry point; the KGToolbar "Ask Aivee" button
 * is a secondary trigger — both drive the same `showKgAivee` state.
 */
import React, { useCallback, useMemo } from 'react';
import { AiveeChatBot } from '@/src/components/aivee';
import { useValidateContext } from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_context/ValidateContext';
import { knowledgeGraphService } from '@/src/services/domain-configuration/pnid/knowledgeGraphChatService';
import { resolveGraphTarget } from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_components/kgChatNavigation';
import { useApp } from '@/src/context/AppContext';

const GREETING =
    "Hi! I'm Aivee. Ask me anything about this P&ID knowledge graph — equipment, tags, or how things connect. Tip: double-click any message to jump to the node or connection we're discussing.";

/** Pull the answer text out of whatever shape the chat endpoint returns. */
function extractAnswer(res) {
    if (res == null) return "I couldn't find an answer for that.";
    if (typeof res === 'string') return res;
    return (
        res.response ?? res.answer ?? res.content ?? res.message ??
        JSON.stringify(res, null, 2)
    );
}

export default function PnidKgAiveeChatbot() {
    const { showKgAivee, setShowKgAivee, kgGraphData } = useValidateContext();
    // Explicit plantCode — the service no longer reads it from localStorage.
    const { plantCode } = useApp();

    // A couple of graph-aware starter prompts (fall back to a generic one).
    const suggestions = useMemo(() => {
        const names = (kgGraphData?.nodes || [])
            .map((n) => n.properties?.name || n.properties?.equipment_id || n.properties?.tag_name || n.properties?.pipe_id || n.properties?.reference_no || n.properties?.notification_id || n.properties?.aif_id || n.properties?.title || n.id)
            .filter(Boolean);
        const list = ['Which equipment has the most connections?'];
        if (names[0]) list.push(`What is connected to ${names[0]}?`);
        if (names[1]) list.push(`Explain the role of ${names[1]} in this system.`);
        return list;
    }, [kgGraphData]);

    const sendMessage = useCallback(async (text, { history, signal }) => {
        const res = await knowledgeGraphService.ask(plantCode, text, history, { signal });
        return extractAnswer(res);
    }, []);

    // Double-click a bubble → locate + center the node/connection it talks about.
    const handleActivate = useCallback((message) => {
        const target = resolveGraphTarget(message?.content, kgGraphData);
        if (!target) return;
        const focused = target.type === 'relationship'
            ? window.__kgFocusEdge?.(target.id)
            : window.__kgFocusNode?.(target.id);
        // A relationship can fail to frame (e.g. capped nodes) — fall back to a node.
        if (!focused && target.type === 'relationship') window.__kgFocusNode?.(target.id);
    }, [kgGraphData]);

    return (
        <AiveeChatBot
            open={showKgAivee}
            onOpenChange={setShowKgAivee}
            showLauncher
            sendMessage={sendMessage}
            onMessageActivate={handleActivate}
            messageActivateHint="Double-click to locate this in the graph"
            title="Aivee"
            subtitle="Knowledge Graph Assistant"
            accent="emerald"
            status={{ tone: 'online', label: 'KG Assistant' }}
            greeting={GREETING}
            placeholder="Ask about this knowledge graph…"
            suggestions={suggestions}
        />
    );
}
