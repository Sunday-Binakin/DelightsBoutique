"use client";

import { useState, type FormEvent } from "react";
import { useMarkUnsaved } from "@/lib/unsaved-changes";
import { type SiteSettings } from "@/lib/site-settings";
import { useSiteSettingsQuery } from "@/lib/use-site-settings";
import { useUpdateSiteSettings } from "@/lib/use-admin-content";
import { Button } from "@/components/ui/Button";
import { SiteSettingsPreview } from "@/components/admin/content/SiteSettingsPreview";
import { LoadingBlock } from "@/components/ui/Spinner";
import { QueryError } from "@/components/ui/QueryError";
import { useToast } from "@/components/ui/ToastProvider";

const inputClasses =
  "w-full rounded-lg border border-input-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary disabled:opacity-50";
const labelClasses = "flex flex-col gap-1.5 text-sm font-medium text-foreground";

export function SiteSettingsForm() {
  const { settings: initialSettings, isLoading, isError, refetch } = useSiteSettingsQuery();
  if (isLoading) return <LoadingBlock />;
  if (isError) return <QueryError label="site settings" onRetry={refetch} />;
  return <SiteSettingsFormInner initialSettings={initialSettings} />;
}

// The public endpoint deliberately omits notifyByEmail/notificationEmail/notifyByWhatsapp
// (admin-only), and there's no admin GET for them either — so their current saved value
// can't be read back yet. They start from the defaults baked into initialSettings until
// that gap is closed.
function SiteSettingsFormInner({ initialSettings }: { initialSettings: SiteSettings }) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [saved, setSaved] = useState(true);
  useMarkUnsaved(!saved);
  const updateSiteSettings = useUpdateSiteSettings();
  const toast = useToast();

  function update<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await updateSiteSettings.mutateAsync(settings);
      setSaved(true);
      toast.success("Site settings saved.");
    } catch {
      toast.error("Couldn't save site settings. Try again.");
    }
  }

  return (
    <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_320px]">
      <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-5">
        <label className={labelClasses}>
          Tagline
          <input
            value={settings.tagline}
            onChange={(e) => update("tagline", e.target.value)}
            className={inputClasses}
          />
        </label>

        <label className={labelClasses}>
          Announcement Bar Text
          <input
            value={settings.announcement}
            onChange={(e) => update("announcement", e.target.value)}
            className={inputClasses}
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className={labelClasses}>
            WhatsApp Number
            <input
              value={settings.whatsappNumber}
              onChange={(e) => update("whatsappNumber", e.target.value)}
              className={inputClasses}
              placeholder="233240000000"
            />
          </label>
          <label className={labelClasses}>
            Phone (displayed)
            <input
              value={settings.phoneDisplay}
              onChange={(e) => update("phoneDisplay", e.target.value)}
              className={inputClasses}
              placeholder="+233 24 000 0000"
            />
          </label>
        </div>

        <label className={labelClasses}>
          Default WhatsApp Message
          <input
            value={settings.whatsappMessage}
            onChange={(e) => update("whatsappMessage", e.target.value)}
            className={inputClasses}
          />
        </label>

        <label className={labelClasses}>
          Address
          <input
            value={settings.address}
            onChange={(e) => update("address", e.target.value)}
            className={inputClasses}
          />
        </label>

        <label className={labelClasses}>
          Business Hours
          <input
            value={settings.hours}
            onChange={(e) => update("hours", e.target.value)}
            className={inputClasses}
          />
        </label>

        <p className="text-sm font-medium text-foreground">Payment Instructions</p>
        <p className="-mt-3 text-xs text-muted-foreground">
          Shown to customers at checkout for whichever payment method they pick.
        </p>
        <label className={labelClasses}>
          Bank Transfer
          <textarea
            rows={2}
            value={settings.bankTransferInstructions}
            onChange={(e) => update("bankTransferInstructions", e.target.value)}
            className={inputClasses}
          />
        </label>
        <label className={labelClasses}>
          Mobile Money
          <textarea
            rows={2}
            value={settings.mobileMoneyInstructions}
            onChange={(e) => update("mobileMoneyInstructions", e.target.value)}
            className={inputClasses}
          />
        </label>
        <label className={labelClasses}>
          Cash on Delivery/Pickup
          <textarea
            rows={2}
            value={settings.cashInstructions}
            onChange={(e) => update("cashInstructions", e.target.value)}
            className={inputClasses}
          />
        </label>

        <p className="text-sm font-medium text-foreground">Social Links</p>
        <p className="-mt-3 text-xs text-muted-foreground">
          Shown in the footer. Leave blank to hide that icon.
        </p>
        <div className="grid grid-cols-3 gap-3">
          <label className={labelClasses}>
            Facebook
            <input
              value={settings.facebookUrl}
              onChange={(e) => update("facebookUrl", e.target.value)}
              className={inputClasses}
              placeholder="https://facebook.com/..."
            />
          </label>
          <label className={labelClasses}>
            Instagram
            <input
              value={settings.instagramUrl}
              onChange={(e) => update("instagramUrl", e.target.value)}
              className={inputClasses}
              placeholder="https://instagram.com/..."
            />
          </label>
          <label className={labelClasses}>
            TikTok
            <input
              value={settings.tiktokUrl}
              onChange={(e) => update("tiktokUrl", e.target.value)}
              className={inputClasses}
              placeholder="https://tiktok.com/@..."
            />
          </label>
        </div>

        <p className="text-sm font-medium text-foreground">Order Notifications</p>
        <p className="-mt-3 text-xs text-muted-foreground">
          Who to alert when a customer places an order. You&apos;ll always see new orders instantly
          in the bell icon at the top of the admin panel — email and WhatsApp sending will go live
          once a backend is connected.
        </p>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            checked={settings.notifyByEmail}
            onChange={(e) => update("notifyByEmail", e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Email me at
        </label>
        <input
          value={settings.notificationEmail}
          onChange={(e) => update("notificationEmail", e.target.value)}
          disabled={!settings.notifyByEmail}
          className={`${inputClasses} disabled:opacity-50`}
          placeholder="owner@delightsboutique.com"
        />
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            checked={settings.notifyByWhatsapp}
            onChange={(e) => update("notifyByWhatsapp", e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          WhatsApp me on the number above ({settings.whatsappNumber})
        </label>

        <Button type="submit" disabled={saved || updateSiteSettings.isPending} className="self-start">
          {updateSiteSettings.isPending ? "Saving…" : saved ? "Saved" : "Save Settings"}
        </Button>
      </form>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Live Preview
        </p>
        <SiteSettingsPreview settings={settings} />
      </div>
    </div>
  );
}
