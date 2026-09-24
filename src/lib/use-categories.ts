"use client";

import { useEffect, useState } from "react";
import type { Category } from "@/lib/types";
import { categories as seedCategories } from "@/lib/data/categories";
import { getAllCategories } from "@/lib/category-store";

/** Live category list for client components — see use-products.ts for the same pattern. */
export function useCategories(): Category[] {
  const [categories, setCategories] = useState<Category[]>(seedCategories);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage
    setCategories(getAllCategories());
  }, []);

  return categories;
}
