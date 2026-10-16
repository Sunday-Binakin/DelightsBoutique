import { Button } from "@/components/ui/Button";

interface QueryErrorProps {
  /** What failed to load, e.g. "products" — used in the default message. */
  label?: string;
  message?: string;
  onRetry?: () => void;
}

/** Shown when a query fails outright (network error, 5xx) — distinct from a
 * genuinely empty result, so a failed fetch doesn't look like "nothing here." */
export function QueryError({ label = "this", message, onRetry }: QueryErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border-subtle py-16 text-center">
      <p className="text-sm text-muted-foreground">
        {message ?? `Couldn't load ${label}. Check your connection and try again.`}
      </p>
      {onRetry && (
        <Button type="button" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
