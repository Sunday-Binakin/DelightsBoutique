"use client";

import { useProducts } from "@/lib/use-products";
import { useWishlist } from "@/lib/wishlist-context";
import { CatalogView } from "@/components/catalog/CatalogView";

export default function WishlistPage() {
  const products = useProducts();
  const { slugs } = useWishlist();

  const saved = products.filter((product) => slugs.includes(product.slug));

  return (
    <CatalogView
      title="My Wishlist"
      subtitle={
        saved.length > 0
          ? `${saved.length} saved item${saved.length === 1 ? "" : "s"}.`
          : "Tap the heart on any product to save it here."
      }
      products={saved}
    />
  );
}
