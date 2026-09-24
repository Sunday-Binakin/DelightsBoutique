"use client";

import { useState } from "react";
import { readImageFile } from "@/lib/image-upload";

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  max?: number;
}

/** Multiple product photos — the first is the cover shown everywhere else (cards, cart, admin tables); the rest only appear in the product page's own gallery. */
export function MultiImageUpload({
  value,
  onChange,
  label = "Product Photos",
  max = 6,
}: MultiImageUploadProps) {
  const [error, setError] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const room = max - value.length;
    if (room <= 0) {
      setError(`You can add up to ${max} photos.`);
      return;
    }

    setError("");
    const chosen = Array.from(files).slice(0, room);
    try {
      const dataUrls = await Promise.all(
        chosen.map((file) => {
          if (!file.type.startsWith("image/")) {
            throw new Error("Please choose image files only.");
          }
          return readImageFile(file);
        }),
      );
      onChange([...value, ...dataUrls]);
    } catch {
      setError("Couldn't read one of those images — try different files.");
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function makeCover(index: number) {
    if (index === 0) return;
    const next = [...value];
    const [photo] = next.splice(index, 1);
    next.unshift(photo);
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div className="flex flex-wrap gap-3">
        {value.map((url, index) => (
          <div key={index} className="relative h-24 w-24 shrink-0">
            <button
              type="button"
              onClick={() => makeCover(index)}
              title={index === 0 ? "Cover photo" : "Make cover photo"}
              className="block h-full w-full overflow-hidden rounded-lg border border-border-subtle bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- data URL preview, not a remote asset */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
            {index === 0 && (
              <span className="absolute bottom-1 left-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
                Cover
              </span>
            )}
            <button
              type="button"
              onClick={() => removeAt(index)}
              aria-label="Remove photo"
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-xs text-white hover:bg-red-600"
            >
              ×
            </button>
          </div>
        ))}

        {value.length < max && (
          <label className="flex h-24 w-24 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border-subtle text-center text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary">
            + Add Photo
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-muted-foreground">
        {value.length === 0
          ? "Until a photo is uploaded, a placeholder illustration is shown instead."
          : "Click a photo to make it the cover shown on cards and listings. The rest appear in the product page's gallery."}
      </p>
    </div>
  );
}
