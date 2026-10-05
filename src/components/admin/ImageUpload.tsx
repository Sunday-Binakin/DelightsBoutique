"use client";

import { useState } from "react";
import { resolveAssetUrl } from "@/lib/asset-url";
import { uploadErrorMessage, uploadImage } from "@/lib/image-upload";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label = "Photo" }: ImageUploadProps) {
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      onChange(await uploadImage(file));
    } catch (err) {
      setError(uploadErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div className="flex items-center gap-4">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border-subtle bg-muted">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element -- served from the API host, not optimised by next/image
            <img src={resolveAssetUrl(value)} alt={`${label} preview`} className="h-full w-full object-cover" />
          ) : (
            <span className="px-2 text-center text-xs text-muted-foreground">No photo yet</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-border-subtle px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:border-primary hover:text-primary">
            {uploading ? "Uploading…" : value ? "Replace Photo" : "Upload Photo"}
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>
          {value && (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="text-left text-xs text-muted-foreground hover:text-primary"
            >
              Remove photo
            </button>
          )}
        </div>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Until a photo is uploaded, a placeholder illustration is shown instead.
      </p>
    </div>
  );
}
