import type { PlaceholderTone } from "@/lib/types";

// The brand's two colors together, not one or the other — reused wherever a
// single element should read as "Delight's Boutique" at a glance (buttons,
// the announcement bar, the header/footer wordmark). White text/icons stay
// at or above 4.9:1 contrast across the whole gradient (checked against
// every stop from --primary to --accent-dark), so it's always safe to pair
// with white content on top.
export const BRAND_GRADIENT = "bg-gradient-to-r from-primary to-accent-dark";

// Single source of truth mapping a tone to its background gradient and the
// icon color that stays legible on top of it — every card/banner/category
// tile stays visually consistent from one shared definition.
export const TONE_GRADIENTS: Record<PlaceholderTone, string> = {
  rose: "from-primary to-accent-dark",
  cream: "from-muted to-accent/40",
  charcoal: "from-foreground/90 to-foreground",
  gold: "from-accent to-accent-dark",
};

export const TONE_ICON: Record<PlaceholderTone, string> = {
  rose: "text-white",
  cream: "text-foreground/70",
  charcoal: "text-white",
  gold: "text-white",
};
