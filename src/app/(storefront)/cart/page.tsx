"use client";

import Link from "next/link";
import { useCart, type CartLine } from "@/lib/cart-context";
import { getProductBySlug } from "@/lib/product-store";
import { formatPrice } from "@/lib/format";
import { ProductVisual } from "@/components/ui/ProductVisual";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { LinkButton } from "@/components/ui/Button";
import { BagIcon } from "@/components/ui/icons";

function CartLineRow({ line }: { line: CartLine }) {
  const { setQuantity, removeLine } = useCart();
  const product = getProductBySlug(line.slug);
  if (!product) return null;

  return (
    <div className="flex gap-4 border-b border-border-subtle py-5 first:pt-0">
      <ProductVisual
        product={product}
        iconClassName="h-1/3 w-1/3"
        className="aspect-4/5 w-24 shrink-0 rounded-lg"
      />

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link href={`/product/${product.slug}`} className="font-medium text-foreground hover:text-primary">
            {product.name}
          </Link>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {[line.size, line.color].filter(Boolean).join(" · ") || product.category}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <QuantityStepper
            quantity={line.quantity}
            onChange={(quantity) => setQuantity(line.slug, quantity, line.size, line.color)}
          />
          <div className="flex items-center gap-3">
            <span className="font-semibold text-foreground">
              {formatPrice(product.retailPrice * line.quantity)}
            </span>
            <button
              type="button"
              onClick={() => removeLine(line.slug, line.size, line.color)}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { lines } = useCart();

  const subtotal = lines.reduce((sum, line) => {
    const product = getProductBySlug(line.slug);
    return product ? sum + product.retailPrice * line.quantity : sum;
  }, 0);

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <BagIcon className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 font-serif text-2xl font-semibold text-foreground">
          Your cart is empty
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Browse the catalog and add something you love.
        </p>
        <LinkButton href="/" className="mt-6">
          Continue Shopping
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-serif text-2xl font-semibold text-foreground">Shopping Cart</h1>

      <div className="mt-6 grid gap-10 lg:grid-cols-[2fr_1fr]">
        <div>
          {lines.map((line) => (
            <CartLineRow key={`${line.slug}-${line.size ?? ""}-${line.color ?? ""}`} line={line} />
          ))}
        </div>

        <div className="h-fit rounded-2xl border border-border-subtle p-6">
          <h2 className="font-serif text-lg font-semibold text-foreground">Order Summary</h2>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Delivery/pickup and final payment are arranged with the admin after you submit your
            order — no payment is taken on this site.
          </p>
          <LinkButton href="/checkout" className="mt-5 w-full">
            Proceed to Checkout
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
