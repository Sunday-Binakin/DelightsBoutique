"use client";

import Link from "next/link";
import { useCategories } from "@/lib/use-categories";
import { useStorefrontCopy } from "@/lib/use-storefront-copy";
import { MediaSwatch } from "@/components/ui/MediaSwatch";
import { getCategoryArt } from "@/components/ui/category-art";

export function CategoryGrid() {
  const categories = useCategories();
  const copy = useStorefrontCopy();

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">
          {copy.categoryGridEyebrow}
        </span>
        <h2 className="mt-1 font-serif text-2xl font-semibold text-foreground">
          {copy.categoryGridTitle}
        </h2>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/category/${category.slug}`}
            className="group text-center"
          >
            <MediaSwatch
              imageUrl={category.imageUrl}
              icon={getCategoryArt(category.slug)}
              label={category.name}
              tone={category.tone}
              className="aspect-square w-full rounded-full transition-transform group-hover:scale-[1.03]"
            />
            <p className="mt-2 text-sm font-medium text-foreground/80">{category.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
