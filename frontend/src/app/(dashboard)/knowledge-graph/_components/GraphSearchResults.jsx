import React from 'react';

export default function GraphSearchResults({
    matchedNodes,
    setSelectedId,
    setSelectedNode,
    setSearchQuery,
    setIsSearchOpen,
    cyRef
}) {
    return (
        <div 
            className="absolute top-0 left-0 w-full h-full flex flex-col p-1.5 z-30 rounded-t-xl bg-surface"
            style={{ backgroundColor: 'var(--do-surface)' }}
        >
            <div className="flex-1 overflow-y-auto thin-scrollbar flex flex-col gap-1 pr-0.5">
                {matchedNodes.length === 0 ? (
                    <div className="px-2 py-1.5 text-text-muted select-none" style={{ fontSize: '10px' }}>No nodes found</div>
                ) : (
                    matchedNodes.map(node => (
                        <button
                            key={node.id()}
                            type="button"
                            onClick={() => {
                                const originalData = node.data('originalData');
                                setSelectedId?.(node.id());
                                setSelectedNode?.(originalData);
                                setSearchQuery('');
                                setIsSearchOpen(false);
                            }}
                            className="px-2 py-1.5 text-left rounded-md hover:bg-surface-2 text-text-secondary hover:text-text-primary transition-all truncate cursor-pointer w-full shrink-0 block"
                            style={{ fontSize: '11px', lineHeight: '14px' }}
                        >
                            {node.data('name')}
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
