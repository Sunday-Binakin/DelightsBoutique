import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/api/products";
import { SITE } from "@/lib/constants";
import { SITE_URL, productJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProductPageClient } from "./ProductPageClient";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);

  if (!product) {
    return { title: "Product" };
  }

  const description = product.description.slice(0, 160);
  const socialTitle = `${product.name} | ${SITE.name}`;
  return {
    title: product.name,
    description,
    alternates: { canonical: `${SITE_URL}/product/${product.slug}` },
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
  const product = await getProductBySlug(slug).catch(() => null);
  return (
    <>
      {product && <JsonLd data={productJsonLd(product)} />}
      <ProductPageClient slug={slug} />
    </>
  );
}
