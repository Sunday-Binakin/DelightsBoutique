"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  toOrderNotification,
} from "@/lib/api/notifications";
import type { OrderNotificationDto, Unpaginated } from "@/lib/api/types";

const LIST_POLL_MS = 30_000;
const COUNT_POLL_MS = 15_000;

export function useNotificationsQuery() {
  const query = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: getNotifications,
    refetchInterval: LIST_POLL_MS,
  });

  return { ...query, notifications: query.data ? query.data.data.map(toOrderNotification) : [] };
}

export function useUnreadCount() {
  const query = useQuery({
    queryKey: ["admin-notifications-unread-count"],
    queryFn: getUnreadCount,
    refetchInterval: COUNT_POLL_MS,
  });

  return query.data?.count ?? 0;
}

function useInvalidateNotifications() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    queryClient.invalidateQueries({ queryKey: ["admin-notifications-unread-count"] });
  };
}

const LIST_KEY = ["admin-notifications"] as const;
const COUNT_KEY = ["admin-notifications-unread-count"] as const;

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: markNotificationRead,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: LIST_KEY });
      await queryClient.cancelQueries({ queryKey: COUNT_KEY });

      const list = queryClient.getQueryData<Unpaginated<OrderNotificationDto>>(LIST_KEY);
      const count = queryClient.getQueryData<{ count: number }>(COUNT_KEY);
      const wasUnread = list?.data.some((n) => n.id === id && !n.read) ?? false;

      queryClient.setQueryData<Unpaginated<OrderNotificationDto>>(LIST_KEY, (old) =>
        old && { ...old, data: old.data.map((n) => (n.id === id ? { ...n, read: true } : n)) },
      );
      if (wasUnread && count) {
        queryClient.setQueryData(COUNT_KEY, { count: Math.max(count.count - 1, 0) });
      }
      return { list, count };
    },
    onError: (_err, _id, context) => {
      if (context?.list) queryClient.setQueryData(LIST_KEY, context.list);
      if (context?.count) queryClient.setQueryData(COUNT_KEY, context.count);
    },
    onSettled: invalidate,
  });
}

export function useMarkAllNotificationsRead() {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: invalidate,
  });
}
