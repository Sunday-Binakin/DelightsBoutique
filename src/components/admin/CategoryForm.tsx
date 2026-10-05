"use client";

import { useState, type FormEvent } from "react";
import { useIsDirty, useMarkUnsaved } from "@/lib/unsaved-changes";
import { useRouter } from "next/navigation";
import type { Category, PlaceholderTone } from "@/lib/types";
import { useSaveCategory, useDeleteCategory } from "@/lib/use-admin-catalog";
import { ApiError } from "@/lib/api/client";
import { slugify } from "@/lib/format";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { MediaSwatch } from "@/components/ui/MediaSwatch";
import { getCategoryArt } from "@/components/ui/category-art";

const TONE_OPTIONS: PlaceholderTone[] = ["rose", "cream", "charcoal", "gold"];

const inputClasses =
  "w-full rounded-lg border border-input-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary disabled:opacity-50";
const labelClasses = "flex flex-col gap-1.5 text-sm font-medium text-foreground";

export function CategoryForm({ initialCategory }: { initialCategory?: Category }) {
  const router = useRouter();
  const isEditing = Boolean(initialCategory);
  const saveCategory = useSaveCategory();
  const deleteCategory = useDeleteCategory();
  const toast = useToast();

  const [name, setName] = useState(initialCategory?.name ?? "");
  const [slug, setSlug] = useState(initialCategory?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(isEditing);
  const [tone, setTone] = useState<PlaceholderTone>(initialCategory?.tone ?? "rose");
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialCategory?.imageUrl);
  const [error, setError] = useState("");

  useMarkUnsaved(useIsDirty({ name, slug, tone, imageUrl }));

  const busy = saveCategory.isPending || deleteCategory.isPending;

  function handleNameChange(value: string) {
    setName(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const finalSlug = slugify(slug);
    if (!finalSlug) {
      setError("Slug is required.");
      return;
    }

    const category: Category = { slug: finalSlug, name, tone, imageUrl };
    try {
      await saveCategory.mutateAsync({ category, isEditing });
      toast.success(isEditing ? "Category updated." : "Category added.");
      router.push("/admin/products");
    } catch (err) {
      if (err instanceof ApiError && err.code === "CONFLICT") {
        setError("Another category already uses this slug — choose a different one.");
      } else if (err instanceof ApiError && err.code === "VALIDATION_ERROR" && err.fields) {
        setError(Object.values(err.fields)[0] ?? err.message);
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong saving this category. Please try again.");
      }
    }
  }

  async function handleDelete() {
    const initial = initialCategory;
    if (!initial) return;
    if (!confirm(`Delete "${initial.name}"? This can't be undone.`)) return;

    setError("");
    try {
      await deleteCategory.mutateAsync(initial.slug);
      toast.success(`"${initial.name}" deleted.`);
      router.push("/admin/products");
    } catch (err) {
      if (err instanceof ApiError && err.code === "CONFLICT") {
        setError(`"${initial.name}" still has products assigned to it — move or delete those first.`);
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong deleting this category. Please try again.");
      }
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
      <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-5">
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</p>
        )}

        <label className={labelClasses}>
          Category Name
          <input
            required
            disabled={busy}
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
            disabled={busy}
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
            disabled={busy}
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
          <Button type="submit" className="self-start" disabled={busy}>
            {saveCategory.isPending ? "Saving…" : isEditing ? "Save Changes" : "Add Category"}
          </Button>
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy}
              className="text-sm font-medium text-red-500 hover:text-red-600 disabled:opacity-50"
            >
              {deleteCategory.isPending ? "Deleting…" : "Delete Category"}
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
