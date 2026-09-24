import { seedOrders } from "@/lib/data/orders";
import { addOrderNotification } from "@/lib/notifications";

export type PaymentMethod = "Bank Transfer" | "Mobile Money" | "Cash on Delivery/Pickup";
export type FulfillmentMethod = "Delivery" | "Pickup";

export type OrderStatus =
  | "Pending Confirmation"
  | "Confirmed"
  | "Processing"
  | "Out for Delivery"
  | "Ready for Pickup"
  | "Completed"
  | "Cancelled";

export const ORDER_STATUSES: OrderStatus[] = [
  "Pending Confirmation",
  "Confirmed",
  "Processing",
  "Out for Delivery",
  "Ready for Pickup",
  "Completed",
  "Cancelled",
];

/**
 * There's no courier/shipping step — fulfillment is always in-house
 * delivery or in-store pickup, so the status options an order can move
 * through only include whichever of those two matches its own fulfillment.
 */
export function getStatusOptions(fulfillment: FulfillmentMethod): OrderStatus[] {
  const fulfillmentStatus: OrderStatus = fulfillment === "Delivery" ? "Out for Delivery" : "Ready for Pickup";
  return ["Pending Confirmation", "Confirmed", "Processing", fulfillmentStatus, "Completed", "Cancelled"];
}

export interface OrderItem {
  slug: string;
  name: string;
  quantity: number;
  unitPrice: number;
  size?: string;
  color?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  customerName: string;
  phone: string;
  fulfillment: FulfillmentMethod;
  address?: string;
  paymentMethod: PaymentMethod;
  /** Submitted by the customer at checkout. */
  notes?: string;
  /** Admin-only notes — never shown to the customer. */
  internalNotes?: string;
}

const STORAGE_KEY = "delight-boutique-orders";

function readAll(): Order[] {
  // No orders placed yet on this device falls back to sample data, so the
  // admin Orders UI isn't empty — same pattern as product-store.ts.
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : seedOrders;
  } catch {
    return seedOrders;
  }
}

function writeAll(orders: Order[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // Storage may be full or blocked — the order still exists for this session.
  }
}

function generateOrderId() {
  return `DB-${Date.now().toString(36).toUpperCase()}`;
}

export function createOrder(input: Omit<Order, "id" | "createdAt" | "status">): Order {
  const order: Order = {
    ...input,
    id: generateOrderId(),
    createdAt: new Date().toISOString(),
    status: "Pending Confirmation",
  };
  writeAll([...readAll(), order]);
  addOrderNotification(order);
  return order;
}

export function getOrder(id: string): Order | undefined {
  return readAll().find((order) => order.id === id);
}

export function getAllOrders(): Order[] {
  return readAll();
}

/** Digits only, and normalized from "+233…"/"233…" international format to local "0…" so
 * a customer typing either form still matches what was captured at checkout. */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("233") && digits.length === 12) {
    return `0${digits.slice(3)}`;
  }
  return digits;
}

/** Every order placed with a given phone number, most recent first — the
 * lookup behind the customer-facing "Track My Order" page. */
export function getOrdersByPhone(phone: string): Order[] {
  const target = normalizePhone(phone);
  if (!target) return [];

  return readAll()
    .filter((order) => normalizePhone(order.phone) === target)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function updateOrder(
  id: string,
  updates: Partial<Pick<Order, "status" | "internalNotes">>,
): Order | undefined {
  const all = readAll();
  const index = all.findIndex((order) => order.id === id);
  if (index === -1) return undefined;

  const updated = { ...all[index], ...updates };
  const next = [...all];
  next[index] = updated;
  writeAll(next);
  return updated;
}
