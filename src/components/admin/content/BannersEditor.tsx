"use client";

import { useState } from "react";
import { useMarkUnsaved } from "@/lib/unsaved-changes";
import { useCategories } from "@/lib/use-categories";
import { useBannersQuery } from "@/lib/use-banners";
import { useUpdateBanner } from "@/lib/use-admin-content";
import { BANNER_LABELS, TEXT_COLOR_OPTIONS, type BannerSet } from "@/lib/banners";
import type { PlaceholderTone, PromoBannerContent } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { PromoBanner } from "@/components/home/PromoBanner";
import { LoadingBlock } from "@/components/ui/Spinner";
import { QueryError } from "@/components/ui/QueryError";
import { useToast } from "@/components/ui/ToastProvider";

const TONE_OPTIONS: PlaceholderTone[] = ["rose", "cream", "charcoal", "gold"];

const inputClasses =
  "w-full rounded-lg border border-input-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary";
const labelClasses = "flex flex-col gap-1.5 text-sm font-medium text-foreground";

function BannerCard({
  bannerKey,
  content,
  onSaved,
}: {
  bannerKey: keyof BannerSet;
  content: PromoBannerContent;
  onSaved: () => void;
}) {
  const categories = useCategories();
  const [draft, setDraft] = useState<PromoBannerContent>(content);
  const [saved, setSaved] = useState(true);
  useMarkUnsaved(!saved);
  const updateBanner = useUpdateBanner();
  const toast = useToast();

  function update<K extends keyof PromoBannerContent>(key: K, value: PromoBannerContent[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    try {
      await updateBanner.mutateAsync({
        key: bannerKey,
        banner: { ...draft, imageUrl: draft.imageUrl ?? null, textColor: draft.textColor ?? null },
      });
      setSaved(true);
      onSaved();
      toast.success(`"${BANNER_LABELS[bannerKey]}" banner saved.`);
    } catch {
      toast.error("Couldn't save this banner. Try again.");
    }
  }

  return (
    <div className="rounded-xl border border-border-subtle p-5">
      <p className="text-sm font-semibold text-foreground">{BANNER_LABELS[bannerKey]}</p>

      <div className="mt-3">
        <PromoBanner content={draft} />
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <label className={labelClasses}>
          Eyebrow
          <input
            value={draft.eyebrow}
            onChange={(e) => update("eyebrow", e.target.value)}
            className={inputClasses}
          />
        </label>
        <label className={labelClasses}>
          Title
          <input
            value={draft.title}
            onChange={(e) => update("title", e.target.value)}
            className={inputClasses}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className={labelClasses}>
            Button Label
            <input
              value={draft.ctaLabel}
              onChange={(e) => update("ctaLabel", e.target.value)}
              className={inputClasses}
            />
          </label>
          <label className={labelClasses}>
            Link
            <input
              value={draft.href}
              onChange={(e) => update("href", e.target.value)}
              className={inputClasses}
            />
          </label>
        </div>
        <ImageUpload
          value={draft.imageUrl}
          onChange={(url) => update("imageUrl", url)}
          label="Banner Photo"
        />

        <div className="grid grid-cols-2 gap-3">
          <label className={labelClasses}>
            Color Theme
            <select
              value={draft.tone}
              onChange={(e) => update("tone", e.target.value as PlaceholderTone)}
              className={inputClasses}
            >
              {TONE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClasses}>
            Illustration (fallback)
            <select
              value={draft.artCategorySlug}
              onChange={(e) => update("artCategorySlug", e.target.value)}
              className={inputClasses}
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={labelClasses}>
          Text Color
          <div className="flex flex-wrap gap-2.5">
            {TEXT_COLOR_OPTIONS.map((option) => {
              const isSelected = (draft.textColor || "#ffffff") === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  title={option.label}
                  aria-label={option.label}
                  onClick={() => update("textColor", option.value)}
                  className={`h-8 w-8 rounded-full border-2 transition-transform ${
                    isSelected
                      ? "scale-110 border-primary"
                      : "border-border-subtle hover:scale-105"
                  }`}
                  style={{ backgroundColor: option.value }}
                />
              );
            })}
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={saved || updateBanner.isPending}
          onClick={handleSave}
          className="self-start"
        >
          {updateBanner.isPending ? "Saving…" : saved ? "Saved" : "Save Banner"}
        </Button>
      </div>
    </div>
  );
}

export function BannersEditor() {
  const { banners, isLoading, isError, refetch } = useBannersQuery();
  if (isLoading) return <LoadingBlock />;
  if (isError) return <QueryError label="banners" onRetry={refetch} />;

  return (
    <div className="mt-4 grid gap-5 lg:grid-cols-2">
      {(Object.keys(banners) as Array<keyof BannerSet>).map((key) => (
        <BannerCard key={key} bannerKey={key} content={banners[key]} onSaved={() => {}} />
      ))}
    </div>
  );
}
