import { test, expect, tick } from "./test-fixtures";
import { ROUTES } from "../src/popup/constants/routes";
import { encodeObject } from "../src/helpers/urls";

test.beforeEach(async ({ page, extensionId }) => {
  const info = {
    connectionKey: "xxxx",
  };

  const encodedBlob = encodeObject(info);

  await page.goto(
    `chrome-extension://${extensionId}/index.html#${ROUTES.sendTransaction}?${encodedBlob}`,
  );
});

test("Send transaction page loads", async ({ page }) => {
  await expect(page).toHaveScreenshot("send-tx-loader.png");

  await tick(2000);

  // Since there is no such connectionKey in the extension the page should close
  expect(page.isClosed()).toBeTruthy();
});
