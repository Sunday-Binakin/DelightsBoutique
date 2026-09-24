import type { MetadataRoute } from "next";
import { featuredProducts } from "@/lib/data/products";
import { categories } from "@/lib/data/categories";

// Only the seed catalog is server-visible (products/categories added or
// edited by the admin live in localStorage) — this covers everything a
// fresh install ships with; a backend would make it fully dynamic.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const STATIC_ROUTES = [
  { path: "/", priority: 1, changeFrequency: "daily" as const },
  { path: "/new-arrivals", priority: 0.8, changeFrequency: "daily" as const },
  { path: "/best-sellers", priority: 0.8, changeFrequency: "daily" as const },
  { path: "/wholesale", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/faqs", priority: 0.4, changeFrequency: "monthly" as const },
  { path: "/shipping", priority: 0.3, changeFrequency: "monthly" as const },
  { path: "/returns", priority: 0.3, changeFrequency: "monthly" as const },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" as const },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const categoryEntries = categories.map((category) => ({
    url: `${siteUrl}/category/${category.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const productEntries = featuredProducts.map((product) => ({
    url: `${siteUrl}/product/${product.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
