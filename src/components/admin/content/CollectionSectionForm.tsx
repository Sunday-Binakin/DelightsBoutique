"use client";

import { useState, type FormEvent } from "react";
import {
  getCollectionSection,
  saveCollectionSection,
  pickCollectionTabProducts,
  type CollectionSectionContent,
} from "@/lib/collection-section";
import { logAction } from "@/lib/audit-log";
import type { Product } from "@/lib/types";
import { getAllProducts } from "@/lib/product-store";
import { Button } from "@/components/ui/Button";
import { ProductPicker } from "@/components/admin/content/ProductPicker";
import { ProductVisual } from "@/components/ui/ProductVisual";

const inputClasses =
  "w-full rounded-lg border border-border-subtle bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary";
const labelClasses = "flex flex-col gap-1.5 text-sm font-medium text-foreground";

interface CollectionSectionPreviewProps {
  content: CollectionSectionContent;
  activeIndex: 0 | 1 | 2;
  onTabClick: (index: 0 | 1 | 2) => void;
  previewProducts: Product[];
}

function CollectionSectionPreview({
  content,
  activeIndex,
  onTabClick,
  previewProducts,
}: CollectionSectionPreviewProps) {
  const tabs = [content.newArrivalsLabel, content.bestSellersLabel, content.wholesalePicksLabel];

  return (
    <div className="rounded-xl border border-border-subtle p-5 text-center">
      <span className="text-xs font-semibold uppercase tracking-widest text-primary">
        {content.eyebrow || "Eyebrow"}
      </span>
      <h3 className="mt-1 font-serif text-lg font-semibold text-foreground">
        {content.title || "Section Title"}
      </h3>
      <div className="mt-3 flex justify-center gap-4 border-b border-border-subtle">
        {tabs.map((tab, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onTabClick(index as 0 | 1 | 2)}
            className={`-mb-px border-b-2 px-1 pb-2 text-xs font-medium ${
              index === activeIndex
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            }`}
          >
            {tab || `Tab ${index + 1}`}
          </button>
        ))}
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
  );
}

export function CollectionSectionForm() {
  const [content, setContent] = useState<CollectionSectionContent>(() => getCollectionSection());
  const [saved, setSaved] = useState(true);
  const [products] = useState(() => getAllProducts());
  const [activeIndex, setActiveIndex] = useState<0 | 1 | 2>(0);

  function update<K extends keyof CollectionSectionContent>(
    key: K,
    value: CollectionSectionContent[K],
  ) {
    setContent((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  // Jump the preview to whichever tab the admin is actively picking products
  // for, so ticking a box shows up on the right without an extra click.
  function updateTabSlugs(
    key: "newArrivalsSlugs" | "bestSellersSlugs" | "wholesalePicksSlugs",
    value: string[],
    tabIndex: 0 | 1 | 2,
  ) {
    update(key, value);
    setActiveIndex(tabIndex);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    saveCollectionSection(content);
    logAction('Updated "Shop the Collection" section');
    setSaved(true);
  }

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

        <p className="text-sm font-medium text-foreground">Tabs &amp; Products</p>
        <p className="-mt-3 text-xs text-muted-foreground">
          Name each tab and pick which products show under it. Leave a tab&apos;s picks empty to
          fall back to auto-selecting by badge/wholesale price.
        </p>

        <div className="flex flex-col gap-3 rounded-lg border border-border-subtle p-4">
          <label className={labelClasses}>
            Tab 1 label
            <input
              value={content.newArrivalsLabel}
              onChange={(e) => update("newArrivalsLabel", e.target.value)}
              className={inputClasses}
            />
          </label>
          <ProductPicker
            products={products}
            selectedSlugs={content.newArrivalsSlugs}
            onChange={(slugs) => updateTabSlugs("newArrivalsSlugs", slugs, 0)}
            previewProducts={pickCollectionTabProducts(products, content.newArrivalsSlugs, 0)}
          />
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-border-subtle p-4">
          <label className={labelClasses}>
            Tab 2 label
            <input
              value={content.bestSellersLabel}
              onChange={(e) => update("bestSellersLabel", e.target.value)}
              className={inputClasses}
            />
          </label>
          <ProductPicker
            products={products}
            selectedSlugs={content.bestSellersSlugs}
            onChange={(slugs) => updateTabSlugs("bestSellersSlugs", slugs, 1)}
            previewProducts={pickCollectionTabProducts(products, content.bestSellersSlugs, 1)}
          />
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-border-subtle p-4">
          <label className={labelClasses}>
            Tab 3 label
            <input
              value={content.wholesalePicksLabel}
              onChange={(e) => update("wholesalePicksLabel", e.target.value)}
              className={inputClasses}
            />
          </label>
          <ProductPicker
            products={products}
            selectedSlugs={content.wholesalePicksSlugs}
            onChange={(slugs) => updateTabSlugs("wholesalePicksSlugs", slugs, 2)}
            previewProducts={pickCollectionTabProducts(products, content.wholesalePicksSlugs, 2)}
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
        <CollectionSectionPreview
          content={content}
          activeIndex={activeIndex}
          onTabClick={setActiveIndex}
          previewProducts={pickCollectionTabProducts(
            products,
            [content.newArrivalsSlugs, content.bestSellersSlugs, content.wholesalePicksSlugs][
              activeIndex
            ],
            activeIndex,
          )}
        />
      </div>
    </div>
  );
}
