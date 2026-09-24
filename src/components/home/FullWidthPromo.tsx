import type { PromoBannerContent } from "@/lib/types";
import { PromoBanner } from "@/components/home/PromoBanner";

const CONTENT: PromoBannerContent = {
  eyebrow: "Wholesale & Retail",
  title: "Outfit Your Whole Wardrobe — or Your Whole Shop",
  ctaLabel: "Talk to Us on WhatsApp",
  href: "/wholesale",
  tone: "charcoal",
  artCategorySlug: "bags",
};

export function FullWidthPromo() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <PromoBanner content={CONTENT} size="large" />
    </section>
  );
}
