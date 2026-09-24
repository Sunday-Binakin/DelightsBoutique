import type { OrderStatus } from "@/lib/orders";

const STYLES: Record<OrderStatus, string> = {
  "Pending Confirmation": "bg-amber-100 text-amber-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Processing: "bg-purple-100 text-purple-800",
  "Out for Delivery": "bg-cyan-100 text-cyan-800",
  "Ready for Pickup": "bg-teal-100 text-teal-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-700",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${STYLES[status]}`}>
      {status}
    </span>
  );
}
