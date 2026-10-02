'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/src/context/AppContext';
import IndustryGateModal from '@/src/components/admin/IndustryGateModal';
import { PlantsProvider } from '@/src/context/PlantsContext';
import PlantCodeBanner from '@/src/components/layout/PlantCodeBanner';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { industry } = useApp();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // UX-only guard — real enforcement is the middleware's signed user_role
    // check (src/proxy.js) + backend authorization. The token itself is never
    // in localStorage; 'auth' is the non-sensitive session marker.
    const isAuthed = localStorage.getItem('auth') === 'true';
    const role = localStorage.getItem('role');
    if (!isAuthed) {
      router.replace('/');
    } else if (role !== 'admin') {
      router.replace('/dashboards');
    }
    setIsMounted(true);
  }, [router]);

  // After hydration, check localStorage as a fallback for the brief window before
  // AppContext resolves its own localStorage read via useEffect.
  const hasIndustry = industry || (isMounted && localStorage.getItem('admin_industry'));
  const isAdminRoot = pathname === '/admin';
  const showGate = isMounted && !isAdminRoot && !hasIndustry;

  // PlantsProvider is mounted per authenticated shell, not in the root layout —
  // see the comment in (dashboard)/layout.jsx for why (pre-login /api/plant-id 401).
  return (
    <PlantsProvider>
      <PlantCodeBanner />
      {children}
      <IndustryGateModal
        open={showGate}
        onAction={() => router.push('/admin')}
        title="Industry Not Selected"
        description="You need to select your industry on the Admin home page before accessing this section. It only takes a second."
        actionLabel="Go to Admin Home"
      />
    </PlantsProvider>
  );
}
