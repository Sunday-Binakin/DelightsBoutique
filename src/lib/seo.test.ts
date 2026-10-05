import { describe, expect, it } from "vitest";
import { productJsonLd } from "./seo";
import { makeProductDto } from "@/test/fixtures";

describe("productJsonLd", () => {
  it("prices in GHS with two decimals and maps stock to schema.org availability", () => {
    const data = productJsonLd(makeProductDto({ slug: "silk-scarf", retailPrice: 120, stockStatus: "outOfStock" }));
    expect(data).toMatchObject({
      "@type": "Product",
      name: "silk scarf",
      offers: { "@type": "Offer", price: "120.00", priceCurrency: "GHS", availability: "https://schema.org/OutOfStock" },
    });
  });

  it("drops inline data-URL photos and keeps API photos as absolute URLs", () => {
    const data = productJsonLd(
      makeProductDto({
        slug: "scarf",
        imageUrls: ["data:image/jpeg;base64,AAAA", "/files/uploads/a.jpg"],
      }),
    );
    expect(data).toMatchObject({ image: ["https://api.test.invalid/files/uploads/a.jpg"] });
  });

  it("omits image and rating when there are none", () => {
    const data = productJsonLd(makeProductDto({ slug: "scarf", imageUrls: [], reviewCount: 0 }));
    expect(data).not.toHaveProperty("image");
    expect(data).not.toHaveProperty("aggregateRating");
  });

  it("includes an aggregate rating once there are reviews", () => {
    const data = productJsonLd(makeProductDto({ slug: "scarf", rating: 4.5, reviewCount: 12 }));
    expect(data).toMatchObject({ aggregateRating: { ratingValue: 4.5, reviewCount: 12 } });
  });
});
