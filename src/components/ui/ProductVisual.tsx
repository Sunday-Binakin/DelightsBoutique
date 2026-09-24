import type { Product } from "@/lib/types";
import { IllustrationSwatch } from "@/components/ui/IllustrationSwatch";
import { getCategoryArt } from "@/components/ui/category-art";

interface ProductVisualProps {
  product: Product;
  className?: string;
  iconClassName?: string;
}

/** Shows the admin-uploaded photo when there is one, otherwise the category illustration. */
export function ProductVisual({ product, className = "", iconClassName }: ProductVisualProps) {
  if (product.imageUrl) {
    return (
      <div className={`overflow-hidden ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- data URL from local upload, not a remote asset Next can optimize */}
        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <IllustrationSwatch
      icon={getCategoryArt(product.categorySlug)}
      label={product.name}
      tone={product.tone}
      className={className}
      iconClassName={iconClassName}
    />
  );
}
