import { useEffect, useRef } from 'react';
import { getGraphStyles } from './graphStyles';

export function useCytoscapeInteractions({
    cyRef,
    selectedNode,
    setSelectedId,
    isDark,
    searchQuery
}) {
    const prevSelectedNode = useRef(null);

    useEffect(() => {
        if (!cyRef.current) return;
        const cy = cyRef.current;

        if (!selectedNode) {
            cy.batch(() => {
                cy.elements().unselect();
                cy.elements().removeClass('selection-dim');
            });
            setSelectedId(null);
            if (prevSelectedNode.current && cy.elements().length > 0) {
                cy.animate({
                    fit: { eles: cy.elements(), padding: 120 },
                    duration: 600,
                    easing: 'ease-in-out-cubic'
                });
            }
            prevSelectedNode.current = null;
            return;
        }

        prevSelectedNode.current = selectedNode;
        const id = String(selectedNode.id);
        const el = cy.getElementById(id);
        if (el.length > 0) {
            cy.batch(() => {
                const neighborhood = el.isNode() ? el.neighborhood().add(el) : el.connectedNodes().union(el);
                cy.elements().difference(neighborhood).addClass('selection-dim');
                neighborhood.removeClass('selection-dim');
            });

            if (!el.selected()) {
                cy.elements().unselect();
                el.select();
                setSelectedId(id);
            }
            if (el.isNode()) {
                const zoom = 2.2;
                cy.animate({
                    pan: { x: cy.width() / 2 - el.position().x * zoom, y: cy.height() / 2 - el.position().y * zoom },
                    zoom: zoom,
                    duration: 500,
                    easing: 'ease-in-out-cubic'
                });
            } else {
                cy.animate({
                    fit: { eles: el.connectedNodes().union(el), padding: 120 },
                    duration: 500,
                    easing: 'ease-in-out-cubic'
                });
            }
        }
    }, [selectedNode, setSelectedId]);

    useEffect(() => {
        if (!cyRef.current) return;
        cyRef.current.style(getGraphStyles(isDark));
    }, [isDark]);

    useEffect(() => {
        if (!cyRef.current) return;
        const cy = cyRef.current;
        cy.batch(() => {
            const q = searchQuery.toLowerCase().trim();
            if (!q) {
                cy.elements().removeClass('search-match search-dim');
                return;
            }

            cy.elements().forEach(el => {
                if (el.isNode()) {
                    const name = el.data('name');
                    if (name && name.toLowerCase().includes(q)) {
                        el.addClass('search-match');
                        el.removeClass('search-dim');
                    } else {
                        el.removeClass('search-match');
                        el.addClass('search-dim');
                    }
                } else if (el.isEdge()) {
                    el.addClass('search-dim');
                }
            });
        });
    }, [searchQuery]);
}
