import * as d3 from 'd3';

/**
 * applyForceLayout - Settle node positions with a force simulation. 
 * Nodes whose id is present in `fixed` are pinned to their existing positions.
 */
export function applyForceLayout(nodes, edges, width, height, fixed, anchorId) {
    return new Promise((resolve) => {
        // Count connections per node to identify degree / hub nodes
        const connections = {};
        edges.forEach(e => {
            const s = String(e.source);
            const t = String(e.target);
            connections[s] = connections[s] || [];
            connections[s].push(t);
            connections[t] = connections[t] || [];
            connections[t].push(s);
        });

        // Determine dynamic concentric ring index for each node
        const linkDistances = new Map();
        const tracker = {};
        edges.forEach(e => {
            const s = String(e.source);
            const t = String(e.target);
            // Identify which endpoint is the hub (parent) based on degrees
            const parent = (connections[s]?.length || 0) > (connections[t]?.length || 0) ? s : t;
            tracker[parent] = tracker[parent] || 0;
            tracker[parent] += 1;
            const index = tracker[parent];

            // Distribute siblings into concentric orbital rings
            let dist = 140;
            if ((connections[parent]?.length || 0) > 8) {
                if (index <= 8) dist = 140; // Ring 1
                else if (index <= 20) dist = 200; // Ring 2
                else if (index <= 38) dist = 260; // Ring 3
                else dist = 320; // Ring 4
            } else {
                dist = 140; // Standard distance for sparse connections
            }

            linkDistances.set(`${s}-${t}`, dist);
            linkDistances.set(`${t}-${s}`, dist);
        });

        // Map initial nodes, initializing starting coordinates of new child nodes
        // on their correct concentric orbits to prevent center-clustering overlaps.
        const simNodes = nodes.map((n) => {
            const pos = fixed?.get(n.id) || fixed?.get(String(n.id));
            if (anchorId && String(n.id) === String(anchorId)) {
                return { ...n, x: pos?.x ?? width / 2, y: pos?.y ?? height / 2, fx: pos?.x ?? width / 2, fy: pos?.y ?? height / 2 };
            } else if (pos) {
                // Initialize at current position and pin (fx/fy) so existing nodes don't shift/reshape
                return { ...n, x: pos.x, y: pos.y, fx: pos.x, fy: pos.y };
            } else {
                // Find all connected nodes that are already fixed/existing
                const fixedConnections = [];
                edges.forEach(e => {
                    if (String(e.source) === String(n.id) && fixed?.has(String(e.target))) {
                        fixedConnections.push({ id: String(e.target), pos: fixed.get(String(e.target)) });
                    } else if (String(e.target) === String(n.id) && fixed?.has(String(e.source))) {
                        fixedConnections.push({ id: String(e.source), pos: fixed.get(String(e.source)) });
                    }
                });

                if (fixedConnections.length > 0) {
                    // Average parent positions
                    const avgX = fixedConnections.reduce((sum, c) => sum + c.pos.x, 0) / fixedConnections.length;
                    const avgY = fixedConnections.reduce((sum, c) => sum + c.pos.y, 0) / fixedConnections.length;

                    // Compute maximum orbital distance assigned to links connected to this node
                    let targetDist = 240;
                    fixedConnections.forEach(fc => {
                        const dist = linkDistances.get(`${n.id}-${fc.id}`) || linkDistances.get(`${fc.id}-${n.id}`);
                        if (dist && dist > targetDist) targetDist = dist;
                    });

                    // Distribute deterministically around parent to avoid initial clustering
                    const siblingIdx = tracker[n.id] || (Math.abs(n.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 36);
                    const angle = (siblingIdx * 0.618033988749895 * 2 * Math.PI); // Golden ratio spiral distribution
                    return {
                        ...n,
                        x: avgX + Math.cos(angle) * targetDist,
                        y: avgY + Math.sin(angle) * targetDist
                    };
                }

                return { ...n };
            }
        });
        const simLinks = edges.map(e => ({ source: e.source, target: e.target }));

        const simulation = d3.forceSimulation(simNodes)
            .force('link', d3.forceLink(simLinks).id(d => d.id).distance(link => {
                const s = typeof link.source === 'object' ? link.source.id : link.source;
                const t = typeof link.target === 'object' ? link.target.id : link.target;
                const dist = linkDistances.get(`${s}-${t}`) || linkDistances.get(`${t}-${s}`) || 140;
                return dist;
            }))
            .force('charge', d3.forceManyBody().strength(-160).theta(0.9)) // Fast Barnes-Hut approximation
            .force('x', d3.forceX(width / 2).strength(0.08)) // Pull disconnected elements to center horizontally
            .force('y', d3.forceY(height / 2).strength(0.08)) // Pull disconnected elements to center vertically
            // Only apply center force on the initial layout (when fixed is empty or has no keys)
            .force('center', (!fixed || fixed.size === 0) ? d3.forceCenter(width / 2, height / 2) : null)
            // Collision radius scales with orb size so nodes don't overlap (min radius 35px).
            .force('collision', d3.forceCollide().radius(d => (d.data?.size ? Math.max(d.data.size / 2 + 15, 35) : 35)))
            .stop();

        // High-efficiency tick count: evenly distributed initial coordinates allow settling in 25-45 ticks
        const maxTicks = nodes.length > 200 ? 25 : nodes.length > 80 ? 35 : 50;
        for (let i = 0; i < maxTicks; ++i) simulation.tick();

        const positionedNodes = nodes.map((n, i) => ({
            ...n,
            position: { x: simNodes[i].x, y: simNodes[i].y }
        }));

        resolve(positionedNodes);
    });
}
