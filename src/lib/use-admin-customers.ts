"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCustomerCounts,
  getCustomers,
  getCustomerOrders,
  updateCustomerWholesale,
  toCustomerSummary,
  type CustomerListParams,
} from "@/lib/api/customers";
import { toOrder } from "@/lib/api/orders";

export const ADMIN_CUSTOMERS_PAGE_SIZE = 20;

export function useAdminCustomersList(params: CustomerListParams = {}) {
  const query = useQuery({
    queryKey: ["admin-customers", params],
    queryFn: () => getCustomers({ limit: ADMIN_CUSTOMERS_PAGE_SIZE, ...params }),
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    customers: query.data ? query.data.data.map(toCustomerSummary) : [],
    total: query.data?.total ?? 0,
  };
}

export function useCustomerCounts() {
  const query = useQuery({
    queryKey: ["admin-customers", "counts"],
    queryFn: getCustomerCounts,
  });
  return {
    total: query.data?.total ?? 0,
    retail: query.data?.retail ?? 0,
    wholesale: query.data?.wholesale ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

export function useCustomerOrders(phone: string | undefined) {
  const query = useQuery({
    queryKey: ["customer-orders", phone],
    queryFn: () => getCustomerOrders(phone!),
    enabled: Boolean(phone),
  });

  return { ...query, orders: query.data ? query.data.data.map(toOrder) : [] };
}

export function useUpdateCustomerWholesale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ phone, wholesale }: { phone: string; wholesale: boolean }) =>
      updateCustomerWholesale(phone, wholesale),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-customers"] }),
  });
}
