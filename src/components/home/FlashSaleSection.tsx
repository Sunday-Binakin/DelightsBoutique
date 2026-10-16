"use client";

import { useFlashSale } from "@/lib/use-flash-sale";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { ProductGridSection } from "@/components/home/ProductGridSection";

export function FlashSaleSection() {
  const content = useFlashSale();

  return (
    <ProductGridSection
      eyebrow={content.eyebrow}
      title={content.title}
      header={<CountdownTimer endsAt={new Date(content.endsAt).getTime()} />}
      products={content.products}
    />
  );
}
