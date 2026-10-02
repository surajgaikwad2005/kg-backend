import * as d3 from 'd3';

/**
 * Resolves node overlaps and rearranges the graph locally when a node is dragged and released.
 * Pulls all nodes toward their target/current positions but resolves overlaps and enforces link distances.
 * 
 * @param {Object} cy - The Cytoscape instance.
 * @param {Object} positionsRef - Ref storing the map of node positions.
 * @param {string} draggedNodeId - The ID of the node that was dragged (will be pinned).
 * @param {Function} setMapTick - React state setter to trigger graph updates.
 */
export function resolveOverlaps(cy, positionsRef, draggedNodeId, setMapTick) {
    if (!cy) return;

    const cyNodes = cy.nodes();
    const cyEdges = cy.edges();

    if (cyNodes.length === 0) return;

    // Capture initial positions
    const startPosMap = new Map();
    cyNodes.forEach(node => {
        startPosMap.set(node.id(), { ...node.position() });
    });

    // 1. Calculate degrees and setup connections for orbital link distances
    const connections = {};
    const edgesList = cyEdges.map(edge => {
        const s = String(edge.source().id());
        const t = String(edge.target().id());
        connections[s] = connections[s] || [];
        connections[s].push(t);
        connections[t] = connections[t] || [];
        connections[t].push(s);
        return { source: s, target: t };
    });

    const linkDistances = new Map();
    const tracker = {};
    edgesList.forEach(e => {
        const s = e.source;
        const t = e.target;
        const parent = (connections[s]?.length || 0) > (connections[t]?.length || 0) ? s : t;
        tracker[parent] = tracker[parent] || 0;
        tracker[parent] += 1;
        const index = tracker[parent];

        let dist = 140;
        if ((connections[parent]?.length || 0) > 8) {
            if (index <= 8) dist = 140;
            else if (index <= 20) dist = 200;
            else if (index <= 38) dist = 260;
            else dist = 320;
        } else {
            dist = 140;
        }
        linkDistances.set(`${s}-${t}`, dist);
        linkDistances.set(`${t}-${s}`, dist);
    });

    // Identify all moved nodes (the dragged node and its successors)
    const draggedNode = cy.getElementById(draggedNodeId);
    const movedNodes = new Set();
    movedNodes.add(draggedNodeId);
    if (draggedNode.length > 0) {
        draggedNode.successors().nodes().forEach(n => {
            movedNodes.add(n.id());
        });
    }

    // 2. Prepare nodes and links for simulation
    const simNodes = cyNodes.map(node => {
        const id = node.id();
        const pos = startPosMap.get(id);
        const size = node.data('size') || 30;
        const isMoved = movedNodes.has(id);
        const isDragged = id === draggedNodeId;

        return {
            id,
            x: pos.x,
            y: pos.y,
            size,
            // Pin the node if it is NOT a moved node OR if it is the dragged node itself
            fx: (!isMoved || isDragged) ? pos.x : null,
            fy: (!isMoved || isDragged) ? pos.y : null
        };
    });

    const simLinks = edgesList.map(e => ({ source: e.source, target: e.target }));

    // 3. Create simulation with positioning, collision, and link forces
    const simulation = d3.forceSimulation(simNodes)
        .force('link', d3.forceLink(simLinks).id(d => d.id).distance(link => {
            const s = typeof link.source === 'object' ? link.source.id : link.source;
            const t = typeof link.target === 'object' ? link.target.id : link.target;
            return linkDistances.get(`${s}-${t}`) || linkDistances.get(`${t}-${s}`) || 140;
        }).strength(0.8))
        .force('charge', d3.forceManyBody().strength(-80))
        // Stronger positioning force on the dragged node to keep it close to drop position
        .force('x', d3.forceX(d => startPosMap.get(d.id).x).strength(d => d.id === draggedNodeId ? 0.6 : 0.2))
        .force('y', d3.forceY(d => startPosMap.get(d.id).y).strength(d => d.id === draggedNodeId ? 0.6 : 0.2))
        .force('collision', d3.forceCollide().radius(d => Math.max(d.size / 2 + 25, 45)).strength(0.9))
        .stop();

    // 4. Settle the simulation quickly (80 ticks)
    for (let i = 0; i < 80; ++i) {
        simulation.tick();
    }

    // 5. Update cytoscape with animations and store positions in positionsRef
    simNodes.forEach(sn => {
        const node = cy.getElementById(sn.id);
        if (node.length > 0) {
            const startPos = startPosMap.get(sn.id);
            const dx = sn.x - startPos.x;
            const dy = sn.y - startPos.y;
            const distSq = dx * dx + dy * dy;

            // Only animate if the position actually shifted significantly
            if (distSq > 0.5) {
                node.animate({
                    position: { x: sn.x, y: sn.y }
                }, {
                    duration: 400,
                    easing: 'ease-out-quad'
                });
            } else {
                node.position({ x: sn.x, y: sn.y });
            }
            positionsRef.current.set(sn.id, { x: sn.x, y: sn.y });
        }
    });

    // Notify React that positions have changed to sync navigator minimap
    setTimeout(() => {
        setMapTick(t => t + 1);
    }, 450);
}
