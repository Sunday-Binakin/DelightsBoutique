import type { ProductListParams } from "@/lib/api/products";
import type { Product } from "@/lib/types";

export type SortOption = "newest" | "price-asc" | "price-desc" | "rating";

export interface CatalogFilters {
  priceBand: number;
  sizes: string[];
  colors: string[];
  sort: SortOption;
}

export const DEFAULT_CATALOG_FILTERS: CatalogFilters = {
  priceBand: 0,
  sizes: [],
  colors: [],
  sort: "newest",
};

// Prices are two-decimal GH₵ amounts, so the open-ended edges sit just inside the next band.
export const PRICE_BANDS: Array<{ label: string; minPrice?: number; maxPrice?: number }> = [
  { label: "All Prices" },
  { label: "Under GH₵100", maxPrice: 99.99 },
  { label: "GH₵100 – GH₵250", minPrice: 100, maxPrice: 250 },
  { label: "Over GH₵250", minPrice: 250.01 },
];

export function hasActiveCatalogFilters(filters: CatalogFilters): boolean {
  return filters.priceBand !== 0 || filters.sizes.length > 0 || filters.colors.length > 0;
}

/** The server-side query for a filter selection. */
export function catalogRequestParams(filters: CatalogFilters): Partial<ProductListParams> {
  const band = PRICE_BANDS[filters.priceBand];
  return {
    minPrice: band.minPrice,
    maxPrice: band.maxPrice,
    size: filters.sizes.length > 0 ? filters.sizes : undefined,
    color: filters.colors.length > 0 ? filters.colors : undefined,
    sort: filters.sort,
  };
}

/** The price part of a selection: facets must count the same price range the list shows. */
export function catalogScope(filters: CatalogFilters): { minPrice?: number; maxPrice?: number } {
  const band = PRICE_BANDS[filters.priceBand];
  return { minPrice: band.minPrice, maxPrice: band.maxPrice };
}

/** Facet values plus any selected value the facets don't list, sorted. */
export function mergeOptions(available: string[], selected: string[]): string[] {
  return [...new Set([...available, ...selected])].sort();
}

/** Options for the size and colour pickers: the loaded products' values, plus any selected value. */
export function catalogOptions(
  products: Product[],
  selected: string[],
  field: "sizes" | "colors",
): string[] {
  const values = new Set<string>(selected);
  for (const product of products) {
    for (const value of product[field] ?? []) values.add(value);
  }
  return [...values].sort();
}

/** For lists already in memory (wishlist, the wholesale picks) that have no server-side query. */
export function applyLocalCatalogFilters(products: Product[], filters: CatalogFilters): Product[] {
  const band = PRICE_BANDS[filters.priceBand];
  const filtered = products.filter((product) => {
    if (band.minPrice !== undefined && product.retailPrice < band.minPrice) return false;
    if (band.maxPrice !== undefined && product.retailPrice > band.maxPrice) return false;
    if (filters.sizes.length > 0 && !(product.sizes ?? []).some((s) => filters.sizes.includes(s))) {
      return false;
    }
    if (filters.colors.length > 0 && !(product.colors ?? []).some((c) => filters.colors.includes(c))) {
      return false;
    }
    return true;
  });

  return [...filtered].sort((a, b) => {
    switch (filters.sort) {
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
}
