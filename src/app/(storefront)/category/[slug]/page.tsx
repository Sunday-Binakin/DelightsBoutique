import type { Metadata } from "next";
import { getCategoryBySlug } from "@/lib/api/categories";
import { SITE } from "@/lib/constants";
import { SITE_URL, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { CategoryPageClient } from "./CategoryPageClient";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug).catch(() => null);

  if (!category) {
    return { title: "Shop" };
  }

  const description = `Browse our full ${category.name.toLowerCase()} collection — retail and wholesale pricing available.`;
  const socialTitle = `${category.name} | ${SITE.name}`;
  return {
    title: category.name,
    description,
    alternates: { canonical: `${SITE_URL}/category/${category.slug}` },
    // openGraph/twitter don't merge with the root layout's — every field
    // we want (image, site name, card type) has to be repeated here.
    openGraph: {
      title: socialTitle,
      description,
      siteName: SITE.name,
      type: "website",
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: ["/opengraph-image"],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug).catch(() => null);
  return (
    <>
      {category && (
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: category.name, path: `/category/${category.slug}` },
          ])}
        />
      )}
      <CategoryPageClient slug={slug} />
    </>
  );
}
