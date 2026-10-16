"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getOrderById, toOrder } from "@/lib/api/orders";
import { isNotFoundError, shouldRetryQuery } from "@/lib/api/client";
import { PAYMENT_METHOD_LABELS } from "@/lib/orders";
import { useSiteSettings } from "@/lib/use-site-settings";
import { buildWhatsAppLink } from "@/lib/site-settings";
import { OrderItemsSummary } from "@/components/cart/OrderItemsSummary";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";
import { LinkButton } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { LoadingBlock } from "@/components/ui/Spinner";
import { QueryError } from "@/components/ui/QueryError";

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const settings = useSiteSettings();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderById(id),
    retry: shouldRetryQuery,
  });
  const order = data ? toOrder(data) : undefined;
  const notFound = isNotFoundError(error);

  if (isLoading) return <LoadingBlock />;
  if (isError && !notFound) return <QueryError label="this order" onRetry={refetch} />;

  if (!order) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="font-serif text-2xl font-semibold text-foreground">Order not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn&apos;t find an order with that id.
        </p>
        <LinkButton href="/" className="mt-6">
          Back to Home
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary">
          ✓
        </span>
        <h1 className="mt-4 font-serif text-2xl font-semibold text-foreground">
          Thank you, {order.customerName.split(" ")[0]}!
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your order has been received and is <strong>Pending Confirmation</strong>. We&apos;ll
          reach out on WhatsApp or by phone to confirm payment and{" "}
          {order.fulfillment === "delivery" ? "delivery" : "pickup"} details.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-border-subtle p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-serif text-lg font-semibold text-foreground">
            Order {order.id}
          </h2>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="mt-4">
          <OrderItemsSummary items={order.items} />
        </div>

        <dl className="mt-5 space-y-1.5 border-t border-border-subtle pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">
              {order.fulfillment === "delivery" ? "Delivery Address" : "Fulfillment"}
            </dt>
            <dd className="text-right text-foreground">
              {order.fulfillment === "delivery" ? order.address : "Pickup in store"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Payment Method</dt>
            <dd className="text-foreground">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Phone</dt>
            <dd className="text-foreground">{order.phone}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a
          href={buildWhatsAppLink(
            settings.whatsappNumber,
            `Hello, I just placed order ${order.id} on the website.`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          <WhatsAppIcon className="h-4 w-4" />
          Message Us About This Order
        </a>
        <LinkButton href="/" variant="outline" className="flex-1">
          Continue Shopping
        </LinkButton>
      </div>
    </div>
  );
}
