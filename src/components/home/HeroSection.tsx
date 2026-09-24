"use client";

import { useBanners } from "@/lib/use-banners";
import { PromoBanner } from "@/components/home/PromoBanner";

export function HeroSection() {
  const banners = useBanners();

  return (
    <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 lg:grid-cols-[2fr_1fr]">
      <PromoBanner content={banners.heroMain} size="large" />
      <div className="grid gap-4">
        <PromoBanner content={banners.heroSide1} />
        <PromoBanner content={banners.heroSide2} />
      </div>
    </section>
  );
}
