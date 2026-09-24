"use client";

import { useProducts } from "@/lib/use-products";
import { CatalogView } from "@/components/catalog/CatalogView";

export default function NewArrivalsPage() {
  const products = useProducts().filter((product) => product.badge === "New");

  return (
    <CatalogView
      title="New Arrivals"
      subtitle="The latest pieces added to the catalog, across dresses, footwear, bags, fabrics and jewellery."
      products={products}
    />
  );
}
