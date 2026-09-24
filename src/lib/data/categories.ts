import type { Category } from "@/lib/types";

export const categories: Category[] = [
  { slug: "dresses", name: "Dresses", tone: "rose" },
  { slug: "footwear", name: "Footwear", tone: "charcoal" },
  { slug: "bags", name: "Bags", tone: "gold" },
  { slug: "fabrics", name: "Fabrics", tone: "cream" },
  { slug: "jewellery", name: "Jewellery", tone: "gold" },
  { slug: "accessories", name: "Accessories", tone: "rose" },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}
