import type { ComponentType, ReactNode, SVGProps } from "react";
import type { PlaceholderTone } from "@/lib/types";
import { TONE_GRADIENTS, TONE_ICON } from "@/lib/tone";

interface IllustrationSwatchProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tone: PlaceholderTone;
  label: string;
  className?: string;
  iconClassName?: string;
  /** Darkens the backdrop so light text/buttons stay legible on top of it. */
  overlay?: boolean;
  children?: ReactNode;
}

export function IllustrationSwatch({
  icon: Icon,
  tone,
  label,
  className = "",
  iconClassName = "h-2/5 w-2/5",
  overlay = false,
  children,
}: IllustrationSwatchProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${TONE_GRADIENTS[tone]} ${className}`}
    >
      <Icon className={`${TONE_ICON[tone]} ${iconClassName}`} />
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      )}
      {children}
    </div>
  );
}
