"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useProductsList } from "@/lib/use-products";
import { useDialog } from "@/lib/use-dialog";
import { formatPrice } from "@/lib/format";
import { SearchIcon } from "@/components/ui/icons";

const MAX_QUICK_RESULTS = 6;
const DEBOUNCE_MS = 250;

export function SearchOverlay() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  function close() {
    setOpen(false);
    setQuery("");
  }

  const panelRef = useDialog<HTMLDivElement>(open, close, { trapFocus: false });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const { products: matches } = useProductsList(
    { search: debouncedQuery, limit: MAX_QUICK_RESULTS },
    { enabled: Boolean(debouncedQuery) },
  );

  function goToResults(e?: FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    close();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Search"
        aria-expanded={open}
        aria-controls="site-search"
        className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/5"
      >
        <SearchIcon className="h-5 w-5" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close search"
            onClick={close}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div
            id="site-search"
            ref={panelRef}
            role="dialog"
            aria-label="Search products"
            className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-input-border bg-background p-3 shadow-lg sm:w-96"
          >
            <form onSubmit={goToResults}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search products"
                placeholder="Search products…"
                className="w-full rounded-lg border border-input-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </form>

            {matches.length > 0 && (
              <div className="mt-2 flex flex-col divide-y divide-border-subtle">
                {matches.map((product) => (
                  <Link
                    key={product.slug}
                    href={`/product/${product.slug}`}
                    onClick={close}
                    className="flex items-center justify-between gap-3 py-2 text-sm text-foreground/80 hover:text-primary"
                  >
                    <span className="truncate">{product.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatPrice(product.retailPrice)}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {query.trim() && (
              <button
                type="button"
                onClick={() => goToResults()}
                className="mt-2 w-full rounded-lg py-2 text-center text-xs font-medium text-primary hover:bg-muted"
              >
                View all results for &ldquo;{query.trim()}&rdquo;
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
