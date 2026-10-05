export type PlaceholderTone = "rose" | "cream" | "charcoal" | "gold";

export type StockStatus = "inStock" | "lowStock" | "outOfStock";

export const BADGE_LABELS: Record<"new" | "bestSeller", string> = {
  new: "New",
  bestSeller: "Best Seller",
};

export interface Category {
  slug: string;
  name: string;
  tone: PlaceholderTone;
  /** Uploaded category photo (data URL) — falls back to the illustration when absent. */
  imageUrl?: string;
}

export interface Product {
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  description: string;
  retailPrice: number;
  wholesalePrice?: number;
  /** Minimum order quantity to qualify for wholesalePrice. */
  wholesaleMoq?: number;
  /** Pre-discount price, shown struck through next to retailPrice when on sale. */
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  tone: PlaceholderTone;
  badge?: "new" | "bestSeller";
  stockStatus: StockStatus;
  sizes?: string[];
  colors?: string[];
  /** Uploaded product photos (data URLs) — the first is the cover shown on cards/listings; falls back to the category illustration when empty. */
  imageUrls?: string[];
}

export interface PromoBannerContent {
  eyebrow: string;
  title: string;
  ctaLabel: string;
  href: string;
  tone: PlaceholderTone;
  /** Category slug whose art illustrates this banner (see category-art.tsx). */
  artCategorySlug: string;
  /** Uploaded banner photo (data URL) — falls back to the illustration when absent. */
  imageUrl?: string;
  /** Hex color for the eyebrow/title/button text laid over the banner image. */
  textColor?: string;
}
