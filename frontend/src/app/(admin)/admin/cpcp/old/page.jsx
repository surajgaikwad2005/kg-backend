'use client';
import React from 'react';

import { CpcpOntologyTable } from './components/CpcpOntologyTable';

export default function CpcpPage() {
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return null;

  return (
    <div className="flex-1 overflow-y-auto thin-scrollbar p-6 md:p-8">
      <CpcpOntologyTable />
    </div>
  );
}
