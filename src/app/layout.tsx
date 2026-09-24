import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { SITE } from "@/lib/constants";
import "./globals.css";

const heading = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${SITE.name} | Ladies Fashion & Accessories`,
  description: SITE.tagline,
};

// Deliberately minimal: the storefront's chrome (header/footer/cart) lives
// in (storefront)/layout.tsx, and /admin has its own separate shell —
// neither should leak into the other.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
