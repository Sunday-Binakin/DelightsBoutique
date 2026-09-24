"use client";

import { useSiteSettings } from "@/lib/use-site-settings";
import { useStorefrontCopy } from "@/lib/use-storefront-copy";
import { buildWhatsAppLink } from "@/lib/site-settings";
import { QuestionIcon, WhatsAppIcon, TruckIcon } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/Button";

export function TrustBadges() {
  const settings = useSiteSettings();
  const copy = useStorefrontCopy();

  const badges = [
    { icon: QuestionIcon, href: "/faqs", ...copy.trustBadges[0] },
    {
      icon: WhatsAppIcon,
      href: buildWhatsAppLink(settings.whatsappNumber, settings.whatsappMessage),
      ...copy.trustBadges[1],
    },
    { icon: TruckIcon, href: "/shipping", ...copy.trustBadges[2] },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-6 sm:grid-cols-3">
        {badges.map(({ icon: Icon, title, description, ctaLabel, href }) => (
          <div
            key={title}
            className="flex flex-col items-center gap-3 rounded-xl border border-border-subtle p-6 text-center"
          >
            <Icon className="h-7 w-7 text-primary" />
            <p className="font-serif text-lg font-semibold text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
            <LinkButton href={href} variant="outline" className="mt-1">
              {ctaLabel}
            </LinkButton>
          </div>
        ))}
      </div>
    </section>
  );
}
