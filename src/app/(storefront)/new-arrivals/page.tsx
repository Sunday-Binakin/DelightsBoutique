"use client";

import { useProducts } from "@/lib/use-products";
import { useStorefrontCopy } from "@/lib/use-storefront-copy";
import { CatalogView } from "@/components/catalog/CatalogView";

export default function NewArrivalsPage() {
  const products = useProducts().filter((product) => product.badge === "New");
  const copy = useStorefrontCopy();

  return (
    <CatalogView title={copy.newArrivalsTitle} subtitle={copy.newArrivalsSubtitle} products={products} />
  );
}
