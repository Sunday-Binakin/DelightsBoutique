"use client";

import { useQuery } from "@tanstack/react-query";
import { getBanners as fetchBanners } from "@/lib/api/content";
import type { BannerDto } from "@/lib/api/types";
import { DEFAULT_BANNERS, type BannerSet } from "@/lib/banners";
import type { PromoBannerContent } from "@/lib/types";

function toBanner(dto: BannerDto): PromoBannerContent {
  return {
    eyebrow: dto.eyebrow,
    title: dto.title,
    ctaLabel: dto.ctaLabel,
    href: dto.href,
    tone: dto.tone,
    artCategorySlug: dto.artCategorySlug,
    imageUrl: dto.imageUrl ?? undefined,
    textColor: dto.textColor ?? undefined,
  };
}

function toBannerSet(data: Awaited<ReturnType<typeof fetchBanners>> | undefined): BannerSet {
  if (!data) return DEFAULT_BANNERS;
  return {
    heroMain: toBanner(data.heroMain),
    heroSide1: toBanner(data.heroSide1),
    heroSide2: toBanner(data.heroSide2),
    fullWidth: toBanner(data.fullWidth),
  };
}

/** Live homepage banner content for client components. */
export function useBanners(): BannerSet {
  const query = useQuery({
    queryKey: ["banners"],
    queryFn: fetchBanners,
  });

  return toBannerSet(query.data);
}

/** Same data plus loading/error state, for the admin editor — it seeds local draft
 * state per banner and needs to wait for the real fetch rather than the defaults. */
export function useBannersQuery() {
  const query = useQuery({
    queryKey: ["banners"],
    queryFn: fetchBanners,
  });

  return { ...query, banners: toBannerSet(query.data) };
}
