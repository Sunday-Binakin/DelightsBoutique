"use client";

import { useState, type FormEvent } from "react";
import { useMarkUnsaved } from "@/lib/unsaved-changes";
import { useFlashSaleQuery } from "@/lib/use-flash-sale";
import { FULL_CATALOG_LIMIT, useProductsList } from "@/lib/use-products";
import { useUpdateFlashSale } from "@/lib/use-admin-content";
import { pickFlashSaleProducts } from "@/lib/flash-sale";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { ProductVisual } from "@/components/ui/ProductVisual";
import { ProductPicker } from "@/components/admin/content/ProductPicker";
import { LoadingBlock } from "@/components/ui/Spinner";
import { QueryError } from "@/components/ui/QueryError";
import { useToast } from "@/components/ui/ToastProvider";

const inputClasses =
  "w-full rounded-lg border border-input-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary";
const labelClasses = "flex flex-col gap-1.5 text-sm font-medium text-foreground";

interface FlashSaleDraft {
  eyebrow: string;
  title: string;
  endsAt: string;
  productSlugs: string[];
}

/** <input type="datetime-local"> works in the browser's local time, with no timezone/seconds. */
function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function FlashSaleForm() {
  const {
    flashSale,
    isLoading: loadingFlashSale,
    isError: flashSaleErrored,
    refetch: refetchFlashSale,
  } = useFlashSaleQuery();
  const {
    products,
    total: catalogTotal,
    isLoading: loadingProducts,
    isError: productsErrored,
    refetch: refetchProducts,
  } = useProductsList({ limit: FULL_CATALOG_LIMIT });

  if (loadingFlashSale || loadingProducts) return <LoadingBlock />;
  if (flashSaleErrored || productsErrored) {
    return (
      <QueryError
        label="the flash sale section"
        onRetry={() => {
          refetchFlashSale();
          refetchProducts();
        }}
      />
    );
  }

  // Auto-filled products aren't a pick; starting from them would save them as one.
  const initialContent: FlashSaleDraft = {
    eyebrow: flashSale.eyebrow,
    title: flashSale.title,
    endsAt: flashSale.endsAt,
    productSlugs: flashSale.isCurated ? flashSale.products.map((p) => p.slug) : [],
  };

  return (
    <FlashSaleFormInner
      initialContent={initialContent}
      allProducts={products}
      catalogTotal={catalogTotal}
    />
  );;
}

function FlashSaleFormInner({
  initialContent,
  allProducts,
  catalogTotal,
}: {
  initialContent: FlashSaleDraft;
  allProducts: Product[];
  catalogTotal: number;
}) {
  const [content, setContent] = useState<FlashSaleDraft>(initialContent);
  const [saved, setSaved] = useState(true);
  useMarkUnsaved(!saved);
  const updateFlashSale = useUpdateFlashSale();
  const toast = useToast();

  function update<K extends keyof FlashSaleDraft>(key: K, value: FlashSaleDraft[K]) {
    setContent((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await updateFlashSale.mutateAsync(content);
      setSaved(true);
      toast.success("Flash sale section saved.");
    } catch {
      toast.error("Couldn't save the flash sale section. Try again.");
    }
  }

  const previewProducts = pickFlashSaleProducts(allProducts, content.productSlugs);
  const endsAtMs = new Date(content.endsAt).getTime();

  return (
    <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_320px]">
      <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-5">

        <label className={labelClasses}>
          Eyebrow
          <input
            value={content.eyebrow}
            onChange={(e) => update("eyebrow", e.target.value)}
            className={inputClasses}
          />
        </label>

        <label className={labelClasses}>
          Title
          <input
            value={content.title}
            onChange={(e) => update("title", e.target.value)}
            className={inputClasses}
          />
        </label>

        <label className={labelClasses}>
          Sale ends
          <input
            type="datetime-local"
            value={toDatetimeLocal(content.endsAt)}
            onChange={(e) => {
              if (!e.target.value) return;
              update("endsAt", new Date(e.target.value).toISOString());
            }}
            className={inputClasses}
          />
        </label>

        <div className="flex flex-col gap-3 rounded-lg border border-border-subtle p-4">
          <p className={labelClasses}>Products in the sale</p>
          {catalogTotal > allProducts.length && (
            <p className="text-xs text-amber-700">
              Showing the first {allProducts.length} of {catalogTotal} products. Products beyond
              that can&apos;t be picked here yet.
            </p>
          )}
          <ProductPicker
            products={allProducts}
            selectedSlugs={content.productSlugs}
            onChange={(slugs) => update("productSlugs", slugs)}
            previewProducts={previewProducts}
            emptyHint="None selected — auto-fills from products with a compare-at (sale) price"
          />
        </div>

        <Button type="submit" disabled={saved || updateFlashSale.isPending} className="self-start">
          {updateFlashSale.isPending ? "Saving…" : saved ? "Saved" : "Save"}
        </Button>
      </form>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Live Preview
        </p>
        <div className="rounded-xl border border-border-subtle p-5 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            {content.eyebrow || "Eyebrow"}
          </span>
          <h3 className="mt-1 font-serif text-lg font-semibold text-foreground">
            {content.title || "Section Title"}
          </h3>
          <div className="mt-3 flex justify-center">
            <CountdownTimer endsAt={endsAtMs} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {previewProducts.slice(0, 6).map((product) => (
              <div key={product.slug}>
                <ProductVisual product={product} className="aspect-square w-full rounded-lg" />
                <p className="mt-1 truncate text-[10px] text-muted-foreground">{product.name}</p>
              </div>
            ))}
            {previewProducts.length === 0 && (
              <p className="col-span-3 py-4 text-xs text-muted-foreground">No products to show yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
