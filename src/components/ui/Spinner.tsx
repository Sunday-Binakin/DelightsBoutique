export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`animate-spin rounded-full border-2 border-current border-t-transparent text-primary ${className}`}
    />
  );
}

/** Centered loading placeholder for a whole section/page's primary content. */
export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <Spinner className="h-6 w-6" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
