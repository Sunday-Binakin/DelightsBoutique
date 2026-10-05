import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement, type ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server, API } from "@/test/server";
import { makeProductDto } from "@/test/fixtures";
import { CartProvider } from "@/lib/cart-context";
import CheckoutPage from "@/app/(storefront)/checkout/page";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }));

function renderCheckout() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const ui: ReactNode = createElement(
    QueryClientProvider,
    { client },
    createElement(CartProvider, null, createElement(CheckoutPage)),
  );
  render(ui);
}

describe("checkout order summary", () => {
  beforeEach(() => {
    window.localStorage.setItem(
      "delight-boutique-cart",
      JSON.stringify([{ slug: "silk-scarf", quantity: 2 }]),
    );
  });

  it("shows the cart's item once its product has loaded", async () => {
    server.use(
      http.get(`${API}/api/products/silk-scarf`, () =>
        HttpResponse.json(makeProductDto({ slug: "silk-scarf", retailPrice: 120 })),
      ),
    );
    renderCheckout();

    expect(await screen.findByText("silk scarf")).toBeInTheDocument();
  });

  it("offers a retry instead of an incomplete summary when the product lookup fails", async () => {
    server.use(
      http.get(`${API}/api/products/silk-scarf`, () =>
        HttpResponse.json({ error: { code: "INTERNAL_ERROR", message: "Oops." } }, { status: 500 }),
      ),
    );
    renderCheckout();

    expect(await screen.findByText(/order summary/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });
});
