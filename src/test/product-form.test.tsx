import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement, type ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server, API } from "@/test/server";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { ProductForm } from "@/components/admin/ProductForm";

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const CATEGORY = {
  id: "c1",
  slug: "scarves",
  name: "Scarves",
  tone: "rose",
  imageUrl: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

function renderForm() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const ui: ReactNode = createElement(
    QueryClientProvider,
    { client },
    createElement(ToastProvider, null, createElement(ProductForm)),
  );
  render(ui);
}

async function fillAndSave() {
  await userEvent.type(screen.getByLabelText("Product Name"), "Silk Scarf");
  await userEvent.type(screen.getByLabelText("Retail Price (GH₵)"), "120");
  await userEvent.type(screen.getByLabelText("Description"), "Soft and light.");
  await userEvent.click(screen.getByRole("button", { name: "Add Product" }));
}

describe("admin product form", () => {
  beforeEach(() => {
    router.push.mockClear();
  });

  it("creates the product with a slug made from its name", async () => {
    let sent: { slug?: string; retailPrice?: number } | undefined;
    server.use(
      http.get(`${API}/api/categories`, () => HttpResponse.json([CATEGORY])),
      http.post(`${API}/api/admin/products`, async ({ request }) => {
        sent = (await request.json()) as typeof sent;
        return HttpResponse.json({ ...sent, id: "p1" }, { status: 201 });
      }),
    );
    renderForm();

    await fillAndSave();

    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/admin/products"));
    expect(sent?.slug).toBe("silk-scarf");
    expect(sent?.retailPrice).toBe(120);
  });

  it("explains a taken slug and stays on the form", async () => {
    server.use(
      http.get(`${API}/api/categories`, () => HttpResponse.json([CATEGORY])),
      http.post(`${API}/api/admin/products`, () =>
        HttpResponse.json({ error: { code: "CONFLICT", message: "Slug exists." } }, { status: 409 }),
      ),
    );
    renderForm();

    await fillAndSave();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Another product already uses this slug — choose a different one.",
    );
    expect(router.push).not.toHaveBeenCalled();
  });
});
