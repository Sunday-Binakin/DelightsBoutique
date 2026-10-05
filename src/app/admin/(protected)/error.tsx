"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function AdminRouteError({
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
    <div className="flex h-full flex-col items-center justify-center py-20 text-center">
      <h1 className="font-serif text-xl font-semibold text-foreground">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        This section hit an unexpected error. Try again, or use the sidebar to go elsewhere.
      </p>
      <Button type="button" variant="outline" onClick={reset} className="mt-5">
        Try again
      </Button>
    </div>
  );
}
