"use client";

import { useState } from "react";
import { useCollectionSectionQuery } from "@/lib/use-collection-section";
import { useSiteSettings } from "@/lib/use-site-settings";
import { useStorefrontCopy } from "@/lib/use-storefront-copy";
import { buildWhatsAppLink } from "@/lib/site-settings";
import {
  DEFAULT_CATALOG_FILTERS,
  applyLocalCatalogFilters,
  catalogOptions,
  type CatalogFilters,
} from "@/lib/catalog-filters";
import { CatalogView } from "@/components/catalog/CatalogView";
import { WhatsAppIcon } from "@/components/ui/icons";
import { LoadingBlock } from "@/components/ui/Spinner";
import { QueryError } from "@/components/ui/QueryError";

export default function WholesalePage() {
  // Same curated/fallback list the homepage's "Wholesale Picks" tab shows —
  // there's no server-side "has a wholesale price" filter on /api/products.
  const { collectionSection, isLoading, isError, refetch } = useCollectionSectionQuery();
  const settings = useSiteSettings();
  const copy = useStorefrontCopy();
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_CATALOG_FILTERS);

  if (isLoading) return <LoadingBlock />;
  if (isError) return <QueryError label="wholesale products" onRetry={refetch} />;

  const picks = collectionSection.wholesalePicks;
  const visible = applyLocalCatalogFilters(picks, filters);

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <div className="rounded-2xl bg-muted px-6 py-8">
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            Wholesale &amp; Bulk Orders
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{copy.wholesaleIntro}</p>
          <a
            href={buildWhatsAppLink(settings.whatsappNumber, copy.wholesaleWhatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Ask About Wholesale
          </a>
        </div>
      </div>

      <CatalogView
        title="Wholesale-Eligible Products"
        subtitle="Retail price is shown on each card — wholesale price and MOQ appear on the product page."
        products={visible}
        total={visible.length}
        filters={filters}
        onFiltersChange={setFilters}
        sizeOptions={catalogOptions(picks, filters.sizes, "sizes")}
        colorOptions={catalogOptions(picks, filters.colors, "colors")}
      />
    </div>
  );
}
