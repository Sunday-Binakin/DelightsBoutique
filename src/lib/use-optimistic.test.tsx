import { describe, expect, it } from "vitest";
import { createElement, type ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server, API } from "@/test/server";
import type { AdminOrderDto, OrderNotificationDto, Paginated, Unpaginated } from "@/lib/api/types";
import { useUpdateOrderStatus } from "./use-admin-orders";
import { useMarkNotificationRead } from "./use-admin-notifications";
import { useDeleteProduct } from "./use-admin-catalog";
import { makeProductDto } from "@/test/fixtures";

function makeClient() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
  return { client, wrapper };
}

function gate() {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

const order = { id: "ORD-1", status: "pendingConfirmation", internalNotes: null } as unknown as AdminOrderDto;

describe("optimistic order status", () => {
  it("shows the new status before the server answers, then keeps it on success", async () => {
    const { client, wrapper } = makeClient();
    const list: Paginated<AdminOrderDto> = { data: [order], page: 1, limit: 20, total: 1 };
    client.setQueryData(["admin-orders", {}], list);
    client.setQueryData(["admin-order", "ORD-1"], order);
    const response = gate();
    server.use(
      http.patch(`${API}/api/admin/orders/ORD-1`, async () => {
        await response.promise;
        return HttpResponse.json({ ...order, status: "confirmed" });
      }),
    );

    const { result } = renderHook(() => useUpdateOrderStatus(), { wrapper });
    act(() => {
      result.current.mutate({ id: "ORD-1", body: { status: "confirmed" } });
    });

    await waitFor(() =>
      expect(client.getQueryData<Paginated<AdminOrderDto>>(["admin-orders", {}])?.data[0].status).toBe(
        "confirmed",
      ),
    );
    expect(client.getQueryData<AdminOrderDto>(["admin-order", "ORD-1"])?.status).toBe("confirmed");

    response.release();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("rolls the status back when the server rejects the change", async () => {
    const { client, wrapper } = makeClient();
    const list: Paginated<AdminOrderDto> = { data: [order], page: 1, limit: 20, total: 1 };
    client.setQueryData(["admin-orders", {}], list);
    server.use(
      http.patch(`${API}/api/admin/orders/ORD-1`, () =>
        HttpResponse.json(
          { error: { code: "CONFLICT", message: "Changed elsewhere." } },
          { status: 409 },
        ),
      ),
    );

    const { result } = renderHook(() => useUpdateOrderStatus(), { wrapper });
    act(() => {
      result.current.mutate({ id: "ORD-1", body: { status: "confirmed" } });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(client.getQueryData<Paginated<AdminOrderDto>>(["admin-orders", {}])?.data[0].status).toBe(
      "pendingConfirmation",
    );
  });
});

describe("optimistic product delete", () => {
  it("removes the product from the list before the server confirms, and restores it on failure", async () => {
    const { client, wrapper } = makeClient();
    const list = {
      data: [makeProductDto({ slug: "silk-scarf" }), makeProductDto({ slug: "wool-hat" })],
      page: 1,
      limit: 20,
      total: 2,
    };
    client.setQueryData(["products", {}], list);
    const response = gate();
    server.use(
      http.delete(`${API}/api/admin/products/silk-scarf`, async () => {
        await response.promise;
        return HttpResponse.json({ error: { code: "INTERNAL_ERROR", message: "Oops." } }, { status: 500 });
      }),
    );

    const { result } = renderHook(() => useDeleteProduct(), { wrapper });
    act(() => {
      result.current.mutate("silk-scarf");
    });

    await waitFor(() =>
      expect(client.getQueryData<typeof list>(["products", {}])?.data.map((p) => p.slug)).toEqual(["wool-hat"]),
    );
    response.release();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(client.getQueryData<typeof list>(["products", {}])?.data.map((p) => p.slug)).toEqual([
      "silk-scarf",
      "wool-hat",
    ]);
  });
});

describe("optimistic notification read", () => {
  const notifications: Unpaginated<OrderNotificationDto> = {
    data: [
      { id: "n1", orderId: "ORD-1", customerName: "Ama", subtotal: 100, createdAt: "2026-10-05T10:00:00Z", read: false },
    ],
  };

  it("marks the row read and drops the badge count while the request is pending", async () => {
    const { client, wrapper } = makeClient();
    client.setQueryData(["admin-notifications"], notifications);
    client.setQueryData(["admin-notifications-unread-count"], { count: 2 });
    const response = gate();
    server.use(
      http.patch(`${API}/api/admin/notifications/n1/read`, async () => {
        await response.promise;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const { result } = renderHook(() => useMarkNotificationRead(), { wrapper });
    act(() => {
      result.current.mutate("n1");
    });

    await waitFor(() =>
      expect(client.getQueryData<{ count: number }>(["admin-notifications-unread-count"])?.count).toBe(1),
    );
    expect(client.getQueryData<Unpaginated<OrderNotificationDto>>(["admin-notifications"])?.data[0].read).toBe(
      true,
    );
    response.release();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("restores the row and count when marking read fails", async () => {
    const { client, wrapper } = makeClient();
    client.setQueryData(["admin-notifications"], notifications);
    client.setQueryData(["admin-notifications-unread-count"], { count: 2 });
    server.use(
      http.patch(`${API}/api/admin/notifications/n1/read`, () =>
        HttpResponse.json({ error: { code: "INTERNAL_ERROR", message: "Oops." } }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useMarkNotificationRead(), { wrapper });
    act(() => {
      result.current.mutate("n1");
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(client.getQueryData<{ count: number }>(["admin-notifications-unread-count"])?.count).toBe(2);
    expect(client.getQueryData<Unpaginated<OrderNotificationDto>>(["admin-notifications"])?.data[0].read).toBe(
      false,
    );
  });
});
