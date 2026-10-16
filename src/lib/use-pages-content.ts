"use client";

import { useQuery } from "@tanstack/react-query";
import { getPage } from "@/lib/api/content";
import type { PageKey } from "@/lib/api/types";

/** One static page's content (about/shipping/returns/terms/privacy). */
export function usePage(key: PageKey) {
  const query = useQuery({
    queryKey: ["page", key],
    queryFn: () => getPage(key),
  });

  return { ...query, page: query.data };
}
