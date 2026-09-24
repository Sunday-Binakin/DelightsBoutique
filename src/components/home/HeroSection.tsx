import type { PromoBannerContent } from "@/lib/types";
import { PromoBanner } from "@/components/home/PromoBanner";

const HERO_MAIN: PromoBannerContent = {
  eyebrow: "New Season",
  title: "Corporate & Occasion Dresses, Made to Turn Heads",
  ctaLabel: "Shop Dresses",
  href: "/category/dresses",
  tone: "rose",
  artCategorySlug: "dresses",
};

const HERO_SIDE: PromoBannerContent[] = [
  {
    eyebrow: "Fresh Stock",
    title: "African Prints & Lace Fabrics",
    ctaLabel: "Shop Fabrics",
    href: "/category/fabrics",
    tone: "cream",
    artCategorySlug: "fabrics",
  },
  {
    eyebrow: "Wholesale Ready",
    title: "Bags & Footwear in Bulk",
    ctaLabel: "Shop Now",
    href: "/wholesale",
    tone: "charcoal",
    artCategorySlug: "bags",
  },
];

export function HeroSection() {
  return (
    <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 lg:grid-cols-[2fr_1fr]">
      <PromoBanner content={HERO_MAIN} size="large" />
      <div className="grid gap-4">
        {HERO_SIDE.map((banner) => (
          <PromoBanner key={banner.href} content={banner} />
        ))}
      </div>
    </section>
  );
}
