import { test, expect, tick } from "./test-fixtures";
import { ROUTES } from "../src/popup/constants/routes";

test.beforeEach(async ({ page, extensionId }) => {
  await page.goto(
    `chrome-extension://${extensionId}/index.html#${ROUTES.grantAccess}`,
  );
});

test("Grand access page loads", async ({ page }) => {
  await expect(page).toHaveScreenshot("grand-access-loader.png");

  await tick(2000);

  // Since there is no account, the connection page should be displayed
  await expect(page).toHaveScreenshot("grand-access-page.png", {
    mask: [page.locator(".test_wrapper")],
  });
});
