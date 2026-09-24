import type { Order } from "@/lib/orders";
import { seedNotifications } from "@/lib/data/notifications";

export interface OrderNotification {
  id: string;
  orderId: string;
  customerName: string;
  subtotal: number;
  createdAt: string;
  read: boolean;
}

// Real, working in-app notifications — no backend needed since it's just
// localStorage. Email/WhatsApp sending is a separate, still-unwired concern
// (see site-settings.ts's orderNotify* fields) for once a backend exists.
export const NOTIFICATIONS_STORAGE_KEY = "delight-boutique-notifications";
const MAX_NOTIFICATIONS = 50;

function readAll(): OrderNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : seedNotifications;
  } catch {
    return seedNotifications;
  }
}

function writeAll(notifications: OrderNotification[]) {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch {
    // Storage may be full or blocked — the order itself still went through.
  }
}

/** Called from createOrder() — every new order raises a notification. */
export function addOrderNotification(order: Order) {
  const notification: OrderNotification = {
    id: `notif-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    orderId: order.id,
    customerName: order.customerName,
    subtotal: order.subtotal,
    createdAt: order.createdAt,
    read: false,
  };
  writeAll([notification, ...readAll()].slice(0, MAX_NOTIFICATIONS));
}

export function getNotifications(): OrderNotification[] {
  return readAll();
}

export function getUnreadCount(): number {
  return readAll().filter((n) => !n.read).length;
}

export function markAsRead(id: string) {
  writeAll(readAll().map((n) => (n.id === id ? { ...n, read: true } : n)));
}

export function markAllAsRead() {
  writeAll(readAll().map((n) => ({ ...n, read: true })));
}
