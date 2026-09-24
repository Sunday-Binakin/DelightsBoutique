import type { Category } from "@/lib/types";
import { categories as seedCategories } from "@/lib/data/categories";

// Mirrors product-store.ts: persists to localStorage, falling back to the
// static seed (data/categories.ts) until an admin adds/edits a category.
const STORAGE_KEY = "delight-boutique-categories";

function readStore(): Category[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStore(categories: Category[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  } catch {
    // Storage may be full or blocked — edits still apply for this session.
  }
}

export function getAllCategories(): Category[] {
  return readStore() ?? seedCategories;
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return getAllCategories().find((category) => category.slug === slug);
}

/** Adds a new category, or updates the existing one with a matching slug. */
export function saveCategory(category: Category) {
  const all = getAllCategories();
  const index = all.findIndex((c) => c.slug === category.slug);
  const next = index >= 0 ? all.map((c, i) => (i === index ? category : c)) : [...all, category];
  writeStore(next);
}

export function deleteCategory(slug: string) {
  writeStore(getAllCategories().filter((category) => category.slug !== slug));
}
