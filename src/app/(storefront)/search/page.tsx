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

export default function SearchPage() {
  const [query, setQuery] = useState<string | null>(null);
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_CATALOG_FILTERS);

  useEffect(() => {
    // Read once on mount — avoids the Suspense boundary useSearchParams()
    // would otherwise require, same as the Orders admin page's ?highlight=.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(new URLSearchParams(window.location.search).get("q") ?? "");
  }, []);

  const trimmed = query?.trim() ?? "";
  const [page, setPage] = usePagedState(`${trimmed}|${JSON.stringify(filters)}`);
  const { products, total, isLoading, isError, refetch } = useProductsList(
    { search: trimmed, page, limit: PRODUCT_PAGE_SIZE, ...catalogRequestParams(filters) },
    { enabled: Boolean(trimmed) },
  );

  const facets = useProductFacets({ search: trimmed || undefined, ...catalogScope(filters) });

  if (query === null) return null;
  if (trimmed && isLoading) return <LoadingBlock />;
  if (trimmed && isError) return <QueryError label="search results" onRetry={refetch} />;

  return (
    <CatalogView
      title={query ? `Search results for "${query}"` : "Search"}
      subtitle={`${total} product${total === 1 ? "" : "s"} found.`}
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
