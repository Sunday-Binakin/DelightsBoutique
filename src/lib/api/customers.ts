import { apiFetch } from "./client";
import type { CustomerDto, OrderDto, Paginated, Unpaginated } from "./types";
import type { CustomerSummary } from "@/lib/customers";

export interface CustomerListParams {
  search?: string;
  customerType?: "retail" | "wholesale";
  page?: number;
  limit?: number;
}

export interface CustomerCounts {
  total: number;
  retail: number;
  wholesale: number;
}

export function getCustomers(params: CustomerListParams = {}): Promise<Paginated<CustomerDto>> {
  return apiFetch<Paginated<CustomerDto>>("/api/admin/customers", { query: { ...params } });
}

export function getCustomerCounts(): Promise<CustomerCounts> {
  return apiFetch<CustomerCounts>("/api/admin/customers/counts");
}

export function getCustomerOrders(phone: string): Promise<Unpaginated<OrderDto>> {
  return apiFetch<Unpaginated<OrderDto>>(`/api/admin/customers/${encodeURIComponent(phone)}/orders`);
}

export function updateCustomerWholesale(phone: string, wholesale: boolean): Promise<CustomerDto> {
  return apiFetch<CustomerDto>(`/api/admin/customers/${encodeURIComponent(phone)}`, {
    method: "PATCH",
    body: { wholesale },
  });
}

export function toCustomerSummary(dto: CustomerDto): CustomerSummary {
  return {
    phone: dto.phone,
    name: dto.name,
    orderCount: dto.orderCount,
    totalSpent: dto.totalSpent,
    lastOrderAt: dto.lastOrderAt,
    wholesale: dto.wholesale,
  };
}
