import { apiFetch } from "./client";
import type { OrderNotificationDto, Unpaginated } from "./types";
import type { OrderNotification } from "@/lib/notifications";

export function getNotifications(): Promise<Unpaginated<OrderNotificationDto>> {
  return apiFetch<Unpaginated<OrderNotificationDto>>("/api/admin/notifications");
}

export function getUnreadCount(): Promise<{ count: number }> {
  return apiFetch<{ count: number }>("/api/admin/notifications/unread-count");
}

export function markNotificationRead(id: string): Promise<void> {
  return apiFetch<void>(`/api/admin/notifications/${encodeURIComponent(id)}/read`, {
    method: "PATCH",
  });
}

export function markAllNotificationsRead(): Promise<void> {
  return apiFetch<void>("/api/admin/notifications/mark-all-read", { method: "POST" });
}

export function toOrderNotification(dto: OrderNotificationDto): OrderNotification {
  return dto;
}
