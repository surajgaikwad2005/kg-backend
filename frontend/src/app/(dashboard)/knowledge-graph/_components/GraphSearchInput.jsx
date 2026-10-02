import React from 'react';
import { Search } from 'lucide-react';

export default function GraphSearchInput({ searchQuery, setSearchQuery }) {
    return (
        <div className="border-t border-border bg-surface p-1.5 relative z-10">
            <div className="relative">
                <Search size={12} className="absolute left-2 top-2.5 text-text-subtle" />
                <input
                    type="text"
                    placeholder="Search node..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-8 pl-6.5 pr-10 rounded-lg border border-border bg-surface text-text-primary text-xs font-semibold placeholder:text-text-muted outline-none focus:border-brand transition-all"
                    autoFocus
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-2.5 text-text-subtle hover:text-text-primary font-bold uppercase transition-colors cursor-pointer"
                        style={{ fontSize: '9px', lineHeight: '1' }}
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
}
