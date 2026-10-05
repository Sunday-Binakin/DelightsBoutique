"use client";

import { useState, type ReactNode } from "react";
import { useReports } from "@/lib/use-reports";
import { useCategories } from "@/lib/use-categories";
import {
  FULFILLMENT_LABELS,
  PAYMENT_METHOD_LABELS,
  type FulfillmentMethod,
  type OrderStatus,
  type PaymentMethod,
} from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { StatCard } from "@/components/admin/StatCard";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";
import { LoadingBlock } from "@/components/ui/Spinner";
import { QueryError } from "@/components/ui/QueryError";

const inputClasses =
  "w-full rounded-lg border border-input-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";
const labelClasses = "flex flex-col gap-1.5 text-xs font-medium text-muted-foreground";

interface ReportFilters {
  from: string;
  to: string;
  fulfillment: FulfillmentMethod | "all";
  paymentMethod: PaymentMethod | "all";
  categorySlug: string;
}

const DEFAULT_FILTERS: ReportFilters = {
  from: "",
  to: "",
  fulfillment: "all",
  paymentMethod: "all",
  categorySlug: "all",
};

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
  rows: Array<{ key: string; count: number; revenue: number }>;
  labelFor: (key: string) => ReactNode;
}) {
  const maxRevenue = Math.max(...rows.map((r) => r.revenue), 1);

  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No orders match these filters.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => (
        <div key={row.key}>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-foreground">{labelFor(row.key)}</span>
            <span className="text-right text-muted-foreground">
              {formatPrice(row.revenue)} · {row.count} order{row.count === 1 ? "" : "s"}
            </span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${(row.revenue / maxRevenue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminReportsPage() {
  const [filters, setFilters] = useState<ReportFilters>(DEFAULT_FILTERS);
  const categories = useCategories();

  function update<K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  const { data: reports, isLoading, isError, refetch } = useReports({
    from: filters.from || undefined,
    to: filters.to || undefined,
    fulfillment: filters.fulfillment === "all" ? undefined : filters.fulfillment,
    paymentMethod: filters.paymentMethod === "all" ? undefined : filters.paymentMethod,
    categorySlug: filters.categorySlug === "all" ? undefined : filters.categorySlug,
  });

  const hasFilters =
    filters.from !== "" ||
    filters.to !== "" ||
    filters.fulfillment !== "all" ||
    filters.paymentMethod !== "all" ||
    filters.categorySlug !== "all";

  const pendingCount =
    reports?.statusBreakdown.find((row) => row.status === "pendingConfirmation")?.count ?? 0;
  const confirmedOrderCount = reports
    ? Math.max(reports.summary.totalOrders - reports.summary.cancelledOrders - pendingCount, 0)
    : 0;
  const averageConfirmedOrderValue =
    reports && confirmedOrderCount > 0 ? reports.summary.confirmedRevenue / confirmedOrderCount : 0;

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
              onClick={() => setFilters(DEFAULT_FILTERS)}
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
              <option value="delivery">{FULFILLMENT_LABELS.delivery}</option>
              <option value="pickup">{FULFILLMENT_LABELS.pickup}</option>
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
              <option value="bankTransfer">{PAYMENT_METHOD_LABELS.bankTransfer}</option>
              <option value="mobileMoney">{PAYMENT_METHOD_LABELS.mobileMoney}</option>
              <option value="cashOnDeliveryOrPickup">{PAYMENT_METHOD_LABELS.cashOnDeliveryOrPickup}</option>
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

      {isLoading ? (
        <LoadingBlock />
      ) : isError ? (
        <QueryError label="reports" onRetry={refetch} />
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Confirmed Revenue" value={formatPrice(reports?.summary.confirmedRevenue ?? 0)} />
            <StatCard label="Pending Amount" value={formatPrice(reports?.summary.pendingAmount ?? 0)} />
            <StatCard label="Avg. Confirmed Order Value" value={formatPrice(averageConfirmedOrderValue)} />
            <StatCard label="Total Orders" value={reports?.summary.totalOrders ?? 0} />
            <StatCard
              label="Cancelled Orders"
              value={reports?.summary.cancelledOrders ?? 0}
              tone={(reports?.summary.cancelledOrders ?? 0) > 0 ? "warning" : "default"}
            />
            <StatCard label="Cancelled Amount" value={formatPrice(reports?.summary.cancelledAmount ?? 0)} />
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="font-serif text-lg font-semibold text-foreground">Top Products</h2>
              {!reports || reports.topProducts.length === 0 ? (
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
                      {reports.topProducts.map((p) => (
                        <tr key={p.slug} className="border-b border-border-subtle last:border-0">
                          <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {p.category ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{p.unitsSold}</td>
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
                    rows={(reports?.statusBreakdown ?? []).map((r) => ({
                      key: r.status,
                      count: r.count,
                      revenue: r.revenue,
                    }))}
                    labelFor={(key) => <OrderStatusBadge status={key as OrderStatus} />}
                  />
                </div>
              </div>

              <div>
                <h2 className="font-serif text-lg font-semibold text-foreground">Payment Method</h2>
                <div className="mt-3 rounded-xl border border-border-subtle p-4">
                  <BreakdownBar
                    rows={(reports?.paymentBreakdown ?? []).map((r) => ({
                      key: r.paymentMethod,
                      count: r.count,
                      revenue: r.revenue,
                    }))}
                    labelFor={(key) => PAYMENT_METHOD_LABELS[key as PaymentMethod]}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="font-serif text-lg font-semibold text-foreground">Revenue by Day</h2>
            <div className="mt-3 rounded-xl border border-border-subtle p-4">
              <BreakdownBar
                rows={(reports?.dailySeries ?? []).map((d) => ({
                  key: d.date,
                  count: d.orderCount,
                  revenue: d.revenue,
                }))}
                labelFor={(key) => key}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
