"use client";

import { useState } from "react";
import { useCollectionSection } from "@/lib/use-collection-section";
import { Tabs } from "@/components/ui/Tabs";
import { ProductGridSection } from "@/components/home/ProductGridSection";

export function BestSellingSection() {
  const content = useCollectionSection();
  const [activeIndex, setActiveIndex] = useState<0 | 1 | 2>(0);

  const tabs = [content.newArrivalsLabel, content.bestSellersLabel, content.wholesalePicksLabel];
  const visible = [content.newArrivals, content.bestSellers, content.wholesalePicks][activeIndex];

  return (
    <ProductGridSection
      eyebrow={content.eyebrow}
      title={content.title}
      header={
        <Tabs
          tabs={tabs}
          active={tabs[activeIndex]}
          onChange={(label) => {
            const index = tabs.indexOf(label);
            if (index === 0 || index === 1 || index === 2) setActiveIndex(index);
          }}
        />
      }
      products={visible}
    />
  );
}
