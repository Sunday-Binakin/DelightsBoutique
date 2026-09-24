"use client";

import { useEffect, useState } from "react";
import { DEFAULT_FLASH_SALE, getFlashSale, type FlashSaleContent } from "@/lib/flash-sale";

/** Live "Flash Sale" section content — see use-products.ts for the same pattern. */
export function useFlashSale(): FlashSaleContent {
  const [content, setContent] = useState<FlashSaleContent>(DEFAULT_FLASH_SALE);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage
    setContent(getFlashSale());
  }, []);

  return content;
}
