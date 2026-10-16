"use client";

import { keepPreviousData, useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminOrders,
  getAdminOrderById,
  updateAdminOrder,
  toAdminOrder,
  type AdminOrderListParams,
} from "@/lib/api/orders";
import type { AdminOrderDto, Paginated, UpdateOrderBody } from "@/lib/api/types";
import type { OrderStatus } from "@/lib/orders";

export const ADMIN_ORDERS_PAGE_SIZE = 20;

export function useAdminOrdersList(params: AdminOrderListParams = {}) {
  const query = useQuery({
    queryKey: ["admin-orders", params],
    queryFn: () => getAdminOrders({ limit: ADMIN_ORDERS_PAGE_SIZE, ...params }),
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    orders: query.data ? query.data.data.map(toAdminOrder) : [],
    total: query.data?.total ?? 0,
  };
}

export function useAdminOrder(id: string | undefined) {
  const query = useQuery({
    queryKey: ["admin-order", id],
    queryFn: () => getAdminOrderById(id!),
    enabled: Boolean(id),
  });

  return { ...query, order: query.data ? toAdminOrder(query.data) : undefined };
}

/** Per-status order counts for the admin sidebar — one cheap `limit=1` request per
 * status, reading just the paginated envelope's `total`. */
export function useOrderStatusCounts(statuses: OrderStatus[]) {
  const results = useQueries({
    queries: statuses.map((status) => ({
      queryKey: ["admin-orders", { status, limit: 1 }],
      queryFn: () => getAdminOrders({ status, limit: 1 }),
    })),
  });

  const countByStatus = new Map<OrderStatus, number>();
  results.forEach((result, index) => {
    if (result.data) countByStatus.set(statuses[index], result.data.total);
  });
  return countByStatus;
}

export function useTotalOrderCount() {
  const query = useQuery({
    queryKey: ["admin-orders", { limit: 1 }],
    queryFn: () => getAdminOrders({ limit: 1 }),
  });
  return { total: query.data?.total ?? 0, isLoading: query.isLoading, isError: query.isError };
}

type OrderListCache = Paginated<AdminOrderDto>;

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateOrderBody }) => updateAdminOrder(id, body),
    onMutate: async ({ id, body }) => {
      if (!body.status) return { lists: [], detail: undefined };
      const status = body.status;
      await queryClient.cancelQueries({ queryKey: ["admin-orders"] });
      await queryClient.cancelQueries({ queryKey: ["admin-order", id] });

      const lists = queryClient.getQueriesData<OrderListCache>({ queryKey: ["admin-orders"] });
      const detail = queryClient.getQueryData<AdminOrderDto>(["admin-order", id]);

      queryClient.setQueriesData<OrderListCache>({ queryKey: ["admin-orders"] }, (old) =>
        old && { ...old, data: old.data.map((o) => (o.id === id ? { ...o, status } : o)) },
      );
      if (detail) queryClient.setQueryData(["admin-order", id], { ...detail, status });

      return { lists, detail };
    },
    onError: (_err, { id }, context) => {
      context?.lists.forEach(([key, data]) => queryClient.setQueryData(key, data));
      if (context?.detail) queryClient.setQueryData(["admin-order", id], context.detail);
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
    },
  });
}
