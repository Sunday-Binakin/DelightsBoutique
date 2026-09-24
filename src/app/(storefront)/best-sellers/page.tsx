"use client";

import { useProducts } from "@/lib/use-products";
import { useStorefrontCopy } from "@/lib/use-storefront-copy";
import { CatalogView } from "@/components/catalog/CatalogView";

export default function BestSellersPage() {
  const products = useProducts().filter((product) => product.badge === "Best Seller");
  const copy = useStorefrontCopy();

  return (
    <CatalogView title={copy.bestSellersTitle} subtitle={copy.bestSellersSubtitle} products={products} />
  );
}
