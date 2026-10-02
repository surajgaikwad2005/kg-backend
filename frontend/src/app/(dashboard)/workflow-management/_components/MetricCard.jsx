"use client";

/**
 * MetricCard — reusable KPI tile for landing/overview pages.
 * Fully prop-driven (icon, colors, labels) so it isn't a one-off tied to
 * a specific metric; compose it per screen instead of duplicating markup.
 */
export function MetricCard({
    icon: Icon,
    iconWrapperClassName = "bg-brand",
    accentClassName = "bg-brand/5",
    eyebrow,
    statusDotClassName = "bg-success",
    statusLabel,
    statusColorClassName = "text-success",
    title,
    value,
    badgeIcon: BadgeIcon,
    badgeLabel,
    badgeColorClassName = "text-text-muted",
    trendLabel,
    actionIcon: ActionIcon,
    actionColorClassName = "bg-brand-muted text-brand group-hover:bg-brand group-hover:text-white",
    onClick,
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="group relative bg-surface rounded-3xl border-2 border-border-strong shadow-card hover:shadow-card-hover transition-all duration-500 overflow-hidden p-6 sm:p-8 flex flex-col justify-between h-[260px] sm:h-[280px] cursor-pointer active:scale-[0.98] w-full text-left"
        >
            <div className={`absolute top-0 right-0 w-32 h-32 ${accentClassName} rounded-bl-[100px] -z-0 transition-transform group-hover:scale-110`} />

            <div className="relative z-10 flex items-center justify-between">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${iconWrapperClassName} flex items-center justify-center text-white shadow-xl`}>
                    <Icon className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[11px] font-black text-text-subtle uppercase tracking-[0.2em]">{eyebrow}</span>
                    <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${statusDotClassName} animate-pulse`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${statusColorClassName}`}>{statusLabel}</span>
                    </div>
                </div>
            </div>

            <div className="relative z-10 mt-6 sm:mt-0">
                <h3 className="text-[18px] font-black text-text-primary uppercase tracking-widest mb-1">{title}</h3>
                <div className="flex flex-wrap items-baseline gap-4">
                    <div className="text-[40px] sm:text-[52px] font-black text-text-primary leading-none tabular-nums">{value.toLocaleString()}</div>
                    <div className="flex flex-col">
                        <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${badgeColorClassName}`}>
                            {BadgeIcon && <BadgeIcon className="w-3 h-3" />}
                            {badgeLabel}
                        </span>
                        <span className="text-[10px] font-black text-border-strong uppercase tracking-widest mt-0.5">{trendLabel}</span>
                    </div>
                </div>
            </div>

            <div className="relative z-10 self-end">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm ${actionColorClassName}`}>
                    <ActionIcon className="w-5 h-5" />
                </div>
            </div>
        </button>
    );
}
