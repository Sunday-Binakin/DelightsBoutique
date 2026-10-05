import { describe, expect, it } from "vitest";
import { createElement, type ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server, API } from "@/test/server";
import { makeProductDto } from "@/test/fixtures";
import { PRODUCT_PAGE_SIZE, useProductsList } from "./use-products";

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

describe("useProductsList", () => {
  it("requests the given page and size, and reports the server total", async () => {
    let requested: URL | undefined;
    server.use(
      http.get(`${API}/api/products`, ({ request }) => {
        requested = new URL(request.url);
        return HttpResponse.json({
          data: [makeProductDto({ slug: "silk-scarf" })],
          page: 2,
          limit: PRODUCT_PAGE_SIZE,
          total: 45,
        });
      }),
    );

    const { result } = renderHook(
      () => useProductsList({ category: "scarves", page: 2, limit: PRODUCT_PAGE_SIZE }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(requested?.searchParams.get("page")).toBe("2");
    expect(requested?.searchParams.get("limit")).toBe("20");
    expect(requested?.searchParams.get("category")).toBe("scarves");
    expect(result.current.total).toBe(45);
    expect(result.current.products[0].slug).toBe("silk-scarf");
  });
});
