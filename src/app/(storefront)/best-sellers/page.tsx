"use client";

import { useProducts } from "@/lib/use-products";
import { CatalogView } from "@/components/catalog/CatalogView";

export default function BestSellersPage() {
  const products = useProducts().filter((product) => product.badge === "Best Seller");

  return (
    <CatalogView
      title="Best Sellers"
      subtitle="Customer favorites across the catalog — the pieces people keep coming back for."
      products={products}
    />
  );
}
