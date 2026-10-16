"use client";

import { useQuery } from "@tanstack/react-query";
import { getSiteSettings } from "@/lib/api/content";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/lib/site-settings";

/** Live site settings for client components. The public endpoint omits the
 * notification fields (admin-only) — the storefront never reads those. */
export function useSiteSettings(): SiteSettings {
  const query = useQuery({
    queryKey: ["site-settings"],
    queryFn: getSiteSettings,
  });

  return query.data ? { ...DEFAULT_SITE_SETTINGS, ...query.data } : DEFAULT_SITE_SETTINGS;
}

/** Same data plus `isLoading`, for callers (the admin settings form) that need to wait
 * for the real fetch before seeding editable local state — otherwise they'd initialize
 * from the defaults and never pick up the real values once they arrive. */
export function useSiteSettingsQuery() {
  const query = useQuery({
    queryKey: ["site-settings"],
    queryFn: getSiteSettings,
  });

  return {
    ...query,
    settings: query.data ? { ...DEFAULT_SITE_SETTINGS, ...query.data } : DEFAULT_SITE_SETTINGS,
  };
}
