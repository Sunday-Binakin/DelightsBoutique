"use client";

import { useQuery } from "@tanstack/react-query";
import { getStorefrontCopy as fetchStorefrontCopy } from "@/lib/api/content";
import { DEFAULT_STOREFRONT_COPY, type StorefrontCopy } from "@/lib/storefront-copy";

/** Live storefront copy. The backend stores/returns this shape verbatim — merge over
 * the defaults so a partially-filled record (or none yet) still renders every field. */
export function useStorefrontCopy(): StorefrontCopy {
  const query = useQuery({
    queryKey: ["storefront-copy"],
    queryFn: fetchStorefrontCopy,
  });

  return query.data
    ? { ...DEFAULT_STOREFRONT_COPY, ...(query.data as Partial<StorefrontCopy>) }
    : DEFAULT_STOREFRONT_COPY;
}
