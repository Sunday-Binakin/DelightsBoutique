"use client";

import Link from "next/link";
import { useNotifications } from "@/lib/use-notifications";
import { markAsRead, markAllAsRead } from "@/lib/notifications";
import { formatPrice, timeAgo } from "@/lib/format";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { BellIcon } from "@/components/ui/icons";

export default function AdminNotificationsPage() {
  const [notifications, refresh] = useNotifications();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <Breadcrumb items={[{ label: "Home", href: "/admin/dashboard" }, { label: "Notifications" }]} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {notifications.length} order{notifications.length === 1 ? "" : "s"} notified
            {unread > 0 ? ` — ${unread} unread` : ""}.
          </p>
        </div>
        {unread > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              markAllAsRead();
              refresh();
            }}
          >
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-border-subtle py-20 text-center">
          <BellIcon className="h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            No orders yet — you&apos;ll see them here the moment a customer checks out.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-border-subtle">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={`/admin/orders?highlight=${n.orderId}`}
              onClick={() => {
                markAsRead(n.id);
                refresh();
              }}
              className={`flex items-center justify-between gap-4 border-b border-border-subtle px-5 py-4 transition-colors last:border-0 hover:bg-muted/60 ${
                n.read ? "" : "bg-primary/5"
              }`}
            >
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                  New order — {n.orderId}
                  {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {n.customerName} · {formatPrice(n.subtotal)}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(n.createdAt)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
