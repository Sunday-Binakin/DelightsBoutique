"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getStatusOptions,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  type Order,
  type OrderStatus,
} from "@/lib/orders";
import { useUpdateOrderStatus } from "@/lib/use-admin-orders";
import { ApiError } from "@/lib/api/client";
import { useToast } from "@/components/ui/ToastProvider";
import { OrderItemsSummary } from "@/components/cart/OrderItemsSummary";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";
import { Button } from "@/components/ui/Button";

const selectClasses =
  "w-full rounded-lg border border-input-border bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50";

interface OrderPreviewProps {
  order: Order | null;
}

export function OrderPreview({ order }: OrderPreviewProps) {
  const [internalNotes, setInternalNotes] = useState(order?.internalNotes ?? "");
  const [notesSaved, setNotesSaved] = useState(true);
  const [error, setError] = useState("");
  const updateOrder = useUpdateOrderStatus();
  const queryClient = useQueryClient();
  const toast = useToast();

  // Resync the notes draft whenever the selected order (or its server data after a
  // refetch) changes — e.g. after a 409 pulls in the latest version.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resyncing local draft from an external prop change, not derived render state
    setInternalNotes(order?.internalNotes ?? "");
    setNotesSaved(true);
  }, [order?.id, order?.internalNotes]);

  if (!order) {
    return (
      <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border-subtle p-6 text-center">
        <p className="text-sm text-muted-foreground">Select an order to view it here.</p>
      </div>
    );
  }

  const orderId = order.id;

  async function handleUpdate(body: { status?: OrderStatus; internalNotes?: string }) {
    setError("");
    try {
      await updateOrder.mutateAsync({ id: orderId, body });
      return true;
    } catch (err) {
      if (err instanceof ApiError && err.code === "CONFLICT") {
        setError("This order changed elsewhere since you loaded it — refreshed with the latest version. Please try again.");
        queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
      return false;
    }
  }

  async function handleStatusChange(status: OrderStatus) {
    const ok = await handleUpdate({ status });
    if (ok) toast.success(`Status changed to "${ORDER_STATUS_LABELS[status]}".`);
  }

  async function handleSaveNotes() {
    const ok = await handleUpdate({ internalNotes });
    if (ok) {
      setNotesSaved(true);
      toast.success("Notes saved.");
    }
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

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
      )}

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
            {order.fulfillment === "delivery" ? "Delivery Address" : "Fulfillment"}
          </dt>
          <dd className="text-right text-foreground">
            {order.fulfillment === "delivery" ? order.address : "Pickup in store"}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Payment</dt>
          <dd className="text-foreground">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</dd>
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
          disabled={updateOrder.isPending}
          onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
          className={`mt-1.5 ${selectClasses}`}
        >
          {getStatusOptions(order.fulfillment).map((status) => (
            <option key={status} value={status}>
              {ORDER_STATUS_LABELS[status]}
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
          disabled={updateOrder.isPending}
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
          disabled={notesSaved || updateOrder.isPending}
          onClick={handleSaveNotes}
        >
          {updateOrder.isPending ? "Saving…" : notesSaved ? "Saved" : "Save Notes"}
        </Button>
      </div>
    </div>
  );
}
