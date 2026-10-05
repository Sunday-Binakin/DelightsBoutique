"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/components/ui/ToastProvider";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Button, LinkButton } from "@/components/ui/Button";

export function AddToCartForm({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const toast = useToast();
  const [size, setSize] = useState(product.sizes?.[0]);
  const [color, setColor] = useState(product.colors?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const outOfStock = product.stockStatus === "outOfStock";

  function handleAddToCart() {
    addItem({ slug: product.slug, size, color, quantity });
    setJustAdded(true);
    toast.success(`Added ${product.name} to your cart.`);
  }

  return (
    <div className="flex flex-col gap-5">
      {product.sizes && (
        <div>
          <p className="text-sm font-medium text-foreground">Size</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.sizes.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setSize(option);
                  setJustAdded(false);
                }}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  option === size
                    ? "border-primary bg-primary text-white"
                    : "border-border-subtle text-foreground/80 hover:border-primary"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.colors && (
        <div>
          <p className="text-sm font-medium text-foreground">Color</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.colors.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setColor(option);
                  setJustAdded(false);
                }}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  option === color
                    ? "border-primary bg-primary text-white"
                    : "border-border-subtle text-foreground/80 hover:border-primary"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-sm font-medium text-foreground">Quantity</p>
        <div className="mt-2">
          <QuantityStepper quantity={quantity} onChange={setQuantity} />
        </div>
      </div>

      {outOfStock ? (
        <Button disabled className="opacity-50">
          Out of Stock
        </Button>
      ) : justAdded ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => setJustAdded(false)} className="flex-1">
            Added — Add More
          </Button>
          <LinkButton href="/cart" className="flex-1">
            View Cart
          </LinkButton>
          <Button onClick={() => router.push("/checkout")} className="flex-1">
            Checkout
          </Button>
        </div>
      ) : (
        <Button onClick={handleAddToCart}>Add to Cart</Button>
      )}
    </div>
  );
}
