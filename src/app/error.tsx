"use client";

import { useEffect } from "react";
import { LinkButton } from "@/components/ui/Button";

export default function GlobalRouteError({
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
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="font-serif text-2xl font-semibold text-foreground">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        An unexpected error occurred. You can try again, or head back to the homepage.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center rounded-full border border-current bg-transparent px-5 py-2.5 text-sm font-medium tracking-wide text-foreground transition-colors hover:bg-foreground/5"
        >
          Try again
        </button>
        <LinkButton href="/">Back to Home</LinkButton>
      </div>
    </div>
  );
}
