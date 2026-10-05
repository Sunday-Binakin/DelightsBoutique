import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { SITE } from "@/lib/constants";
import { DEFAULT_SITE_SETTINGS } from "@/lib/site-settings";
import { AppProviders } from "./providers";
import "./globals.css";

const heading = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

// Swap NEXT_PUBLIC_SITE_URL for the real domain once this is deployed —
// og:image and other absolute URLs resolve against it.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE.name} | Ladies Fashion & Accessories`,
    template: `%s | ${SITE.name}`,
  },
  // Page metadata is server-rendered and can't reflect admin-edited
  // content without a backend — this always uses the default tagline.
  description: DEFAULT_SITE_SETTINGS.tagline,
  openGraph: {
    siteName: SITE.name,
    title: `${SITE.name} | Ladies Fashion & Accessories`,
    description: DEFAULT_SITE_SETTINGS.tagline,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} | Ladies Fashion & Accessories`,
    description: DEFAULT_SITE_SETTINGS.tagline,
  },
};

// Deliberately minimal: the storefront's chrome (header/footer/cart) lives
// in (storefront)/layout.tsx, and /admin has its own separate shell —
// neither should leak into the other.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
