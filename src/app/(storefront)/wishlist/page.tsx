"use client";

import { useEffect, useState } from "react";
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
  const { slugs, toggle } = useWishlist();
  const { bySlug, notFoundSlugs, isLoading, isError, refetch } = useProductsBySlug(slugs);
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_CATALOG_FILTERS);

  // Same cleanup as the cart page: a confirmed-gone product (deleted, or a
  // stale slug from a different environment/seed) gets dropped from the
  // wishlist for real, not just hidden here — otherwise the heart-icon badge
  // count never matches what's actually shown.
  const notFoundKey = notFoundSlugs.join(",");
  useEffect(() => {
    if (!notFoundSlugs.length) return;
    notFoundSlugs.forEach((slug) => toggle(slug));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when the set of not-found slugs changes
  }, [notFoundKey]);

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
