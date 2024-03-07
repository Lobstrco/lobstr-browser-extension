import {
  initContentScriptMessageListener,
  initExtensionMessageListener,
  initInstalledListener,
} from "background/index";

import { buildStore } from "background/store";

async function main() {
  const store = await buildStore();
  initContentScriptMessageListener();
  initExtensionMessageListener(store);
  initInstalledListener();
}

main();
