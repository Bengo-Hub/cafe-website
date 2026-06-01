'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // ChunkLoadError happens when the browser cached references to old JS chunks
    // that no longer exist after a new deployment. Auto-reload once to fetch the
    // current chunks — this silently recovers without the user noticing.
    if (error?.name === 'ChunkLoadError' || error?.message?.includes('ChunkLoadError') || error?.message?.includes('Loading chunk')) {
      const reloadKey = `chunk_reload_${Date.now().toString().slice(0, 8)}`;
      if (!sessionStorage.getItem('chunk_reload_attempted')) {
        sessionStorage.setItem('chunk_reload_attempted', reloadKey);
        window.location.reload();
      }
      // If we already tried reloading and still get a ChunkLoadError, fall through
      // to the regular error UI so the user isn't stuck in a reload loop.
    }
  }, [error]);

  const isChunkError =
    error?.name === 'ChunkLoadError' ||
    error?.message?.includes('ChunkLoadError') ||
    error?.message?.includes('Loading chunk');

  if (isChunkError) {
    return (
      <html>
        <body className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center space-y-4 max-w-sm">
            <p className="text-sm text-muted-foreground">Updating the app — please wait…</p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center space-y-4 max-w-sm">
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred. Try refreshing the page.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-md border border-border text-sm font-medium hover:bg-accent transition"
            >
              Reload page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
