import { formatPrice } from "@/lib/format";

export interface SummaryItem {
  name: string;
  quantity: number;
  unitPrice: number;
  size?: string;
  color?: string;
}

export function OrderItemsSummary({ items }: { items: SummaryItem[] }) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <div>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex justify-between gap-3 text-sm">
            <span className="text-foreground">
              {item.name}
              <span className="text-muted-foreground"> × {item.quantity}</span>
              {(item.size || item.color) && (
                <span className="block text-xs text-muted-foreground">
                  {[item.size, item.color].filter(Boolean).join(" · ")}
                </span>
              )}
            </span>
            <span className="shrink-0 font-medium text-foreground">
              {formatPrice(item.unitPrice * item.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-between border-t border-border-subtle pt-4 text-sm">
        <span className="font-medium text-foreground">Subtotal</span>
        <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
      </div>
    </div>
  );
}
