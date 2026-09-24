"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { ProductVisual } from "@/components/ui/ProductVisual";
import { SearchIcon } from "@/components/ui/icons";

const thinScrollbar =
  "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border-subtle";

interface ProductPickerProps {
  products: Product[];
  selectedSlugs: string[];
  onChange: (slugs: string[]) => void;
  /** The products that will actually display for this tab right now (curated picks, or the fallback). */
  previewProducts: Product[];
  /** Shown when nothing is checked yet, explaining what the automatic fallback picks. */
  emptyHint?: string;
}

// A simple search + checklist for hand-picking which products belong to
// something (e.g. a homepage tab), reused wherever an admin needs to curate
// a subset of the catalog rather than filter it by a rule.
export function ProductPicker({
  products,
  selectedSlugs,
  onChange,
  previewProducts,
  emptyHint = "None selected — auto-fills from product badge/wholesale price",
}: ProductPickerProps) {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const visible = query ? products.filter((p) => p.name.toLowerCase().includes(query)) : products;

  function toggle(slug: string) {
    onChange(
      selectedSlugs.includes(slug)
        ? selectedSlugs.filter((s) => s !== slug)
        : [...selectedSlugs, slug],
    );
  }

  return (
    <div>
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full rounded-lg border border-border-subtle bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
        />
      </div>

      <div
        className={`mt-2 max-h-56 overflow-y-auto rounded-lg border border-border-subtle ${thinScrollbar}`}
      >
        {visible.map((product) => {
          const isSelected = selectedSlugs.includes(product.slug);
          return (
            <label
              key={product.slug}
              className={`flex cursor-pointer items-center gap-3 border-b border-border-subtle px-3 py-2 text-sm transition-colors last:border-0 ${
                isSelected ? "bg-primary/5" : "hover:bg-muted"
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggle(product.slug)}
                className="h-4 w-4 shrink-0 cursor-pointer accent-primary"
              />
              <ProductVisual product={product} className="h-10 w-10 shrink-0 rounded-md" />
              <span className="flex-1 truncate font-medium text-foreground">{product.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatPrice(product.retailPrice)}
              </span>
            </label>
          );
        })}
        {visible.length === 0 && (
          <p className="px-3 py-4 text-center text-xs text-muted-foreground">No products match.</p>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <span
          className={`text-xs ${selectedSlugs.length ? "font-medium text-primary" : "text-muted-foreground"}`}
        >
          {selectedSlugs.length
            ? `${selectedSlugs.length} product${selectedSlugs.length === 1 ? "" : "s"} selected`
            : emptyHint}
        </span>
        {selectedSlugs.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="shrink-0 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      <div className="mt-3 rounded-lg bg-muted/40 p-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Will show on homepage
        </p>
        <div className={`mt-2 flex gap-2.5 overflow-x-auto pb-1 ${thinScrollbar}`}>
          {previewProducts.map((product) => (
            <div key={product.slug} className="w-16 shrink-0 text-center">
              <ProductVisual
                product={product}
                className="aspect-square w-16 rounded-lg shadow-sm"
              />
              <p className="mt-1 truncate text-[11px] text-muted-foreground">{product.name}</p>
            </div>
          ))}
          {previewProducts.length === 0 && (
            <p className="py-2 text-xs text-muted-foreground">No products to show yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
