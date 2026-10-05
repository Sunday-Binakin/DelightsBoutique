import { apiFetch } from "./client";
import type {
  AdminSiteSettingsBody,
  BannerDto,
  BannerKey,
  BannersDto,
  CollectionSectionDto,
  CreateFaqBody,
  FaqDto,
  FlashSaleDto,
  PageContentDto,
  PageKey,
  SiteSettingsDto,
  StorefrontCopyDto,
  UpdateCollectionSectionBody,
  UpdateFaqBody,
  UpdateFlashSaleBody,
} from "./types";

export function getSiteSettings(): Promise<SiteSettingsDto> {
  return apiFetch<SiteSettingsDto>("/api/content/site-settings");
}

export function getBanners(): Promise<BannersDto> {
  return apiFetch<BannersDto>("/api/content/banners");
}

export function getFlashSale(): Promise<FlashSaleDto> {
  return apiFetch<FlashSaleDto>("/api/content/flash-sale");
}

export function getCollectionSection(): Promise<CollectionSectionDto> {
  return apiFetch<CollectionSectionDto>("/api/content/collection-section");
}

export function getStorefrontCopy(): Promise<StorefrontCopyDto> {
  return apiFetch<StorefrontCopyDto>("/api/content/storefront-copy");
}

export function getPage(key: PageKey): Promise<PageContentDto> {
  return apiFetch<PageContentDto>(`/api/content/pages/${key}`);
}

export function getFaqs(): Promise<FaqDto[]> {
  return apiFetch<FaqDto[]>("/api/content/faqs");
}

// --- Admin mutations -------------------------------------------------------------

export function updateSiteSettings(body: AdminSiteSettingsBody): Promise<void> {
  return apiFetch<void>("/api/admin/content/site-settings", { method: "PATCH", body });
}

export function updateBanner(key: BannerKey, body: BannerDto): Promise<BannerDto> {
  return apiFetch<BannerDto>(`/api/admin/content/banners/${key}`, { method: "PUT", body });
}

export function updateFlashSale(body: UpdateFlashSaleBody): Promise<void> {
  return apiFetch<void>("/api/admin/content/flash-sale", { method: "PATCH", body });
}

export function updateCollectionSection(body: UpdateCollectionSectionBody): Promise<void> {
  return apiFetch<void>("/api/admin/content/collection-section", { method: "PATCH", body });
}

export function updateStorefrontCopy(body: StorefrontCopyDto): Promise<void> {
  return apiFetch<void>("/api/admin/content/storefront-copy", { method: "PATCH", body });
}

export function updatePage(key: PageKey, body: PageContentDto): Promise<PageContentDto> {
  return apiFetch<PageContentDto>(`/api/admin/content/pages/${key}`, { method: "PUT", body });
}

export function createFaq(body: CreateFaqBody): Promise<FaqDto> {
  return apiFetch<FaqDto>("/api/admin/content/faqs", { method: "POST", body });
}

export function updateFaq(id: string, body: UpdateFaqBody): Promise<FaqDto> {
  return apiFetch<FaqDto>(`/api/admin/content/faqs/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body,
  });
}

export function deleteFaq(id: string): Promise<void> {
  return apiFetch<void>(`/api/admin/content/faqs/${encodeURIComponent(id)}`, { method: "DELETE" });
}
