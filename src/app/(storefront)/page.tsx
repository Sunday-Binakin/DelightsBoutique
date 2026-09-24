import { HeroSection } from "@/components/home/HeroSection";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ShopByFilters } from "@/components/home/ShopByFilters";
import { BestSellingSection } from "@/components/home/BestSellingSection";
import { FullWidthPromo } from "@/components/home/FullWidthPromo";
import { FlashSaleSection } from "@/components/home/FlashSaleSection";
import { TrustBadges } from "@/components/home/TrustBadges";
import { NewsletterSignup } from "@/components/home/NewsletterSignup";

export default function Home() {
  return (
    <>
      <HeroSection />
      <CategoryGrid />
      <ShopByFilters />
      <BestSellingSection />
      <FullWidthPromo />
      <FlashSaleSection />
      <TrustBadges />
      <NewsletterSignup />
    </>
  );
}
