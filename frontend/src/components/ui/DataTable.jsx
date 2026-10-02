'use client';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';

/**
 * DataTable — reusable table with loading + empty states
 *
 * columns: Array<{
 *   key: string,           // row[key] used as cell value when no render()
 *   label: string,         // header label
 *   render?: (row) => ReactNode,  // custom cell renderer
 *   className?: string,    // th className
 *   cellClassName?: string // td className
 * }>
 *
 * rows: Array<object> — each object is one table row
 */
export function DataTable({
  columns = [],
  rows = [],
  loading = false,
  emptyTitle = 'No data',
  emptyDescription,
  emptyIcon,
  emptyAction,
  className = '',
  onRowClick,
}) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-xs text-left border-collapse">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-2.5 bg-surface-2 font-semibold text-text-muted uppercase tracking-wider text-[10px] first:rounded-tl-lg last:rounded-tr-lg whitespace-nowrap ${col.className ?? ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={`skeleton-${i}`} className="border-b border-border last:border-0">
                {columns.map((col, ci) => (
                  <td key={col.key} className={`px-4 py-3 ${col.cellClassName ?? ''}`}>
                    <Skeleton delay={i * 0.06 + ci * 0.02} className="h-3.5 w-full max-w-32" />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState
                  icon={emptyIcon}
                  title={emptyTitle}
                  description={emptyDescription}
                  action={emptyAction}
                />
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={row.id ?? row._id ?? i}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-border last:border-0 hover:bg-surface-2 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-text-secondary ${col.cellClassName ?? ''}`}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
