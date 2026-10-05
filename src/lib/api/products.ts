import { apiFetch } from "./client";
import type { BulkUploadResult, CreateProductBody, Paginated, ProductDto, UpdateProductBody } from "./types";
import type { Product } from "@/lib/types";

export interface ProductListParams {
  category?: string;
  search?: string;
  badge?: "new" | "bestSeller";
  sort?: "newest" | "price-asc" | "price-desc" | "rating";
  minPrice?: number;
  maxPrice?: number;
  size?: string[];
  color?: string[];
  page?: number;
  limit?: number;
}

export function getProducts(params: ProductListParams = {}): Promise<Paginated<ProductDto>> {
  return apiFetch<Paginated<ProductDto>>("/api/products", { query: { ...params } });
}

export function getProductBySlug(slug: string): Promise<ProductDto> {
  return apiFetch<ProductDto>(`/api/products/${encodeURIComponent(slug)}`);
}

export function createProduct(body: CreateProductBody): Promise<ProductDto> {
  return apiFetch<ProductDto>("/api/admin/products", { method: "POST", body });
}

export function updateProduct(slug: string, body: UpdateProductBody): Promise<ProductDto> {
  return apiFetch<ProductDto>(`/api/admin/products/${encodeURIComponent(slug)}`, {
    method: "PATCH",
    body,
  });
}

export function deleteProduct(slug: string): Promise<void> {
  return apiFetch<void>(`/api/admin/products/${encodeURIComponent(slug)}`, { method: "DELETE" });
}

export function bulkUploadProducts(file: File): Promise<BulkUploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<BulkUploadResult>("/api/admin/products/bulk-upload", { method: "POST", formData });
}

/** Builds the admin create/update payload from the app's Product shape. */
export function fromProduct(product: Product): CreateProductBody {
  return {
    slug: product.slug,
    name: product.name,
    categorySlug: product.categorySlug,
    description: product.description,
    retailPrice: product.retailPrice,
    wholesalePrice: product.wholesalePrice ?? null,
    wholesaleMoq: product.wholesaleMoq ?? null,
    compareAtPrice: product.compareAtPrice ?? null,
    rating: product.rating,
    reviewCount: product.reviewCount,
    tone: product.tone,
    badge: product.badge ?? null,
    stockStatus: product.stockStatus,
    sizes: product.sizes ?? [],
    colors: product.colors ?? [],
    imageUrls: product.imageUrls ?? [],
  };
}

/** Adapts the backend's nullable DTO fields to the app's Product type (optional, never null). */
export function toProduct(dto: ProductDto): Product {
  return {
    slug: dto.slug,
    name: dto.name,
    category: dto.category,
    categorySlug: dto.categorySlug,
    description: dto.description,
    retailPrice: dto.retailPrice,
    wholesalePrice: dto.wholesalePrice ?? undefined,
    wholesaleMoq: dto.wholesaleMoq ?? undefined,
    compareAtPrice: dto.compareAtPrice ?? undefined,
    rating: dto.rating,
    reviewCount: dto.reviewCount,
    tone: dto.tone,
    badge: dto.badge ?? undefined,
    stockStatus: dto.stockStatus,
    sizes: dto.sizes.length ? dto.sizes : undefined,
    colors: dto.colors.length ? dto.colors : undefined,
    imageUrls: dto.imageUrls.length ? dto.imageUrls : undefined,
  };
}
