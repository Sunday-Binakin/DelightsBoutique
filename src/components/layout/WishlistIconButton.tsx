"use client";

import Link from "next/link";
import { useWishlist } from "@/lib/wishlist-context";
import { BRAND_GRADIENT } from "@/lib/tone";
import { HeartIcon } from "@/components/ui/icons";

export function WishlistIconButton() {
  const { slugs } = useWishlist();

  return (
    <Link
      href="/wishlist"
      aria-label="Wishlist"
      className="relative flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/5"
    >
      <HeartIcon className="h-5 w-5" />
      {slugs.length > 0 && (
        <span
          className={`${BRAND_GRADIENT} absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white`}
        >
          {slugs.length}
        </span>
      )}
    </Link>
  );
}
