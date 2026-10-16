import { expect, test, type Page } from "@playwright/test";

const STAFF = "staff-viewreports@dev.local";

async function signIn(page: Page, email: string) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("DevPassword123!");
  const loginResponse = page.waitForResponse((r) => r.url().endsWith("/api/auth/login") && r.request().method() === "POST");
  await page.getByRole("button", { name: "Sign In" }).click();
  const body = (await (await loginResponse).json()) as { devCode?: string };
  expect(body.devCode, "the backend must return devCode in Development").toBeTruthy();
  await page.getByLabel("Verification Code").fill(body.devCode!);
  await page.getByRole("button", { name: "Verify & Sign In" }).click();
  await page.waitForURL("**/admin/dashboard");
}

test("a reports-only staff member reaches reports and is denied customers", async ({ page }) => {
  await signIn(page, STAFF);

  await page.goto("/admin/reports");
  await expect(page.getByRole("heading", { name: "Reports" })).toBeVisible();
  await expect(page.getByText("Revenue by Day")).toBeVisible();

  await page.goto("/admin/customers");
  await expect(page.getByRole("heading", { name: "Access Denied" })).toBeVisible();
});

test("the account page shows the current phone number", async ({ page }) => {
  await signIn(page, STAFF);
  await page.goto("/admin/account");
  await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();
  await expect(page.getByLabel("Phone number")).not.toHaveValue("");
});
