import type { PlaceholderTone } from "@/lib/types";

// Single source of truth mapping a tone to its background gradient and the
// icon color that stays legible on top of it — every card/banner/category
// tile stays visually consistent from one shared definition.
export const TONE_GRADIENTS: Record<PlaceholderTone, string> = {
  rose: "from-primary/90 to-primary-dark",
  cream: "from-muted to-accent/40",
  charcoal: "from-foreground/90 to-foreground",
  gold: "from-accent to-primary-dark/80",
};

export const TONE_ICON: Record<PlaceholderTone, string> = {
  rose: "text-white",
  cream: "text-foreground/70",
  charcoal: "text-white",
  gold: "text-white",
};
