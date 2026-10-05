"use client";

import { useMutation, useQueries, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import {
  createProduct,
  updateProduct,
  deleteProduct as deleteProductApi,
  getProducts,
  fromProduct,
} from "@/lib/api/products";
import {
  createCategory,
  updateCategory,
  deleteCategory as deleteCategoryApi,
  fromCategory,
} from "@/lib/api/categories";
import type { Product, Category } from "@/lib/types";

function invalidateCatalog(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["products"] });
  queryClient.invalidateQueries({ queryKey: ["categories"] });
}

export function useSaveProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ product, isEditing }: { product: Product; isEditing: boolean }) =>
      isEditing
        ? updateProduct(product.slug, fromProduct(product))
        : createProduct(fromProduct(product)),
    onSuccess: () => invalidateCatalog(queryClient),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => deleteProductApi(slug),
    onSuccess: () => invalidateCatalog(queryClient),
  });
}

export function useSaveCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ category, isEditing }: { category: Category; isEditing: boolean }) =>
      isEditing
        ? updateCategory(category.slug, fromCategory(category))
        : createCategory(fromCategory(category)),
    onSuccess: () => invalidateCatalog(queryClient),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => deleteCategoryApi(slug),
    onSuccess: () => invalidateCatalog(queryClient),
  });
}

/** How many products fall under each category — one cheap `limit=1` request per
 * slug, reading just the paginated envelope's `total`. Used for the admin sidebar. */
export function useCategoryProductCounts(categorySlugs: string[]) {
  const results = useQueries({
    queries: categorySlugs.map((slug) => ({
      queryKey: ["products", { category: slug, limit: 1 }],
      queryFn: () => getProducts({ category: slug, limit: 1 }),
    })),
  });

  const countBySlug = new Map<string, number>();
  results.forEach((result, index) => {
    if (result.data) countBySlug.set(categorySlugs[index], result.data.total);
  });
  return countBySlug;
}

export function useTotalProductCount() {
  const query = useQuery({
    queryKey: ["products", { limit: 1 }],
    queryFn: () => getProducts({ limit: 1 }),
  });
  return { total: query.data?.total ?? 0, isLoading: query.isLoading, isError: query.isError };
}
