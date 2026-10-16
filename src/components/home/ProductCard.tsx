import { memo } from "react";
import Link from "next/link";
import { BADGE_LABELS, type Product } from "@/lib/types";
import { ProductVisual } from "@/components/ui/ProductVisual";
import { StarRating } from "@/components/ui/StarRating";
import { WishlistButton } from "@/components/ui/WishlistButton";
import { formatPrice } from "@/lib/format";

export const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative">
        <ProductVisual
          product={product}
          className="aspect-3/4 w-full rounded-xl transition-transform group-hover:scale-[1.02]"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-background px-2.5 py-1 text-xs font-semibold text-foreground shadow">
            {BADGE_LABELS[product.badge]}
          </span>
        )}
        <div className="absolute right-3 top-3">
          <WishlistButton slug={product.slug} productName={product.name} />
        </div>
      </div>
      <div className="mt-3">
        <p className="text-sm font-medium text-foreground">{product.name}</p>
        <div className="mt-1">
          <StarRating rating={product.rating} reviewCount={product.reviewCount} />
        </div>
        <p className="mt-1 flex flex-wrap items-baseline gap-2 text-sm">
          {product.compareAtPrice && (
            <span className="text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
          <span className="font-semibold text-foreground">{formatPrice(product.retailPrice)}</span>
          {product.wholesalePrice && (
            <span className="text-xs text-primary">
              Wholesale {formatPrice(product.wholesalePrice)}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
});
