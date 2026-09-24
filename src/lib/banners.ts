import type { PromoBannerContent } from "@/lib/types";

export interface BannerSet {
  heroMain: PromoBannerContent;
  heroSide1: PromoBannerContent;
  heroSide2: PromoBannerContent;
  fullWidth: PromoBannerContent;
}

/** Text color choices offered wherever an admin overlays text on a banner image. */
export const TEXT_COLOR_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "White", value: "#ffffff" },
  { label: "Cream", value: "#f3e9da" },
  { label: "Gold", value: "#c9a66b" },
  { label: "Charcoal", value: "#2b2320" },
  { label: "Maroon", value: "#7c3f42" },
];

export const BANNER_LABELS: Record<keyof BannerSet, string> = {
  heroMain: "Homepage Hero — Main",
  heroSide1: "Homepage Hero — Side 1",
  heroSide2: "Homepage Hero — Side 2",
  fullWidth: "Full-Width Promo Banner",
};

export const DEFAULT_BANNERS: BannerSet = {
  heroMain: {
    eyebrow: "New Season",
    title: "Corporate & Occasion Dresses, Made to Turn Heads",
    ctaLabel: "Shop Dresses",
    href: "/category/dresses",
    tone: "rose",
    artCategorySlug: "dresses",
    textColor: "#ffffff",
  },
  heroSide1: {
    eyebrow: "Fresh Stock",
    title: "African Prints & Lace Fabrics",
    ctaLabel: "Shop Fabrics",
    href: "/category/fabrics",
    tone: "cream",
    artCategorySlug: "fabrics",
    textColor: "#ffffff",
  },
  heroSide2: {
    eyebrow: "Wholesale Ready",
    title: "Bags & Footwear in Bulk",
    ctaLabel: "Shop Now",
    href: "/wholesale",
    tone: "charcoal",
    artCategorySlug: "bags",
    textColor: "#ffffff",
  },
  fullWidth: {
    eyebrow: "Wholesale & Retail",
    title: "Outfit Your Whole Wardrobe — or Your Whole Shop",
    ctaLabel: "Talk to Us on WhatsApp",
    href: "/wholesale",
    tone: "charcoal",
    artCategorySlug: "bags",
    textColor: "#ffffff",
  },
};

const STORAGE_KEY = "delight-boutique-banners";

export function getBanners(): BannerSet {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_BANNERS, ...JSON.parse(raw) } : DEFAULT_BANNERS;
  } catch {
    return DEFAULT_BANNERS;
  }
}

export function saveBanner(key: keyof BannerSet, content: PromoBannerContent) {
  const next = { ...getBanners(), [key]: content };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage may be full or blocked — the change still applies for this session.
  }
}
