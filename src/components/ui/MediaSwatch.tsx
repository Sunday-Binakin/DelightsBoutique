import type { ComponentType, ReactNode, SVGProps } from "react";
import type { PlaceholderTone } from "@/lib/types";
import { TONE_GRADIENTS, TONE_ICON } from "@/lib/tone";
import { resolveAssetUrl } from "@/lib/asset-url";

interface MediaSwatchProps {
  /** Uploaded photo URL — shown instead of the illustration when present. */
  imageUrl?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tone: PlaceholderTone;
  label: string;
  className?: string;
  iconClassName?: string;
  /** Darkens the backdrop so light text/buttons stay legible on top of it. */
  overlay?: boolean;
  /** Use "eager" only for images visible on first paint (hero, main product photo). */
  loading?: "eager" | "lazy";
  children?: ReactNode;
}

/**
 * The one place that decides "real photo vs. placeholder illustration" for
 * products, categories, and banners alike — upload a photo anywhere in the
 * admin panel and this is what swaps it in.
 */
export function MediaSwatch({
  imageUrl,
  icon: Icon,
  tone,
  label,
  className = "",
  iconClassName = "h-2/5 w-2/5",
  overlay = false,
  loading = "lazy",
  children,
}: MediaSwatchProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${TONE_GRADIENTS[tone]} ${className}`}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- inline data URLs can't go through the Next image optimizer
        <img
          src={resolveAssetUrl(imageUrl)}
          alt=""
          loading={loading}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <Icon className={`${TONE_ICON[tone]} ${iconClassName}`} />
      )}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      )}
      {children}
    </div>
  );
}
