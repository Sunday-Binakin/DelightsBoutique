"use client";

import { useProducts } from "@/lib/use-products";
import { useFlashSale } from "@/lib/use-flash-sale";
import { pickFlashSaleProducts } from "@/lib/flash-sale";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { ProductGridSection } from "@/components/home/ProductGridSection";

export function FlashSaleSection() {
  const products = useProducts();
  const content = useFlashSale();
  const onSale = pickFlashSaleProducts(products, content.productSlugs);

  return (
    <ProductGridSection
      eyebrow={content.eyebrow}
      title={content.title}
      header={<CountdownTimer endsAt={new Date(content.endsAt).getTime()} />}
      products={onSale.length ? onSale : products.slice(0, 4)}
    />
  );
}
