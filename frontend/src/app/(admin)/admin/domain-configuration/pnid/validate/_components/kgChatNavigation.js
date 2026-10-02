/**
 * kgChatNavigation — resolve which graph node/relationship a chat message is
 * "about" by matching entity names mentioned in the text against the nodes
 * currently in the knowledge graph. Pure + dependency-free so it stays testable
 * and the chatbot adapter stays thin.
 */

// Ignore 1-char aliases so stray letters in prose don't false-match.
const MIN_ALIAS = 2;

/** Candidate identifier strings for a node (the names a user might mention). */
function nodeAliases(node) {
    const p = node.properties || {};
    return [p.name, p.equipment_id, p.tag_name, p.title, node.id]
        .filter((v) => v != null && String(v).trim().length >= MIN_ALIAS)
        .map((v) => String(v).trim());
}

/**
 * Find the node / relationship a message refers to.
 * @param {string} text                 the message content (prompt or reply)
 * @param {{nodes:Array, relationships:Array}} graphData  the live graph
 * @returns {{ type: 'node'|'relationship', id: string } | null}
 */
export function resolveGraphTarget(text, graphData) {
    if (!text || !graphData?.nodes?.length) return null;
    const haystack = String(text).toLowerCase();

    // Score each node by the longest alias that appears in the text — a longer
    // match (e.g. "PUMP-101A") is more specific than a short one (e.g. "P1").
    const hits = [];
    for (const node of graphData.nodes) {
        let best = 0;
        for (const alias of nodeAliases(node)) {
            if (haystack.includes(alias.toLowerCase())) best = Math.max(best, alias.length);
        }
        if (best > 0) hits.push({ id: String(node.id), score: best });
    }
    if (!hits.length) return null;
    hits.sort((a, b) => b.score - a.score);

    // Two entities mentioned with an edge between them → the connection wins.
    if (hits.length >= 2) {
        const [a, b] = hits;
        const rel = (graphData.relationships || []).find((r) => {
            const s = String(r.source);
            const t = String(r.target);
            return (s === a.id && t === b.id) || (s === b.id && t === a.id);
        });
        if (rel) return { type: 'relationship', id: String(rel.id) };
    }
    return { type: 'node', id: hits[0].id };
}
