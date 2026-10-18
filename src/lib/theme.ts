/** The two colors an owner can pick — every other shade is derived from these. */
export interface ThemeColors {
  primary: string;
  accent: string;
}

/** Matches the backend's seeded default and today's flyer-derived palette, so a
 * failed/slow theme fetch falls back to exactly what the site already looks like. */
export const DEFAULT_THEME: ThemeColors = {
  primary: "#0550c2",
  accent: "#ff7101",
};

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  switch (max) {
    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
    case g: h = (b - r) / d + 2; break;
    default: h = (r - g) / d + 4;
  }
  return [h / 6, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    hue2rgb(p, q, h + 1 / 3) * 255,
    hue2rgb(p, q, h) * 255,
    hue2rgb(p, q, h - 1 / 3) * 255,
  ];
}

/** A darker, more saturated shade of `hex` — used for hover/active states and
 * anywhere white text needs to sit on top of the color. Drops lightness by a
 * fixed amount (not a fixed ratio), which holds up across whatever color an
 * owner picks, unlike channel-scaling tuned for one specific hue. */
function darken(hex: string, amount = 0.14): string {
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  const darkerL = Math.max(0.14, l - amount);
  return rgbToHex(...hslToRgb(h, Math.min(1, s * 1.05), darkerL));
}

function relativeLuminance(hex: string): number {
  const toLinear = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two colors (1–21). */
function contrastRatio(a: string, b: string): number {
  const [l1, l2] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

const MIN_AA_CONTRAST = 4.5;

/** Flags a picked color whose derived "-dark" shade still can't clear AA contrast
 * for white text/icons — happens with very light or very low-saturation picks,
 * where darkening by a fixed amount isn't enough. Doesn't block saving; it's a
 * heads-up, since the owner may still want the color for non-text uses. */
export function checkThemeContrast(theme: ThemeColors): string[] {
  const t = deriveThemeTokens(theme);
  const warnings: string[] = [];
  if (contrastRatio("#ffffff", t.primaryDark) < MIN_AA_CONTRAST) {
    warnings.push("Primary is too light — white text/buttons may be hard to read on it.");
  }
  if (contrastRatio("#ffffff", t.accentDark) < MIN_AA_CONTRAST) {
    warnings.push("Accent is too light — white text/buttons may be hard to read on it.");
  }
  return warnings;
}

export interface ThemeTokens {
  primary: string;
  primaryDark: string;
  accent: string;
  accentDark: string;
}

/** Everything the CSS layer needs, computed from just the two owner-picked colors. */
export function deriveThemeTokens(theme: ThemeColors): ThemeTokens {
  return {
    primary: theme.primary,
    primaryDark: darken(theme.primary),
    accent: theme.accent,
    accentDark: darken(theme.accent),
  };
}

/** The inline `<style>` body that overrides globals.css's default `:root` values —
 * rendered server-side so the very first paint already has the owner's colors,
 * instead of flashing the defaults and swapping once a client fetch resolves. */
export function themeStyleTag(theme: ThemeColors): string {
  const t = deriveThemeTokens(theme);
  return `:root{--primary:${t.primary};--primary-dark:${t.primaryDark};--accent:${t.accent};--accent-dark:${t.accentDark};}`;
}

/** Client-only: pushes a theme straight onto the live document, so a save in the
 * admin panel takes effect immediately everywhere without a full page reload. */
export function applyThemeToDocument(theme: ThemeColors): void {
  if (typeof document === "undefined") return;
  const t = deriveThemeTokens(theme);
  const root = document.documentElement.style;
  root.setProperty("--primary", t.primary);
  root.setProperty("--primary-dark", t.primaryDark);
  root.setProperty("--accent", t.accent);
  root.setProperty("--accent-dark", t.accentDark);
}

/** Server-only: fetches the live theme for the root layout's inline style tag.
 * Deliberately swallows any failure (backend down, cold start, bad data) and
 * falls back to DEFAULT_THEME — a missing theme should never take the whole
 * site down. Revalidates periodically rather than on every request, since
 * colors change rarely and this runs on every single page load. */
export async function getServerTheme(): Promise<ThemeColors> {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
  if (!base) return DEFAULT_THEME;
  try {
    const res = await fetch(`${base}/api/content/theme`, { next: { revalidate: 60 } });
    if (!res.ok) return DEFAULT_THEME;
    const data = (await res.json()) as Partial<ThemeColors>;
    if (!data.primary || !data.accent) return DEFAULT_THEME;
    return { primary: data.primary, accent: data.accent };
  } catch {
    return DEFAULT_THEME;
  }
}
