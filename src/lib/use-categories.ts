"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategories, toCategory } from "@/lib/api/categories";

/** Bare, unpaginated list per the contract — small enough to always fetch in full. */
export function useCategories() {
  const query = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  return query.data ? query.data.map(toCategory) : [];
}

/** Same data plus loading/error state, for callers that need to tell "still
 * loading" apart from "genuinely not found" (e.g. a category detail page). */
export function useCategoriesQuery() {
  const query = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  return { ...query, categories: query.data ? query.data.map(toCategory) : [] };
}
