"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_COLLECTION_SECTION,
  getCollectionSection,
  type CollectionSectionContent,
} from "@/lib/collection-section";

/** Live "Shop the Collection" section content — see use-products.ts for the same pattern. */
export function useCollectionSection(): CollectionSectionContent {
  const [content, setContent] = useState<CollectionSectionContent>(DEFAULT_COLLECTION_SECTION);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage
    setContent(getCollectionSection());
  }, []);

  return content;
}
