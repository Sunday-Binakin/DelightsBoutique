import type { StockStatus } from "@/lib/types";

const STYLES: Record<StockStatus, string> = {
  "In Stock": "bg-green-100 text-green-800",
  "Low Stock": "bg-amber-100 text-amber-800",
  "Out of Stock": "bg-red-100 text-red-700",
};

export function StockBadge({ status }: { status: StockStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STYLES[status]}`}>
      {status}
    </span>
  );
}
