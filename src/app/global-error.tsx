"use client";

import { useEffect } from "react";

// Only catches errors thrown by the root layout itself (fonts, providers, etc.) —
// error.tsx handles everything else. Next.js requires this to render its own
// <html>/<body> since it replaces the root layout entirely.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-gray-600">
          Please refresh the page. If this keeps happening, let us know.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center justify-center rounded-full border border-current px-5 py-2.5 text-sm font-medium"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
