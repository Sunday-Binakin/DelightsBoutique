"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { getOrdersByPhone, type Order } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";
import { Button } from "@/components/ui/Button";

export default function TrackOrderPage() {
  const [phone, setPhone] = useState("");
  const [results, setResults] = useState<Order[] | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResults(getOrdersByPhone(phone));
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="text-center">
        <h1 className="font-serif text-2xl font-semibold text-foreground">Track My Order</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the phone number you used at checkout to see all your orders.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto mt-6 flex max-w-sm gap-3">
        <input
          required
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="024 000 0000"
          className="w-full rounded-lg border border-border-subtle bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
        />
        <Button type="submit">Find Orders</Button>
      </form>

      {results !== null && (
        <div className="mt-8">
          {results.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              No orders found for that number. Double-check the phone number you used at checkout.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                {results.length} order{results.length > 1 ? "s" : ""} found — select one to see its
                status.
              </p>
              {results.map((order) => (
                <Link
                  key={order.id}
                  href={`/order-confirmation/${order.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle p-4 transition-colors hover:border-primary"
                >
                  <div>
                    <p className="font-medium text-foreground">{order.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()} · {formatPrice(order.subtotal)}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
