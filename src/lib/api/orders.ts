import { apiFetch } from "./client";
import type { AdminOrderDto, CheckoutBody, OrderDto, Paginated, UpdateOrderBody, Unpaginated } from "./types";
import type { Order, OrderItem, OrderStatus, FulfillmentMethod, PaymentMethod } from "@/lib/orders";

export function checkout(body: CheckoutBody, idempotencyKey: string): Promise<OrderDto> {
  return apiFetch<OrderDto>("/api/orders", { method: "POST", body, idempotencyKey });
}

export function trackOrders(phone: string): Promise<Unpaginated<OrderDto>> {
  return apiFetch<Unpaginated<OrderDto>>("/api/orders/track", { query: { phone } });
}

export function getOrderById(id: string): Promise<OrderDto> {
  return apiFetch<OrderDto>(`/api/orders/${encodeURIComponent(id)}`);
}

export interface AdminOrderListParams {
  status?: OrderStatus;
  fulfillment?: FulfillmentMethod;
  paymentMethod?: PaymentMethod;
  categorySlug?: string;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function getAdminOrders(params: AdminOrderListParams = {}): Promise<Paginated<AdminOrderDto>> {
  return apiFetch<Paginated<AdminOrderDto>>("/api/admin/orders", { query: { ...params } });
}

export function getAdminOrderById(id: string): Promise<AdminOrderDto> {
  return apiFetch<AdminOrderDto>(`/api/admin/orders/${encodeURIComponent(id)}`);
}

export function updateAdminOrder(id: string, body: UpdateOrderBody): Promise<AdminOrderDto> {
  return apiFetch<AdminOrderDto>(`/api/admin/orders/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body,
  });
}

export function toOrder(dto: OrderDto): Order {
  return {
    id: dto.id,
    createdAt: dto.createdAt,
    status: dto.status,
    items: dto.items.map(
      (item): OrderItem => ({
        slug: item.slug,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        size: item.size ?? undefined,
        color: item.color ?? undefined,
      }),
    ),
    subtotal: dto.subtotal,
    customerName: dto.customerName,
    phone: dto.phone,
    fulfillment: dto.fulfillment,
    address: dto.address ?? undefined,
    paymentMethod: dto.paymentMethod,
    notes: dto.notes ?? undefined,
  };
}

export function toAdminOrder(dto: AdminOrderDto): Order {
  return { ...toOrder(dto), internalNotes: dto.internalNotes ?? undefined };
}
