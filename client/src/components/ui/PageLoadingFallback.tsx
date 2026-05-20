import React from 'react';

/**
 * Shown by Suspense while a lazy-loaded page chunk is being fetched.
 * Deliberately minimal — no heavy imports — so it renders instantly.
 */
export const PageLoadingFallback: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      {/* Simple spinner that uses only CSS / Tailwind — zero JS overhead */}
      <div
        className="h-8 w-8 rounded-full border-2 border-border border-t-primary animate-spin"
        role="status"
        aria-label="Loading page…"
      />
      <p className="text-sm text-muted-foreground font-medium select-none">
        Loading…
      </p>
    </div>
  </div>
);
