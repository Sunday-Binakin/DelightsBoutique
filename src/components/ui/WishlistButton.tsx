"use client";

import { useWishlist } from "@/lib/wishlist-context";
import { useToast } from "@/components/ui/ToastProvider";
import { HeartIcon } from "@/components/ui/icons";

export function WishlistButton({ slug, productName }: { slug: string; productName: string }) {
  const { isSaved, toggle } = useWishlist();
  const toast = useToast();
  const saved = isSaved(slug);

  return (
    <button
      type="button"
      aria-label={saved ? `Remove ${productName} from wishlist` : `Save ${productName} to wishlist`}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
        if (saved) {
          toast.info(`Removed ${productName} from your wishlist.`);
        } else {
          toast.success(`Added ${productName} to your wishlist.`);
        }
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
