import { SITE } from "@/lib/constants";

export function AnnouncementBar() {
  return (
    <div className="bg-primary-dark text-white">
      <div className="mx-auto max-w-7xl px-4 py-2 text-center text-xs sm:text-sm">
        <p className="truncate">{SITE.announcement}</p>
      </div>
    </div>
  );
}
