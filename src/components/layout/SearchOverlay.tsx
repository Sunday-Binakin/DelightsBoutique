"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useProducts } from "@/lib/use-products";
import { formatPrice } from "@/lib/format";
import { SearchIcon } from "@/components/ui/icons";

const MAX_QUICK_RESULTS = 6;

export function SearchOverlay() {
  const products = useProducts();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, MAX_QUICK_RESULTS);
  }, [products, query]);

  function close() {
    setOpen(false);
    setQuery("");
  }

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
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-border-subtle bg-background p-3 shadow-lg sm:w-96">
            <form onSubmit={goToResults}>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-primary"
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
