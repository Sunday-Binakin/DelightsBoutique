import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement, type ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server, API } from "@/test/server";
import LoginPage from "@/app/admin/login/page";

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

function renderLogin() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const ui: ReactNode = createElement(QueryClientProvider, { client }, createElement(LoginPage));
  render(ui);
}

async function signInWith(email: string, password: string) {
  await userEvent.type(screen.getByLabelText("Email"), email);
  await userEvent.type(screen.getByLabelText("Password"), password);
  await userEvent.click(screen.getByRole("button", { name: "Sign In" }));
}

describe("admin login", () => {
  beforeEach(() => {
    router.push.mockClear();
  });

  it("moves from credentials to the verification code step", async () => {
    server.use(
      http.post(`${API}/api/auth/login`, () => HttpResponse.json({ loginToken: "tok-1" })),
    );
    renderLogin();

    await signInWith("owner@example.com", "Secret123!");

    expect(await screen.findByLabelText("Verification Code")).toBeInTheDocument();
  });

  it("explains a wrong password in plain words", async () => {
    server.use(
      http.post(`${API}/api/auth/login`, () =>
        HttpResponse.json({ error: { code: "UNKNOWN", message: "Unauthorized" } }, { status: 401 }),
      ),
    );
    renderLogin();

    await signInWith("owner@example.com", "wrong");

    expect(await screen.findByRole("alert")).toHaveTextContent("Incorrect email or password.");
  });

  it("rejects a wrong code, then signs in and goes to the dashboard", async () => {
    server.use(
      http.post(`${API}/api/auth/login`, () => HttpResponse.json({ loginToken: "tok-1" })),
      http.post(`${API}/api/auth/verify-otp`, async ({ request }) => {
        const body = (await request.json()) as { code: string };
        if (body.code !== "123456") {
          return HttpResponse.json({ error: { code: "UNKNOWN", message: "Bad code" } }, { status: 401 });
        }
        return HttpResponse.json({
          role: "Owner",
          staffId: null,
          email: "owner@example.com",
          name: "Owner",
          permissions: [],
        });
      }),
    );
    renderLogin();
    await signInWith("owner@example.com", "Secret123!");

    await userEvent.type(await screen.findByLabelText("Verification Code"), "000000");
    await userEvent.click(screen.getByRole("button", { name: "Verify & Sign In" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("That code is incorrect or has expired.");

    await userEvent.clear(screen.getByLabelText("Verification Code"));
    await userEvent.type(screen.getByLabelText("Verification Code"), "123456");
    await userEvent.click(screen.getByRole("button", { name: "Verify & Sign In" }));

    await vi.waitFor(() => expect(router.push).toHaveBeenCalledWith("/admin/dashboard"));
  });
});
