"use client";

import { useSiteSettings } from "@/lib/use-site-settings";
import { BRAND_GRADIENT } from "@/lib/tone";

export function AnnouncementBar() {
  const { announcement } = useSiteSettings();

  return (
    <div className={`${BRAND_GRADIENT} text-white`}>
      <div className="mx-auto max-w-7xl px-4 py-2 text-center text-xs sm:text-sm">
        <p className="truncate">{announcement}</p>
      </div>
    </div>
  );
}
