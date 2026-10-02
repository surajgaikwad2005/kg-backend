'use client';

// Re-export barrel — keeps `@/src/components/ui/Toast` resolvable for every
// existing caller while the real implementation lives in ./toast/*.
export { ToastProvider, useToast, toast } from './toast/index.js';
