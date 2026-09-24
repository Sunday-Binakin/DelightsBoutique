"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Category, PlaceholderTone } from "@/lib/types";
import { saveCategory, deleteCategory, getAllCategories } from "@/lib/category-store";
import { getAllProducts } from "@/lib/product-store";
import { slugify } from "@/lib/format";
import { logAction } from "@/lib/audit-log";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { MediaSwatch } from "@/components/ui/MediaSwatch";
import { getCategoryArt } from "@/components/ui/category-art";

const TONE_OPTIONS: PlaceholderTone[] = ["rose", "cream", "charcoal", "gold"];

const inputClasses =
  "w-full rounded-lg border border-border-subtle bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary";
const labelClasses = "flex flex-col gap-1.5 text-sm font-medium text-foreground";

export function CategoryForm({ initialCategory }: { initialCategory?: Category }) {
  const router = useRouter();
  const isEditing = Boolean(initialCategory);

  const [name, setName] = useState(initialCategory?.name ?? "");
  const [slug, setSlug] = useState(initialCategory?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(isEditing);
  const [tone, setTone] = useState<PlaceholderTone>(initialCategory?.tone ?? "rose");
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialCategory?.imageUrl);
  const [error, setError] = useState("");

  function handleNameChange(value: string) {
    setName(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const finalSlug = slugify(slug);
    if (!finalSlug) {
      setError("Slug is required.");
      return;
    }
    const collision = getAllCategories().find((c) => c.slug === finalSlug);
    if (collision && collision.slug !== initialCategory?.slug) {
      setError("Another category already uses this slug — choose a different one.");
      return;
    }

    const category: Category = { slug: finalSlug, name, tone, imageUrl };
    saveCategory(category);
    logAction(`${isEditing ? "Updated" : "Added"} category "${name}"`);
    router.push("/admin/products");
  }

  function handleDelete() {
    const initial = initialCategory;
    if (!initial) return;

    const productCount = getAllProducts().filter((p) => p.categorySlug === initial.slug).length;
    const warning =
      productCount > 0
        ? `Delete "${initial.name}"? It removes the category from the homepage and category menu — its ${productCount} product${productCount === 1 ? "" : "s"} will stay in the catalog but show under "All Products" instead. This can't be undone.`
        : `Delete "${initial.name}"? This can't be undone.`;
    if (!confirm(warning)) return;

    deleteCategory(initial.slug);
    logAction(`Deleted category "${initial.name}"`);
    router.push("/admin/products");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
      <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-5">
        {error && (
          <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</p>
        )}

        <label className={labelClasses}>
          Category Name
          <input
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={inputClasses}
            placeholder="Sunglasses"
          />
        </label>

        <label className={labelClasses}>
          URL Slug
          <input
            required
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugEdited(true);
            }}
            className={inputClasses}
          />
        </label>

        <ImageUpload value={imageUrl} onChange={setImageUrl} label="Category Photo" />

        <label className={labelClasses}>
          Color Theme
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as PlaceholderTone)}
            className={inputClasses}
          >
            {TONE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-3">
          <Button type="submit" className="self-start">
            {isEditing ? "Save Changes" : "Add Category"}
          </Button>
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              className="text-sm font-medium text-red-500 hover:text-red-600"
            >
              Delete Category
            </button>
          )}
        </div>
      </form>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Live Preview
        </p>
        <div className="text-center">
          <MediaSwatch
            imageUrl={imageUrl}
            icon={getCategoryArt(slug || "accessories")}
            label={name || "Category"}
            tone={tone}
            className="aspect-square w-full rounded-full"
          />
          <p className="mt-2 text-sm font-medium text-foreground/80">{name || "Category Name"}</p>
        </div>
      </div>
    </div>
  );
}
