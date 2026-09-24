"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { getProductBySlug } from "@/lib/product-store";
import { createOrder, type FulfillmentMethod, type PaymentMethod } from "@/lib/orders";
import { OrderItemsSummary } from "@/components/cart/OrderItemsSummary";
import { Button } from "@/components/ui/Button";

const PAYMENT_METHODS: PaymentMethod[] = ["Bank Transfer", "Mobile Money", "Cash on Delivery/Pickup"];

const PAYMENT_INSTRUCTIONS: Record<PaymentMethod, string> = {
  "Bank Transfer": "Transfer to Delight's Boutique — GCB Bank, Acct 001-234-5678. Send your proof of payment via WhatsApp after ordering.",
  "Mobile Money": "Send to MoMo number 024-000-0000 (Delight's Boutique). Send your proof of payment via WhatsApp after ordering.",
  "Cash on Delivery/Pickup": "Pay in cash when your order is delivered or picked up.",
};

const inputClasses =
  "w-full rounded-lg border border-border-subtle bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary";

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, clear } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fulfillment, setFulfillment] = useState<FulfillmentMethod>("Delivery");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Bank Transfer");
  const [notes, setNotes] = useState("");

  const items = lines
    .map((line) => {
      const product = getProductBySlug(line.slug);
      if (!product) return null;
      return {
        slug: line.slug,
        name: product.name,
        quantity: line.quantity,
        unitPrice: product.retailPrice,
        size: line.size,
        color: line.color,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="font-serif text-2xl font-semibold text-foreground">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add something to your cart before checking out.
        </p>
      </div>
    );
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const order = createOrder({
      items,
      subtotal,
      customerName: name,
      phone,
      fulfillment,
      address: fulfillment === "Delivery" ? address : undefined,
      paymentMethod,
      notes: notes || undefined,
    });

    clear();
    router.push(`/order-confirmation/${order.id}`);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-serif text-2xl font-semibold text-foreground">Checkout</h1>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-10 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
              Full Name
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClasses}
                placeholder="Ama Serwaa"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
              Phone Number
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClasses}
                placeholder="024 000 0000"
              />
            </label>
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-foreground">Delivery or Pickup</legend>
            <div className="mt-2 flex gap-3">
              {(["Delivery", "Pickup"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFulfillment(option)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                    fulfillment === option
                      ? "border-primary bg-primary text-white"
                      : "border-border-subtle text-foreground/80 hover:border-primary"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>

          {fulfillment === "Delivery" ? (
            <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
              Delivery Address
              <textarea
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className={inputClasses}
                placeholder="House number, street, area, city"
              />
            </label>
          ) : (
            <p className="rounded-lg bg-muted px-3.5 py-2.5 text-sm text-muted-foreground">
              We&apos;ll contact you with pickup details after your order is confirmed.
            </p>
          )}

          <fieldset>
            <legend className="text-sm font-medium text-foreground">Payment Method</legend>
            <div className="mt-2 flex flex-wrap gap-3">
              {PAYMENT_METHODS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setPaymentMethod(option)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                    paymentMethod === option
                      ? "border-primary bg-primary text-white"
                      : "border-border-subtle text-foreground/80 hover:border-primary"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <p className="mt-3 rounded-lg bg-muted px-3.5 py-2.5 text-sm text-muted-foreground">
              {PAYMENT_INSTRUCTIONS[paymentMethod]}
            </p>
          </fieldset>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
            Notes (optional)
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className={inputClasses}
              placeholder="Anything else we should know?"
            />
          </label>
        </div>

        <div className="h-fit rounded-2xl border border-border-subtle p-6">
          <h2 className="font-serif text-lg font-semibold text-foreground">Order Summary</h2>
          <div className="mt-4">
            <OrderItemsSummary items={items} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Your order will be marked &quot;Pending Confirmation&quot; — we&apos;ll reach out on
            WhatsApp or by phone to confirm payment and delivery.
          </p>
          <Button type="submit" className="mt-5 w-full">
            Place Order
          </Button>
        </div>
      </form>
    </div>
  );
}
