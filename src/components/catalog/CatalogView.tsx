"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/home/ProductCard";

type SortOption = "newest" | "price-asc" | "price-desc" | "rating";

const PRICE_BANDS: Array<{ label: string; test: (price: number) => boolean }> = [
  { label: "All Prices", test: () => true },
  { label: "Under GH₵100", test: (price) => price < 100 },
  { label: "GH₵100 – GH₵250", test: (price) => price >= 100 && price <= 250 },
  { label: "Over GH₵250", test: (price) => price > 250 },
];

function pillClasses(active: boolean) {
  return `rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
    active
      ? "border-primary bg-primary text-white"
      : "border-border-subtle text-foreground/80 hover:border-primary"
  }`;
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function toggleInSet(set: Set<string>, value: string) {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

interface CatalogViewProps {
  title: string;
  subtitle?: string;
  products: Product[];
}

// Drives every product-listing page (categories, New Arrivals, Best
// Sellers, Wholesale) — only the title/subtitle/product list differ.
export function CatalogView({ title, subtitle, products }: CatalogViewProps) {
  const [sort, setSort] = useState<SortOption>("newest");
  const [priceBand, setPriceBand] = useState(0);
  const [sizes, setSizes] = useState<Set<string>>(new Set());
  const [colors, setColors] = useState<Set<string>>(new Set());

  const availableSizes = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.sizes ?? []))).sort(),
    [products],
  );
  const availableColors = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.colors ?? []))).sort(),
    [products],
  );

  const filtered = products.filter((product) => {
    if (!PRICE_BANDS[priceBand].test(product.retailPrice)) return false;
    if (sizes.size > 0 && !(product.sizes ?? []).some((size) => sizes.has(size))) return false;
    if (colors.size > 0 && !(product.colors ?? []).some((color) => colors.has(color))) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case "price-asc":
        return a.retailPrice - b.retailPrice;
      case "price-desc":
        return b.retailPrice - a.retailPrice;
      case "rating":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const hasActiveFilters = priceBand !== 0 || sizes.size > 0 || colors.size > 0;

  function resetFilters() {
    setPriceBand(0);
    setSizes(new Set());
    setColors(new Set());
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-serif text-2xl font-semibold text-foreground">{title}</h1>
      {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}

      <div className="mt-6 grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="flex flex-col gap-6">
          <FilterGroup title="Price">
            <div className="flex flex-col gap-2">
              {PRICE_BANDS.map((band, index) => (
                <label key={band.label} className="flex items-center gap-2 text-sm text-foreground/80">
                  <input
                    type="radio"
                    name="price"
                    checked={priceBand === index}
                    onChange={() => setPriceBand(index)}
                  />
                  {band.label}
                </label>
              ))}
            </div>
          </FilterGroup>

          {availableSizes.length > 0 && (
            <FilterGroup title="Size">
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSizes(toggleInSet(sizes, size))}
                    className={pillClasses(sizes.has(size))}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </FilterGroup>
          )}

          {availableColors.length > 0 && (
            <FilterGroup title="Color">
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setColors(toggleInSet(colors, color))}
                    className={pillClasses(colors.has(color))}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </FilterGroup>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-left text-sm font-medium text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </aside>

        <div>
          <div className="flex items-center justify-between border-b border-border-subtle pb-4">
            <p className="text-sm text-muted-foreground">{sorted.length} products</p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="rounded-lg border border-border-subtle bg-background px-3 py-1.5 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {sorted.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-muted-foreground">No products match your filters.</p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-3 text-sm font-medium text-primary hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3">
              {sorted.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
