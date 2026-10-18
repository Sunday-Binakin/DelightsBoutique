import { SITE } from "@/lib/constants";
import { deriveThemeTokens, type ThemeColors } from "@/lib/theme";
import type { CSSProperties } from "react";

/** Scopes the draft colors to just this preview via CSS custom properties, so
 * the existing bg-primary/text-accent-dark/etc. utility classes render the
 * admin's in-progress picks without touching the real, currently-live theme. */
export function ThemePreview({ theme }: { theme: ThemeColors }) {
  const t = deriveThemeTokens(theme);
  const scoped = {
    "--primary": t.primary,
    "--primary-dark": t.primaryDark,
    "--accent": t.accent,
    "--accent-dark": t.accentDark,
  } as CSSProperties;

  return (
    <div style={scoped} className="overflow-hidden rounded-xl border border-border-subtle">
      <div className="bg-gradient-to-r from-primary to-accent-dark px-4 py-2 text-center text-xs text-white">
        Wholesale & retail welcome — order today, pay on confirmation.
      </div>

      <div className="border-b border-border-subtle px-4 py-3">
        <p className="bg-gradient-to-r from-primary to-accent-dark bg-clip-text font-serif text-sm font-semibold text-transparent">
          {SITE.name}
        </p>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-primary to-accent-dark inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-medium text-white">
            Add to Cart
          </span>
          <span className="rounded-full border border-current px-4 py-2 text-xs font-medium text-primary">
            Shop Now
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="tracking-tight text-accent-dark">★★★★☆</span>
          <span className="text-muted-foreground">(42 reviews)</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-white">
            2
          </span>
          <span className="text-xs text-muted-foreground">Items in cart</span>
        </div>
      </div>
    </div>
  );
}
