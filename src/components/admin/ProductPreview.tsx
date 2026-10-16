import Link from "next/link";
import { BADGE_LABELS, type Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { ProductVisual } from "@/components/ui/ProductVisual";
import { StarRating } from "@/components/ui/StarRating";
import { StockBadge } from "@/components/ui/StockBadge";
import { LinkButton, Button } from "@/components/ui/Button";

interface ProductPreviewProps {
  product: Product | null;
  onDelete?: (slug: string, name: string) => void;
}

export function ProductPreview({ product, onDelete }: ProductPreviewProps) {
  if (!product) {
    return (
      <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border-subtle p-6 text-center">
        <p className="text-sm text-muted-foreground">Select a product to preview it here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border-subtle p-5">
      <ProductVisual product={product} className="aspect-square w-full rounded-lg" />

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          {product.category}
          {product.badge && (
            <span className="ml-2 text-foreground/60">• {BADGE_LABELS[product.badge]}</span>
          )}
        </p>
        <h3 className="mt-1 font-serif text-lg font-semibold text-foreground">{product.name}</h3>

        <div className="mt-2">
          <StarRating rating={product.rating} reviewCount={product.reviewCount} />
        </div>

        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          {product.compareAtPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
          <span className="text-lg font-semibold text-foreground">
            {formatPrice(product.retailPrice)}
          </span>
        </div>
        {product.wholesalePrice && (
          <p className="mt-1 text-sm text-primary">
            Wholesale {formatPrice(product.wholesalePrice)} · MOQ {product.wholesaleMoq}
          </p>
        )}

        <div className="mt-2">
          <StockBadge status={product.stockStatus} />
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        {product.sizes && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Sizes
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {product.sizes.map((size) => (
                <span
                  key={size}
                  className="rounded-full border border-border-subtle px-2.5 py-0.5 text-xs text-foreground/80"
                >
                  {size}
                </span>
              ))}
            </div>
          </div>
        )}

        {product.colors && (
          <div className="mt-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Colors
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {product.colors.map((color) => (
                <span
                  key={color}
                  className="rounded-full border border-border-subtle px-2.5 py-0.5 text-xs text-foreground/80"
                >
                  {color}
                </span>
              ))}
            </div>
          </div>
        )}

        {onDelete && (
          <>
            <div className="mt-5 flex gap-3">
              <LinkButton href={`/admin/products/${product.slug}/edit`} className="flex-1">
                Edit
              </LinkButton>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onDelete(product.slug, product.name)}
              >
                Delete
              </Button>
            </div>

            <Link
              href={`/product/${product.slug}`}
              target="_blank"
              className="mt-3 block text-center text-xs text-muted-foreground hover:text-primary"
            >
              View on storefront ↗
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
