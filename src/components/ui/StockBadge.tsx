import type { StockStatus } from "@/lib/types";

const STYLES: Record<StockStatus, string> = {
  inStock: "bg-green-100 text-green-800",
  lowStock: "bg-amber-100 text-amber-800",
  outOfStock: "bg-red-100 text-red-700",
};

const LABELS: Record<StockStatus, string> = {
  inStock: "In Stock",
  lowStock: "Low Stock",
  outOfStock: "Out of Stock",
};

export function StockBadge({ status }: { status: StockStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
