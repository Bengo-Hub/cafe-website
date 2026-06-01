'use client';

import { useEffect } from 'react';

function isChunkError(err: unknown): boolean {
  if (!err) return false;
  const msg = (err as Error)?.message ?? String(err);
  return (
    (err as Error)?.name === 'ChunkLoadError' ||
    msg.includes('ChunkLoadError') ||
    msg.includes('Loading chunk') ||
    msg.includes('Failed to load chunk') ||
    msg.includes('/_next/static/chunks/')
  );
}

/**
 * Catches stale-chunk 404s at the window level (before React error boundary)
 * and reloads the page once. These happen when the browser has cached references
 * to old JS chunk hashes from the previous deployment.
 */
export function ChunkErrorHandler() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (isChunkError(event.error)) {
        event.preventDefault();
        if (!sessionStorage.getItem('chunk_reload')) {
          sessionStorage.setItem('chunk_reload', '1');
          window.location.reload();
        }
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      if (isChunkError(event.reason)) {
        event.preventDefault();
        if (!sessionStorage.getItem('chunk_reload')) {
          sessionStorage.setItem('chunk_reload', '1');
          window.location.reload();
        }
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    // Clear the reload flag after a successful load so future deployments
    // can trigger a reload again.
    sessionStorage.removeItem('chunk_reload');

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return null;
}
