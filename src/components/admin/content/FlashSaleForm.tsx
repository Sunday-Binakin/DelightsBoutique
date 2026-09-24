"use client";

import { useState, type FormEvent } from "react";
import { getFlashSale, saveFlashSale, pickFlashSaleProducts, type FlashSaleContent } from "@/lib/flash-sale";
import { logAction } from "@/lib/audit-log";
import { getAllProducts } from "@/lib/product-store";
import { Button } from "@/components/ui/Button";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { ProductVisual } from "@/components/ui/ProductVisual";
import { ProductPicker } from "@/components/admin/content/ProductPicker";

const inputClasses =
  "w-full rounded-lg border border-border-subtle bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary";
const labelClasses = "flex flex-col gap-1.5 text-sm font-medium text-foreground";

/** <input type="datetime-local"> works in the browser's local time, with no timezone/seconds. */
function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function FlashSaleForm() {
  const [content, setContent] = useState<FlashSaleContent>(() => getFlashSale());
  const [saved, setSaved] = useState(true);
  const [products] = useState(() => getAllProducts());

  function update<K extends keyof FlashSaleContent>(key: K, value: FlashSaleContent[K]) {
    setContent((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    saveFlashSale(content);
    logAction('Updated "Flash Sale" section');
    setSaved(true);
  }

  const previewProducts = pickFlashSaleProducts(products, content.productSlugs);
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
          <ProductPicker
            products={products}
            selectedSlugs={content.productSlugs}
            onChange={(slugs) => update("productSlugs", slugs)}
            previewProducts={previewProducts}
            emptyHint="None selected — auto-fills from products with a compare-at (sale) price"
          />
        </div>

        <Button type="submit" disabled={saved} className="self-start">
          {saved ? "Saved" : "Save"}
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
