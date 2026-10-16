import { describe, expect, it, vi } from "vitest";
import { createElement, type ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import { SearchOverlay } from "./SearchOverlay";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

function renderWithClient(ui: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(createElement(QueryClientProvider, { client }, ui));
}

describe("SearchOverlay", () => {
  it("opens as a labelled dialog with focus in the search field", async () => {
    renderWithClient(<SearchOverlay />);
    await userEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(screen.getByRole("dialog", { name: "Search products" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Search products" })).toHaveFocus();
    expect(screen.getByRole("button", { name: "Search" })).toHaveAttribute("aria-expanded", "true");
  });

  it("closes on Escape and returns focus to the search button", async () => {
    renderWithClient(<SearchOverlay />);
    await userEvent.click(screen.getByRole("button", { name: "Search" }));

    await userEvent.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Search" })).toHaveFocus();
  });
});
