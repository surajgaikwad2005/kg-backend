'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarClock, ScrollText } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const TABS = [
  { href: '/developer-options/scheduler', icon: CalendarClock, label: 'Scheduler' },
  { href: '/developer-options/log-management', icon: ScrollText, label: 'Log Management' },
];

export function DeveloperOptionsTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Developer Options sections" className="flex items-center gap-1">
      {TABS.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'relative flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors cursor-pointer',
              isActive ? 'text-brand' : 'text-text-muted hover:text-text-primary',
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
            {isActive && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-brand rounded-full" />}
          </Link>
        );
      })}
    </nav>
  );
}
