'use client';

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      {icon && (
        <div className="mb-4 text-text-muted opacity-50">
          {icon}
        </div>
      )}
      <p className="text-sm font-semibold text-text-secondary mb-1">{title}</p>
      {description && (
        <p className="text-xs text-text-muted max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
