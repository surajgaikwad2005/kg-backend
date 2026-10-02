import { getCurrentUsername } from '@/src/lib/currentUser';

let idCounter = 0;

export const getId = () => `dnode_${idCounter++}`;

// Moved to src/lib/currentUser.js so the shared asset-config hook can use it
// without importing out of this route folder. Re-exported here because several
// files in this feature already import it from this module.
export { getCurrentUsername };

/**
 * Converts React Flow nodes/edges into the API save payload.
 */
export const buildSavePayload = ({ nodes, edges, templateName, templateClass, templateId, plantCode }) => {
    const categories = {};

    nodes
        .filter((n) => n.type !== 'group')
        .forEach((node) => {
            const template = node.data.type;
            const fKey = node.data.featureKey || node.data.label.toLowerCase().replace(/\s+/g, '_');
            const fDesc = node.data.featureDescription || `Configuration for ${node.data.label}`;

            if (!categories[template]) {
                categories[template] = {
                    template: template.toLowerCase(),
                    description: `${template.toLowerCase()} feature micro-template list`,
                    features: {},
                };
            }

            categories[template].features[fKey] = {
                name: node.data.label,
                description: fDesc,
                configurations: (node.data.configurations || []).map((c) => {
                    const saved = { ...c };
                    if (saved.userValue !== undefined && saved.userValue !== '') {
                        saved.default = saved.userValue;
                    }
                    delete saved.userValue;
                    return saved;
                }),
            };
        });

    const payload = {
        template_name: templateName || 'demo',
        template_class: templateClass || 'demo',
        created_by: getCurrentUsername(),
        workflow: {
            data: Object.values(categories),
            ui_nodes: nodes.map((n) => ({ ...n, data: { ...n.data, onDelete: undefined } })),
            ui_edges: edges,
        },
        plant_code_id: plantCode,
    };

    if (templateId) payload.template_id = templateId;

    return payload;
};

/**
 * Reconstructs React Flow state from a saved workflow (editing mode).
 */
export const parseInitialData = (initialData, setNodes, setEdges, setSelectedNode, onNodeDelete) => {
    if (!initialData?.workflow) return;

    if (initialData.workflow.ui_nodes && initialData.workflow.ui_edges) {
        const nodesWithDelete = initialData.workflow.ui_nodes.map((n) => ({
            ...n,
            style: n.type === 'group' ? { ...n.style, zIndex: -1, pointerEvents: 'none' } : n.style,
            data: { ...n.data, onDelete: (id) => onNodeDelete(id) },
        }));
        setNodes(nodesWithDelete);
        setEdges(
            initialData.workflow.ui_edges.map((e) => ({ ...e, type: 'deletableEdge', zIndex: 1000 }))
        );
        return;
    }

    if (!Array.isArray(initialData.workflow.data)) return;

    const newNodes = [];
    const positions = {
        Observe: { x: 50, y: 50 },
        Investigate: { x: 450, y: 50 },
        Diagnose: { x: 850, y: 50 },
    };
    const containerMap = {
        Observe: 'observe-container',
        Investigate: 'investigate-container',
        Diagnose: 'diagnose-container',
    };

    initialData.workflow.data.forEach((templateObj) => {
        if (!templateObj.template) return;
        const category = templateObj.template.charAt(0).toUpperCase() + templateObj.template.slice(1);
        const parentId = containerMap[category];
        if (!parentId) return;

        if (!newNodes.find((n) => n.id === parentId)) {
            newNodes.push({
                id: parentId,
                type: 'group',
                data: { label: category },
                position: positions[category] || { x: 50, y: 50 },
                style: {
                    width: 300,
                    height: 400,
                    border: '2px dashed #94a3b8',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(248, 250, 252, 0.5)',
                    zIndex: -1,
                    pointerEvents: 'none',
                },
            });
        }

        let yOffset = 20;
        Object.entries(templateObj.features || {}).forEach(([fKey, fVal]) => {
            newNodes.push({
                id: getId(),
                type: 'custom',
                position: { x: 20, y: yOffset },
                parentId,
                extent: 'parent',
                data: {
                    label: fVal.name,
                    type: category,
                    configurations: (fVal.configurations || []).map((c) => ({ ...c, userValue: c.default })),
                    featureKey: fKey,
                    featureDescription: fVal.description,
                },
            });
            yOffset += 80;
        });
    });

    if (newNodes.length > 0) {
        setNodes(
            newNodes.map((n) => ({ ...n, data: { ...n.data, onDelete: (id) => onNodeDelete(id) } }))
        );
    }
};
