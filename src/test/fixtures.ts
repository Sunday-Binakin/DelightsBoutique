import type { ProductDto } from "@/lib/api/types";

export function makeProductDto(overrides: Partial<ProductDto> & { slug: string }): ProductDto {
  return {
    id: `id-${overrides.slug}`,
    name: overrides.slug.replace(/-/g, " "),
    categorySlug: "scarves",
    category: "Scarves",
    description: "",
    retailPrice: 120,
    wholesalePrice: null,
    wholesaleMoq: null,
    compareAtPrice: null,
    rating: 5,
    reviewCount: 0,
    tone: "rose",
    badge: null,
    stockStatus: "inStock",
    sizes: [],
    colors: [],
    imageUrls: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}
