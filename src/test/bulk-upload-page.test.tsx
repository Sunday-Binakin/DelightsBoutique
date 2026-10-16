import { describe, expect, it, vi } from "vitest";
import { createElement, type ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server, API } from "@/test/server";
import { ToastProvider } from "@/components/ui/ToastProvider";
import BulkProductUploadPage from "@/app/admin/(protected)/products/bulk/page";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const ui: ReactNode = createElement(
    QueryClientProvider,
    { client },
    createElement(ToastProvider, null, createElement(BulkProductUploadPage)),
  );
  const { container } = render(ui);
  const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
  return { input };
}

describe("bulk product upload page", () => {
  it("uploads the CSV and lists each row's result", async () => {
    server.use(
      http.post(`${API}/api/admin/products/bulk-upload`, () =>
        HttpResponse.json({
          rows: [
            { rowNumber: 1, success: true, slug: "silk-scarf", error: null },
            { rowNumber: 2, success: false, slug: null, error: "retailPrice 'x' is not a valid number." },
          ],
          successCount: 1,
          errorCount: 1,
        }),
      ),
    );

    const { input } = renderPage();
    await userEvent.upload(input, new File(["slug,name\n"], "products.csv", { type: "text/csv" }));
    await userEvent.click(screen.getByRole("button", { name: "Upload Products" }));

    expect(await screen.findByText("1 imported, 1 failed")).toBeInTheDocument();
    expect(screen.getByText("silk-scarf")).toBeInTheDocument();
    expect(screen.getByText("retailPrice 'x' is not a valid number.")).toBeInTheDocument();
  });

  it("rejects a file over 2MB before uploading", async () => {
    let called = false;
    server.use(
      http.post(`${API}/api/admin/products/bulk-upload`, () => {
        called = true;
        return HttpResponse.json({ rows: [], successCount: 0, errorCount: 0 });
      }),
    );

    const { input } = renderPage();
    const big = new File([new Uint8Array(2 * 1024 * 1024 + 1)], "big.csv", { type: "text/csv" });
    await userEvent.upload(input, big);

    expect(await screen.findByText(/over 2MB/)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("button", { name: "Upload Products" })).toBeDisabled());
    expect(called).toBe(false);
  });
});
