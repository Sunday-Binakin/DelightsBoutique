"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { ProductVisual } from "@/components/ui/ProductVisual";
import { MediaSwatch } from "@/components/ui/MediaSwatch";
import { getCategoryArt } from "@/components/ui/category-art";
import { resolveAssetUrl } from "@/lib/asset-url";

export function ProductGallery({ product }: { product: Product }) {
  const images = product.imageUrls ?? [];
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length <= 1) {
    return (
      <ProductVisual
        product={product}
        iconClassName="h-1/2 w-1/2"
        className="aspect-4/5 w-full rounded-2xl"
      />
    );
  }

  return (
    <div>
      <MediaSwatch
        imageUrl={images[activeIndex]}
        icon={getCategoryArt(product.categorySlug)}
        label={product.name}
        tone={product.tone}
        loading="eager"
        className="aspect-4/5 w-full rounded-2xl"
        iconClassName="h-1/2 w-1/2"
      />
      <div className="mt-3 grid grid-cols-5 gap-2">
        {images.map((url, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Show photo ${index + 1} of ${images.length}`}
            className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
              index === activeIndex ? "border-primary" : "border-transparent hover:border-border-subtle"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- served from the API host, not optimised by next/image */}
            <img src={resolveAssetUrl(url)} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
