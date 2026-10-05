"use client";

import { useState } from "react";
import { useProductsBySlug } from "@/lib/use-products";
import { useWishlist } from "@/lib/wishlist-context";
import {
  DEFAULT_CATALOG_FILTERS,
  applyLocalCatalogFilters,
  catalogOptions,
  type CatalogFilters,
} from "@/lib/catalog-filters";
import { CatalogView } from "@/components/catalog/CatalogView";
import { LoadingBlock } from "@/components/ui/Spinner";
import { QueryError } from "@/components/ui/QueryError";

export default function WishlistPage() {
  const { slugs } = useWishlist();
  const { bySlug, isLoading, isError, refetch } = useProductsBySlug(slugs);
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_CATALOG_FILTERS);

  if (slugs.length > 0 && isLoading) return <LoadingBlock />;
  if (slugs.length > 0 && isError) return <QueryError label="your wishlist" onRetry={refetch} />;

  const saved = slugs.map((slug) => bySlug.get(slug)).filter((p) => p !== undefined);
  const visible = applyLocalCatalogFilters(saved, filters);

  return (
    <CatalogView
      title="My Wishlist"
      subtitle={
        saved.length > 0
          ? `${saved.length} saved item${saved.length === 1 ? "" : "s"}.`
          : "Tap the heart on any product to save it here."
      }
      products={visible}
      total={visible.length}
      filters={filters}
      onFiltersChange={setFilters}
      sizeOptions={catalogOptions(saved, filters.sizes, "sizes")}
      colorOptions={catalogOptions(saved, filters.colors, "colors")}
    />
  );
}
