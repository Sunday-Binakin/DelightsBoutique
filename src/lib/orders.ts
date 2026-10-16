export type PaymentMethod = "bankTransfer" | "mobileMoney" | "cashOnDeliveryOrPickup";
export type FulfillmentMethod = "delivery" | "pickup";

export type OrderStatus =
  | "pendingConfirmation"
  | "confirmed"
  | "processing"
  | "outForDelivery"
  | "readyForPickup"
  | "completed"
  | "cancelled";

export const ORDER_STATUSES: OrderStatus[] = [
  "pendingConfirmation",
  "confirmed",
  "processing",
  "outForDelivery",
  "readyForPickup",
  "completed",
  "cancelled",
];

/** Human-readable labels for the camelCase enum values the backend uses — render these, never the raw value. */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pendingConfirmation: "Pending Confirmation",
  confirmed: "Confirmed",
  processing: "Processing",
  outForDelivery: "Out for Delivery",
  readyForPickup: "Ready for Pickup",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  bankTransfer: "Bank Transfer",
  mobileMoney: "Mobile Money",
  cashOnDeliveryOrPickup: "Cash on Delivery/Pickup",
};

export const FULFILLMENT_LABELS: Record<FulfillmentMethod, string> = {
  delivery: "Delivery",
  pickup: "Pickup",
};

/**
 * There's no courier/shipping step — fulfillment is always in-house
 * delivery or in-store pickup, so the status options an order can move
 * through only include whichever of those two matches its own fulfillment.
 */
export function getStatusOptions(fulfillment: FulfillmentMethod): OrderStatus[] {
  const fulfillmentStatus: OrderStatus = fulfillment === "delivery" ? "outForDelivery" : "readyForPickup";
  return ["pendingConfirmation", "confirmed", "processing", fulfillmentStatus, "completed", "cancelled"];
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

/** Digits only, and normalized from "+233…"/"233…" international format to local "0…" so
 * a customer typing either form still matches what was captured at checkout. */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("233") && digits.length === 12) {
    return `0${digits.slice(3)}`;
  }
  return digits;
}
