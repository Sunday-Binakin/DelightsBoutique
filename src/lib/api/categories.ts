import { apiFetch } from "./client";
import type { CategoryDto, CreateCategoryBody, UpdateCategoryBody } from "./types";
import type { Category } from "@/lib/types";

export function getCategories(): Promise<CategoryDto[]> {
  return apiFetch<CategoryDto[]>("/api/categories");
}

export function getCategoryBySlug(slug: string): Promise<CategoryDto> {
  return apiFetch<CategoryDto>(`/api/categories/${encodeURIComponent(slug)}`);
}

export function createCategory(body: CreateCategoryBody): Promise<CategoryDto> {
  return apiFetch<CategoryDto>("/api/admin/categories", { method: "POST", body });
}

export function updateCategory(slug: string, body: UpdateCategoryBody): Promise<CategoryDto> {
  return apiFetch<CategoryDto>(`/api/admin/categories/${encodeURIComponent(slug)}`, {
    method: "PATCH",
    body,
  });
}

export function deleteCategory(slug: string): Promise<void> {
  return apiFetch<void>(`/api/admin/categories/${encodeURIComponent(slug)}`, { method: "DELETE" });
}

export function toCategory(dto: CategoryDto): Category {
  return {
    slug: dto.slug,
    name: dto.name,
    tone: dto.tone,
    imageUrl: dto.imageUrl ?? undefined,
  };
}

export function fromCategory(category: Category): CreateCategoryBody {
  return {
    slug: category.slug,
    name: category.name,
    tone: category.tone,
    imageUrl: category.imageUrl ?? null,
  };
}
