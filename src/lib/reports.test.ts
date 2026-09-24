import { beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_REPORT_FILTERS,
  filterOrders,
  getPaymentMethodBreakdown,
  getSalesSummary,
  getStatusBreakdown,
  getTopProducts,
  type ReportFilters,
} from "@/lib/reports";
import type { Order } from "@/lib/orders";

beforeEach(() => {
  localStorage.clear();
});

// Midday timestamps throughout — keeps date-range comparisons well clear of
// any day boundary regardless of the test runner's local timezone.
function makeOrder(overrides: Partial<Order>): Order {
  return {
    id: "TEST-ID",
    createdAt: "2026-01-15T12:00:00.000Z",
    status: "Confirmed",
    items: [{ slug: "ada-corporate-dress", name: "Ada Corporate Dress", quantity: 1, unitPrice: 350 }],
    subtotal: 350,
    customerName: "Fixture Customer",
    phone: "024 000 0000",
    fulfillment: "Pickup",
    paymentMethod: "Bank Transfer",
    ...overrides,
  };
}

describe("filterOrders", () => {
  const orders: Order[] = [
    makeOrder({
      id: "A",
      createdAt: "2026-01-05T12:00:00.000Z",
      fulfillment: "Delivery",
      paymentMethod: "Mobile Money",
    }),
    makeOrder({
      id: "B",
      createdAt: "2026-01-20T12:00:00.000Z",
      fulfillment: "Pickup",
      paymentMethod: "Bank Transfer",
    }),
    makeOrder({
      id: "C",
      createdAt: "2026-02-10T12:00:00.000Z",
      fulfillment: "Pickup",
      paymentMethod: "Cash on Delivery/Pickup",
    }),
  ];

  it("returns all orders when filters are all default", () => {
    expect(filterOrders(orders, DEFAULT_REPORT_FILTERS)).toHaveLength(3);
  });

  it("filters by date range inclusively", () => {
    const filters: ReportFilters = { ...DEFAULT_REPORT_FILTERS, from: "2026-01-15", to: "2026-01-25" };
    expect(filterOrders(orders, filters).map((o) => o.id)).toEqual(["B"]);
  });

  it("filters by fulfillment method", () => {
    const filters: ReportFilters = { ...DEFAULT_REPORT_FILTERS, fulfillment: "Delivery" };
    expect(filterOrders(orders, filters).map((o) => o.id)).toEqual(["A"]);
  });

  it("filters by payment method", () => {
    const filters: ReportFilters = {
      ...DEFAULT_REPORT_FILTERS,
      paymentMethod: "Cash on Delivery/Pickup",
    };
    expect(filterOrders(orders, filters).map((o) => o.id)).toEqual(["C"]);
  });

  it("filters by category using the product catalog", () => {
    // All 3 fixture orders contain a Dresses-category product.
    const filters: ReportFilters = { ...DEFAULT_REPORT_FILTERS, categorySlug: "dresses" };
    expect(filterOrders(orders, filters)).toHaveLength(3);
  });

  it("excludes orders for a category none of them are in", () => {
    const filters: ReportFilters = { ...DEFAULT_REPORT_FILTERS, categorySlug: "jewellery" };
    expect(filterOrders(orders, filters)).toHaveLength(0);
  });
});

describe("getSalesSummary", () => {
  it("splits confirmed and pending revenue, and excludes cancelled orders from both", () => {
    const orders: Order[] = [
      makeOrder({ id: "A", status: "Confirmed", subtotal: 100 }),
      makeOrder({ id: "B", status: "Pending Confirmation", subtotal: 50 }),
      makeOrder({ id: "C", status: "Cancelled", subtotal: 999 }),
    ];

    const summary = getSalesSummary(orders);
    expect(summary.confirmedRevenue).toBe(100);
    expect(summary.pendingRevenue).toBe(50);
    expect(summary.cancelledAmount).toBe(999);
    expect(summary.cancelledCount).toBe(1);
    expect(summary.orderCount).toBe(2);
  });

  it("computes average order value across confirmed + pending orders only", () => {
    const orders: Order[] = [
      makeOrder({ id: "A", status: "Confirmed", subtotal: 100 }),
      makeOrder({ id: "B", status: "Completed", subtotal: 300 }),
    ];
    expect(getSalesSummary(orders).averageOrderValue).toBe(200);
  });

  it("returns zero average order value when there are no non-cancelled orders", () => {
    const orders: Order[] = [makeOrder({ id: "A", status: "Cancelled", subtotal: 500 })];
    expect(getSalesSummary(orders).averageOrderValue).toBe(0);
  });
});

describe("getStatusBreakdown", () => {
  it("counts orders per status and omits statuses with zero orders", () => {
    const orders: Order[] = [
      makeOrder({ id: "A", status: "Confirmed" }),
      makeOrder({ id: "B", status: "Confirmed" }),
      makeOrder({ id: "C", status: "Cancelled" }),
    ];
    const breakdown = getStatusBreakdown(orders);
    expect(breakdown.find((r) => r.key === "Confirmed")?.count).toBe(2);
    expect(breakdown.find((r) => r.key === "Processing")).toBeUndefined();
  });
});

describe("getPaymentMethodBreakdown", () => {
  it("excludes cancelled orders from payment method totals", () => {
    const orders: Order[] = [
      makeOrder({ id: "A", status: "Confirmed", paymentMethod: "Mobile Money", subtotal: 100 }),
      makeOrder({ id: "B", status: "Cancelled", paymentMethod: "Mobile Money", subtotal: 500 }),
    ];
    const breakdown = getPaymentMethodBreakdown(orders);
    const mobileMoney = breakdown.find((r) => r.key === "Mobile Money");
    expect(mobileMoney?.count).toBe(1);
    expect(mobileMoney?.amount).toBe(100);
  });
});

describe("getTopProducts", () => {
  it("aggregates quantity and revenue per product across orders", () => {
    const orders: Order[] = [
      makeOrder({
        id: "A",
        items: [{ slug: "ada-corporate-dress", name: "Ada Corporate Dress", quantity: 2, unitPrice: 350 }],
        subtotal: 700,
      }),
      makeOrder({
        id: "B",
        items: [{ slug: "ada-corporate-dress", name: "Ada Corporate Dress", quantity: 1, unitPrice: 350 }],
        subtotal: 350,
      }),
    ];
    const top = getTopProducts(orders);
    const dress = top.find((p) => p.slug === "ada-corporate-dress");
    expect(dress?.quantity).toBe(3);
    expect(dress?.revenue).toBe(1050);
  });

  it("excludes items from cancelled orders", () => {
    const orders: Order[] = [
      makeOrder({
        id: "A",
        status: "Cancelled",
        items: [{ slug: "ada-corporate-dress", name: "Ada Corporate Dress", quantity: 5, unitPrice: 350 }],
      }),
    ];
    expect(getTopProducts(orders)).toHaveLength(0);
  });
});
