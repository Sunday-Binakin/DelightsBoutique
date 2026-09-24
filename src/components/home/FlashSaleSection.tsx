"use client";

import { useProducts } from "@/lib/use-products";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { ProductGridSection } from "@/components/home/ProductGridSection";

export function FlashSaleSection() {
  const products = useProducts();
  const onSale = products.filter((p) => p.compareAtPrice);

  return (
    <ProductGridSection
      eyebrow="Ends Soon"
      title="Flash Sale"
      header={<CountdownTimer />}
      products={onSale.length ? onSale : products.slice(0, 4)}
    />
  );
}
