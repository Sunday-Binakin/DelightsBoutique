"use client";

import type { ReactNode } from "react";
import type { Product } from "@/lib/types";
import {
  DEFAULT_CATALOG_FILTERS,
  PRICE_BANDS,
  hasActiveCatalogFilters,
  type CatalogFilters,
  type SortOption,
} from "@/lib/catalog-filters";
import { ProductCard } from "@/components/home/ProductCard";

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

function toggle(values: string[], value: string) {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}

interface CatalogViewProps {
  title: string;
  subtitle?: string;
  products: Product[];
  /** Count across all pages for the current filters. */
  total: number;
  filters: CatalogFilters;
  onFiltersChange: (next: CatalogFilters) => void;
  sizeOptions: string[];
  colorOptions: string[];
  pagination?: ReactNode;
}

// Drives every product-listing page. The page decides what `products` contains;
// this component only renders the controls and reports changes back.
export function CatalogView({
  title,
  subtitle,
  products,
  total,
  filters,
  onFiltersChange,
  sizeOptions,
  colorOptions,
  pagination,
}: CatalogViewProps) {
  const hasActiveFilters = hasActiveCatalogFilters(filters);

  function resetFilters() {
    onFiltersChange({ ...DEFAULT_CATALOG_FILTERS, sort: filters.sort });
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
                    checked={filters.priceBand === index}
                    onChange={() => onFiltersChange({ ...filters, priceBand: index })}
                  />
                  {band.label}
                </label>
              ))}
            </div>
          </FilterGroup>

          {sizeOptions.length > 0 && (
            <FilterGroup title="Size">
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((size) => (
                  <button
                    key={size}
                    type="button"
                    aria-pressed={filters.sizes.includes(size)}
                    onClick={() => onFiltersChange({ ...filters, sizes: toggle(filters.sizes, size) })}
                    className={pillClasses(filters.sizes.includes(size))}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </FilterGroup>
          )}

          {colorOptions.length > 0 && (
            <FilterGroup title="Color">
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-pressed={filters.colors.includes(color)}
                    onClick={() => onFiltersChange({ ...filters, colors: toggle(filters.colors, color) })}
                    className={pillClasses(filters.colors.includes(color))}
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
            <p className="text-sm text-muted-foreground">{total} products</p>
            <select
              aria-label="Sort products"
              value={filters.sort}
              onChange={(e) => onFiltersChange({ ...filters, sort: e.target.value as SortOption })}
              className="rounded-lg border border-input-border bg-background px-3 py-1.5 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {products.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-muted-foreground">No products match your filters.</p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-3 text-sm font-medium text-primary hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          )}
          {pagination}
        </div>
      </div>
    </div>
  );
}
