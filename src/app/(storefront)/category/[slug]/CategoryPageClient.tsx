"use client";

import { useState } from "react";
import { useCategoriesQuery } from "@/lib/use-categories";
import { PRODUCT_PAGE_SIZE, useProductsList } from "@/lib/use-products";
import { usePagedState } from "@/lib/use-paged-state";
import {
  DEFAULT_CATALOG_FILTERS,
  catalogOptions,
  catalogRequestParams,
  type CatalogFilters,
} from "@/lib/catalog-filters";
import { CatalogView } from "@/components/catalog/CatalogView";
import { LinkButton } from "@/components/ui/Button";
import { LoadingBlock } from "@/components/ui/Spinner";
import { QueryError } from "@/components/ui/QueryError";
import { Pagination } from "@/components/ui/Pagination";

export function CategoryPageClient({ slug }: { slug: string }) {
  const { categories, isLoading: loadingCategories, isError: categoriesErrored, refetch } =
    useCategoriesQuery();
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_CATALOG_FILTERS);
  const [page, setPage] = usePagedState(`${slug}|${JSON.stringify(filters)}`);
  const {
    products,
    total,
    isLoading: loadingProducts,
    isError: productsErrored,
    refetch: refetchProducts,
  } = useProductsList({
    category: slug,
    page,
    limit: PRODUCT_PAGE_SIZE,
    ...catalogRequestParams(filters),
  });

  if (loadingCategories || loadingProducts) return <LoadingBlock />;

  if (categoriesErrored || productsErrored) {
    return (
      <QueryError
        label="this category"
        onRetry={() => {
          refetch();
          refetchProducts();
        }}
      />
    );
  }

  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="font-serif text-2xl font-semibold text-foreground">Category not found</h1>
        <LinkButton href="/" className="mt-6">
          Back to Home
        </LinkButton>
      </div>
    );
  }

  return (
    <CatalogView
      title={category.name}
      subtitle={`Browse our full ${category.name.toLowerCase()} collection — retail and wholesale pricing available.`}
      products={products}
      total={total}
      filters={filters}
      onFiltersChange={setFilters}
      sizeOptions={catalogOptions(products, filters.sizes, "sizes")}
      colorOptions={catalogOptions(products, filters.colors, "colors")}
      pagination={
        <Pagination page={page} pageSize={PRODUCT_PAGE_SIZE} total={total} onPageChange={setPage} />
      }
    />
  );
}
