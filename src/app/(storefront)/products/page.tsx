"use client";

import { useEffect, useState } from "react";
import { PRODUCT_PAGE_SIZE, useProductFacets, useProductsList } from "@/lib/use-products";
import { usePagedState } from "@/lib/use-paged-state";
import {
  DEFAULT_CATALOG_FILTERS,
  catalogRequestParams,
  catalogScope,
  mergeOptions,
  type CatalogFilters,
} from "@/lib/catalog-filters";
import { CatalogView } from "@/components/catalog/CatalogView";
import { LoadingBlock } from "@/components/ui/Spinner";
import { QueryError } from "@/components/ui/QueryError";
import { Pagination } from "@/components/ui/Pagination";

/** The full catalog — what "Shop Now"/"Explore" hero CTAs link to. Also accepts
 * ?badge=BestSeller (same query the "Best Sellers" promo banner links with) as
 * a path into the same filter /best-sellers uses, read once on mount the same
 * way /search reads ?q= — avoids the Suspense boundary useSearchParams() needs. */
export default function ProductsPage() {
  const [badge, setBadge] = useState<"bestSeller" | undefined>(undefined);
  const [badgeResolved, setBadgeResolved] = useState(false);

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("badge");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBadge(raw?.toLowerCase() === "bestseller" ? "bestSeller" : undefined);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBadgeResolved(true);
  }, []);

  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_CATALOG_FILTERS);
  const [page, setPage] = usePagedState(`products|${badge ?? ""}|${JSON.stringify(filters)}`);
  const { products, total, isLoading, isError, refetch } = useProductsList(
    { badge, page, limit: PRODUCT_PAGE_SIZE, ...catalogRequestParams(filters) },
    { enabled: badgeResolved },
  );

  const facets = useProductFacets({ badge, ...catalogScope(filters) });

  if (!badgeResolved || isLoading) return <LoadingBlock />;
  if (isError) return <QueryError label="the catalog" onRetry={refetch} />;

  return (
    <CatalogView
      title={badge === "bestSeller" ? "Best Sellers" : "All Products"}
      subtitle={
        badge === "bestSeller"
          ? "Customer favorites across the catalog — the pieces people keep coming back for."
          : "Everything we carry, in one place."
      }
      products={products}
      total={total}
      filters={filters}
      onFiltersChange={setFilters}
      sizeOptions={mergeOptions(facets.sizes, filters.sizes)}
      colorOptions={mergeOptions(facets.colors, filters.colors)}
      pagination={
        <Pagination page={page} pageSize={PRODUCT_PAGE_SIZE} total={total} onPageChange={setPage} />
      }
    />
  );
}
