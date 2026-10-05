import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/api/products";
import { getCategories } from "@/lib/api/categories";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const CATALOG_PAGE_SIZE = 100;

async function getAllProducts() {
  const products: Awaited<ReturnType<typeof getProducts>>["data"] = [];
  for (let page = 1; ; page++) {
    const res = await getProducts({ page, limit: CATALOG_PAGE_SIZE }).catch(() => null);
    if (!res || res.data.length === 0) break;
    products.push(...res.data);
    if (products.length >= res.total) break;
  }
  return products;
}

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const [categories, products] = await Promise.all([
    getCategories().catch(() => []),
    getAllProducts(),
  ]);

  const categoryEntries = categories.map((category) => ({
    url: `${siteUrl}/category/${category.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const productEntries = products.map((product) => ({
    url: `${siteUrl}/product/${product.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
