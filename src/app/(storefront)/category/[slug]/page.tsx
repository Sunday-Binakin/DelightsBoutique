"use client";

import { useParams } from "next/navigation";
import { useCategories } from "@/lib/use-categories";
import { useProducts } from "@/lib/use-products";
import { CatalogView } from "@/components/catalog/CatalogView";
import { LinkButton } from "@/components/ui/Button";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = useCategories().find((c) => c.slug === slug);
  const products = useProducts().filter((product) => product.categorySlug === slug);

  if (!category) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="font-serif text-2xl font-semibold text-foreground">Category not found</h1>
        <LinkButton href="/" className="mt-6">
          Back to Home
        </LinkButton>
      </div>
    );
  }

  return (
    <CatalogView
      title={category.name}
      subtitle={`Browse our full ${category.name.toLowerCase()} collection — retail and wholesale pricing available.`}
      products={products}
    />
  );
}
