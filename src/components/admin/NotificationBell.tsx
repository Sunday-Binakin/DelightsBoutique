"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useNotificationsQuery,
  useUnreadCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/lib/use-admin-notifications";
import { formatPrice, timeAgo } from "@/lib/format";
import { BellIcon } from "@/components/ui/icons";
import { useToast } from "@/components/ui/ToastProvider";

export function NotificationBell() {
  const { notifications } = useNotificationsQuery();
  const unread = useUnreadCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const toast = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const recent = notifications.slice(0, 8);

  function openOrder(orderId: string, notificationId: string) {
    markRead.mutate(notificationId);
    setOpen(false);
    router.push(`/admin/orders?highlight=${orderId}`);
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Order notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-muted"
      >
        <BellIcon className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Click-outside catcher */}
          <button
            type="button"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div className="absolute left-0 top-full z-20 mt-2 w-80 rounded-xl border border-input-border bg-background shadow-lg">
            <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Order Notifications</p>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    markAllRead.mutate(undefined, {
                      onError: () => toast.error("Couldn't mark notifications as read. Try again."),
                    })
                  }
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {recent.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No orders yet — you&apos;ll see them here the moment a customer checks out.
                </p>
              ) : (
                recent.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => openOrder(n.orderId, n.id)}
                    className={`flex w-full flex-col gap-0.5 border-b border-border-subtle px-4 py-3 text-left last:border-0 hover:bg-muted/60 ${
                      n.read ? "" : "bg-primary/5"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">
                        New order — {n.orderId}
                      </span>
                      {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {n.customerName} · {formatPrice(n.subtotal)}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{timeAgo(n.createdAt)}</span>
                  </button>
                ))
              )}
            </div>

            <Link
              href="/admin/notifications"
              onClick={() => setOpen(false)}
              className="block border-t border-border-subtle px-4 py-2.5 text-center text-sm font-medium text-primary hover:bg-muted/60"
            >
              View all notifications{notifications.length > recent.length ? ` (${notifications.length})` : ""}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
