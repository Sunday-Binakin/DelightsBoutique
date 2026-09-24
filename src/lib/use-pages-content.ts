"use client";

import { useEffect, useState } from "react";
import { DEFAULT_PAGES_CONTENT, getPagesContent, type PagesContent } from "@/lib/pages-content";

/** Live static-page/FAQ content for client components — see use-products.ts for the same pattern. */
export function usePagesContent(): PagesContent {
  const [content, setContent] = useState<PagesContent>(DEFAULT_PAGES_CONTENT);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage
    setContent(getPagesContent());
  }, []);

  return content;
}
