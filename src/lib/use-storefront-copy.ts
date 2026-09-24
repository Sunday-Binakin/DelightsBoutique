"use client";

import { useEffect, useState } from "react";
import { DEFAULT_STOREFRONT_COPY, getStorefrontCopy, type StorefrontCopy } from "@/lib/storefront-copy";

/** Live storefront copy — see use-products.ts for the same pattern. */
export function useStorefrontCopy(): StorefrontCopy {
  const [copy, setCopy] = useState<StorefrontCopy>(DEFAULT_STOREFRONT_COPY);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage
    setCopy(getStorefrontCopy());
  }, []);

  return copy;
}
