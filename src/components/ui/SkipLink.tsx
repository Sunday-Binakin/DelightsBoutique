export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only z-100 rounded-lg bg-background px-4 py-2 text-sm font-medium text-primary focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:shadow-lg"
    >
      Skip to content
    </a>
  );
}
