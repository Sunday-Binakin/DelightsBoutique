"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { useProducts } from "@/lib/use-products";
import { Tabs } from "@/components/ui/Tabs";
import { ProductGridSection } from "@/components/home/ProductGridSection";

const TAB_FILTERS: Record<string, (product: Product) => boolean> = {
  "New Arrivals": (p) => p.badge === "New",
  "Best Sellers": (p) => p.badge === "Best Seller",
  "Wholesale Picks": (p) => Boolean(p.wholesalePrice),
};

const TABS = Object.keys(TAB_FILTERS);

export function BestSellingSection() {
  const products = useProducts();
  const [active, setActive] = useState(TABS[0]);
  const visible = products.filter(TAB_FILTERS[active]);

  return (
    <ProductGridSection
      eyebrow="Handpicked for You"
      title="Shop the Collection"
      header={<Tabs tabs={TABS} active={active} onChange={setActive} />}
      products={visible.length ? visible : products.slice(0, 4)}
    />
  );
}
