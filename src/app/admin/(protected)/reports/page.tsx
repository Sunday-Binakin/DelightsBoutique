"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  DEFAULT_REPORT_FILTERS,
  filterOrders,
  getPaymentMethodBreakdown,
  getReportCategories,
  getReportOrders,
  getSalesSummary,
  getStatusBreakdown,
  getTopProducts,
  type ReportFilters,
} from "@/lib/reports";
import type { FulfillmentMethod, OrderStatus, PaymentMethod } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { StatCard } from "@/components/admin/StatCard";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";

const inputClasses =
  "w-full rounded-lg border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-primary";
const labelClasses = "flex flex-col gap-1.5 text-xs font-medium text-muted-foreground";

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const PRESETS: Array<{ label: string; apply: () => { from: string; to: string } }> = [
  {
    label: "Today",
    apply: () => {
      const today = toISODate(new Date());
      return { from: today, to: today };
    },
  },
  {
    label: "Last 7 Days",
    apply: () => {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 6);
      return { from: toISODate(from), to: toISODate(to) };
    },
  },
  {
    label: "This Month",
    apply: () => {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: toISODate(from), to: toISODate(now) };
    },
  },
  { label: "All Time", apply: () => ({ from: "", to: "" }) },
];

function BreakdownBar({
  rows,
  labelFor,
}: {
  rows: Array<{ key: string; count: number; amount: number }>;
  labelFor: (key: string) => ReactNode;
}) {
  const maxAmount = Math.max(...rows.map((r) => r.amount), 1);

  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No orders match these filters.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => (
        <div key={row.key}>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">{labelFor(row.key)}</span>
            <span className="text-muted-foreground">
              {row.count} order{row.count === 1 ? "" : "s"} · {formatPrice(row.amount)}
            </span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${(row.amount / maxAmount) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminReportsPage() {
  const [filters, setFilters] = useState<ReportFilters>(DEFAULT_REPORT_FILTERS);
  const [allOrders] = useState(() => getReportOrders());
  const [categories] = useState(() => getReportCategories());

  function update<K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  const filtered = useMemo(() => filterOrders(allOrders, filters), [allOrders, filters]);
  const summary = useMemo(() => getSalesSummary(filtered), [filtered]);
  const topProducts = useMemo(() => getTopProducts(filtered), [filtered]);
  const statusBreakdown = useMemo(() => getStatusBreakdown(filtered), [filtered]);
  const paymentBreakdown = useMemo(() => getPaymentMethodBreakdown(filtered), [filtered]);

  const maxDayRevenue = Math.max(...summary.byDay.map((d) => d.revenue), 1);
  const hasFilters =
    filters.from !== "" ||
    filters.to !== "" ||
    filters.fulfillment !== "all" ||
    filters.paymentMethod !== "all" ||
    filters.categorySlug !== "all";

  return (
    <div>
      <Breadcrumb items={[{ label: "Home", href: "/admin/dashboard" }, { label: "Reports" }]} />

      <h1 className="font-serif text-2xl font-semibold text-foreground">Reports</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Sales are based on order value, not a payment gateway — payment happens off-app, so
        &ldquo;Confirmed&rdquo; means you&apos;ve verified it, not just that it was requested.
      </p>

      <div className="mt-6 rounded-xl border border-border-subtle p-4">
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, ...preset.apply() }))}
              className="rounded-full border border-border-subtle px-3 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-primary hover:text-primary"
            >
              {preset.label}
            </button>
          ))}
          {hasFilters && (
            <button
              type="button"
              onClick={() => setFilters(DEFAULT_REPORT_FILTERS)}
              className="rounded-full px-3 py-1 text-xs font-medium text-red-500 hover:underline"
            >
              Reset filters
            </button>
          )}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className={labelClasses}>
            From
            <input
              type="date"
              value={filters.from}
              onChange={(e) => update("from", e.target.value)}
              className={inputClasses}
            />
          </label>
          <label className={labelClasses}>
            To
            <input
              type="date"
              value={filters.to}
              onChange={(e) => update("to", e.target.value)}
              className={inputClasses}
            />
          </label>
          <label className={labelClasses}>
            Fulfillment
            <select
              value={filters.fulfillment}
              onChange={(e) => update("fulfillment", e.target.value as FulfillmentMethod | "all")}
              className={inputClasses}
            >
              <option value="all">All</option>
              <option value="Delivery">Delivery</option>
              <option value="Pickup">Pickup</option>
            </select>
          </label>
          <label className={labelClasses}>
            Payment Method
            <select
              value={filters.paymentMethod}
              onChange={(e) => update("paymentMethod", e.target.value as PaymentMethod | "all")}
              className={inputClasses}
            >
              <option value="all">All</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Cash on Delivery/Pickup">Cash on Delivery/Pickup</option>
            </select>
          </label>
          <label className={labelClasses}>
            Category
            <select
              value={filters.categorySlug}
              onChange={(e) => update("categorySlug", e.target.value)}
              className={inputClasses}
            >
              <option value="all">All</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Confirmed Revenue" value={formatPrice(summary.confirmedRevenue)} />
        <StatCard
          label="Pending Revenue"
          value={formatPrice(summary.pendingRevenue)}
          tone={summary.pendingRevenue > 0 ? "warning" : "default"}
        />
        <StatCard label="Orders" value={summary.orderCount} />
        <StatCard label="Average Order Value" value={formatPrice(summary.averageOrderValue)} />
      </div>
      {summary.cancelledCount > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          Excludes {summary.cancelledCount} cancelled order{summary.cancelledCount === 1 ? "" : "s"}{" "}
          ({formatPrice(summary.cancelledAmount)}).
        </p>
      )}

      <div className="mt-8">
        <h2 className="font-serif text-lg font-semibold text-foreground">Revenue by Day</h2>
        {summary.byDay.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No orders match these filters.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2 rounded-xl border border-border-subtle p-4">
            {summary.byDay.map((day) => (
              <div key={day.date} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs text-muted-foreground">
                  {new Date(`${day.date}T00:00:00`).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(day.revenue / maxDayRevenue) * 100}%` }}
                  />
                </div>
                <span className="w-28 shrink-0 text-right text-xs text-muted-foreground">
                  {formatPrice(day.revenue)} · {day.orders} order{day.orders === 1 ? "" : "s"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-serif text-lg font-semibold text-foreground">Top Products</h2>
          {topProducts.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No orders match these filters.</p>
          ) : (
            <div className="mt-3 overflow-x-auto rounded-xl border border-border-subtle">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border-subtle bg-muted text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p) => (
                    <tr key={p.slug} className="border-b border-border-subtle last:border-0">
                      <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.categoryName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.quantity}</td>
                      <td className="px-4 py-3">{formatPrice(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-8">
          <div>
            <h2 className="font-serif text-lg font-semibold text-foreground">Order Status</h2>
            <div className="mt-3 rounded-xl border border-border-subtle p-4">
              <BreakdownBar
                rows={statusBreakdown}
                labelFor={(key) => <OrderStatusBadge status={key as OrderStatus} />}
              />
            </div>
          </div>

          <div>
            <h2 className="font-serif text-lg font-semibold text-foreground">Payment Method</h2>
            <div className="mt-3 rounded-xl border border-border-subtle p-4">
              <BreakdownBar rows={paymentBreakdown} labelFor={(key) => key} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
