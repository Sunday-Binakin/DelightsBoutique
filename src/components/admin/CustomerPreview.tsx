"use client";

import type { CustomerSummary } from "@/lib/customers";
import { getCustomerOrders, setWholesaleCustomer } from "@/lib/customers";
import { logAction } from "@/lib/audit-log";
import { formatPrice } from "@/lib/format";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";

interface CustomerPreviewProps {
  customer: CustomerSummary | null;
  onUpdate: () => void;
}

export function CustomerPreview({ customer, onUpdate }: CustomerPreviewProps) {
  if (!customer) {
    return (
      <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border-subtle p-6 text-center">
        <p className="text-sm text-muted-foreground">Select a customer to view them here.</p>
      </div>
    );
  }

  const customerPhone = customer.phone;
  const customerName = customer.name;
  const orders = getCustomerOrders(customerPhone);

  function handleWholesaleToggle(checked: boolean) {
    setWholesaleCustomer(customerPhone, checked);
    logAction(`${checked ? "Flagged" : "Unflagged"} "${customerName}" as wholesale`);
    onUpdate();
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
          onChange={(e) => handleWholesaleToggle(e.target.checked)}
          className="h-4 w-4 accent-primary"
        />
      </label>
      <p className="mt-1.5 text-xs text-muted-foreground">
        Unlocks wholesale pricing once customer accounts exist on the storefront.
      </p>

      <div className="mt-5 border-t border-border-subtle pt-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Order History
        </p>
        <div className="mt-2 flex flex-col gap-2">
          {orders.map((order) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}
