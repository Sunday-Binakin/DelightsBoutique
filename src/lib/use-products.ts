"use client";

import { keepPreviousData, useQuery, useQueries } from "@tanstack/react-query";
import { getProducts, getProductBySlug, toProduct, type ProductListParams } from "@/lib/api/products";
import { isNotFoundError, shouldRetryQuery } from "@/lib/api/client";
import type { Product } from "@/lib/types";

export const PRODUCT_PAGE_SIZE = 20;

/** For the few consumers that genuinely need the whole catalog in memory (product
 * picker, stock-status counts). The API caps a page, so this stops at 100 — past that,
 * these need their own pagination. */
export const FULL_CATALOG_LIMIT = 100;

export function useProductsList(params: ProductListParams = {}, options: { enabled?: boolean } = {}) {
  const query = useQuery({
    queryKey: ["products", params],
    queryFn: () => getProducts({ limit: PRODUCT_PAGE_SIZE, ...params }),
    enabled: options.enabled ?? true,
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    products: query.data ? query.data.data.map(toProduct) : [],
    total: query.data?.total ?? 0,
  };
}

export function useProduct(slug: string | undefined) {
  const query = useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug!),
    enabled: Boolean(slug),
    retry: shouldRetryQuery,
  });

  return {
    ...query,
    product: query.data ? toProduct(query.data) : undefined,
    notFound: isNotFoundError(query.error),
  };
}

/** Resolves a set of slugs (cart lines, wishlist) to products via parallel per-slug
 * requests — there's no bulk-by-slugs endpoint, so this is N small cached requests. */
export function useProductsBySlug(slugs: string[]) {
  const results = useQueries({
    queries: slugs.map((slug) => ({
      queryKey: ["product", slug],
      queryFn: () => getProductBySlug(slug),
    })),
  });

  const bySlug = new Map<string, Product>();
  results.forEach((result, index) => {
    if (result.data) bySlug.set(slugs[index], toProduct(result.data));
  });

  return {
    bySlug,
    isLoading: results.some((r) => r.isLoading),
    isError: results.some((r) => r.isError),
    refetch: () => results.forEach((r) => r.refetch()),
  };
}
