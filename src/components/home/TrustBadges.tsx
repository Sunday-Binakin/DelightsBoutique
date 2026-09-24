import { buildWhatsAppLink } from "@/lib/constants";
import { QuestionIcon, WhatsAppIcon, TruckIcon } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/Button";

const BADGES = [
  {
    icon: QuestionIcon,
    title: "Browse our FAQs",
    description: "Answers about sizing, ordering, and payment.",
    ctaLabel: "Read FAQs",
    href: "/faqs",
  },
  {
    icon: WhatsAppIcon,
    title: "Chat with Us",
    description: "Questions before you order? Message us directly.",
    ctaLabel: "Chat on WhatsApp",
    href: buildWhatsAppLink(),
  },
  {
    icon: TruckIcon,
    title: "Delivery & Returns",
    description: "Delivery, pickup, and return policy details.",
    ctaLabel: "Read More",
    href: "/shipping",
  },
];

export function TrustBadges() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-6 sm:grid-cols-3">
        {BADGES.map(({ icon: Icon, title, description, ctaLabel, href }) => (
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
