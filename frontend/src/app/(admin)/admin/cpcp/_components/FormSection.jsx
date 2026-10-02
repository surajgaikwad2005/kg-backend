'use client';

const ACCENTS = {
    brand: { badge: 'bg-brand-muted text-brand', border: 'border-t-brand/40' },
    info: { badge: 'bg-info/10 text-info', border: 'border-t-info/40' },
    success: { badge: 'bg-success/10 text-success', border: 'border-t-success/40' },
};

/** Numbered section wrapper used by the Template Setup step (Identity, Asset Details, Specifications). */
export function FormSection({ index, accent = 'brand', title, description, children }) {
    const tone = ACCENTS[accent] || ACCENTS.brand;

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10">
            <div className="md:col-span-4 lg:col-span-3 pt-2">
                <h2 className="text-base font-bold text-text-primary flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${tone.badge}`}>
                        {index}
                    </span>
                    {title}
                </h2>
                <p className="mt-3 text-sm text-text-muted leading-relaxed pl-9">{description}</p>
            </div>
            <div className={`md:col-span-8 lg:col-span-9 bg-surface rounded-xl shadow-sm border border-border p-6 sm:p-8 space-y-6 border-t-4 ${tone.border}`}>
                {children}
            </div>
        </div>
    );
}
