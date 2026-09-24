"use client";

import { useSiteSettings } from "@/lib/use-site-settings";

export function AnnouncementBar() {
  const { announcement } = useSiteSettings();

  return (
    <div className="bg-primary-dark text-white">
      <div className="mx-auto max-w-7xl px-4 py-2 text-center text-xs sm:text-sm">
        <p className="truncate">{announcement}</p>
      </div>
    </div>
  );
}
