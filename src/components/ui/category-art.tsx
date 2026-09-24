import type { ComponentType, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

// Simple line-art silhouettes standing in for product photography until
// real photos exist — on-brand and stable, unlike a random stock photo.
export function DressArt(props: IconProps) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" fillOpacity={0.16} stroke="currentColor" strokeWidth={2} strokeLinejoin="round" {...props}>
      <path d="M35 18 Q50 10 65 18 L72 30 L64 34 L58 52 L78 88 L22 88 L42 52 L36 34 L28 30 Z" />
    </svg>
  );
}

export function FootwearArt(props: IconProps) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" fillOpacity={0.16} stroke="currentColor" strokeWidth={2} strokeLinejoin="round" {...props}>
      <path d="M10 70 Q8 80 20 82 L66 82 Q80 82 82 68 L84 52 Q85 44 76 42 L46 34 Q34 31 28 40 L22 54 Q18 64 10 70 Z" />
      <path d="M78 60 L86 84 L72 84 Z" fillOpacity={0.3} />
    </svg>
  );
}

export function BagArt(props: IconProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" {...props}>
      <path d="M30 34 Q30 14 50 14 Q70 14 70 34" />
      <rect x="18" y="34" width="64" height="52" rx="8" fill="currentColor" fillOpacity={0.16} />
      <rect x="44" y="34" width="12" height="8" rx="2" fill="currentColor" fillOpacity={0.5} stroke="none" />
    </svg>
  );
}

export function FabricArt(props: IconProps) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" {...props}>
      <ellipse cx="22" cy="58" rx="10" ry="26" fillOpacity={0.2} />
      <rect x="22" y="32" width="56" height="52" rx="4" fillOpacity={0.1} />
      <path d="M30 46 Q50 42 78 46 M30 58 Q50 54 78 58 M30 70 Q50 66 78 70" fill="none" strokeWidth={1.5} opacity={0.6} />
    </svg>
  );
}

export function JewelleryArt(props: IconProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="M18 20 Q50 60 82 20" />
      <rect x="42" y="38" width="16" height="16" rx="2" transform="rotate(45 50 46)" fill="currentColor" fillOpacity={0.25} />
    </svg>
  );
}

export function AccessoryArt(props: IconProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" {...props}>
      <circle cx="28" cy="52" r="16" fill="currentColor" fillOpacity={0.16} />
      <circle cx="72" cy="52" r="16" fill="currentColor" fillOpacity={0.16} />
      <path d="M44 50 Q50 44 56 50" />
      <path d="M12 48 L4 42" />
      <path d="M88 48 L96 42" />
    </svg>
  );
}

export const CATEGORY_ART: Record<string, ComponentType<IconProps>> = {
  dresses: DressArt,
  footwear: FootwearArt,
  bags: BagArt,
  fabrics: FabricArt,
  jewellery: JewelleryArt,
  accessories: AccessoryArt,
};

export function getCategoryArt(categorySlug: string): ComponentType<IconProps> {
  return CATEGORY_ART[categorySlug] ?? AccessoryArt;
}
