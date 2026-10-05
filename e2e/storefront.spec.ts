import { expect, test } from "@playwright/test";

test("search returns products from the API", async ({ page }) => {
  await page.goto("/search?q=dresses");
  await expect(page.locator('a[href^="/product/"]').first()).toBeVisible();
});

test("category page lists its products", async ({ page }) => {
  await page.goto("/category/dresses");
  await expect(page.locator('a[href^="/product/"]').first()).toBeVisible();
});

test("product page shows the product name", async ({ page }) => {
  await page.goto("/product/r5-verify-product-3124429003");
  await expect(page.getByRole("heading", { name: "R5 Verify Product" })).toBeVisible();
});

test("price band is sent to the server, not filtered in the browser", async ({ page }) => {
  await page.goto("/category/dresses");
  const request = page.waitForRequest((req) => req.url().includes("/api/products") && req.url().includes("maxPrice=99.99"));
  await page.getByLabel("Under GH₵100").check();
  await request;
});

test("newsletter signup accepts an address", async ({ page }) => {
  await page.goto("/");
  const email = `e2e+${Date.now()}@example.com`;
  await page.getByLabel("Email address").fill(email);
  await page.getByRole("button", { name: "Subscribe" }).click();
  await expect(page.getByLabel("Email address")).toHaveCount(0);
});
