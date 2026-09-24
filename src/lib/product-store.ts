import type { Product } from "@/lib/types";
import { featuredProducts as seedProducts } from "@/lib/data/products";

// Shared product data behind both the storefront and the admin panel.
// There's no backend yet, so this persists to localStorage and falls back
// to the static seed data (data/products.ts) until an admin makes a
// change. Once a real API/database exists, swap the bodies of these
// functions for network calls — callers don't need to change.
const STORAGE_KEY = "delight-boutique-products";

function readStore(): Product[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStore(products: Product[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch {
    // Storage may be full or blocked — edits still apply for this session.
  }
}

export function getAllProducts(): Product[] {
  return readStore() ?? seedProducts;
}

export function getProductBySlug(slug: string): Product | undefined {
  return getAllProducts().find((product) => product.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return getAllProducts().filter((product) => product.categorySlug === categorySlug);
}

/** Adds a new product, or updates the existing one with a matching slug. */
export function saveProduct(product: Product) {
  const all = getAllProducts();
  const index = all.findIndex((p) => p.slug === product.slug);
  const next = index >= 0 ? all.map((p, i) => (i === index ? product : p)) : [...all, product];
  writeStore(next);
}

export function deleteProduct(slug: string) {
  writeStore(getAllProducts().filter((product) => product.slug !== slug));
}
