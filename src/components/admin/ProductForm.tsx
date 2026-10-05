"use client";

import { useState, type FormEvent } from "react";
import { useIsDirty, useMarkUnsaved } from "@/lib/unsaved-changes";
import { useRouter } from "next/navigation";
import type { Product, StockStatus } from "@/lib/types";
import { useCategories } from "@/lib/use-categories";
import { useSaveProduct } from "@/lib/use-admin-catalog";
import { ApiError } from "@/lib/api/client";
import { slugify } from "@/lib/format";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Button";
import { MultiImageUpload } from "@/components/admin/MultiImageUpload";
import { ProductPreview } from "@/components/admin/ProductPreview";

const STOCK_OPTIONS: { value: StockStatus; label: string }[] = [
  { value: "inStock", label: "In Stock" },
  { value: "lowStock", label: "Low Stock" },
  { value: "outOfStock", label: "Out of Stock" },
];
const BADGE_OPTIONS = [
  { value: "None", label: "None" },
  { value: "new", label: "New" },
  { value: "bestSeller", label: "Best Seller" },
] as const;

const inputClasses =
  "w-full rounded-lg border border-input-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary disabled:opacity-50";
const labelClasses = "flex flex-col gap-1.5 text-sm font-medium text-foreground";

export function ProductForm({ initialProduct }: { initialProduct?: Product }) {
  const router = useRouter();
  const isEditing = Boolean(initialProduct);
  const categories = useCategories();
  const saveProduct = useSaveProduct();
  const toast = useToast();

  const [name, setName] = useState(initialProduct?.name ?? "");
  const [slug, setSlug] = useState(initialProduct?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(isEditing);
  const [categorySlug, setCategorySlug] = useState(
    initialProduct?.categorySlug ?? categories[0]?.slug ?? "",
  );
  const [description, setDescription] = useState(initialProduct?.description ?? "");
  const [retailPrice, setRetailPrice] = useState(initialProduct?.retailPrice.toString() ?? "");
  const [compareAtPrice, setCompareAtPrice] = useState(initialProduct?.compareAtPrice?.toString() ?? "");
  const [wholesalePrice, setWholesalePrice] = useState(initialProduct?.wholesalePrice?.toString() ?? "");
  const [wholesaleMoq, setWholesaleMoq] = useState(initialProduct?.wholesaleMoq?.toString() ?? "");
  const [stockStatus, setStockStatus] = useState<StockStatus>(initialProduct?.stockStatus ?? "inStock");
  const [badge, setBadge] = useState<string>(initialProduct?.badge ?? "None");
  const [sizes, setSizes] = useState(initialProduct?.sizes?.join(", ") ?? "");
  const [colors, setColors] = useState(initialProduct?.colors?.join(", ") ?? "");
  const [imageUrls, setImageUrls] = useState<string[]>(initialProduct?.imageUrls ?? []);
  const [error, setError] = useState("");

  useMarkUnsaved(
    useIsDirty({
      name,
      slug,
      categorySlug,
      description,
      retailPrice,
      compareAtPrice,
      wholesalePrice,
      wholesaleMoq,
      stockStatus,
      badge,
      sizes,
      colors,
      imageUrls,
    }),
  );

  function handleNameChange(value: string) {
    setName(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  // Shared between the live preview (every render) and the actual save —
  // the only difference at submit time is a validated/slugified slug.
  function buildProduct(finalSlug: string): Product {
    const category = categories.find((c) => c.slug === categorySlug) ?? categories[0];
    return {
      slug: finalSlug,
      name: name || "Untitled Product",
      category: category?.name ?? "",
      categorySlug: category?.slug ?? categorySlug,
      description,
      retailPrice: Number(retailPrice) || 0,
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      wholesalePrice: wholesalePrice ? Number(wholesalePrice) : undefined,
      wholesaleMoq: wholesalePrice && wholesaleMoq ? Number(wholesaleMoq) : undefined,
      rating: initialProduct?.rating ?? 5,
      reviewCount: initialProduct?.reviewCount ?? 0,
      tone: category?.tone ?? "rose",
      badge: badge === "None" ? undefined : (badge as "new" | "bestSeller"),
      stockStatus,
      sizes: sizes.trim() ? sizes.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
      colors: colors.trim() ? colors.split(",").map((c) => c.trim()).filter(Boolean) : undefined,
      imageUrls: imageUrls.length ? imageUrls : undefined,
    };
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const finalSlug = slugify(slug);
    if (!finalSlug) {
      setError("Slug is required.");
      return;
    }

    try {
      await saveProduct.mutateAsync({ product: buildProduct(finalSlug), isEditing });
      toast.success(isEditing ? "Product updated." : "Product added.");
      router.push("/admin/products");
    } catch (err) {
      if (err instanceof ApiError && err.code === "VALIDATION_ERROR" && err.fields) {
        setError(Object.values(err.fields)[0] ?? err.message);
      } else if (err instanceof ApiError && err.code === "CONFLICT") {
        setError("Another product already uses this slug — choose a different one.");
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong saving this product. Please try again.");
      }
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-5">
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</p>
        )}

        <label className={labelClasses}>
          Product Name
          <input
            required
            disabled={saveProduct.isPending}
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={inputClasses}
          />
        </label>

        <label className={labelClasses}>
          URL Slug
          <input
            required
            disabled={saveProduct.isPending}
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugEdited(true);
            }}
            className={inputClasses}
          />
        </label>

        <MultiImageUpload value={imageUrls} onChange={setImageUrls} />

        <label className={labelClasses}>
          Category
          <select
            value={categorySlug}
            disabled={saveProduct.isPending}
            onChange={(e) => setCategorySlug(e.target.value)}
            className={inputClasses}
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClasses}>
          Description
          <textarea
            required
            rows={3}
            disabled={saveProduct.isPending}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClasses}
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className={labelClasses}>
            Retail Price (GH₵)
            <input
              required
              type="number"
              min="0"
              step="0.01"
              disabled={saveProduct.isPending}
              value={retailPrice}
              onChange={(e) => setRetailPrice(e.target.value)}
              className={inputClasses}
            />
          </label>
          <label className={labelClasses}>
            Compare-at Price (optional)
            <input
              type="number"
              min="0"
              step="0.01"
              disabled={saveProduct.isPending}
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
              className={inputClasses}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className={labelClasses}>
            Wholesale Price (optional)
            <input
              type="number"
              min="0"
              step="0.01"
              disabled={saveProduct.isPending}
              value={wholesalePrice}
              onChange={(e) => setWholesalePrice(e.target.value)}
              className={inputClasses}
            />
          </label>
          <label className={labelClasses}>
            Wholesale MOQ
            <input
              type="number"
              min="0"
              disabled={saveProduct.isPending || !wholesalePrice}
              value={wholesaleMoq}
              onChange={(e) => setWholesaleMoq(e.target.value)}
              className={inputClasses}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className={labelClasses}>
            Stock Status
            <select
              value={stockStatus}
              disabled={saveProduct.isPending}
              onChange={(e) => setStockStatus(e.target.value as StockStatus)}
              className={inputClasses}
            >
              {STOCK_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClasses}>
            Badge
            <select
              value={badge}
              disabled={saveProduct.isPending}
              onChange={(e) => setBadge(e.target.value)}
              className={inputClasses}
            >
              {BADGE_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className={labelClasses}>
          Sizes (comma-separated, optional)
          <input
            disabled={saveProduct.isPending}
            value={sizes}
            onChange={(e) => setSizes(e.target.value)}
            className={inputClasses}
            placeholder="S, M, L, XL"
          />
        </label>

        <label className={labelClasses}>
          Colors (comma-separated, optional)
          <input
            disabled={saveProduct.isPending}
            value={colors}
            onChange={(e) => setColors(e.target.value)}
            className={inputClasses}
            placeholder="Black, Navy"
          />
        </label>

        <div className="flex gap-3">
          <Button type="submit" disabled={saveProduct.isPending}>
            {saveProduct.isPending ? "Saving…" : isEditing ? "Save Changes" : "Add Product"}
          </Button>
        </div>
      </form>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Live Preview
        </p>
        <ProductPreview product={buildProduct(slug || "preview")} />
      </div>
    </div>
  );
}
