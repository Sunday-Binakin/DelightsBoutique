"use client";

import type { CustomerSummary } from "@/lib/customers";
import { useCustomerOrders, useUpdateCustomerWholesale } from "@/lib/use-admin-customers";
import { ApiError } from "@/lib/api/client";
import { formatPrice } from "@/lib/format";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/ToastProvider";

interface CustomerPreviewProps {
  customer: CustomerSummary | null;
}

export function CustomerPreview({ customer }: CustomerPreviewProps) {
  const updateWholesale = useUpdateCustomerWholesale();
  const toast = useToast();
  const { orders, isLoading: loadingOrders, isError: ordersErrored } = useCustomerOrders(customer?.phone);

  if (!customer) {
    return (
      <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border-subtle p-6 text-center">
        <p className="text-sm text-muted-foreground">Select a customer to view them here.</p>
      </div>
    );
  }

  const customerPhone = customer.phone;

  async function handleWholesaleToggle(checked: boolean) {
    try {
      await updateWholesale.mutateAsync({ phone: customerPhone, wholesale: checked });
      toast.success(checked ? "Flagged as wholesale." : "Unflagged as wholesale.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't save — try again.");
    }
  }

  return (
    <div className="rounded-xl border border-border-subtle p-5">
      <h3 className="font-serif text-lg font-semibold text-foreground">{customer.name}</h3>
      <a
        href={`tel:${customer.phone}`}
        className="text-sm text-primary hover:underline"
      >
        {customer.phone}
      </a>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-muted px-3 py-2">
          <p className="text-xs text-muted-foreground">Orders</p>
          <p className="font-semibold text-foreground">{customer.orderCount}</p>
        </div>
        <div className="rounded-lg bg-muted px-3 py-2">
          <p className="text-xs text-muted-foreground">Total Spent</p>
          <p className="font-semibold text-foreground">{formatPrice(customer.totalSpent)}</p>
        </div>
      </div>

      <label className="mt-4 flex items-center justify-between rounded-lg border border-border-subtle px-3 py-2.5 text-sm">
        <span className="font-medium text-foreground">Wholesale Customer</span>
        <input
          type="checkbox"
          checked={customer.wholesale}
          disabled={updateWholesale.isPending}
          onChange={(e) => handleWholesaleToggle(e.target.checked)}
          className="h-4 w-4 accent-primary"
        />
      </label>
      <p className="mt-1.5 text-xs text-muted-foreground">
        Orders of qualifying quantity price automatically at the wholesale rate once flagged.
      </p>

      <div className="mt-5 border-t border-border-subtle pt-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Order History
        </p>
        <div className="mt-2 flex flex-col gap-2">
          {loadingOrders ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : ordersErrored ? (
            <p className="py-2 text-center text-xs text-red-600">Couldn&apos;t load order history.</p>
          ) : orders.length === 0 ? (
            <p className="py-2 text-center text-xs text-muted-foreground">No orders yet.</p>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border-subtle px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-foreground">{order.id}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()} · {formatPrice(order.subtotal)}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
