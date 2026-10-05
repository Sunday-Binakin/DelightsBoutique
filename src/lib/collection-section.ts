import type { Product } from "@/lib/types";

// Fallback per tab when an admin hasn't manually picked products yet.
const TAB_FALLBACK_FILTERS: Array<(product: Product) => boolean> = [
  (p) => p.badge === "new",
  (p) => p.badge === "bestSeller",
  (p) => Boolean(p.wholesalePrice),
];

/** The products a tab actually shows — curated picks if any, else the badge/wholesale fallback. */
export function pickCollectionTabProducts(
  products: Product[],
  curatedSlugs: string[],
  tabIndex: 0 | 1 | 2,
): Product[] {
  return curatedSlugs.length
    ? products.filter((p) => curatedSlugs.includes(p.slug))
    : products.filter(TAB_FALLBACK_FILTERS[tabIndex]);
}
