"use client";

import { useSiteSettings } from "@/lib/use-site-settings";
import { buildWhatsAppLink } from "@/lib/site-settings";
import { WhatsAppIcon } from "@/components/ui/icons";

export function WhatsAppButton() {
  const settings = useSiteSettings();

  return (
    <a
      href={buildWhatsAppLink(settings.whatsappNumber, settings.whatsappMessage)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
