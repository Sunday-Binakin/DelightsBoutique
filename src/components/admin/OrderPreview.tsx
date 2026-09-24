"use client";

import { useState } from "react";
import { getStatusOptions, updateOrder, type Order, type OrderStatus } from "@/lib/orders";
import { logAction } from "@/lib/audit-log";
import { OrderItemsSummary } from "@/components/cart/OrderItemsSummary";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";
import { Button } from "@/components/ui/Button";

const selectClasses =
  "w-full rounded-lg border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-primary";

interface OrderPreviewProps {
  order: Order | null;
  onUpdate: () => void;
}

export function OrderPreview({ order, onUpdate }: OrderPreviewProps) {
  const [internalNotes, setInternalNotes] = useState(order?.internalNotes ?? "");
  const [notesSaved, setNotesSaved] = useState(true);

  if (!order) {
    return (
      <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border-subtle p-6 text-center">
        <p className="text-sm text-muted-foreground">Select an order to view it here.</p>
      </div>
    );
  }

  const orderId = order.id;

  function handleStatusChange(status: OrderStatus) {
    updateOrder(orderId, { status });
    logAction(`Changed order ${orderId} status to "${status}"`);
    onUpdate();
  }

  function handleSaveNotes() {
    updateOrder(orderId, { internalNotes });
    logAction(`Added internal note to order ${orderId}`);
    setNotesSaved(true);
    onUpdate();
  }

  return (
    <div className="rounded-xl border border-border-subtle p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-serif text-lg font-semibold text-foreground">{order.id}</h3>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {new Date(order.createdAt).toLocaleString()}
      </p>

      <div className="mt-4">
        <OrderItemsSummary items={order.items} />
      </div>

      <dl className="mt-4 space-y-1.5 border-t border-border-subtle pt-4 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Customer</dt>
          <dd className="text-right text-foreground">{order.customerName}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Phone</dt>
          <dd>
            <a href={`tel:${order.phone.replace(/\s/g, "")}`} className="text-primary hover:underline">
              {order.phone}
            </a>
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">
            {order.fulfillment === "Delivery" ? "Delivery Address" : "Fulfillment"}
          </dt>
          <dd className="text-right text-foreground">
            {order.fulfillment === "Delivery" ? order.address : "Pickup in store"}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Payment</dt>
          <dd className="text-foreground">{order.paymentMethod}</dd>
        </div>
      </dl>

      {order.notes && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Customer Notes
          </p>
          <p className="mt-1 text-sm text-foreground/80">{order.notes}</p>
        </div>
      )}

      <div className="mt-4">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Update Status
        </label>
        <select
          value={order.status}
          onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
          className={`mt-1.5 ${selectClasses}`}
        >
          {getStatusOptions(order.fulfillment).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Internal Notes
        </label>
        <textarea
          rows={3}
          value={internalNotes}
          onChange={(e) => {
            setInternalNotes(e.target.value);
            setNotesSaved(false);
          }}
          placeholder="Not visible to the customer"
          className={`mt-1.5 ${selectClasses}`}
        />
        <Button
          type="button"
          variant="outline"
          className="mt-2 w-full"
          disabled={notesSaved}
          onClick={handleSaveNotes}
        >
          {notesSaved ? "Saved" : "Save Notes"}
        </Button>
      </div>
    </div>
  );
}
