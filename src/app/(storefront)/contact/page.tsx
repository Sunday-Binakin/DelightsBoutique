import { SITE, buildWhatsAppLink } from "@/lib/constants";
import { WhatsAppIcon, PhoneIcon, TruckIcon } from "@/components/ui/icons";

const CONTACT_CARDS = [
  {
    icon: WhatsAppIcon,
    title: "WhatsApp",
    description: "Fastest way to reach us — order questions, follow-ups, and wholesale enquiries.",
    action: { label: "Chat on WhatsApp", href: buildWhatsAppLink() },
  },
  {
    icon: PhoneIcon,
    title: "Phone",
    description: `Call or text us directly, ${SITE.hours}.`,
    action: { label: SITE.phoneDisplay, href: `tel:${SITE.phoneDisplay.replace(/\s/g, "")}` },
  },
  {
    icon: TruckIcon,
    title: "Visit or Pick Up",
    description: SITE.address,
    action: { label: "Get Directions", href: `https://maps.google.com/?q=${encodeURIComponent(SITE.address)}` },
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-semibold text-foreground">Get in Touch</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Questions about an order, sizing, or wholesale pricing? Reach us any of these ways.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {CONTACT_CARDS.map(({ icon: Icon, title, description, action }) => (
          <div
            key={title}
            className="flex flex-col items-center gap-3 rounded-xl border border-border-subtle p-6 text-center"
          >
            <Icon className="h-7 w-7 text-primary" />
            <p className="font-serif text-lg font-semibold text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
            <a
              href={action.href}
              target={action.href.startsWith("http") ? "_blank" : undefined}
              rel={action.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="mt-1 inline-flex items-center justify-center rounded-full border border-current px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white"
            >
              {action.label}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
