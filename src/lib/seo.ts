import type { ProductDto } from "@/lib/api/types";
import { resolveAssetUrl } from "@/lib/asset-url";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const AVAILABILITY: Record<ProductDto["stockStatus"], string> = {
  inStock: "https://schema.org/InStock",
  lowStock: "https://schema.org/LimitedAvailability",
  outOfStock: "https://schema.org/OutOfStock",
};

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function siteJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Delight's Boutique",
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Delight's Boutique",
      url: SITE_URL,
    },
  ];
}

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
