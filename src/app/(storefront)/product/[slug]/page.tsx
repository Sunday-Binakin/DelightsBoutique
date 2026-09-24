import type { Metadata } from "next";
import { featuredProducts } from "@/lib/data/products";
import { SITE } from "@/lib/constants";
import { ProductPageClient } from "./ProductPageClient";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Real per-product edits (name/description/photos) live in localStorage,
// which the server can't see — so metadata is generated from the static
// seed catalog only. A product the admin added/renamed after the seed
// still renders correctly on the page itself; its share preview just
// falls back to the generic site description below until a backend
// makes product data readable server-side.
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = featuredProducts.find((p) => p.slug === slug);

  if (!product) {
    return { title: "Product" };
  }

  const description = product.description.slice(0, 160);
  const socialTitle = `${product.name} | ${SITE.name}`;
  return {
    title: product.name,
    description,
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

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  return <ProductPageClient slug={slug} />;
}
