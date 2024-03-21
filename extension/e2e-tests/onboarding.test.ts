import { test, expect } from "./test-fixtures";

test.beforeEach(async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/index.html`);
});

test("Welcome page loads", async ({ page }) => {
  await expect(page.getByText("Welcome to LOBSTR extension")).toBeVisible();
  await expect(
    page.getByText(
      "Securely connect to decentralized services on the Stellar network and sign transactions with your LOBSTR wallet.",
    ),
  ).toBeVisible();
  await expect(page).toHaveScreenshot("welcome-page.png");
});

test("Connection page loads", async ({ page }) => {
  await page.getByText("Get started").click();
  await expect(
    page.getByRole("heading", { name: "Connect your wallet" }),
  ).toBeVisible();
  await expect(page).toHaveScreenshot("create-connection-page.png", {
    mask: [page.locator(".test_wrapper")],
  });
  await page.getByText("Don’t have the LOBSTR mobile app installed?").click();
  await expect(page.getByText("Download LOBSTR app for iOS")).toBeVisible();
  await expect(page.getByText("Download LOBSTR app for Android")).toBeVisible();
  await expect(page).toHaveScreenshot("create-connection-page-with-links.png", {
    mask: [page.locator(".test_wrapper")],
  });
});
