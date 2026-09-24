"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { featuredProducts as seedProducts } from "@/lib/data/products";
import { getAllProducts } from "@/lib/product-store";

/**
 * Live product list for client components. Starts from the static seed
 * (so server and client render the same thing on first paint) and swaps
 * in the real store's contents right after mount.
 */
export function useProducts(): Product[] {
  const [products, setProducts] = useState<Product[]>(seedProducts);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage, see cart-context.tsx for the same pattern
    setProducts(getAllProducts());
  }, []);

  return products;
}
