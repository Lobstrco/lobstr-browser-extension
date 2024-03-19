import { test, expect } from "./test-fixtures";

test.beforeEach(async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/index.html`);
});

test("Welcome page loads", async ({ page }) => {
  await expect(page.getByText("Welcome to LOBSTR Extension")).toBeVisible();
  await expect(
    page.getByText(
      "Connect your LOBSTR Wallet mobile app\n" +
        "to interact with various dApps and services",
    ),
  ).toBeVisible();
  await expect(page).toHaveScreenshot("welcome-page.png");
});

test("Connection page loads", async ({ page }) => {
  await page.getByText("Get started").click();
  await expect(page.getByText("Scan to connect")).toBeVisible();
  await expect(
    page.getByText("Connect extension with your LOBSTR Wallet"),
  ).toBeVisible();
  await expect(page).toHaveScreenshot("create-connection-page.png", {
    mask: [page.locator(".test_wrapper")],
  });
  await page.getByText("Don’t have the LOBSTR mobile app?").click();
  await expect(page.getByText("LOBSTR for iOS")).toBeVisible();
  await expect(page.getByText("LOBSTR for Android")).toBeVisible();
  await expect(page).toHaveScreenshot("create-connection-page-with-links.png", {
    mask: [page.locator(".test_wrapper")],
  });
});
