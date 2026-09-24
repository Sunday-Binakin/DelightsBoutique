import type { Product } from "@/lib/types";
import { ProductVisual } from "@/components/ui/ProductVisual";

export function ProductGallery({ product }: { product: Product }) {
  return (
    <ProductVisual
      product={product}
      iconClassName="h-1/2 w-1/2"
      className="aspect-4/5 w-full rounded-2xl"
    />
  );
}
