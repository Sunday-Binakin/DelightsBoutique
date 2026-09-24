"use client";

import Link from "next/link";
import { SITE } from "@/lib/constants";
import { useSiteSettings } from "@/lib/use-site-settings";
import { useCategories } from "@/lib/use-categories";
import { FacebookIcon, InstagramIcon, TikTokIcon } from "@/components/ui/icons";

const OTHER_FOOTER_COLUMNS = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Wholesale", href: "/wholesale" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "FAQs", href: "/faqs" },
      { label: "Shipping & Delivery", href: "/shipping" },
      { label: "Return Policy", href: "/returns" },
    ],
  },
  {
    title: "Service",
    links: [
      { label: "Track My Order", href: "/orders" },
      { label: "Best Sellers", href: "/best-sellers" },
      { label: "New Arrivals", href: "/new-arrivals" },
    ],
  },
];

export function SiteFooter() {
  const { tagline, facebookUrl, instagramUrl, tiktokUrl } = useSiteSettings();
  const categories = useCategories();

  const socialLinks = [
    { label: "Facebook", href: facebookUrl, icon: FacebookIcon },
    { label: "Instagram", href: instagramUrl, icon: InstagramIcon },
    { label: "TikTok", href: tiktokUrl, icon: TikTokIcon },
  ].filter((link) => link.href);

  const footerColumns = [
    {
      title: "Shop",
      links: categories.map((c) => ({ label: c.name, href: `/category/${c.slug}` })),
    },
    ...OTHER_FOOTER_COLUMNS,
  ];

  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <p className="font-serif text-lg font-semibold text-accent">{SITE.name}</p>
          <p className="mt-2 max-w-xs text-sm text-background/70">{tagline}</p>
          {socialLinks.length > 0 && (
            <div className="mt-4 flex gap-3">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-background/10 text-background transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <p className="text-sm font-semibold text-background">{column.title}</p>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/70 hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-background/10 px-4 py-4">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-xs text-background/60 sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-accent">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-accent">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
