import type { OrderNotification } from "@/lib/notifications";

// Sample notifications matching the newest seed orders (data/orders.ts) so
// the bell isn't empty before any real order comes in. Falls away the
// moment a real order is placed — see notifications.ts's readAll().
export const seedNotifications: OrderNotification[] = [
  {
    id: "notif-seed1",
    orderId: "DB-SEED001",
    customerName: "Akosua Mensah",
    subtotal: 350,
    createdAt: "2026-09-22T09:15:00.000Z",
    read: false,
  },
  {
    id: "notif-seed2",
    orderId: "DB-SEED002",
    customerName: "Adjoa Fosu",
    subtotal: 185,
    createdAt: "2026-09-21T14:40:00.000Z",
    read: false,
  },
  {
    id: "notif-seed3",
    orderId: "DB-SEED003",
    customerName: "Efua Owusu",
    subtotal: 400,
    createdAt: "2026-09-19T11:05:00.000Z",
    read: true,
  },
];
