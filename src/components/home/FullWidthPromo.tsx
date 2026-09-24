"use client";

import { useBanners } from "@/lib/use-banners";
import { PromoBanner } from "@/components/home/PromoBanner";

export function FullWidthPromo() {
  const banners = useBanners();

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <PromoBanner content={banners.fullWidth} size="large" />
    </section>
  );
}
