"use client";

import Link from "next/link";
import { FULL_CATALOG_LIMIT, useProductsList } from "@/lib/use-products";
import { useTotalProductCount } from "@/lib/use-admin-catalog";
import { useAdminOrdersList, useTotalOrderCount, useOrderStatusCounts } from "@/lib/use-admin-orders";
import { formatPrice } from "@/lib/format";
import { StatCard } from "@/components/admin/StatCard";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";
import { LoadingBlock } from "@/components/ui/Spinner";
import { QueryError } from "@/components/ui/QueryError";

const RECENT_ORDERS_COUNT = 5;

export default function AdminDashboardPage() {
  // Stock-status counts have no dedicated endpoint, so they're derived from the
  // same generous single-page product fetch used elsewhere in the admin panel.
  const {
    products,
    total: catalogTotal,
    isLoading: loadingProducts,
    isError: productsErrored,
  } = useProductsList({ limit: FULL_CATALOG_LIMIT });
  const { total: totalProducts, isLoading: loadingTotalProducts } = useTotalProductCount();
  const { total: totalOrders, isLoading: loadingTotalOrders, isError: totalOrdersErrored } =
    useTotalOrderCount();
  const {
    orders: recentOrders,
    isLoading: loadingRecentOrders,
    isError: recentOrdersErrored,
    refetch,
  } = useAdminOrdersList({ limit: RECENT_ORDERS_COUNT });
  const pendingOrders = useOrderStatusCounts(["pendingConfirmation"]).get("pendingConfirmation") ?? 0;

  const lowStock = products.filter((p) => p.stockStatus === "lowStock").length;
  const outOfStock = products.filter((p) => p.stockStatus === "outOfStock").length;

  const isLoading = loadingProducts || loadingTotalProducts || loadingTotalOrders || loadingRecentOrders;
  const isError = productsErrored || totalOrdersErrored || recentOrdersErrored;

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-foreground">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        A quick look at your catalog and incoming orders.
      </p>

      {isLoading ? (
        <LoadingBlock />
      ) : isError ? (
        <QueryError label="dashboard data" onRetry={refetch} />
      ) : (
        <>
          {catalogTotal > products.length && (
            <p className="mt-6 text-xs text-amber-700">
              Low and out-of-stock counts cover the first {products.length} of {catalogTotal} products.
            </p>
          )}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Total Products" value={totalProducts} href="/admin/products" />
            <StatCard
              label="Low Stock"
              value={lowStock}
              tone={lowStock > 0 ? "warning" : "default"}
              href="/admin/products"
            />
            <StatCard
              label="Out of Stock"
              value={outOfStock}
              tone={outOfStock > 0 ? "warning" : "default"}
              href="/admin/products"
            />
            <StatCard label="Total Orders" value={totalOrders} href="/admin/orders" />
            <StatCard
              label="Pending Confirmation"
              value={pendingOrders}
              tone={pendingOrders > 0 ? "warning" : "default"}
              href="/admin/orders"
            />
          </div>

          <div className="mt-8">
            <div className="flex items-baseline justify-between">
              <h2 className="font-serif text-lg font-semibold text-foreground">Recent Orders</h2>
              <Link href="/admin/orders" className="text-sm font-medium text-primary hover:underline">
                View all
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-border-subtle px-4 py-6 text-center text-sm text-muted-foreground">
                No orders yet — they&apos;ll appear here as soon as a customer checks out.
              </p>
            ) : (
              <div className="mt-3 overflow-x-auto rounded-xl border border-border-subtle">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border-subtle bg-muted text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-border-subtle last:border-0">
                        <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                          {order.id}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="text-foreground">{order.customerName}</p>
                          <a
                            href={`tel:${order.phone.replace(/\s/g, "")}`}
                            className="text-xs text-muted-foreground hover:text-primary"
                          >
                            {order.phone}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">{formatPrice(order.subtotal)}</td>
                        <td className="px-4 py-3">
                          <OrderStatusBadge status={order.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
