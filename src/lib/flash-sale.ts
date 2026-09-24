import type { Product } from "@/lib/types";

export interface FlashSaleContent {
  eyebrow: string;
  title: string;
  /** ISO timestamp the countdown ends at. */
  endsAt: string;
  /** Product slugs manually picked for the sale. Empty = auto-fill from compareAtPrice. */
  productSlugs: string[];
}

// The "Flash Sale" homepage section — heading, countdown end time, and which
// products show are all editable from /admin/content. Leaving productSlugs
// empty falls back to auto-selecting products that have a compareAtPrice set.
export const DEFAULT_FLASH_SALE: FlashSaleContent = {
  eyebrow: "Ends Soon",
  title: "Flash Sale",
  endsAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
  productSlugs: [],
};

const STORAGE_KEY = "delight-boutique-flash-sale";

export function getFlashSale(): FlashSaleContent {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_FLASH_SALE, ...JSON.parse(raw) } : DEFAULT_FLASH_SALE;
  } catch {
    return DEFAULT_FLASH_SALE;
  }
}

export function saveFlashSale(updates: Partial<FlashSaleContent>) {
  const next = { ...getFlashSale(), ...updates };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage may be full or blocked — the change still applies for this session.
  }
}

/** The products the sale actually shows — curated picks if any, else items with a compareAtPrice. */
export function pickFlashSaleProducts(products: Product[], productSlugs: string[]): Product[] {
  return productSlugs.length
    ? products.filter((p) => productSlugs.includes(p.slug))
    : products.filter((p) => Boolean(p.compareAtPrice));
}
