"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useProductsBySlug } from "@/lib/use-products";
import { checkout } from "@/lib/api/orders";
import { ApiError, describeApiError } from "@/lib/api/client";
import { FULFILLMENT_LABELS, PAYMENT_METHOD_LABELS, type FulfillmentMethod, type PaymentMethod } from "@/lib/orders";
import { useSiteSettings } from "@/lib/use-site-settings";
import { useStorefrontCopy } from "@/lib/use-storefront-copy";
import { OrderItemsSummary } from "@/components/cart/OrderItemsSummary";
import { Button } from "@/components/ui/Button";
import { LoadingBlock } from "@/components/ui/Spinner";
import { QueryError } from "@/components/ui/QueryError";

const PAYMENT_METHODS: PaymentMethod[] = ["bankTransfer", "mobileMoney", "cashOnDeliveryOrPickup"];
const FULFILLMENT_METHODS: FulfillmentMethod[] = ["delivery", "pickup"];

const inputClasses =
  "w-full rounded-lg border border-input-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary disabled:opacity-50";

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, clear } = useCart();
  const settings = useSiteSettings();
  const copy = useStorefrontCopy();
  const {
    bySlug: products,
    isLoading: loadingProducts,
    isError: productsErrored,
    refetch: refetchProducts,
  } = useProductsBySlug(lines.map((line) => line.slug));

  // One key per visit to this form, reused across retries of the same submit
  // so a flaky connection can't create duplicate orders.
  const idempotencyKey = useRef(crypto.randomUUID());

  const paymentInstructions: Record<PaymentMethod, string> = {
    bankTransfer: settings.bankTransferInstructions,
    mobileMoney: settings.mobileMoneyInstructions,
    cashOnDeliveryOrPickup: settings.cashInstructions,
  };
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fulfillment, setFulfillment] = useState<FulfillmentMethod>("delivery");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bankTransfer");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const previewItems = lines
    .map((line) => {
      const product = products.get(line.slug);
      if (!product) return null;
      return { name: product.name, quantity: line.quantity, unitPrice: product.retailPrice, size: line.size, color: line.color };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const order = await checkout(
        {
          items: lines.map((line) => ({
            slug: line.slug,
            quantity: line.quantity,
            size: line.size ?? null,
            color: line.color ?? null,
          })),
          customerName: name,
          phone,
          fulfillment,
          address: fulfillment === "delivery" ? address : null,
          paymentMethod,
          notes: notes || null,
        },
        idempotencyKey.current,
      );

      clear();
      router.push(`/order-confirmation/${order.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.code === "VALIDATION_ERROR" && err.fields) {
        setError(Object.values(err.fields)[0] ?? err.message);
      } else {
        setError(describeApiError(err, "Something went wrong placing your order. Please try again."));
      }
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-serif text-2xl font-semibold text-foreground">Checkout</h1>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-10 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
              Full Name
              <input
                required
                disabled={submitting}
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
                disabled={submitting}
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
              {FULFILLMENT_METHODS.map((option) => (
                <button
                  key={option}
                  type="button"
                  disabled={submitting}
                  onClick={() => setFulfillment(option)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                    fulfillment === option
                      ? "border-primary bg-primary text-white"
                      : "border-border-subtle text-foreground/80 hover:border-primary"
                  }`}
                >
                  {FULFILLMENT_LABELS[option]}
                </button>
              ))}
            </div>
          </fieldset>

          {fulfillment === "delivery" ? (
            <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
              Delivery Address
              <textarea
                required
                disabled={submitting}
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
                  disabled={submitting}
                  onClick={() => setPaymentMethod(option)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                    paymentMethod === option
                      ? "border-primary bg-primary text-white"
                      : "border-border-subtle text-foreground/80 hover:border-primary"
                  }`}
                >
                  {PAYMENT_METHOD_LABELS[option]}
                </button>
              ))}
            </div>
            <p className="mt-3 rounded-lg bg-muted px-3.5 py-2.5 text-sm text-muted-foreground">
              {paymentInstructions[paymentMethod]}
            </p>
          </fieldset>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
            Notes (optional)
            <textarea
              disabled={submitting}
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
            {loadingProducts ? (
              <LoadingBlock label="Loading your order…" />
            ) : productsErrored ? (
              <QueryError label="your order summary" onRetry={refetchProducts} />
            ) : (
              <OrderItemsSummary items={previewItems} />
            )}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{copy.checkoutDisclaimer}</p>
          <Button type="submit" className="mt-5 w-full" disabled={submitting}>
            {submitting ? "Placing Order…" : "Place Order"}
          </Button>
        </div>
      </form>
    </div>
  );
}
