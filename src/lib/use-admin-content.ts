"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateSiteSettings,
  updateBanner,
  updateFlashSale,
  updateCollectionSection,
  updateStorefrontCopy,
  updatePage,
  createFaq,
  updateFaq,
  deleteFaq,
} from "@/lib/api/content";
import type { BannerKey, PageKey } from "@/lib/api/types";

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSiteSettings,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["site-settings"] }),
  });
}

export function useUpdateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, banner }: { key: BannerKey; banner: Parameters<typeof updateBanner>[1] }) =>
      updateBanner(key, banner),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["banners"] }),
  });
}

export function useUpdateFlashSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateFlashSale,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["flash-sale"] }),
  });
}

export function useUpdateCollectionSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCollectionSection,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["collection-section"] }),
  });
}

export function useUpdateStorefrontCopy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStorefrontCopy,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["storefront-copy"] }),
  });
}

export function useUpdatePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, page }: { key: PageKey; page: Parameters<typeof updatePage>[1] }) =>
      updatePage(key, page),
    onSuccess: (_data, { key }) => queryClient.invalidateQueries({ queryKey: ["page", key] }),
  });
}

export function useCreateFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFaq,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faqs"] }),
  });
}

export function useUpdateFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof updateFaq>[1] }) =>
      updateFaq(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faqs"] }),
  });
}

export function useDeleteFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFaq,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faqs"] }),
  });
}
