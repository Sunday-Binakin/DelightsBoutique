import { getAllOrders, ORDER_STATUSES, type Order, type OrderStatus, type FulfillmentMethod, type PaymentMethod } from "@/lib/orders";
import { getAllProducts } from "@/lib/product-store";
import { getAllCategories } from "@/lib/category-store";
import type { Category } from "@/lib/types";

export interface ReportFilters {
  /** ISO date (yyyy-mm-dd), inclusive. Empty string = no lower bound. */
  from: string;
  /** ISO date (yyyy-mm-dd), inclusive. Empty string = no upper bound. */
  to: string;
  fulfillment: FulfillmentMethod | "all";
  paymentMethod: PaymentMethod | "all";
  categorySlug: string | "all";
}

export const DEFAULT_REPORT_FILTERS: ReportFilters = {
  from: "",
  to: "",
  fulfillment: "all",
  paymentMethod: "all",
  categorySlug: "all",
};

// Payment happens off-app (MoMo, bank transfer, cash agreed with the
// customer) — nothing here is a real payment gateway total. "Confirmed"
// revenue is orders the admin has moved past Pending Confirmation, i.e.
// payment has actually been verified; "Pending" is money not in hand yet.
const CANCELLED: OrderStatus = "Cancelled";
const PENDING: OrderStatus = "Pending Confirmation";

function inDateRange(iso: string, from: string, to: string): boolean {
  const time = new Date(iso).getTime();
  if (from && time < new Date(`${from}T00:00:00`).getTime()) return false;
  if (to && time > new Date(`${to}T23:59:59.999`).getTime()) return false;
  return true;
}

/** Product/category lookup is done once per call, not per order, since the catalog rarely changes mid-report. */
function buildCategoryIndex() {
  const products = getAllProducts();
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  return bySlug;
}

function orderMatchesCategory(order: Order, categorySlug: string, productsBySlug: Map<string, ReturnType<typeof getAllProducts>[number]>): boolean {
  if (categorySlug === "all") return true;
  return order.items.some((item) => productsBySlug.get(item.slug)?.categorySlug === categorySlug);
}

export function filterOrders(orders: Order[], filters: ReportFilters): Order[] {
  const productsBySlug = buildCategoryIndex();
  return orders.filter((order) => {
    if (!inDateRange(order.createdAt, filters.from, filters.to)) return false;
    if (filters.fulfillment !== "all" && order.fulfillment !== filters.fulfillment) return false;
    if (filters.paymentMethod !== "all" && order.paymentMethod !== filters.paymentMethod) return false;
    if (!orderMatchesCategory(order, filters.categorySlug, productsBySlug)) return false;
    return true;
  });
}

export interface SalesSummary {
  confirmedRevenue: number;
  pendingRevenue: number;
  cancelledAmount: number;
  cancelledCount: number;
  orderCount: number;
  averageOrderValue: number;
  byDay: Array<{ date: string; revenue: number; orders: number }>;
}

export function getSalesSummary(orders: Order[]): SalesSummary {
  let confirmedRevenue = 0;
  let pendingRevenue = 0;
  let cancelledAmount = 0;
  let cancelledCount = 0;
  const dayTotals = new Map<string, { revenue: number; orders: number }>();

  for (const order of orders) {
    if (order.status === CANCELLED) {
      cancelledAmount += order.subtotal;
      cancelledCount += 1;
      continue;
    }
    if (order.status === PENDING) {
      pendingRevenue += order.subtotal;
    } else {
      confirmedRevenue += order.subtotal;
    }

    const day = order.createdAt.slice(0, 10);
    const existing = dayTotals.get(day) ?? { revenue: 0, orders: 0 };
    existing.revenue += order.subtotal;
    existing.orders += 1;
    dayTotals.set(day, existing);
  }

  const orderCount = orders.length - cancelledCount;
  const byDay = Array.from(dayTotals.entries())
    .map(([date, totals]) => ({ date, ...totals }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    confirmedRevenue,
    pendingRevenue,
    cancelledAmount,
    cancelledCount,
    orderCount,
    averageOrderValue: orderCount > 0 ? (confirmedRevenue + pendingRevenue) / orderCount : 0,
    byDay,
  };
}

export interface ProductSales {
  slug: string;
  name: string;
  categoryName: string;
  quantity: number;
  revenue: number;
}

export function getTopProducts(orders: Order[], limit = 10): ProductSales[] {
  const products = getAllProducts();
  const productsBySlug = new Map(products.map((p) => [p.slug, p]));
  const categoriesBySlug = new Map(getAllCategories().map((c) => [c.slug, c]));

  const bySlug = new Map<string, ProductSales>();
  for (const order of orders) {
    if (order.status === CANCELLED) continue;
    for (const item of order.items) {
      const existing = bySlug.get(item.slug);
      const categorySlug = productsBySlug.get(item.slug)?.categorySlug;
      const categoryName = (categorySlug && categoriesBySlug.get(categorySlug)?.name) || "Unknown";
      const revenue = item.quantity * item.unitPrice;
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += revenue;
      } else {
        bySlug.set(item.slug, { slug: item.slug, name: item.name, categoryName, quantity: item.quantity, revenue });
      }
    }
  }

  return Array.from(bySlug.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export interface BreakdownRow<T extends string> {
  key: T;
  count: number;
  amount: number;
}

export function getStatusBreakdown(orders: Order[]): BreakdownRow<OrderStatus>[] {
  return ORDER_STATUSES.map((status) => {
    const matching = orders.filter((o) => o.status === status);
    return {
      key: status,
      count: matching.length,
      amount: matching.reduce((sum, o) => sum + o.subtotal, 0),
    };
  }).filter((row) => row.count > 0);
}

const PAYMENT_METHODS: PaymentMethod[] = ["Bank Transfer", "Mobile Money", "Cash on Delivery/Pickup"];

export function getPaymentMethodBreakdown(orders: Order[]): BreakdownRow<PaymentMethod>[] {
  const nonCancelled = orders.filter((o) => o.status !== CANCELLED);
  return PAYMENT_METHODS.map((method) => {
    const matching = nonCancelled.filter((o) => o.paymentMethod === method);
    return {
      key: method,
      count: matching.length,
      amount: matching.reduce((sum, o) => sum + o.subtotal, 0),
    };
  }).filter((row) => row.count > 0);
}

export function getReportCategories(): Category[] {
  return getAllCategories();
}

export function getReportOrders(): Order[] {
  return getAllOrders();
}
