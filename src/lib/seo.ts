import type { ProductDto } from "@/lib/api/types";
import { resolveAssetUrl } from "@/lib/asset-url";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const AVAILABILITY: Record<ProductDto["stockStatus"], string> = {
  inStock: "https://schema.org/InStock",
  lowStock: "https://schema.org/LimitedAvailability",
  outOfStock: "https://schema.org/OutOfStock",
};

/** schema.org Product data. Inline data-URL photos are left out: crawlers can't fetch them. */
export function productJsonLd(product: ProductDto) {
  const url = `${SITE_URL}/product/${product.slug}`;
  const images = product.imageUrls
    .filter((src) => !src.startsWith("data:"))
    .map(resolveAssetUrl);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    url,
    category: product.category,
    ...(images.length > 0 ? { image: images } : {}),
    offers: {
      "@type": "Offer",
      url,
      price: product.retailPrice.toFixed(2),
      priceCurrency: "GHS",
      availability: AVAILABILITY[product.stockStatus],
    },
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };
}
