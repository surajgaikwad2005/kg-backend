export const getGraphStyles = (isDark = false) => [
    {
        selector: 'core',
        style: {
            'active-bg-opacity': 0,
        }
    },
    {
        selector: 'node',
        style: {
            'shape': 'ellipse',
            'width': 'data(size)',
            'height': 'data(size)',
            'background-color': 'data(color)',
            'border-width': 2.5,
            'border-color': 'data(customBorderColor)',
            'label': 'data(name)',
            'color': isDark ? '#f8fafc' : '#0f172a',
            'font-size': '11px',
            'font-weight': 'bold',
            'text-valign': 'bottom',
            'text-margin-y': '8px',
            'text-max-width': '100px',
            'text-wrap': 'ellipsis',
            'font-family': 'Inter, Roboto, sans-serif',
            'text-background-color': isDark ? '#0f172a' : '#ffffff',
            'text-background-opacity': 0.85,
            'text-background-padding': '2px 4px',
            'text-background-shape': 'roundrectangle',
            'overlay-opacity': 0,
            'transition-property': 'background-color, border-color, border-width, color, width, height',
            'transition-duration': '0.2s',
        }
    },
    {
        selector: 'node.hover',
        style: {
            'border-color': '#0284c7',
            'border-width': 1.2,
            'overlay-opacity': 0,
        }
    },
    {
        selector: 'node:selected',
        style: {
            'width': ele => (Number(ele.data('size')) || 25) + 12,
            'height': ele => (Number(ele.data('size')) || 25) + 12,
            'border-width': 3.0,
            'border-color': '#efda47',
            'color': isDark ? '#38bdf8' : '#0284c7',
            'font-weight': 'bold',
            'text-background-color': isDark ? '#1e293b' : '#f8fafc',
            'text-background-opacity': 0.95,
            'text-background-padding': '2px 4px',
            'text-background-shape': 'roundrectangle',
            'overlay-opacity': 0,
        }
    },
    {
        selector: 'edge',
        style: {
            'width': 2.0,
            'line-color': 'data(color)',
            'target-arrow-color': 'data(color)',
            'target-arrow-shape': 'triangle',
            'arrow-scale': 0.9,
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '9px',
            'font-weight': 'bold',
            'color': isDark ? '#94a3b8' : '#64748b',
            'text-background-opacity': 0.90,
            'text-background-color': isDark ? '#0f172a' : '#ffffff',
            'text-background-padding': '2px 4px',
            'text-background-shape': 'roundrectangle',
            'text-rotation': 'autorotate',
            'opacity': 0.85,
            'overlay-opacity': 0,
        }
    },
    {
        selector: 'edge:selected',
        style: {
            'line-color': 'data(color)',
            'target-arrow-color': 'data(color)',
            'width': 4.0,
            'color': 'data(color)',
            'font-weight': 'bold',
            'text-background-color': isDark ? '#1e293b' : '#f1f5f9',
            'text-background-opacity': 1.0,
            'opacity': 1.0,
            'overlay-opacity': 0,
        }
    },
    {
        selector: 'node.search-match',
        style: {
            'border-color': '#eab308',
            'border-width': 2.5,
            'background-color': isDark ? '#eab308' : '#fef08a',
            'color': isDark ? '#ffffff' : '#000000',
            'font-weight': 'bold',
            'font-size': '8px',
            'text-background-color': isDark ? '#1e293b' : '#f8fafc',
            'text-background-opacity': 0.95,
            'text-background-padding': '2px 4px',
            'text-background-shape': 'roundrectangle',
        }
    },
    {
        selector: 'node.search-dim, node.selection-dim',
        style: {
            'opacity': 0.15,
            'text-opacity': 0,
            'border-opacity': 0.15,
        }
    },
    {
        selector: 'edge.search-dim, edge.selection-dim',
        style: {
            'opacity': 0.1,
        }
    }
];
