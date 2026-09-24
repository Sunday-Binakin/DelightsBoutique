"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useProducts } from "@/lib/use-products";
import { formatPrice } from "@/lib/format";
import { buildWhatsAppLink } from "@/lib/constants";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AddToCartForm } from "@/components/product/AddToCartForm";
import { StarRating } from "@/components/ui/StarRating";
import { StockBadge } from "@/components/ui/StockBadge";
import { WhatsAppIcon } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/Button";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = useProducts().find((p) => p.slug === slug);

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="font-serif text-2xl font-semibold text-foreground">Product not found</h1>
        <LinkButton href="/" className="mt-6">
          Back to Home
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/category/${product.categorySlug}`} className="hover:text-primary">
          {product.category}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <ProductGallery product={product} />

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            {product.category}
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-foreground">
            {product.name}
          </h1>

          <div className="mt-2 flex items-center gap-3">
            <StarRating rating={product.rating} reviewCount={product.reviewCount} />
            <StockBadge status={product.stockStatus} />
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            {product.compareAtPrice && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
            <span className="text-2xl font-semibold text-foreground">
              {formatPrice(product.retailPrice)}
            </span>
          </div>
          {product.wholesalePrice && (
            <p className="mt-1 text-sm text-primary">
              Wholesale price {formatPrice(product.wholesalePrice)} on orders of{" "}
              {product.wholesaleMoq}+ units.
            </p>
          )}

          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-6 border-t border-border-subtle pt-6">
            <AddToCartForm product={product} />
          </div>

          <a
            href={buildWhatsAppLink(`Hello Delight's Boutique, I'd like to ask about ${product.name}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Ask about this item on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
