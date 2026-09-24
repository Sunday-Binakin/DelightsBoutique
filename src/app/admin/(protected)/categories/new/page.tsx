"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Category, PlaceholderTone } from "@/lib/types";
import { saveCategory, getAllCategories } from "@/lib/category-store";
import { slugify } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { logAction } from "@/lib/audit-log";

const TONE_OPTIONS: PlaceholderTone[] = ["rose", "cream", "charcoal", "gold"];

const inputClasses =
  "w-full rounded-lg border border-border-subtle bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary";
const labelClasses = "flex flex-col gap-1.5 text-sm font-medium text-foreground";

export default function AdminNewCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [tone, setTone] = useState<PlaceholderTone>("rose");
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
    if (getAllCategories().some((c) => c.slug === finalSlug)) {
      setError("A category with this slug already exists — choose a different one.");
      return;
    }

    const category: Category = { slug: finalSlug, name, tone };
    saveCategory(category);
    logAction(`Added category "${name}"`);
    router.push("/admin/products");
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Home", href: "/admin/dashboard" },
          { label: "Products", href: "/admin/products" },
          { label: "Add Category" },
        ]}
      />

      <h1 className="font-serif text-2xl font-semibold text-foreground">Add Category</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        New categories appear immediately in the product filters and on the storefront.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-5">
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

        <Button type="submit">Add Category</Button>
      </form>
    </div>
  );
}
