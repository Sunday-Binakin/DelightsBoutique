import type { Product } from "@/lib/types";

export interface CollectionSectionContent {
  eyebrow: string;
  title: string;
  newArrivalsLabel: string;
  bestSellersLabel: string;
  wholesalePicksLabel: string;
  /** Product slugs manually picked for each tab. Empty = auto-fill from badge/wholesale price. */
  newArrivalsSlugs: string[];
  bestSellersSlugs: string[];
  wholesalePicksSlugs: string[];
}

// The "Handpicked for You / Shop the Collection" tabbed section on the
// homepage — its heading, tab labels, and which products show under each
// tab are all editable from /admin/content. Leaving a tab's picks empty
// falls back to auto-selecting by that product's badge/wholesale price.
export const DEFAULT_COLLECTION_SECTION: CollectionSectionContent = {
  eyebrow: "Handpicked for You",
  title: "Shop the Collection",
  newArrivalsLabel: "New Arrivals",
  bestSellersLabel: "Best Sellers",
  wholesalePicksLabel: "Wholesale Picks",
  newArrivalsSlugs: [],
  bestSellersSlugs: [],
  wholesalePicksSlugs: [],
};

const STORAGE_KEY = "delight-boutique-collection-section";

export function getCollectionSection(): CollectionSectionContent {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_COLLECTION_SECTION, ...JSON.parse(raw) } : DEFAULT_COLLECTION_SECTION;
  } catch {
    return DEFAULT_COLLECTION_SECTION;
  }
}

export function saveCollectionSection(updates: Partial<CollectionSectionContent>) {
  const next = { ...getCollectionSection(), ...updates };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage may be full or blocked — the change still applies for this session.
  }
}

// Fallback per tab when an admin hasn't manually picked products yet.
const TAB_FALLBACK_FILTERS: Array<(product: Product) => boolean> = [
  (p) => p.badge === "New",
  (p) => p.badge === "Best Seller",
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
