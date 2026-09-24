"use client";

import { useEffect, useState } from "react";
import { DEFAULT_BANNERS, getBanners, type BannerSet } from "@/lib/banners";

/** Live homepage banner content for client components — see use-products.ts for the same pattern. */
export function useBanners(): BannerSet {
  const [banners, setBanners] = useState<BannerSet>(DEFAULT_BANNERS);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage
    setBanners(getBanners());
  }, []);

  return banners;
}
