/**
 * Registers drag wave animation event listeners on the Cytoscape instance.
 * Manages the physics-based spring-damper animation for children when a parent node is dragged.
 * Calls onDragRelease when dragging stops to trigger local overlap resolution.
 * 
 * @param {Object} cy - The Cytoscape instance.
 * @param {Object} positionsRef - Ref to store node positions.
 * @param {Function} setMapTick - React state setter to trigger graph updates.
 * @param {Function} onDragRelease - Callback invoked when a node drag stops.
 * @returns {Function} cleanup - Function to unregister listeners and cancel animations.
 */
export function registerDragWaveAnimation(cy, positionsRef, setMapTick, onDragRelease) {
    let activeDrag = null;
    let isDragging = false;
    let animationFrameId = null;

    // Wave Animation: Trailing spring-damper physics integration loop for descendants
    const animateChildren = () => {
        if (!activeDrag) {
            animationFrameId = null;
            return;
        }

        const parentPos = activeDrag.parent.position();
        const parentDispX = parentPos.x - activeDrag.startParentPos.x;
        const parentDispY = parentPos.y - activeDrag.startParentPos.y;
        let allConverged = true;

        activeDrag.children.forEach(child => {
            const targetX = child.initialChildPos.x + parentDispX;
            const targetY = child.initialChildPos.y + parentDispY;

            const dx = targetX - child.currentPos.x;
            const dy = targetY - child.currentPos.y;

            // Spring physics force propagation (stiffness decreases with depth)
            const ax = dx * child.stiffness;
            const ay = dy * child.stiffness;

            child.vx = (child.vx + ax) * child.damping;
            child.vy = (child.vy + ay) * child.damping;

            child.currentPos.x += child.vx;
            child.currentPos.y += child.vy;

            const speedSq = child.vx * child.vx + child.vy * child.vy;
            const distSq = dx * dx + dy * dy;

            if (speedSq < 0.0001 && distSq < 0.01) {
                child.currentPos.x = targetX;
                child.currentPos.y = targetY;
                child.vx = 0;
                child.vy = 0;
            } else {
                allConverged = false;
            }

            child.node.position(child.currentPos);
            positionsRef.current.set(child.node.id(), { ...child.currentPos });
        });

        // Force Cytoscape to redraw the viewport canvas immediately
        cy.forceRender();

        if (isDragging || !allConverged) {
            animationFrameId = requestAnimationFrame(animateChildren);
        } else {
            activeDrag = null;
            animationFrameId = null;
            setMapTick(t => t + 1); // Sync final positions once converged
        }
    };

    // Grab event triggers directed wave propagation and logs initial positions
    const handleGrab = (evt) => {
        const grabbedNode = evt.target;
        if (activeDrag) {
            const prevParentPos = activeDrag.parent.position();
            const prevStartParentPos = activeDrag.startParentPos;
            const prevDispX = prevParentPos.x - prevStartParentPos.x;
            const prevDispY = prevParentPos.y - prevStartParentPos.y;

            activeDrag.children.forEach(child => {
                const finalX = child.initialChildPos.x + prevDispX;
                const finalY = child.initialChildPos.y + prevDispY;
                child.node.position({ x: finalX, y: finalY });
                positionsRef.current.set(child.node.id(), { x: finalX, y: finalY });
            });
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        }

        // Target only downstream descendants (children and grandchildren recursively)
        const descendants = grabbedNode.successors().nodes();
        if (descendants.length === 0) return;

        // Compute depth hierarchy of descendants using directed Dijkstra from root
        const dijkstra = cy.elements().dijkstra({ root: grabbedNode, directed: true });

        const parentPos = grabbedNode.position();
        const children = [];

        descendants.forEach(child => {
            const depth = dijkstra.distanceTo(child);
            if (depth !== Infinity && !isNaN(depth)) {
                const childPos = child.position();
                // Logarithmic stiffness scaling with low baseline for a slow, log-time wave effect
                const stiffness = 0.02 / Math.log2(depth + 1.2);
                const damping = 0.84; // High damping/momentum for fluid, long-tail water wave look

                children.push({
                    node: child,
                    initialChildPos: { x: childPos.x, y: childPos.y },
                    currentPos: { x: childPos.x, y: childPos.y },
                    vx: 0,
                    vy: 0,
                    stiffness,
                    damping
                });
            }
        });

        if (children.length === 0) return;

        activeDrag = {
            parent: grabbedNode,
            startParentPos: { x: parentPos.x, y: parentPos.y },
            children
        };
        isDragging = true;

        if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(animateChildren);
        }
    };

    const handleFree = (evt) => {
        if (activeDrag && activeDrag.parent.id() === evt.target.id()) {
            isDragging = false;
        }
    };

    const handleDragFree = (evt) => {
        const node = evt.target;

        // Force-stop drag wave animation on drag release
        if (activeDrag) {
            activeDrag.children.forEach(child => {
                positionsRef.current.set(child.node.id(), child.node.position());
            });
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            activeDrag = null;
            isDragging = false;
        }

        positionsRef.current.set(node.id(), node.position());
        
        // Run overlap resolution simulation
        if (onDragRelease) {
            onDragRelease(node.id());
        }
    };

    cy.on('grab', 'node', handleGrab);
    cy.on('free', 'node', handleFree);
    cy.on('dragfree', 'node', handleDragFree);

    return () => {
        cy.off('grab', 'node', handleGrab);
        cy.off('free', 'node', handleFree);
        cy.off('dragfree', 'node', handleDragFree);
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
    };
}
