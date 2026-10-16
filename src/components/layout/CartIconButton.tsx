"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { BRAND_GRADIENT } from "@/lib/tone";
import { BagIcon } from "@/components/ui/icons";

export function CartIconButton() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      aria-label="Cart"
      className="relative flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/5"
    >
      <BagIcon />
      {itemCount > 0 && (
        <span
          className={`${BRAND_GRADIENT} absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white`}
        >
          {itemCount}
        </span>
      )}
    </Link>
  );
}
