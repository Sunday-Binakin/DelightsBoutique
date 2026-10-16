"use client";

import { useState } from "react";
import { PRODUCT_PAGE_SIZE, useProductFacets, useProductsList } from "@/lib/use-products";
import { usePagedState } from "@/lib/use-paged-state";
import { useStorefrontCopy } from "@/lib/use-storefront-copy";
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

export default function BestSellersPage() {
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_CATALOG_FILTERS);
  const [page, setPage] = usePagedState(`bestSeller|${JSON.stringify(filters)}`);
  const { products, total, isLoading, isError, refetch } = useProductsList({
    badge: "bestSeller",
    page,
    limit: PRODUCT_PAGE_SIZE,
    ...catalogRequestParams(filters),
  });
  const copy = useStorefrontCopy();

  const facets = useProductFacets({ badge: "bestSeller", ...catalogScope(filters) });

  if (isLoading) return <LoadingBlock />;
  if (isError) return <QueryError label="best sellers" onRetry={refetch} />;

  return (
    <CatalogView
      title={copy.bestSellersTitle}
      subtitle={copy.bestSellersSubtitle}
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
