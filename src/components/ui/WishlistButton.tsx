"use client";

import { useState } from "react";
import { HeartIcon } from "@/components/ui/icons";

// Local-only toggle for now — no wishlist persistence until the backend exists.
export function WishlistButton({ productName }: { productName: string }) {
  const [saved, setSaved] = useState(false);

  return (
    <button
      type="button"
      aria-label={saved ? `Remove ${productName} from wishlist` : `Save ${productName} to wishlist`}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setSaved((v) => !v);
      }}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow transition-colors hover:text-primary"
    >
      <HeartIcon
        className="h-4 w-4"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
      />
    </button>
  );
}
