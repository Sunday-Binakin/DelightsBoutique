import { SITE } from "@/lib/constants";
import type { SiteSettings } from "@/lib/site-settings";
import { WhatsAppIcon, PhoneIcon, TruckIcon } from "@/components/ui/icons";

export function SiteSettingsPreview({ settings }: { settings: SiteSettings }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle">
      {/* Announcement bar */}
      <div className="bg-primary-dark px-4 py-2 text-center text-xs text-white">
        {settings.announcement || "Announcement bar text"}
      </div>

      {/* Header snippet */}
      <div className="border-b border-border-subtle px-4 py-3">
        <p className="font-serif text-sm font-semibold text-primary">{SITE.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{settings.tagline || "Tagline"}</p>
      </div>

      {/* Contact cards, matching the real /contact page */}
      <div className="grid gap-3 p-4">
        <div className="flex items-start gap-3 rounded-lg border border-border-subtle p-3">
          <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="text-xs">
            <p className="font-medium text-foreground">WhatsApp</p>
            <p className="mt-0.5 text-muted-foreground">
              {settings.whatsappNumber || "WhatsApp number"}
            </p>
            <p className="mt-1 italic text-muted-foreground">
              &ldquo;{settings.whatsappMessage || "Default message"}&rdquo;
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-border-subtle p-3">
          <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="text-xs">
            <p className="font-medium text-foreground">
              {settings.phoneDisplay || "Phone number"}
            </p>
            <p className="mt-0.5 text-muted-foreground">
              Call or text us directly, {settings.hours || "business hours"}.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-border-subtle p-3">
          <TruckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="text-xs">
            <p className="font-medium text-foreground">Visit or Pick Up</p>
            <p className="mt-0.5 text-muted-foreground">{settings.address || "Store address"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
