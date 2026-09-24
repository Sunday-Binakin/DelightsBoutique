"use client";

import { useEffect, useState } from "react";
import { getAllOrders, ORDER_STATUSES, type Order } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";
import { OrderPreview } from "@/components/admin/OrderPreview";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { BagIcon } from "@/components/ui/icons";

const ALL = "all";

function OrdersTable({
  orders,
  selectedId,
  onSelect,
}: {
  orders: Order[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (orders.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border-subtle px-4 py-6 text-center text-sm text-muted-foreground">
        No orders here yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border-subtle">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border-subtle bg-muted text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Items</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              onClick={() => onSelect(order.id)}
              className={`cursor-pointer border-b border-border-subtle last:border-0 hover:bg-muted/60 ${
                selectedId === order.id ? "bg-muted" : ""
              }`}
            >
              <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{order.id}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <p className="text-foreground">{order.customerName}</p>
                <a
                  href={`tel:${order.phone.replace(/\s/g, "")}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  {order.phone}
                </a>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {order.items.reduce((sum, item) => sum + item.quantity, 0)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{formatPrice(order.subtotal)}</td>
              <td className="px-4 py-3">
                <OrderStatusBadge status={order.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(() => [...getAllOrders()].reverse());
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>(ALL);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    // Arriving from a notification click — jump straight to that order.
    const highlight = new URLSearchParams(window.location.search).get("highlight");
    if (highlight) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time deep-link on mount
      setSelectedId(highlight);
    }
  }, []);

  function refresh() {
    setOrders([...getAllOrders()].reverse());
  }

  function selectStatus(status: string) {
    setSelectedStatus(status);
    setSelectedId(null);
  }

  const query = search.trim().toLowerCase();
  const inSelectedStatus =
    selectedStatus === ALL ? orders : orders.filter((o) => o.status === selectedStatus);
  const visible = query
    ? inSelectedStatus.filter(
        (o) => o.id.toLowerCase().includes(query) || o.customerName.toLowerCase().includes(query),
      )
    : inSelectedStatus;

  const selectedOrder = visible.find((o) => o.id === selectedId) ?? null;

  return (
    <div>
      <Breadcrumb items={[{ label: "Home", href: "/admin/dashboard" }, { label: "Orders" }]} />

      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">{orders.length} orders received.</p>
      </div>

      {orders.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-border-subtle py-20 text-center">
          <BagIcon className="h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            No orders yet — they&apos;ll appear here as soon as a customer checks out.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[200px_1fr_340px]">
          <aside className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => selectStatus(ALL)}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                selectedStatus === ALL ? "bg-primary text-white" : "text-foreground/80 hover:bg-muted"
              }`}
            >
              All Orders
              <span className={selectedStatus === ALL ? "text-white/80" : "text-muted-foreground"}>
                {orders.length}
              </span>
            </button>
            {ORDER_STATUSES.map((status) => {
              const count = orders.filter((o) => o.status === status).length;
              const active = selectedStatus === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => selectStatus(status)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                    active ? "bg-primary text-white" : "text-foreground/80 hover:bg-muted"
                  }`}
                >
                  <span>{status}</span>
                  <span className={active ? "text-white/80" : "text-muted-foreground"}>{count}</span>
                </button>
              );
            })}
          </aside>

          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-serif text-lg font-semibold text-foreground">
                {selectedStatus === ALL ? "All Orders" : selectedStatus}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {visible.length}
                </span>
              </h2>
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedId(null);
                }}
                placeholder="Search by order # or customer..."
                className="w-full max-w-xs rounded-lg border border-border-subtle bg-background px-3.5 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="mt-3">
              <OrdersTable orders={visible} selectedId={selectedId} onSelect={setSelectedId} />
            </div>
          </div>

          <OrderPreview key={selectedOrder?.id ?? "empty"} order={selectedOrder} onUpdate={refresh} />
        </div>
      )}
    </div>
  );
}
