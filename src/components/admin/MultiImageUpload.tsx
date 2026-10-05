"use client";

import { useState } from "react";
import { resolveAssetUrl } from "@/lib/asset-url";
import { uploadErrorMessage, uploadImage } from "@/lib/image-upload";

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
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const room = max - value.length;
    if (room <= 0) {
      setError(`You can add up to ${max} photos.`);
      return;
    }

    setError("");
    const chosen = Array.from(files).slice(0, room);
    if (chosen.some((file) => !file.type.startsWith("image/"))) {
      setError("Please choose image files only.");
      return;
    }

    setUploading(true);
    try {
      const urls = await Promise.all(chosen.map(uploadImage));
      onChange([...value, ...urls]);
    } catch (err) {
      setError(uploadErrorMessage(err));
    } finally {
      setUploading(false);
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
              {/* eslint-disable-next-line @next/next/no-img-element -- served from the API host, not optimised by next/image */}
              <img src={resolveAssetUrl(url)} alt={`Product photo ${index + 1}`} className="h-full w-full object-cover" />
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
            {uploading ? "Uploading…" : "+ Add Photo"}
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
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
