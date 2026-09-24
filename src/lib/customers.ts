import { getAllOrders, normalizePhone, type Order } from "@/lib/orders";

export interface CustomerSummary {
  /** Normalized phone number — the customer's identity, since there's no account system yet. */
  phone: string;
  name: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string;
  wholesale: boolean;
}

const WHOLESALE_FLAGS_KEY = "delight-boutique-wholesale-flags";

function readWholesaleFlags(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(WHOLESALE_FLAGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeWholesaleFlags(flags: Record<string, boolean>) {
  try {
    localStorage.setItem(WHOLESALE_FLAGS_KEY, JSON.stringify(flags));
  } catch {
    // Storage may be full or blocked — the flag still applies for this session.
  }
}

export function isWholesaleCustomer(phone: string): boolean {
  return readWholesaleFlags()[normalizePhone(phone)] ?? false;
}

export function setWholesaleCustomer(phone: string, wholesale: boolean) {
  const flags = readWholesaleFlags();
  flags[normalizePhone(phone)] = wholesale;
  writeWholesaleFlags(flags);
}

/**
 * There's no customer registration yet, so a "customer" here is derived
 * from order history — every unique phone number that has placed an
 * order, aggregated with their totals and most recent name/order date.
 */
export function getAllCustomers(): CustomerSummary[] {
  const byPhone = new Map<string, Order[]>();

  for (const order of getAllOrders()) {
    const key = normalizePhone(order.phone);
    const existing = byPhone.get(key);
    if (existing) existing.push(order);
    else byPhone.set(key, [order]);
  }

  const customers: CustomerSummary[] = [];
  for (const [phone, orders] of byPhone) {
    const sorted = [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    customers.push({
      phone,
      name: sorted[0].customerName,
      orderCount: orders.length,
      totalSpent: orders.reduce((sum, o) => sum + o.subtotal, 0),
      lastOrderAt: sorted[0].createdAt,
      wholesale: isWholesaleCustomer(phone),
    });
  }

  return customers.sort((a, b) => new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime());
}

export function getCustomerOrders(phone: string): Order[] {
  const key = normalizePhone(phone);
  return getAllOrders()
    .filter((order) => normalizePhone(order.phone) === key)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
