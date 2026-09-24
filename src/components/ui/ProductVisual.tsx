import type { Product } from "@/lib/types";
import { MediaSwatch } from "@/components/ui/MediaSwatch";
import { getCategoryArt } from "@/components/ui/category-art";

interface ProductVisualProps {
  product: Product;
  className?: string;
  iconClassName?: string;
}

export function ProductVisual({ product, className = "", iconClassName }: ProductVisualProps) {
  return (
    <MediaSwatch
      imageUrl={product.imageUrls?.[0]}
      icon={getCategoryArt(product.categorySlug)}
      label={product.name}
      tone={product.tone}
      className={className}
      iconClassName={iconClassName}
    />
  );
}
