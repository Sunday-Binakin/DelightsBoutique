import type { Product } from "@/lib/types";

/** The products the sale actually shows — curated picks if any, else items with a compareAtPrice. */
export function pickFlashSaleProducts(products: Product[], productSlugs: string[]): Product[] {
  return productSlugs.length
    ? products.filter((p) => productSlugs.includes(p.slug))
    : products.filter((p) => Boolean(p.compareAtPrice));
}
