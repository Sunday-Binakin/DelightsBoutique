"use client";

import { useQuery } from "@tanstack/react-query";
import { getTheme } from "@/lib/api/content";
import { DEFAULT_THEME } from "@/lib/theme";

/** Live theme colors plus loading state, for the admin editor — it needs to wait
 * for the real fetch before seeding editable form state, same reasoning as
 * useSiteSettingsQuery. The storefront itself never calls this: its colors come
 * from the server-rendered inline style in the root layout, not a client fetch. */
export function useThemeQuery() {
  const query = useQuery({
    queryKey: ["theme"],
    queryFn: getTheme,
  });

  return {
    ...query,
    theme: query.data ?? DEFAULT_THEME,
  };
}
