"use client";

import { useEffect, useState } from "react";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type Order, type OrderStatus } from "@/lib/orders";
import { ADMIN_ORDERS_PAGE_SIZE, useAdminOrdersList, useOrderStatusCounts, useTotalOrderCount } from "@/lib/use-admin-orders";
import { usePagedState } from "@/lib/use-paged-state";
import { formatPrice } from "@/lib/format";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";
import { OrderPreview } from "@/components/admin/OrderPreview";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { BagIcon } from "@/components/ui/icons";
import { LoadingBlock } from "@/components/ui/Spinner";
import { QueryError } from "@/components/ui/QueryError";
import { Pagination } from "@/components/ui/Pagination";

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
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | typeof ALL>(ALL);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const trimmedSearch = search.trim();
  const [page, setPage] = usePagedState(`${selectedStatus}|${trimmedSearch}`);

  const {
    orders: visible,
    total: listTotal,
    isLoading: loadingOrders,
    isError: ordersErrored,
    refetch: refetchOrders,
  } = useAdminOrdersList({
    status: selectedStatus === ALL ? undefined : selectedStatus,
    search: trimmedSearch || undefined,
    page,
    limit: ADMIN_ORDERS_PAGE_SIZE,
  });
  const statusCounts = useOrderStatusCounts(ORDER_STATUSES);
  const { total: totalCount, isLoading: loadingTotal, isError: totalErrored } = useTotalOrderCount();

  useEffect(() => {
    // Arriving from a notification click — jump straight to that order.
    const highlight = new URLSearchParams(window.location.search).get("highlight");
    if (highlight) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time deep-link on mount
      setSelectedId(highlight);
    }
  }, []);

  function selectStatus(status: OrderStatus | typeof ALL) {
    setSelectedStatus(status);
    setSelectedId(null);
  }

  const selectedOrder = visible.find((o) => o.id === selectedId) ?? null;

  return (
    <div>
      <Breadcrumb items={[{ label: "Home", href: "/admin/dashboard" }, { label: "Orders" }]} />

      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">{totalCount} orders received.</p>
      </div>

      {loadingOrders || loadingTotal ? (
        <LoadingBlock />
      ) : ordersErrored || totalErrored ? (
        <QueryError label="orders" onRetry={refetchOrders} />
      ) : totalCount === 0 ? (
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
                {totalCount}
              </span>
            </button>
            {ORDER_STATUSES.map((status) => {
              const count = statusCounts.get(status) ?? 0;
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
                  <span>{ORDER_STATUS_LABELS[status]}</span>
                  <span className={active ? "text-white/80" : "text-muted-foreground"}>{count}</span>
                </button>
              );
            })}
          </aside>

          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-serif text-lg font-semibold text-foreground">
                {selectedStatus === ALL ? "All Orders" : ORDER_STATUS_LABELS[selectedStatus]}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {listTotal}
                </span>
              </h2>
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedId(null);
                }}
                aria-label="Search orders"
                placeholder="Search by order # or customer..."
                className="w-full max-w-xs rounded-lg border border-input-border bg-background px-3.5 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="mt-3">
              <OrdersTable orders={visible} selectedId={selectedId} onSelect={setSelectedId} />
              <Pagination
                page={page}
                pageSize={ADMIN_ORDERS_PAGE_SIZE}
                total={listTotal}
                onPageChange={setPage}
              />
            </div>
          </div>

          <OrderPreview key={selectedOrder?.id ?? "empty"} order={selectedOrder} />
        </div>
      )}
    </div>
  );
}
